/**
 * import-softonic-kr.ts
 *
 * softonic.kr 카테고리 목록 페이지에서 "사실 정보만" 가져와
 * software_applications 에 뼈대 레코드를 만든다.
 *
 * 저작권 정책: 본문 HTML/리뷰/설명문은 가져오지 않는다. 목록 카드에 보이는
 * 사실 정보(앱 이름, 아이콘)만 가져온다. 콘텐츠(리뷰/요약/SEO)는 이후
 * generate-bilingual-reviews.ts 가 AI로 새로 생성한다.
 *
 * 주의: softonic.kr 은 이 목록의 3페이지 이상을 봇 차단(HTTP 406)한다 — 새 세션/다른 도구로
 * 시도해도 동일해서 세션 문제가 아니라 사이트 자체의 깊은 페이지네이션 차단으로 보인다.
 * 그래서 페이지 수를 늘리는 대신 정렬(sort) 옵션을 여러 개 돌려서(각각 독립된 목록이라
 * 페이지 1~2 제한에 걸리지 않는다) 서로 다른 앱 집합을 모은다.
 *
 * Usage:
 *   npx tsx scripts/import-softonic-kr.ts                                          # dry-run, 기본 정렬 전체
 *   npx tsx scripts/import-softonic-kr.ts --sort=trending --dry-run                # 정렬 1개만 시험
 *   npx tsx scripts/import-softonic-kr.ts --insert                                 # 실제 삽입
 *   npx tsx scripts/import-softonic-kr.ts --sorts=trending,new-apps --pages=2
 *
 * 삽입된 id 목록은 scripts/.softonic-kr-ids.json 에 저장되어
 * generate-bilingual-reviews.ts --ids=.softonic-kr-ids.json 의 대상 목록으로 쓰인다.
 */

import { chromium, Browser, BrowserContext, Page } from "playwright";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

const args = process.argv.slice(2);
const getArg = (prefix: string) => args.find((a) => a.startsWith(prefix))?.split("=")[1];

const CATEGORY = getArg("--category=") ?? "게임";
// 게임 카테고리에서 확인된 정렬 옵션. 3페이지 이상이 막히므로 각 정렬을 독립된
// "목록"으로 취급해 서로 다른 앱을 모은다 (trending/weekly-downloads/free-trending 은
// 겹치는 인기 게임이 많고, new-apps/new-versions/date/last-news 는 상대적으로 덜 겹친다).
const ALL_SORTS = [
  "trending",
  "weekly-downloads",
  "free-trending",
  "new-apps",
  "new-versions",
  "date",
  "last-news",
];
const SORTS = (getArg("--sorts=") ?? getArg("--sort=") ?? ALL_SORTS.join(",")).split(",").map((s) => s.trim());
const PLATFORM = getArg("--platform=") ?? "android";
// 3페이지부터 예외 없이 차단되므로 2보다 크게 줘도 의미가 없다.
const PAGES = Math.min(parseInt(getArg("--pages=") ?? "2", 10) || 2, 2);
const DELAY_MS = parseInt(getArg("--delay=") ?? "1200", 10) || 1200;
const DO_INSERT = args.includes("--insert");

const PLATFORM_MAP: Record<string, string> = {
  android: "Android",
  iphone: "iOS",
  windows: "Windows",
  mac: "Mac",
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const PREVIEW_FILE = path.join(process.cwd(), "scripts", ".softonic-kr-preview.json");
const IDS_FILE = path.join(process.cwd(), "scripts", ".softonic-kr-ids.json");

interface Candidate {
  name: string;
  url: string;
  iconUrl: string | null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function listingUrl(sort: string, page: number): string {
  const base = `https://www.softonic.kr/${PLATFORM}/${encodeURIComponent(CATEGORY)}:${sort}`;
  return page <= 1 ? base : `${base}/${page}`;
}

/** 플레인 fetch는 3페이지째부터 봇으로 판단돼 406을 받는다(Fastly 엣지 차단).
 * crawl-softonic-all.ts 와 같은 방식으로 실제 브라우저(Playwright)를 띄워 우회한다. */
async function createBrowser(): Promise<{ browser: Browser; context: BrowserContext }> {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({
    userAgent: UA,
    locale: "ko-KR",
    extraHTTPHeaders: { "Accept-Language": "ko,en;q=0.9" },
    viewport: { width: 1280, height: 900 },
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });
  return { browser, context };
}

/** 목록 페이지 1개에서 앱 카드(이름/링크/아이콘)만 뽑는다. 본문은 건드리지 않는다.
 * 페이지마다 새 탭을 열지 않고 같은 탭에서 계속 이동한다 — crawl-softonic-all.ts 와
 * 동일한 방식이 봇 차단을 덜 유발했다(탭을 계속 새로 여는 쪽이 더 의심스러워 보임). */
async function fetchListingPage(page: Page, sort: string, pageNum: number): Promise<Candidate[]> {
  await page.goto(listingUrl(sort, pageNum), { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1200);
  return await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('a[data-meta="program"]')) as HTMLAnchorElement[];
    return cards
      .map((a) => ({
        name: a.getAttribute("title")?.trim() ?? "",
        url: a.href,
        iconUrl: a.querySelector('img[data-meta="program-icon"]')?.getAttribute("src") ?? null,
      }))
      .filter((c) => c.name && c.url);
  });
}

/** 앱 이름 → DB 기본키로 쓸 슬러그. ASCII만 허용 — 한글만으로 된 이름은
 * 카드 URL의 서브도메인(예: pojavlauncher.softonic.kr → pojavlauncher)으로 대체한다. */
