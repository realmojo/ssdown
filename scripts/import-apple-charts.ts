/**
 * import-apple-charts.ts
 *
 * Apple 공식 차트 API(rss.marketingtools.apple.com — 무료, 공식 지원)로 한국(kr) 인기
 * 앱 목록을 가져와 "사실 정보만" software_applications 에 뼈대 레코드로 등록한다.
 *
 * 저작권 정책: 설명문/스크린샷은 가져오지 않는다. 사실 정보만 — 앱 이름, 개발사,
 * 카테고리, 아이콘, 앱스토어 링크. 리뷰/요약/SEO 는 generate-bilingual-reviews.ts 가
 * 이후 새로 생성한다. import-play-apps.ts 와 동일한 정책(평점 미수집 등)을 따른다.
 *
 * Usage:
 *   npx tsx scripts/import-apple-charts.ts                     # dry-run
 *   npx tsx scripts/import-apple-charts.ts --insert             # 실제 삽입
 *   npx tsx scripts/import-apple-charts.ts --charts=top-free,top-paid --limit=100
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

const CHARTS = (getArg("--charts=") ?? "top-free,top-paid").split(",").map((c) => c.trim());
const CHART_LIMIT = parseInt(getArg("--limit=") ?? "100", 10) || 100;
const COUNTRY = getArg("--country=") ?? "kr";
const DO_INSERT = args.includes("--insert");
const NO_ICONS = args.includes("--no-icons");
// RSS 차트(top-free/top-paid)는 앱스토어당 최대 100개로 막혀 있어 커버리지가
// 좁다. --genre-scrape 를 붙이면 apps.apple.com/{country}/charts/iphone/{feed}/{genreId}
// 정적 페이지(장르별로 앱 50개씩 나열)를 긁어 후보를 크게 늘린다.
const GENRE_SCRAPE = args.includes("--genre-scrape");
const SCRAPE_FEEDS = ["top-free-apps", "top-paid-apps"];
// Apple 공식 장르 id (App Store Connect 문서 기준, 안정적인 값들만).
const GENRE_IDS = [
  6000, 6001, 6002, 6003, 6004, 6005, 6006, 6007, 6008, 6009, 6010, 6011,
  6012, 6013, 6014, 6015, 6016, 6017, 6018, 6020, 6023, 6024,
];

const REGION = process.env.AWS_REGION ?? "";
const BUCKET = process.env.S3_BUCKET ?? "";
const PUBLIC_BASE =
  process.env.S3_PUBLIC_BASE?.replace(/\/$/, "") ??
  (BUCKET && REGION ? `https://${BUCKET}.s3.${REGION}.amazonaws.com` : "");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

const PREVIEW_FILE = path.join(process.cwd(), "scripts", ".apple-charts-preview.json");
const IDS_FILE = path.join(process.cwd(), "scripts", ".apple-charts-ids.json");

// Apple primaryGenreName → 기존 category_main/sub 체계(import-play-apps.ts 의 GENRE_MAP 과 같은 축)
const GENRE_MAP: Record<string, { main: string; sub: string }> = {
  Games: { main: "Games", sub: "Games" },
  Entertainment: { main: "Multimedia", sub: "Entertainment" },
  "Photo & Video": { main: "Multimedia", sub: "Photo Editors" },
  Music: { main: "Multimedia", sub: "Music" },
  "Health & Fitness": { main: "Lifestyle", sub: "Health & Fitness" },
  "Food & Drink": { main: "Lifestyle", sub: "Food & Drink" },
  Lifestyle: { main: "Lifestyle", sub: "Lifestyle" },
  Shopping: { main: "Lifestyle", sub: "Shopping" },
  Travel: { main: "Travel & Navigation", sub: "Travel" },
  Navigation: { main: "Travel & Navigation", sub: "Navigation" },
  Weather: { main: "Utilities & Tools", sub: "Weather" },
  Utilities: { main: "Utilities & Tools", sub: "Utilities" },
  Productivity: { main: "Productivity", sub: "Productivity" },
  Business: { main: "Productivity", sub: "Business" },
  Finance: { main: "Lifestyle", sub: "Finance" },
  Education: { main: "Education & Reference", sub: "Education" },
  Reference: { main: "Education & Reference", sub: "Books & Reference" },
  Book: { main: "Education & Reference", sub: "Books & Reference" },
  "Social Networking": { main: "Social & Communication", sub: "Social" },
  News: { main: "Multimedia", sub: "News" },
  "Magazines & Newspapers": { main: "Multimedia", sub: "News" },
  Sports: { main: "Lifestyle", sub: "Sports" },
  Medical: { main: "Lifestyle", sub: "Medical" },
  "Developer Tools": { main: "Development & IT", sub: "Development" },
};

function fallbackCategory(): { main: string; sub: string } {
  return { main: "Utilities & Tools", sub: "Utilities" };
}

interface ChartEntry {
  id: string;
  name: string;
  artistName: string;
  url: string;
  artworkUrl100: string;
}

interface EnrichedEntry extends ChartEntry {
  genre: string;
  artworkUrl512: string;
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

/** id에서 우리 DB 기본키로 쓸 슬러그를 이름으로부터 만든다.
 * ASCII만 허용한다 — 한글만으로 된 이름은 base가 비므로 앱스토어 숫자 ID로 대체한다
 * (id가 URL 세그먼트/파일명으로도 쓰이므로 non-ASCII를 넣으면 안 된다). */
