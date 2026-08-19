/**
 * import-downloadziper.ts
 *
 * downloadziper.co.kr (WordPress) 의 "다양한 앱"(카테고리 290) 목록에서
 * "메타 정보만" WP REST API 로 가져와 software_applications 테이블에 뼈대 레코드를
 * 만듭니다.
 *
 * 저작권 정책: 본문 HTML / 발췌문 / 이미지 / SEO 설명문은 복사하지 않습니다.
 * 가져오는 것은 사실 정보뿐입니다: 앱 이름(meta.custom-title), slug, 카테고리, 날짜.
 * 콘텐츠(리뷰/요약/SEO)는 이후 generate-bilingual-reviews.ts 가 새로 생성합니다.
 * ai_review_html_kr 이 비어 있는 동안에는 목록·사이트맵에 노출되지 않습니다.
 *
 * 평점은 가져오지 않습니다. 원 사이트의 값은 그 사이트 방문자의 투표라
 * 우리 사이트 평점으로 표시하면 사실과 다릅니다. rating_average 는 0 으로 둡니다.
 *
 * Usage:
 *   npx tsx scripts/import-downloadziper.ts                    # dry-run → .downloadziper-preview.json
 *   npx tsx scripts/import-downloadziper.ts --insert           # 신규만 삽입 (기존 id/이름 스킵)
 *   npx tsx scripts/import-downloadziper.ts --platform=Android # 기본 플랫폼 (기본값 Android)
 *
 * 삽입된 id 목록은 scripts/.downloadziper-ids.json 에 저장되어
 * generate-bilingual-reviews.ts 의 대상 목록으로 쓸 수 있습니다.
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
const DEFAULT_PLATFORM = (getArg("--platform=") ?? "Android") as
  | "Windows"
  | "Android"
  | "Mac"
  | "iOS";

const WP = "https://downloadziper.co.kr/wp-json/wp/v2";
const APP_CATEGORY_ID = 290; // "다양한 앱"

/** 원 사이트 카테고리 slug → 우리 DB 의 category_main / category_sub */
const CATEGORY_MAP: Record<string, { main: string; sub: string }> = {
  game: { main: "Games", sub: "Games" },
  "video-player": { main: "Multimedia", sub: "Video Players" },
  "video-editor": { main: "Multimedia", sub: "Video Editors" },
  "video-extraction": { main: "Multimedia", sub: "Video Converters" },
  audio: { main: "Multimedia", sub: "Audio" },
  "photo-editor": { main: "Multimedia", sub: "Photo Editors" },
  security: { main: "Security & Privacy", sub: "Antivirus" },
  document: { main: "Productivity", sub: "Documents" },
  "pdf-viewer": { main: "Productivity", sub: "PDF" },
  memo: { main: "Productivity", sub: "Notes" },
  productivity: { main: "Productivity", sub: "Productivity" },
  messenger: { main: "Social & Communication", sub: "Messaging" },
  internet: { main: "Browsers", sub: "Browsers" },
  network: { main: "Internet & Network", sub: "Network" },
  remote: { main: "Internet & Network", sub: "Remote Desktop" },
  "cloud-drive": { main: "Internet & Network", sub: "Cloud Storage" },
  driver: { main: "Utilities & Tools", sub: "Drivers" },
  compression: { main: "Utilities & Tools", sub: "Compression" },
  translator: { main: "Utilities & Tools", sub: "Translation" },
  shopping: { main: "Lifestyle", sub: "Shopping" },
  "food-and-drinks": { main: "Lifestyle", sub: "Food & Drink" },
  travel: { main: "Travel & Navigation", sub: "Travel" },
  health: { main: "Lifestyle", sub: "Health" },
  finance: { main: "Lifestyle", sub: "Finance" },
  study: { main: "Education & Reference", sub: "Education" },
  "digital-contents": { main: "Multimedia", sub: "Digital Content" },
};

