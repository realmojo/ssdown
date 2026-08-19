/**
 * import-download-beer.ts
 *
 * download.beer (WordPress) 의 app / game 포스트 "메타 정보만" WP REST API로 가져와
 * software_applications 테이블에 뼈대 레코드를 만듭니다.
 *
 * 저작권 정책: 본문 HTML / 이미지 / 발췌문은 복사하지 않습니다.
 * 가져오는 것은 사실 정보뿐입니다: 앱 이름(한국어), slug, 카테고리, 플랫폼.
 * 콘텐츠(리뷰/요약/SEO)는 이후 generate-bilingual-reviews.ts 가 새로 생성합니다.
 * ai_review_html 이 비어 있는 동안에는 목록 페이지에 노출되지 않습니다.
 *
 * Usage:
 *   npx tsx scripts/import-download-beer.ts                # dry-run → .download-beer-preview.json
 *   npx tsx scripts/import-download-beer.ts --insert       # 신규 항목만 Supabase에 삽입 (기존 id 스킵)
 *   npx tsx scripts/import-download-beer.ts --types=app    # app만 (기본: app,game)
 *
 * 삽입된 id 목록은 scripts/.download-beer-ids.json 에 저장되어
 * generate-bilingual-reviews.ts 의 대상 목록으로 사용됩니다.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

const args = process.argv.slice(2);
const getArg = (prefix: string) =>
  args.find((a) => a.startsWith(prefix))?.split("=")[1];

const DO_INSERT = args.includes("--insert");
const TYPES = (getArg("--types") ?? "app,game").split(",").map((t) => t.trim());

const WP_BASE = "https://download.beer/wp-json/wp/v2";
const PREVIEW_FILE = path.join(process.cwd(), "scripts", ".download-beer-preview.json");
const IDS_FILE = path.join(process.cwd(), "scripts", ".download-beer-ids.json");

// download.beer app-category slug → 기존 DB category_main 값
const CATEGORY_MAP: Record<string, { main: string; sub: string }> = {
  "ott":                  { main: "Multimedia",            sub: "Streaming" },
  "pc-optimization":      { main: "Utilities & Tools",     sub: "PC Optimization" },
  "development":          { main: "Development & IT",      sub: "Development" },
  "entertain":            { main: "Games",                 sub: "Entertainment" },
  "education":            { main: "Education & Reference", sub: "Education" },
  "finance":              { main: "Productivity",          sub: "Finance" },
  "video-player":         { main: "Multimedia",            sub: "Video Player" },
  "driver":               { main: "Utilities & Tools",     sub: "Drivers" },
  "memo":                 { main: "Productivity",          sub: "Notes & Planner" },
  "security":             { main: "Security & Privacy",    sub: "Antivirus" },
  "browser":              { main: "Browsers",              sub: "Web Browser" },
  "business":             { main: "Productivity",          sub: "Business" },
  "social-communication": { main: "Social & Communication", sub: "Messenger" },
  "travel":               { main: "Travel & Navigation",   sub: "Maps" },
  "video-edit":           { main: "Multimedia",            sub: "Video Editing" },
  "remote-pc":            { main: "Utilities & Tools",     sub: "Remote Desktop" },
  "utility-tool":         { main: "Utilities & Tools",     sub: "Utilities" },
  "music-player":         { main: "Multimedia",            sub: "Music Player" },
  "image-viewer":         { main: "Multimedia",            sub: "Image Viewer & Editor" },
  "cloud":                { main: "Internet & Network",    sub: "Cloud Storage" },
  "screen-recording":     { main: "Multimedia",            sub: "Screen Recording" },
};

interface WpPost {
  id: number;
  slug: string;
  modified: string;
  title: { rendered: string };
  "app-category"?: number[];
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

// slug 에서 영어 이름 초안 생성 (AI 생성 단계에서 정식 명칭으로 교체됨)
const WORD_FIXES: Record<string, string> = {
  pc: "PC", ai: "AI", tv: "TV", hd: "HD", "3d": "3D", vpn: "VPN",
  pdf: "PDF", ftp: "FTP", sdk: "SDK", ide: "IDE", db: "DB", vs: "VS",
};

function titleizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => WORD_FIXES[w] ?? w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function fetchAllPosts(type: string): Promise<WpPost[]> {
  const posts: WpPost[] = [];
  let page = 1;
  while (true) {
    const url = `${WP_BASE}/${type}?per_page=100&page=${page}&_fields=id,slug,modified,title,app-category`;
    const res = await fetch(url);
    if (res.status === 400) break; // 페이지 범위 초과
    if (!res.ok) throw new Error(`${type} page ${page} 요청 실패: HTTP ${res.status}`);
    const batch = (await res.json()) as WpPost[];
    posts.push(...batch);
    const totalPages = parseInt(res.headers.get("x-wp-totalpages") ?? "1", 10);
    console.log(`  ${type} page ${page}/${totalPages}: ${batch.length}개`);
    if (page >= totalPages) break;
    page++;
  }
  return posts;
}

async function fetchCategoryTerms(): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  const res = await fetch(`${WP_BASE}/app-category?per_page=100`);
  if (!res.ok) return map;
  const terms = (await res.json()) as Array<{ id: number; slug: string }>;
  for (const t of terms) map.set(t.id, t.slug);
  return map;
}

function toRecord(post: WpPost, type: string, termSlugById: Map<number, string>) {
  const nameKr = decodeEntities(post.title.rendered).trim();
  const nameEn = titleizeSlug(post.slug);

  let category = { main: "Utilities & Tools", sub: "Utilities" };
  if (type === "game") {
    category = { main: "Games", sub: "Games" };
  } else {
    const termId = post["app-category"]?.[0];
    const termSlug = termId ? termSlugById.get(termId) : undefined;
    if (termSlug && CATEGORY_MAP[termSlug]) category = CATEGORY_MAP[termSlug];
  }

  return {
    id: post.slug,
    slug: `/windows/${post.slug}`,
    name: nameEn,
    name_kr: nameKr,
    platform: "Windows",
    developer_name: "",
    developer_website_url: null,
    category_main: category.main,
    category_sub: category.sub,
    // 콘텐츠/SEO 필드는 전부 비움 — generate-bilingual-reviews.ts 가 채움
    seo_title: "",
    seo_description: "",
    seo_title_kr: null,
    seo_description_kr: null,
    download_url: "#",
    file_size: "",
    license: "Free",
    security_status: "Unknown",
    rating_average: 0,
    rating_total_count: 0,
    icon_url: null,
    short_summary: "",
    short_summary_kr: null,
    body_html: "",
    editor_review_html: "",
    ai_review_html: "",
    ai_review_html_kr: null,
    pros: [],
    cons: [],
    os_requirements: "Windows 10 이상",
    languages: ["Korean", "English"],
    last_updated_date: post.modified,
  };
}

async function main() {
  console.log(`download.beer 메타 정보 가져오기 (types: ${TYPES.join(", ")})\n`);

  const termSlugById = await fetchCategoryTerms();
  console.log(`app-category 용어 ${termSlugById.size}개 로드\n`);

  const records: ReturnType<typeof toRecord>[] = [];
  for (const type of TYPES) {
    console.log(`${type} 포스트 수집:`);
    const posts = await fetchAllPosts(type);
    for (const post of posts) records.push(toRecord(post, type, termSlugById));
  }

  console.log(`\n총 ${records.length}개 변환 완료`);

  const byCategory: Record<string, number> = {};
  for (const r of records) {
    byCategory[r.category_main] = (byCategory[r.category_main] ?? 0) + 1;
  }
  console.log("카테고리 분포:", byCategory);

  if (!DO_INSERT) {
    fs.writeFileSync(PREVIEW_FILE, JSON.stringify(records, null, 2), "utf-8");
    console.log(`\n[dry-run] DB에 쓰지 않았습니다. 미리보기: ${PREVIEW_FILE}`);
    console.log("실제 삽입: npx tsx scripts/import-download-beer.ts --insert");
    return;
  }

  const supabase: SupabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 기존 id 조회 — 이미 있는 앱은 건드리지 않음 (Softonic 데이터 보호)
  const ids = records.map((r) => r.id);
  const existing = new Set<string>();
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await supabase
      .from("ssdown_software_applications")
      .select("id")
      .in("id", ids.slice(i, i + 200));
    if (error) throw new Error(`기존 id 조회 실패: ${error.message}`);
    for (const row of data ?? []) existing.add(row.id);
  }

  const fresh = records.filter((r) => !existing.has(r.id));
  console.log(`\n기존 id 스킵: ${records.length - fresh.length}개, 신규 삽입: ${fresh.length}개`);

  let ok = 0;
  let failed = 0;
  for (let i = 0; i < fresh.length; i += 50) {
    const batch = fresh.slice(i, i + 50);
    const { error } = await supabase.from("ssdown_software_applications").insert(batch);
    if (error) {
      console.error(`  batch ${i / 50 + 1} 실패: ${error.message}`);
      failed += batch.length;
    } else {
      ok += batch.length;
      console.log(`  ${ok}/${fresh.length} 저장`);
    }
  }

  fs.writeFileSync(
    IDS_FILE,
    JSON.stringify(fresh.map((r) => r.id), null, 2),
    "utf-8",
  );
  console.log(`\n완료: 성공 ${ok}, 실패 ${failed}`);
  console.log(`id 목록 저장: ${IDS_FILE}`);
  console.log("다음 단계: npx tsx scripts/generate-bilingual-reviews.ts");
}

main().catch((e) => {
  console.error("오류:", e);
  process.exit(1);
});