function slugify(name: string, appStoreId: string, taken: Set<string>): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || `app-${appStoreId}`;
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

async function fetchChart(chart: string, attempt = 1): Promise<ChartEntry[]> {
  // 예전 도메인(rss.applemarketingtools.com)은 새 도메인으로 301 리다이렉트되는데
  // 그 경유 과정에서 가끔 504가 난다. 새 도메인을 바로 쓰고, 그래도 실패하면 재시도한다.
  const url = `https://rss.marketingtools.apple.com/api/v2/${COUNTRY}/apps/${chart}/${CHART_LIMIT}/apps.json`;
  const res = await fetch(url);
  if (!res.ok) {
    if (attempt <= 3) {
      await new Promise((r) => setTimeout(r, attempt * 2_000));
      return fetchChart(chart, attempt + 1);
    }
    throw new Error(`HTTP ${res.status}`);
  }
  const json = (await res.json()) as { feed?: { results?: ChartEntry[] } };
  return json.feed?.results ?? [];
}

/**
 * 장르별 차트 정적 페이지(apps.apple.com/{country}/charts/iphone/{feed}/{genreId})에서
 * 앱스토어 숫자 id만 긁는다. RSS 차트 API가 top-free/top-paid 100개로 막혀 있는 것과
 * 달리, 이 페이지는 장르마다 앱을 새로 나열해 훨씬 넓게 후보를 모을 수 있다.
 * 이름·개발사 등은 여기서 가져오지 않는다 — 뒤이어 iTunes Lookup(공식 API)으로
 * 사실 정보만 채운다.
 */