/** 한글 slug 로 저장된 카테고리는 이름으로 매칭한다. */
const CATEGORY_NAME_MAP: Record<string, { main: string; sub: string }> = {
  건강: { main: "Lifestyle", sub: "Health" },
  금융: { main: "Lifestyle", sub: "Finance" },
  쇼핑: { main: "Lifestyle", sub: "Shopping" },
  여행: { main: "Travel & Navigation", sub: "Travel" },
  영화: { main: "Multimedia", sub: "Video Players" },
  육아: { main: "Lifestyle", sub: "Family" },
  학습: { main: "Education & Reference", sub: "Education" },
  구인구직: { main: "Lifestyle", sub: "Jobs" },
  "디지털 콘텐츠": { main: "Multimedia", sub: "Digital Content" },
};

/**
 * 원 사이트에는 플랫폼 필드가 없다. 표본 179건의 SEO 문구를 훑어 보면
 * 모바일 단서 118 / PC 전용 단서 4 / 단서 없음 57 이라 기본값은 Android 가 맞고,
 * PC 전용으로 확인된 것만 여기서 덮어쓴다. 잘못된 플랫폼은 "APK 설치" 같은
 * 엉뚱한 안내 문구를 만들어 내므로 기본값에 맡기지 않는다.
 */
const PLATFORM_OVERRIDE: Record<string, "Windows" | "Mac" | "iOS" | "Android"> = {
  // 스팀·콘솔로만 나오는 게임
  "elden-ring": "Windows",
  "dark-souls-3": "Windows",
  "djmax-respect-v": "Windows",
  supervive: "Windows",
  "metalslug-awakening": "Windows",
  "crimson-desert": "Windows",
  // PC 전용 유틸리티
  puttygen: "Windows",
  "nvidia-driver": "Windows",
};

interface WpPost {
  id: number;
  slug: string;
  date: string;
  modified: string;
  categories: number[];
  meta?: Record<string, unknown>;
}

function client(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": "ssdown-importer" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return (await res.json()) as T;
}

/** 카테고리 목록에서 id → {slug, name} 을 만든다. */
async function loadCategories() {
  const cats = await fetchJson<{ id: number; slug: string; name: string }[]>(
    `${WP}/categories?per_page=100`,
  );
  return new Map(cats.map((c) => [c.id, { slug: c.slug, name: c.name }]));
}

