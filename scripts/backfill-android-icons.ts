/**
 * backfill-android-icons.ts
 *
 * icon_url 이 비어 있는 기존 Android 앱들에 대해 플레이 스토어 페이지에서
 * 아이콘(og:image)만 가져와 WebP 로 바꾼 뒤 S3 에 올리고 icon_url 을 채운다.
 * import-play-apps.ts 의 fetchMeta/uploadIcon 로직을 기존 행 백필용으로 재사용한다.
 *
 * 저작권 정책: 아이콘 외의 설명문·스크린샷은 가져오지 않는다.
 *
 * Usage:
 *   npx tsx scripts/backfill-android-icons.ts                    # dry-run (대상 수 확인)
 *   npx tsx scripts/backfill-android-icons.ts --limit=20          # 20건만 시험
 *   npx tsx scripts/backfill-android-icons.ts --apply              # 전체 실제 반영
 *   npx tsx scripts/backfill-android-icons.ts --apply --limit=500  # 500건만 실제 반영
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

dotenv.config({ path: ".env.local" });

const args = process.argv.slice(2);
const getArg = (p: string) => args.find((a) => a.startsWith(p))?.split("=")[1];

const APPLY = args.includes("--apply");
const LIMIT = Number(getArg("--limit=") ?? 0);
const CONCURRENCY = Number(getArg("--concurrency=") ?? 8);

const REGION = process.env.AWS_REGION ?? "";
const BUCKET = process.env.S3_BUCKET ?? "";
const PUBLIC_BASE =
  process.env.S3_PUBLIC_BASE?.replace(/\/$/, "") ??
  (BUCKET && REGION ? `https://${BUCKET}.s3.${REGION}.amazonaws.com` : "");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const REPORT = path.join(__dirname, ".android-icon-report.json");

interface Row {
  id: string;
  download_url: string | null;
  developer_website_url: string | null;
}

interface Outcome {
  id: string;
  pkg?: string;
  iconUrl?: string;
  newUrl?: string;
  error?: string;
}

function db(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 환경변수가 필요합니다.");
  return createClient(url, key, { auth: { persistSession: false } });
}

function s3(): S3Client {
  const id = process.env.AWS_ACCESS_KEY_ID;
  const secret = process.env.AWS_SECRET_ACCESS_KEY;
  if (!id || !secret || !REGION || !BUCKET) throw new Error("S3 환경변수가 필요합니다.");
  return new S3Client({ region: REGION, credentials: { accessKeyId: id, secretAccessKey: secret } });
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function pkgFromRow(r: Row): string | null {
  for (const u of [r.download_url, r.developer_website_url]) {
    const m = String(u ?? "").match(/[?&]id=([^&\s]+)/);
    if (m) return m[1];
  }
  return null;
}

/** 스토어 페이지에서 아이콘 주소(og:image)만 뽑는다. 설명문은 읽지 않는다. */
async function fetchIconUrl(pkg: string): Promise<string | null> {
  const url = `https://play.google.com/store/apps/details?id=${pkg}&hl=ko&gl=KR`;
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "ko" } });
  if (!res.ok) return null;
  const html = await res.text();
  const m = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (!m) return null;
  return decodeEntities(m[1]).replace(/=w\d+-h\d+.*$/, "=w512");
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
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: webp,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return `${PUBLIC_BASE}/${key}`;
}

async function processOne(row: Row, client: S3Client | null, sb: SupabaseClient): Promise<Outcome> {
  const out: Outcome = { id: row.id };
  const pkg = pkgFromRow(row);
  if (!pkg) {
    out.error = "패키지 ID 없음";
    return out;
  }
  out.pkg = pkg;
  try {
    const iconUrl = await fetchIconUrl(pkg);
    if (!iconUrl) {
      out.error = "아이콘 주소 없음 (스토어 페이지 접근 실패 또는 삭제된 앱)";
      return out;
    }
    if (client) {
      const newUrl = await uploadIcon(client, row.id, iconUrl);
      if (!newUrl) {
        out.error = "업로드 실패";
        return out;
      }
      out.newUrl = newUrl;
      // 행 단위로 바로 반영한다 — 중간에 죽어도 이미 처리한 만큼은 남는다.
      const { error } = await sb.from("ssdown_software_applications").update({ icon_url: newUrl }).eq("id", row.id);
      if (error) out.error = `DB 갱신 실패: ${error.message}`;
    }
    return out;
  } catch (e) {
    out.error = e instanceof Error ? e.message.slice(0, 140) : String(e);
    return out;
  }
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
  onTick?: (done: number, total: number) => void,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  let done = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]);
      done++;
      if (onTick && done % 50 === 0) onTick(done, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  onTick?.(done, items.length);
  return out;
}

async function main() {
  const sb = db();

  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("ssdown_software_applications")
      .select("id,download_url,developer_website_url")
      .eq("platform", "Android")
      .or("icon_url.is.null,icon_url.eq.")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    rows.push(...(data as Row[]));
    if (data.length < 1000) break;
  }

  const targets = LIMIT > 0 ? rows.slice(0, LIMIT) : rows;
  console.log(`대상: ${targets.length}건 (아이콘 없는 Android 전체 ${rows.length}건)`);
  console.log(APPLY ? `업로드: s3://${BUCKET}/icons/ → ${PUBLIC_BASE}` : "업로드: 안 함 (dry-run, --apply 로 실제 반영)");
  console.log();

  const client = APPLY ? s3() : null;
  const started = Date.now();

  const results = await mapLimit(targets, CONCURRENCY, (r) => processOne(r, client, sb), (d, t) =>
    console.log(`  ${d}/${t}  (${Math.round((Date.now() - started) / 1000)}초)`),
  );

  const ok = results.filter((r) => !r.error && (APPLY ? r.newUrl : r.iconUrl));
  const failed = results.filter((r) => r.error);

  console.log(`\n성공 ${ok.length} / 실패 ${failed.length}`);
  if (failed.length) {
    const kinds: Record<string, number> = {};
    for (const f of failed) kinds[f.error!] = (kinds[f.error!] ?? 0) + 1;
    console.log("실패 사유:");
    Object.entries(kinds)
      .sort((a, b) => b[1] - a[1])
      .forEach(([k, v]) => console.log(`  ${String(v).padStart(5)}  ${k}`));
  }

  fs.writeFileSync(REPORT, JSON.stringify(results, null, 1));
  console.log(`\n보고서: ${REPORT}`);
  console.log(
    APPLY
      ? `icon_url 갱신(행 단위로 즉시 반영됨): ${ok.length}건`
      : "\n[dry-run] 업로드도 DB 갱신도 하지 않았습니다. --apply 를 붙이세요.",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