async function scrapeGenreChartIds(feed: string, genreId: number): Promise<string[]> {
  const url = `https://apps.apple.com/${COUNTRY}/charts/iphone/${feed}/${genreId}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (!res.ok) return [];
    const html = await res.text();
    const ids = new Set<string>();
    for (const m of html.matchAll(/\/app\/[^"']*\/id(\d+)/g)) ids.add(m[1]);
    return [...ids];
  } catch {
    return [];
  }
}

/**
 * iTunes Lookup(공식 API)으로 이름·개발사·장르·아이콘·스토어 링크를 배치로 채운다.
 * RSS 차트로 들어온 항목은 이미 이름이 있지만, 장르 스크레이핑으로 들어온 항목은
 * id만 있으므로 이 조회가 유일한 사실 정보 출처다 — lookup 결과를 항상 우선한다.
 */
async function enrich(entries: ChartEntry[]): Promise<EnrichedEntry[]> {
  const out: EnrichedEntry[] = [];
  for (let i = 0; i < entries.length; i += 100) {
    const batch = entries.slice(i, i + 100);
    const ids = batch.map((e) => e.id).join(",");
    try {
      const res = await fetch(`https://itunes.apple.com/lookup?id=${ids}&country=${COUNTRY}`);
      const json = (await res.json()) as {
        results?: Array<{
          trackId: number;
          trackName?: string;
          artistName?: string;
          trackViewUrl?: string;
          primaryGenreName?: string;
          artworkUrl512?: string;
          artworkUrl100?: string;
        }>;
      };
      const byId = new Map((json.results ?? []).map((r) => [String(r.trackId), r]));
      for (const e of batch) {
        const meta = byId.get(e.id);
        if (!meta) continue; // lookup에 안 걸리면(비공개 전환 등) 버린다 — 이름을 지어내지 않는다.
        out.push({
          ...e,
          name: meta.trackName ?? e.name,
          artistName: meta.artistName ?? e.artistName,
          url: meta.trackViewUrl ?? e.url,
          genre: meta.primaryGenreName ?? "",
          artworkUrl512: meta.artworkUrl512 ?? meta.artworkUrl100 ?? e.artworkUrl100,
        });
      }
    } catch {
      for (const e of batch) if (e.name) out.push({ ...e, genre: "", artworkUrl512: e.artworkUrl100 });
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return out;
}

