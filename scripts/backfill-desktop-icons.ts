/**
 * backfill-desktop-icons.ts
 *
 * icon_url 이 비어 있는 Windows/Mac 앱들에 대해, .desktop-icon-domains.json 에
 * 미리 정리해 둔 "id → 공식 도메인" 매핑을 바탕으로 아이콘을 가져와
 * WebP 로 바꾼 뒤 S3 에 올리고 icon_url 을 채운다.
 *
 * 아이콘 소스 우선순위 (도메인당):
 *   1) 페이지 <link rel=icon> 이 가리키는 이미지 (.ico 제외)
 *   2) https://{domain}/apple-touch-icon.png
 *   3) https://www.google.com/s2/favicons?domain={domain}&sz=256 (마지막 수단)
 *
 * favicon.ico 는 일부러 뺐다 — sharp 가 ICO 컨테이너를 디코딩하지 못한다.
 *
 * 매핑에 없는 id 는 건드리지 않는다 (추측으로 잘못된 아이콘을 붙이지 않기 위함).
 *
 * Usage:
 *   npx tsx scripts/backfill-desktop-icons.ts              # dry-run
 *   npx tsx scripts/backfill-desktop-icons.ts --apply       # 실제 반영
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

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const REPORT = path.join(__dirname, ".desktop-icon-report.json");
const DOMAINS_FILE = path.join(__dirname, ".desktop-icon-domains.json");
const MIN_BYTES = 400; // 너무 작으면 빈 이미지/1x1 이므로 버린다

interface Row {
  id: string;
  platform: string;
}
interface Outcome {
  id: string;
  domain?: string;
  source?: string;
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

async function tryFetchImage(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/") && !ct.includes("octet-stream")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < MIN_BYTES) return null;
    return buf;
  } catch {
    return null;
  }
}

/** 홈페이지 HTML에서 <link rel="...icon..."> 태그를 찾아 실제 아이콘 주소를 얻는다. */
async function findIconFromHtml(domain: string): Promise<string | null> {
  try {
    const res = await fetch(`https://${domain}/`, {
      headers: { "User-Agent": UA, "Accept-Language": "ko,en" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const html = await res.text();
    const links: { href: string; rel: string; sizes: number }[] = [];
    const re = /<link\s+[^>]*rel=["']([^"']*icon[^"']*)["'][^>]*>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      const tag = m[0];
      const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
      if (!href) continue;
      const sizesAttr = tag.match(/sizes=["']([^"']+)["']/i)?.[1] ?? "";
      const sizeNum = parseInt(sizesAttr.split("x")[0], 10) || 0;
      links.push({ href, rel: m[1].toLowerCase(), sizes: sizeNum });
    }
    if (!links.length) return null;
    links.sort((a, b) => {
      const score = (l: { rel: string; sizes: number }) => (l.rel.includes("apple-touch") ? 1000 : 0) + l.sizes;
      return score(b) - score(a);
    });
    const chosen = links[0].href;
    return new URL(chosen, `https://${domain}/`).toString();
  } catch {
    return null;
  }
}

async function findIcon(domain: string): Promise<{ buf: Buffer; source: string } | null> {
  const fromHtml = await findIconFromHtml(domain);
  // favicon.ico 는 뺐다 — 옛 윈도우 ICO 컨테이너 포맷이라 sharp 가 대부분 디코딩하지 못한다.
  const candidates: [string, string][] = [
    ...(fromHtml && !fromHtml.toLowerCase().endsWith(".ico") ? ([[fromHtml, "html-link"]] as [string, string][]) : []),
    [`https://${domain}/apple-touch-icon.png`, "apple-touch-icon"],
    [`https://www.google.com/s2/favicons?domain=${domain}&sz=256`, "google-s2"],
  ];
  for (const [url, source] of candidates) {
    const buf = await tryFetchImage(url);
    if (buf) return { buf, source };
  }
  return null;
}

async function uploadIcon(client: S3Client, id: string, buf: Buffer): Promise<string | null> {
  try {
    const webp = await sharp(buf).resize(256, 256, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } }).webp({ quality: 82 }).toBuffer();
    const key = `icons/${id}.webp`;
    await client.send(
      new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: webp, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" }),
    );
    return `${PUBLIC_BASE}/${key}`;
  } catch {
    return null;
  }
}

async function processOne(row: Row, domain: string, client: S3Client | null, sb: SupabaseClient): Promise<Outcome> {
  const out: Outcome = { id: row.id, domain };
  try {
    const found = await findIcon(domain);
    if (!found) {
      out.error = "아이콘을 찾지 못함";
      return out;
    }
    out.source = found.source;
    if (client) {
      const newUrl = await uploadIcon(client, row.id, found.buf);
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
      if (tick && done % 20 === 0) tick(done, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, w));
  tick?.(done, items.length);
  return out;
}

async function main() {
  const domainMap: Record<string, string> = JSON.parse(fs.readFileSync(DOMAINS_FILE, "utf-8"));
  const sb = db();

  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("ssdown_software_applications")
      .select("id,platform")
      .in("platform", ["Windows", "Mac"])
      .or("icon_url.is.null,icon_url.eq.")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    rows.push(...(data as Row[]));
    if (data.length < 1000) break;
  }

  const targets = rows.filter((r) => domainMap[r.id]);
  console.log(`아이콘 없는 Windows/Mac ${rows.length}건 중 도메인 매핑된 ${targets.length}건 대상`);
  console.log(APPLY ? `업로드: s3://${BUCKET}/icons/ → ${PUBLIC_BASE}` : "dry-run (--apply 로 실제 반영)");
  console.log();

  const client = APPLY ? s3() : null;
  const started = Date.now();
  const results = await mapLimit(
    targets,
    CONCURRENCY,
    (r) => processOne(r, domainMap[r.id], client, sb),
    (d, t) => console.log(`  ${d}/${t}  (${Math.round((Date.now() - started) / 1000)}초)`),
  );

  const ok = results.filter((r) => !r.error);
  const failed = results.filter((r) => r.error);
  console.log(`\n성공 ${ok.length} / 실패 ${failed.length}`);
  if (failed.length) {
    const kinds: Record<string, number> = {};
    for (const f of failed) kinds[f.error!] = (kinds[f.error!] ?? 0) + 1;
    Object.entries(kinds)
      .sort((a, b) => b[1] - a[1])
      .forEach(([k, v]) => console.log(`  ${String(v).padStart(4)}  ${k}`));
  }
  const bySource: Record<string, number> = {};
  for (const r of ok) bySource[r.source!] = (bySource[r.source!] ?? 0) + 1;
  console.log("소스:", bySource);

  fs.writeFileSync(REPORT, JSON.stringify(results, null, 1));
  console.log(`\n보고서: ${REPORT}`);
  console.log(`매핑 안 된 나머지: ${rows.length - targets.length}건 (건드리지 않음)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