/** 앱 카테고리의 모든 글을 사실 필드만 받아 온다. */
async function fetchPosts(): Promise<WpPost[]> {
  const fields = "id,slug,date,modified,categories,meta";
  const out: WpPost[] = [];
  for (let page = 1; ; page++) {
    const batch = await fetchJson<WpPost[]>(
      `${WP}/posts?categories=${APP_CATEGORY_ID}&per_page=100&page=${page}&_fields=${fields}`,
    );
    if (!batch.length) break;
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

/** 우리 DB 에 이미 있는 id 와 한국어 이름을 모은다(중복 삽입 방지). */
async function loadExisting(db: SupabaseClient) {
  const ids = new Set<string>();
  const names = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("ssdown_software_applications")
      .select("id,name,name_kr")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    for (const r of data) {
      ids.add(r.id);
      for (const n of [r.name_kr, r.name]) {
        const t = (n ?? "").trim();
        if (t) names.add(t);
      }
    }
    if (data.length < 1000) break;
  }
  return { ids, names };
}

function pickCategory(
  post: WpPost,
  catById: Map<number, { slug: string; name: string }>,
): { main: string; sub: string } {
  for (const id of post.categories) {
    if (id === APP_CATEGORY_ID) continue; // "다양한 앱" 은 분류 정보가 없다
    const cat = catById.get(id);
    if (!cat) continue;
    const bySlug = CATEGORY_MAP[cat.slug];
    if (bySlug) return bySlug;
    const byName = CATEGORY_NAME_MAP[cat.name];
    if (byName) return byName;
  }
  return { main: "Utilities & Tools", sub: "Utilities" };
}

function platformPath(platform: string): string {
  return platform.toLowerCase() === "ios" ? "iphone" : platform.toLowerCase();
}

async function main() {
  const db = client();
  const [catById, posts, existing] = await Promise.all([
    loadCategories(),
    fetchPosts(),
    loadExisting(db),
  ]);

  console.log(`원본 글: ${posts.length}건`);
  console.log(`기존 DB: id ${existing.ids.size}개 / 이름 ${existing.names.size}개`);

  const rows: Record<string, unknown>[] = [];
  const skipped: string[] = [];
  const unnamed: string[] = [];

  for (const post of posts) {
    const nameKr = String(post.meta?.["custom-title"] ?? "").trim();
    if (!nameKr) {
      unnamed.push(post.slug);
      continue;
    }
    if (existing.ids.has(post.slug) || existing.names.has(nameKr)) {
      skipped.push(nameKr);
      continue;
    }

    const category = pickCategory(post, catById);
    const platform = PLATFORM_OVERRIDE[post.slug] ?? DEFAULT_PLATFORM;
    rows.push({
      id: post.slug,
      slug: `/${platformPath(platform)}/${post.slug}`,
      name: nameKr,
      name_kr: nameKr,
      platform,
      developer_name: "",
      developer_website_url: null,
      category_main: category.main,
      category_sub: category.sub,
      // 콘텐츠·SEO 는 전부 비운다. generate-bilingual-reviews.ts 가 채운다.
      seo_title: "",
      seo_description: "",
      seo_title_kr: null,
      seo_description_kr: null,
      download_url: "#",
      file_size: "",
      license: "Free",
      security_status: "Unknown",
      // 원 사이트의 평점은 그 사이트 방문자의 것이므로 가져오지 않는다.
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
      os_requirements: "",
      languages: ["Korean"],
      last_updated_date: post.modified || post.date,
    });
  }

  console.log(`\n신규: ${rows.length}건 / 중복 스킵: ${skipped.length}건 / 이름 없음: ${unnamed.length}건`);
  if (skipped.length) console.log(`  스킵 예: ${skipped.slice(0, 8).join(", ")}`);

  const byCategory: Record<string, number> = {};
  for (const r of rows) {
    const k = String(r.category_main);
    byCategory[k] = (byCategory[k] ?? 0) + 1;
  }
  console.log("\n카테고리 분포:");
  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${String(v).padStart(4)}  ${k}`));

  const previewPath = path.join(__dirname, ".downloadziper-preview.json");
  fs.writeFileSync(previewPath, JSON.stringify(rows, null, 1));
  console.log(`\n미리보기 저장: ${previewPath}`);

  if (!DO_INSERT) {
    console.log("\n[dry-run] 삽입하지 않았습니다. 실제 삽입은 --insert 를 붙이세요.");
    return;
  }

  // 100건씩 나눠 넣는다. 이미 있는 id 는 위에서 걸렀지만 만약을 위해 무시 처리.
  let inserted = 0;
  const insertedIds: string[] = [];
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await db
      .from("ssdown_software_applications")
      .upsert(chunk, { onConflict: "id", ignoreDuplicates: true });
    if (error) {
      console.error(`  삽입 실패 (${i}~):`, error.message);
      continue;
    }
    inserted += chunk.length;
    insertedIds.push(...chunk.map((c) => String(c.id)));
    console.log(`  ${inserted}/${rows.length} 삽입`);
  }

  const idsPath = path.join(__dirname, ".downloadziper-ids.json");
  fs.writeFileSync(idsPath, JSON.stringify(insertedIds, null, 1));
  console.log(`\n삽입 완료: ${inserted}건`);
  console.log(`대상 id 목록: ${idsPath}`);
  console.log("\n다음 단계: npx tsx scripts/generate-bilingual-reviews.ts 로 한국어 리뷰를 생성하세요.");
  console.log("리뷰가 채워지기 전까지는 목록·사이트맵에 노출되지 않습니다.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