async function uploadIcon(client: S3Client, id: string, url: string): Promise<string | null> {
  try {
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
  } catch {
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
  console.log(`Apple 차트(${COUNTRY}) 수집: ${CHARTS.join(", ")} (차트당 ${CHART_LIMIT}개)\n`);

  const sb = db();

  const existingIds = new Set<string>();
  const existingNames = new Set<string>();
  const existingAppIds = new Set<string>(); // download_url 의 /id\d+ 로 이미 등록된 앱 판별
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("ssdown_software_applications")
      .select("id,name,name_kr,download_url,developer_website_url")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    for (const row of data ?? []) {
      existingIds.add(row.id);
      for (const n of [row.name, row.name_kr]) if ((n ?? "").trim()) existingNames.add(n.trim());
      for (const u of [row.download_url, row.developer_website_url]) {
        const m = String(u ?? "").match(/\/id(\d+)/);
        if (m) existingAppIds.add(m[1]);
      }
    }
    if (!data || data.length < 1000) break;
  }
  console.log(`기존 DB: id ${existingIds.size}개 / 이름 ${existingNames.size}개 / 앱스토어ID ${existingAppIds.size}개\n`);

  // ── 차트 수집 + dedup(같은 앱이 여러 차트에 겹치는 것 제거) ─────────────────
  const byAppId = new Map<string, ChartEntry>();
  for (const chart of CHARTS) {
    try {
      const entries = await fetchChart(chart);
      let added = 0;
      for (const e of entries) {
        if (!byAppId.has(e.id)) added++;
        byAppId.set(e.id, e);
      }
      console.log(`  [${chart}]: ${entries.length}개 (신규 ${added}, 누적 ${byAppId.size})`);
    } catch (e) {
      console.warn(`  [${chart}] 실패: ${e instanceof Error ? e.message : e}`);
    }
  }

  if (GENRE_SCRAPE) {
    console.log(`\n장르별 차트 페이지 스크레이핑 (${SCRAPE_FEEDS.join(", ")} × 장르 ${GENRE_IDS.length}개)...`);
    for (const feed of SCRAPE_FEEDS) {
      for (const genreId of GENRE_IDS) {
        const ids = await scrapeGenreChartIds(feed, genreId);
        let added = 0;
        for (const id of ids) {
          if (byAppId.has(id)) continue;
          added++;
          // name은 비워 둔다 — enrich()의 iTunes Lookup 결과만 신뢰한다(지어내지 않음).
          byAppId.set(id, {
            id,
            name: "",
            artistName: "",
            url: `https://apps.apple.com/${COUNTRY}/app/id${id}`,
            artworkUrl100: "",
          });
        }
        if (added) console.log(`  [${feed}/${genreId}]: 신규 ${added} (누적 ${byAppId.size})`);
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  // 기존 DB(앱스토어ID)와 겹치는 것만 우선 제외한다. 이름 dedup은 enrich() 이후
  // (장르 스크레이핑으로 들어온 항목은 아직 이름을 모르기 때문).
  const preEnrich = [...byAppId.values()].filter((e) => !existingAppIds.has(e.id));
  console.log(`\n차트+장르 스크레이핑 총 ${byAppId.size}개 → 기존 앱스토어ID와 겹쳐 제외 후 ${preEnrich.length}개 후보`);

  console.log("메타(이름/개발사/장르/고해상도 아이콘) 보강 중...");
  const enrichedAll = await enrich(preEnrich);
  const enriched = enrichedAll.filter((e) => e.name.trim() && !existingNames.has(e.name.trim()));
  console.log(`이름 확인 및 기존과 중복 제외 후 최종 신규 후보 ${enriched.length}개`);

  const taken = new Set(existingIds);
  const rows: Record<string, unknown>[] = [];
  for (const e of enriched) {
    const id = slugify(e.name, e.id, taken);
    taken.add(id);
    const cat = GENRE_MAP[e.genre] ?? fallbackCategory();
    rows.push({
      id,
      slug: `/ios/${id}`,
      name: e.name,
      name_kr: e.name,
      platform: "iOS",
      developer_name: e.artistName,
      developer_website_url: e.url,
      category_main: cat.main,
      category_sub: cat.sub,
      seo_title: "",
      seo_description: "",
      seo_title_kr: null,
      seo_description_kr: null,
      download_url: e.url,
      file_size: "",
      license: "Free",
      security_status: "Unknown",
      // Apple 차트/평점은 그 스토어 이용자의 것이라 우리 사이트 평점으로 넣지 않는다.
      rating_average: 0,
      rating_total_count: 0,
      icon_url: NO_ICONS ? e.artworkUrl512 : null, // 아래에서 S3 업로드 후 채움
      short_summary: "",
      short_summary_kr: null,
      body_html: "",
      editor_review_html: "",
      ai_review_html: "",
      ai_review_html_kr: null,
      pros: [],
      cons: [],
      os_requirements: "",
      languages: ["Korean"],
      last_updated_date: null,
      _artworkUrl512: e.artworkUrl512, // 삽입 전 제거
    });
  }

  fs.writeFileSync(PREVIEW_FILE, JSON.stringify(rows, null, 2), "utf-8");
  console.log(`\n미리보기 저장: ${PREVIEW_FILE} (${rows.length}건)`);

  if (!DO_INSERT) {
    console.log("\n[dry-run] DB에 쓰지 않았습니다. 실제 삽입: --insert 를 붙이세요.");
    return;
  }

  if (!NO_ICONS) {
    const client = s3();
    const urls = await mapLimit(
      rows,
      8,
      (r) => uploadIcon(client, r.id as string, r._artworkUrl512 as string),
      (d, t) => console.log(`  아이콘 ${d}/${t}`),
    );
    rows.forEach((r, i) => {
      if (urls[i]) r.icon_url = urls[i];
    });
    console.log(`아이콘 업로드: ${urls.filter(Boolean).length}/${rows.length}`);
  }
  rows.forEach((r) => delete (r as Record<string, unknown>)._artworkUrl512);

  let inserted = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await sb.from("ssdown_software_applications").upsert(chunk, { onConflict: "id", ignoreDuplicates: true });
    if (error) {
      console.error(`  batch ${i / 100 + 1} 실패: ${error.message}`);
      continue;
    }
    inserted += chunk.length;
  }

  fs.writeFileSync(IDS_FILE, JSON.stringify(rows.map((r) => r.id)), "utf-8");
  console.log(`\n완료: ${inserted}개 삽입`);
  console.log(`id 목록 저장: ${IDS_FILE}`);
  console.log("다음 단계: npx tsx scripts/generate-bilingual-reviews.ts --provider=claude --ids=.apple-charts-ids.json");
}

main().catch((e) => {
  console.error("오류:", e);
  process.exit(1);
});