function slugify(name: string, url: string, taken: Set<string>): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || new URL(url).hostname.split(".")[0];
  if (base && !taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

function toRecord(c: Candidate, id: string) {
  const platform = PLATFORM_MAP[PLATFORM] ?? "Android";
  return {
    id,
    slug: `/${PLATFORM}/${id}`,
    name: c.name,
    name_kr: c.name,
    platform,
    developer_name: "",
    developer_website_url: null,
    category_main: "Games",
    category_sub: "Games",
    seo_title: "",
    seo_description: "",
    seo_title_kr: null,
    seo_description_kr: null,
    download_url: "#",
    file_size: "",
    license: "Free",
    security_status: "Unknown",
    // 소프토닉 평점은 그 사이트 이용자의 것이라 우리 사이트 평점으로 넣지 않는다
    // (import-play-apps.ts 와 동일한 정책).
    rating_average: 0,
    rating_total_count: 0,
    icon_url: c.iconUrl,
    short_summary: "",
    short_summary_kr: null,
    body_html: "",
    editor_review_html: "",
    ai_review_html: "",
    ai_review_html_kr: null,
    pros: [],
    cons: [],
    os_requirements: platform,
    languages: ["Korean", "English"],
    last_updated_date: null,
  };
}

async function main() {
  console.log(`softonic.kr 목록 수집: /${PLATFORM}/${CATEGORY}, 정렬 ${SORTS.length}개(${SORTS.join(", ")}) × ${PAGES}페이지\n`);

  const supabase: SupabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 기존 id / 이름 전체를 먼저 로드해 둔다 — 이미 있는 앱은 절대 건드리지 않는다.
  const existingIds = new Set<string>();
  const existingNames = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("ssdown_software_applications")
      .select("id,name,name_kr")
      .range(from, from + 999);
    if (error) throw new Error(`기존 데이터 조회 실패: ${error.message}`);
    for (const row of data ?? []) {
      existingIds.add(row.id);
      for (const n of [row.name, row.name_kr]) if ((n ?? "").trim()) existingNames.add(n.trim());
    }
    if (!data || data.length < 1000) break;
  }
  console.log(`기존 DB: id ${existingIds.size}개 / 이름 ${existingNames.size}개\n`);

  // ── 목록 페이지 수집 ──────────────────────────────────────────────────────
  const { browser, context } = await createBrowser();
  const listPage = await context.newPage();
  await listPage.route("**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,eot}", (route) => route.abort());
  const seenUrls = new Set<string>();
  const candidates: Candidate[] = [];
  try {
    for (const sort of SORTS) {
      console.log(`[정렬: ${sort}]`);
      for (let page = 1; page <= PAGES; page++) {
        try {
          const items = await fetchListingPage(listPage, sort, page);
          if (items.length === 0) {
            console.log(`  p${page}: 앱 없음 → 이 정렬 종료`);
            break;
          }
          let added = 0;
          for (const c of items) {
            if (seenUrls.has(c.url)) continue;
            seenUrls.add(c.url);
            candidates.push(c);
            added++;
          }
          console.log(`  p${page}/${PAGES}: ${items.length}개 (신규 ${added}, 누적 ${candidates.length})`);
        } catch (e) {
          console.warn(`  p${page}: 실패 (${e instanceof Error ? e.message : e}) — 이 정렬 건너뜀`);
          break;
        }
        await sleep(DELAY_MS);
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`\n목록에서 총 ${candidates.length}개 유니크 카드 수집`);

  // ── 기존 DB와 겹치는 것 제외 ──────────────────────────────────────────────
  const taken = new Set(existingIds);
  const rows: ReturnType<typeof toRecord>[] = [];
  let skippedExisting = 0;
  for (const c of candidates) {
    if (existingNames.has(c.name.trim())) {
      skippedExisting++;
      continue;
    }
    const id = slugify(c.name, c.url, taken);
    if (existingIds.has(id)) {
      skippedExisting++;
      continue;
    }
    taken.add(id);
    rows.push(toRecord(c, id));
  }

  console.log(`기존과 겹쳐 스킵: ${skippedExisting}개 / 신규 대상: ${rows.length}개`);

  fs.writeFileSync(PREVIEW_FILE, JSON.stringify(rows, null, 2), "utf-8");
  console.log(`\n미리보기 저장: ${PREVIEW_FILE}`);

  if (!DO_INSERT) {
    console.log("\n[dry-run] DB에 쓰지 않았습니다. 실제 삽입: --insert 를 붙이세요.");
    return;
  }

  let inserted = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await supabase
      .from("ssdown_software_applications")
      .upsert(chunk, { onConflict: "id", ignoreDuplicates: true });
    if (error) {
      console.error(`  batch ${i / 100 + 1} 실패: ${error.message}`);
      continue;
    }
    inserted += chunk.length;
    console.log(`  ${inserted}/${rows.length} 저장`);
  }

  fs.writeFileSync(IDS_FILE, JSON.stringify(rows.map((r) => r.id), null, 2), "utf-8");
  console.log(`\n완료: ${inserted}개 삽입`);
  console.log(`id 목록 저장: ${IDS_FILE}`);
  console.log("다음 단계: npx tsx scripts/generate-bilingual-reviews.ts --provider=claude --ids=.softonic-kr-ids.json");
}

main().catch((e) => {
  console.error("오류:", e);
  process.exit(1);
});
