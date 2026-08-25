/**
 * backfill-homebrew-cask-icons.ts
 *
 * import-homebrew-casks.ts 로 등록한 Mac 소프트웨어는 icon_url 이 비어 있다
 * (Homebrew Cask API 자체에 아이콘이 없음). download_url(=공식 홈페이지) 도메인에서
 * 직접 아이콘을 찾아 채운다.
 *
 * 소스 우선순위(도메인당):
 *   1) https://{domain}/apple-touch-icon.png
 *   2) https://{domain}/favicon.ico
 *   3) https://www.google.com/s2/favicons?domain={domain}&sz=256 (최후 수단)
 *
 * Usage:
 *   npx tsx scripts/backfill-homebrew-cask-icons.ts --limit=20   # dry-run
 *   npx tsx scripts/backfill-homebrew-cask-icons.ts --apply
 *   npx tsx scripts/backfill-homebrew-cask-icons.ts --apply --platform=Windows
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import sharp from "sharp";

dotenv.config({ path: ".env.local" });

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const LIMIT = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0);
// Mac(Homebrew) 전용으로 만들었지만, download_url 이 공식 홈페이지인 플랫폼이면
// 똑같은 방식이 통한다. Windows 처럼 도메인 매핑이 없는 쪽에 쓴다.
const PLATFORM = args.find((a) => a.startsWith("--platform="))?.split("=")[1] ?? "Mac";
const CONCURRENCY = 6;

const REGION = process.env.AWS_REGION ?? "";
const BUCKET = process.env.S3_BUCKET ?? "";
const PUBLIC_BASE =
  process.env.S3_PUBLIC_BASE?.replace(/\/$/, "") ??
  (BUCKET && REGION ? `https://${BUCKET}.s3.${REGION}.amazonaws.com` : "");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

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

/**
 * 후보 URL 을 돌면서 "webp 로 변환까지 성공한" 첫 이미지를 돌려준다.
 *
 * 예전에는 내려받기만 성공하면 채택했는데, sharp 가 .ico 를 디코드하지 못해
 * favicon.ico 를 받은 항목이 변환 단계에서 조용히 버려졌다(1,420건 중 48건만
 * 저장되던 원인). 그래서 변환 성공 여부까지 여기서 확인한다.
 */
async function fetchFirstWorkingImage(domain: string): Promise<Buffer | null> {
  const candidates = [
    `https://${domain}/apple-touch-icon.png`,
    `https://${domain}/apple-touch-icon-precomposed.png`,
    `https://${domain}/favicon.ico`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA },
        redirect: "follow",
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 200) continue; // 1x1 placeholder 등 너무 작은 건 건너뛴다
      const webp = await toWebp(buf);
      if (webp) return webp; // 이미 변환된 상태로 넘긴다
    } catch {
      continue;
    }
  }
  return null;
}

/** sharp 가 못 읽는 포맷(.ico 등)이면 null. */
async function toWebp(buf: Buffer): Promise<Buffer | null> {
  try {
    return await sharp(buf).resize(256, 256, { fit: "cover" }).webp({ quality: 82 }).toBuffer();
  } catch {
    return null;
  }
}

async function uploadIcon(client: S3Client, id: string, webp: Buffer): Promise<string | null> {
  try {
    const key = `icons/${id}.webp`;
    await client.send(
      new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: webp, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" }),
    );
    return `${PUBLIC_BASE}/${key}`;
  } catch (err) {
    // 조용히 삼키면 원인 파악이 안 된다.
    console.error(`    업로드 실패 (${id}): ${(err as Error).message}`);
    return null;
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
      if (tick && done % 50 === 0) tick(done, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, w));
  tick?.(done, items.length);
  return out;
}

async function main() {
  const sb = db();
  let targets: { id: string; download_url: string }[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("ssdown_software_applications")
      .select("id,download_url,icon_url")
      .eq("platform", PLATFORM)
      .is("icon_url", null)
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    targets = targets.concat((data ?? []).filter((r) => r.download_url) as any);
    if (!data || data.length < 1000) break;
  }
  if (LIMIT > 0) targets = targets.slice(0, LIMIT);
  console.log(`플랫폼: ${PLATFORM}\n대상: ${targets.length}개\n`);

  const client = APPLY ? s3() : null;
  const started = Date.now();
  let found = 0, uploaded = 0;
  const results = await mapLimit(
    targets,
    CONCURRENCY,
    async (t) => {
      let domain: string;
      try {
        domain = new URL(t.download_url).hostname;
      } catch {
        return { id: t.id, ok: false };
      }
      const buf = await fetchFirstWorkingImage(domain);
      if (!buf) return { id: t.id, ok: false };
      found++;
      if (!APPLY) return { id: t.id, ok: true };
      const url = await uploadIcon(client!, t.id, buf);
      if (url) {
        await sb.from("ssdown_software_applications").update({ icon_url: url }).eq("id", t.id);
        uploaded++;
      }
      return { id: t.id, ok: Boolean(url) };
    },
    (d, t) => console.log(`  진행 ${d}/${t} (${Math.round((Date.now() - started) / 1000)}초, 아이콘 발견 ${found})`),
  );

  const okCount = results.filter((r) => r.ok).length;
  console.log(`\n아이콘 확보 ${found}/${targets.length}`);
  if (APPLY) console.log(`업로드 완료 ${uploaded}/${targets.length}`);
  else console.log(`[dry-run] --apply 를 붙이면 실제로 S3에 올리고 DB를 갱신합니다. (성공 예상 ${okCount})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
