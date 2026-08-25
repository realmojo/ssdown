/**
 * backfill-ios-icons.ts
 *
 * icon_url 이 비어 있는 기존 iOS 앱들에 대해 애플 공식 iTunes Lookup API로
 * 아이콘(artworkUrl512)만 가져와 WebP 로 바꾼 뒤 S3 에 올리고 icon_url 을 채운다.
 *
 * Usage:
 *   npx tsx scripts/backfill-ios-icons.ts              # dry-run
 *   npx tsx scripts/backfill-ios-icons.ts --apply       # 실제 반영
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

dotenv.config({ path: ".env.local" });

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const CONCURRENCY = 6;

const REGION = process.env.AWS_REGION ?? "";
const BUCKET = process.env.S3_BUCKET ?? "";
const PUBLIC_BASE =
  process.env.S3_PUBLIC_BASE?.replace(/\/$/, "") ??
  (BUCKET && REGION ? `https://${BUCKET}.s3.${REGION}.amazonaws.com` : "");

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";
const REPORT = path.join(__dirname, ".ios-icon-report.json");

interface Row {
  id: string;
  download_url: string | null;
  developer_website_url: string | null;
}
interface Outcome {
  id: string;
  appId?: string;
  newUrl?: string;
  error?: string;
}

function db(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
function s3(): S3Client {
  return new S3Client({
    region: REGION,
    credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! },
  });
}

function appIdFromRow(r: Row): string | null {
  for (const u of [r.download_url, r.developer_website_url]) {
    const m = String(u ?? "").match(/\/id(\d+)/);
    if (m) return m[1];
  }
  return null;
}

async function uploadIcon(client: S3Client, id: string, url: string): Promise<string | null> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const webp = await sharp(Buffer.from(await res.arrayBuffer()))
    .resize(256, 256, { fit: "cover" })
    .webp({ quality: 82 })
    .toBuffer();
  const key = `icons/${id}.webp`;
  await client.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: webp, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" }),
  );
  return `${PUBLIC_BASE}/${key}`;
}

async function processOne(row: Row, client: S3Client | null, sb: SupabaseClient): Promise<Outcome> {
  const out: Outcome = { id: row.id };
  const appId = appIdFromRow(row);
  if (!appId) {
    out.error = "앱스토어 숫자 ID 없음";
    return out;
  }
  out.appId = appId;
  try {
    const res = await fetch(`https://itunes.apple.com/lookup?id=${appId}`);
    if (!res.ok) {
      out.error = `lookup 실패 ${res.status}`;
      return out;
    }
    const json = (await res.json()) as { results?: Array<{ artworkUrl512?: string; artworkUrl100?: string }> };
    const artwork = json.results?.[0]?.artworkUrl512 ?? json.results?.[0]?.artworkUrl100;
    if (!artwork) {
      out.error = "artworkUrl 없음 (내려간 앱)";
      return out;
    }
    if (client) {
      const newUrl = await uploadIcon(client, row.id, artwork);
      if (!newUrl) {
        out.error = "업로드 실패";
        return out;
      }
      out.newUrl = newUrl;
      const { error } = await sb.from("ssdown_software_applications").update({ icon_url: newUrl }).eq("id", row.id);
      if (error) out.error = `DB 갱신 실패: ${error.message}`;
    }
    return out;
  } catch (e) {
    out.error = e instanceof Error ? e.message.slice(0, 140) : String(e);
    return out;
  }
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>, tick?: (d: number, t: number) => void) {
  const out = new Array<R>(items.length);
  let next = 0, done = 0;
  async function w() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]);
      done++;
      if (tick) tick(done, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, w));
  return out;
}

async function main() {
  const sb = db();
  const { data, error } = await sb
    .from("ssdown_software_applications")
    .select("id,download_url,developer_website_url")
    .eq("platform", "iOS")
    .or("icon_url.is.null,icon_url.eq.");
  if (error) throw new Error(error.message);
  const rows = data as Row[];

  console.log(`대상: ${rows.length}건`);
  console.log(APPLY ? `업로드: s3://${BUCKET}/icons/ → ${PUBLIC_BASE}` : "dry-run (--apply 로 실제 반영)");

  const client = APPLY ? s3() : null;
  const results = await mapLimit(rows, CONCURRENCY, (r) => processOne(r, client, sb), (d, t) => console.log(`  ${d}/${t}`));

  const ok = results.filter((r) => !r.error);
  const failed = results.filter((r) => r.error);
  console.log(`\n성공 ${ok.length} / 실패 ${failed.length}`);
  if (failed.length) {
    const kinds: Record<string, number> = {};
    for (const f of failed) kinds[f.error!] = (kinds[f.error!] ?? 0) + 1;
    Object.entries(kinds).forEach(([k, v]) => console.log(`  ${v}  ${k}`));
  }
  fs.writeFileSync(REPORT, JSON.stringify(results, null, 1));
  console.log(`보고서: ${REPORT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
