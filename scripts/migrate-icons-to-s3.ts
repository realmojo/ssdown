/**
 * migrate-icons-to-s3.ts
 *
 * software_applications.icon_url 이 외부 CDN 을 가리키는 항목을
 * 내려받아 WebP 로 변환한 뒤 S3 에 올리고, icon_url 을 우리 주소로 바꿉니다.
 *
 * 왜 하는가
 *  - 지금은 images.sftcdn.net / play-lh.googleusercontent.com 을 직접 부른다.
 *    상대가 이미지를 내리거나 주소를 바꾸면 우리 페이지에서 깨진다.
 *  - 원본은 앱 개발사의 저작물이다. 앱 정보 페이지에서 그 앱을 가리키는 용도로만
 *    쓴다(앱 디렉터리의 통상적인 사용 범위).
 *
 * 안전장치
 *  - 이미 우리 S3 를 가리키는 항목은 건너뛴다(재실행 가능).
 *  - 원래 주소를 보고서 파일에 남긴다. 되돌려야 하면 이 파일로 복구한다.
 *  - --dry-run 이 기본이다. 실제 반영은 --apply 를 붙여야 한다.
 *
 * 필요한 환경변수 (.env.local)
 *   AWS_ACCESS_KEY_ID
 *   AWS_SECRET_ACCESS_KEY
 *   AWS_REGION            예: ap-northeast-2
 *   S3_BUCKET             예: ssdown-assets
 *   S3_PUBLIC_BASE        (선택) CloudFront 등 공개 주소. 없으면 버킷 기본 주소를 쓴다.
 *
 * Usage:
 *   npx tsx scripts/migrate-icons-to-s3.ts --limit=10          # 10건만 시험 (업로드 안 함)
 *   npx tsx scripts/migrate-icons-to-s3.ts --limit=10 --apply  # 10건 실제 반영
 *   npx tsx scripts/migrate-icons-to-s3.ts --apply             # 전체
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
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
const SIZE = Number(getArg("--size=") ?? 256);
const QUALITY = Number(getArg("--quality=") ?? 82);

const REGION = process.env.AWS_REGION ?? "";
const BUCKET = process.env.S3_BUCKET ?? "";
const PREFIX = getArg("--prefix=") ?? "icons";
const PUBLIC_BASE =
  process.env.S3_PUBLIC_BASE?.replace(/\/$/, "") ??
  (BUCKET && REGION ? `https://${BUCKET}.s3.${REGION}.amazonaws.com` : "");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const REPORT = path.join(__dirname, ".icon-migration-report.json");

interface Row {
  id: string;
  icon_url: string;
}
interface Outcome {
  id: string;
  originalUrl: string;
  newUrl?: string;
  bytesBefore?: number;
  bytesAfter?: number;
  error?: string;
}

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 환경변수가 필요합니다.");
  return createClient(url, key, { auth: { persistSession: false } });
}

function s3() {
  const id = process.env.AWS_ACCESS_KEY_ID;
  const secret = process.env.AWS_SECRET_ACCESS_KEY;
  if (!id || !secret || !REGION || !BUCKET) {
    throw new Error(
      "S3 환경변수가 없습니다. .env.local 에 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET 을 넣어 주세요.",
    );
  }
  return new S3Client({ region: REGION, credentials: { accessKeyId: id, secretAccessKey: secret } });
}

/** 이미 우리 저장소를 가리키면 건너뛴다. */
function alreadyMigrated(url: string): boolean {
  if (!PUBLIC_BASE) return false;
  return url.startsWith(PUBLIC_BASE);
}

async function processOne(
  row: Row,
  client: S3Client | null,
): Promise<Outcome> {
  const out: Outcome = { id: row.id, originalUrl: row.icon_url };
  try {
    const res = await fetch(row.icon_url, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      out.error = `내려받기 실패 ${res.status}`;
      return out;
    }
    const input = Buffer.from(await res.arrayBuffer());
    out.bytesBefore = input.length;

    const webp = await sharp(input)
      .resize(SIZE, SIZE, { fit: "cover", withoutEnlargement: false })
      .webp({ quality: QUALITY })
      .toBuffer();
    out.bytesAfter = webp.length;

    const key = `${PREFIX}/${row.id}.webp`;
    out.newUrl = `${PUBLIC_BASE}/${key}`;

    if (client) {
      await client.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: webp,
          ContentType: "image/webp",
          // 아이콘은 잘 바뀌지 않는다. 오래 캐시해 재요청을 줄인다.
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
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
  const sb = supabase();

  // 아이콘이 있고 아직 우리 저장소가 아닌 항목을 모은다.
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("ssdown_software_applications")
      .select("id,icon_url")
      .not("icon_url", "is", null)
      .neq("icon_url", "")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    for (const r of data) {
      if (!/^https?:\/\//i.test(r.icon_url)) continue;
      if (alreadyMigrated(r.icon_url)) continue;
      rows.push(r as Row);
    }
    if (data.length < 1000) break;
  }

  const targets = LIMIT > 0 ? rows.slice(0, LIMIT) : rows;
  console.log(`대상: ${targets.length}건 (전체 아이콘 보유 ${rows.length}건)`);
  console.log(`변환: ${SIZE}x${SIZE} WebP q${QUALITY} / 동시 ${CONCURRENCY}`);
  console.log(APPLY ? `업로드: s3://${BUCKET}/${PREFIX}/  →  ${PUBLIC_BASE}` : "업로드: 안 함 (dry-run)");
  console.log();

  const client = APPLY ? s3() : null;
  const started = Date.now();

  const results = await mapLimit(targets, CONCURRENCY, (r) => processOne(r, client), (d, t) =>
    console.log(`  ${d}/${t}  (${Math.round((Date.now() - started) / 1000)}초)`),
  );

  const ok = results.filter((r) => !r.error);
  const failed = results.filter((r) => r.error);
  const before = ok.reduce((n, r) => n + (r.bytesBefore ?? 0), 0);
  const after = ok.reduce((n, r) => n + (r.bytesAfter ?? 0), 0);

  console.log(`\n성공 ${ok.length} / 실패 ${failed.length}`);
  if (before) {
    console.log(
      `용량 ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB (${Math.round((1 - after / before) * 100)}% 감소)`,
    );
  }
  if (failed.length) {
    const kinds: Record<string, number> = {};
    for (const f of failed) kinds[f.error!.slice(0, 40)] = (kinds[f.error!.slice(0, 40)] ?? 0) + 1;
    console.log("실패 사유:");
    Object.entries(kinds)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .forEach(([k, v]) => console.log(`  ${String(v).padStart(4)}  ${k}`));
  }

  // 원래 주소를 남겨 둔다. 되돌릴 때 쓴다.
  fs.writeFileSync(REPORT, JSON.stringify(results, null, 1));
  console.log(`\n보고서: ${REPORT}`);

  if (!APPLY) {
    console.log("\n[dry-run] 업로드도 DB 갱신도 하지 않았습니다. --apply 를 붙이세요.");
    return;
  }

  // DB 의 icon_url 을 새 주소로 바꾼다.
  let updated = 0;
  for (const r of ok) {
    const { error } = await sb
      .from("ssdown_software_applications")
      .update({ icon_url: r.newUrl })
      .eq("id", r.id);
    if (error) {
      console.error(`  갱신 실패 ${r.id}: ${error.message}`);
      continue;
    }
    updated++;
  }
  console.log(`icon_url 갱신: ${updated}건`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
