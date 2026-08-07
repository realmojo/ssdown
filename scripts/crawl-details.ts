/**
 * crawl-details.ts
 *
 * .crawl-urls.json 을 읽어 각 앱 상세 페이지를 스크래핑하고 Supabase에 저장합니다.
 *
 * Usage:
 *   npx tsx scripts/crawl-details.ts                        # 전체 처리
 *   npx tsx scripts/crawl-details.ts --resume               # 미처리 URL만
 *   npx tsx scripts/crawl-details.ts --concurrency=15       # 동시 처리 수
 *   npx tsx scripts/crawl-details.ts --platform=android     # 특정 플랫폼만
 *   npx tsx scripts/crawl-details.ts --limit=1000           # N개만 처리
 *   npx tsx scripts/crawl-details.ts --input=path/to/urls.json
 */

import { chromium, Browser, BrowserContext, Page } from "playwright"; // BrowserContext used in createBrowser return type
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
dotenv.config({ path: ".env.local" });

// ── CLI 인수 ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (prefix: string) =>
  args.find((a) => a.startsWith(prefix))?.split("=")[1];

const CONCURRENCY = parseInt(getArg("--concurrency") ?? "1") || 1;
const DELAY_MS = parseInt(getArg("--delay") ?? "500") || 500;
const RESUME = args.includes("--resume");
const PLATFORM_FILTER =
  getArg("--platform")
    ?.split(",")
    .map((p) => p.trim().toLowerCase()) ?? null;
const LIMIT = parseInt(getArg("--limit") ?? "0") || 0; // 0 = 무제한
const INPUT_FILE =
  getArg("--input") ?? path.join(process.cwd(), "scripts", ".crawl-urls.json");
const PROGRESS_FILE = path.join(
  process.cwd(),
  "scripts",
  ".details-progress.json",
);

// ── 타입 ──────────────────────────────────────────────────────────────────────

type LicenseType = "Free" | "Trial" | "Paid" | "Open Source" | "Freemium";
type PlatformType = "Windows" | "Mac" | "Android" | "iOS" | "Web" | "Linux";
type SecurityStatus = "Safe" | "Warning" | "Dangerous" | "Unknown";

interface FaqItem {
  question: string;
  answer: string;
}

interface ScrapedApp {
  id: string;
  slug: string;
  name: string;
  platform: PlatformType;
  developer_name: string;
  developer_website_url: string | null;
  category_main: string;
  category_sub: string;
  seo_title: string;
  seo_description: string;
  download_url: string;
  file_size: string;
  license: LicenseType;
  security_status: SecurityStatus;
  rating_average: number;
  rating_total_count: number;
  icon_url: string | null;
  short_summary: string;
  body_html: string;
  editor_review_html: string;
  pros: string[];
  cons: string[];
  os_requirements: string | null;
  languages: string[];
  last_updated_date: string | null;
}

interface UrlEntry {
  url: string;
  platform: string;
}
interface Progress {
  processedUrls: string[];
  failedUrls: string[];
  startedAt: string;
  lastUpdated: string;
}

// ── 헬퍼 ─────────────────────────────────────────────────────────────────────

function normalizePlatform(raw: string): PlatformType {
  const map: Record<string, PlatformType> = {
    windows: "Windows",
    mac: "Mac",
    android: "Android",
    ios: "iOS",
    iphone: "iOS",
    web: "Web",
    linux: "Linux",
    pwa: "Web",
  };
  return map[raw.toLowerCase()] ?? "Windows";
}

function normalizeLicense(raw: string): LicenseType {
  const lower = raw.toLowerCase();
  if (lower.includes("open source")) return "Open Source";
  if (lower.includes("trial")) return "Trial";
  if (lower.includes("freemium")) return "Freemium";
  if (lower.includes("paid")) return "Paid";
  return "Free";
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function log(level: "INFO" | "WARN" | "ERROR" | "OK", msg: string) {
  const icons = { INFO: "📌", WARN: "⚠️", ERROR: "❌", OK: "✅" };
  const ts = new Date().toLocaleTimeString();
  console.log(`${icons[level]} [${ts}] ${msg}`);
}

// ── Progress ──────────────────────────────────────────────────────────────────

function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
    } catch {
      /**/
    }
  }
  return {
    processedUrls: [],
    failedUrls: [],
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
}

function saveProgress(p: Progress) {
  p.lastUpdated = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

// ── Browser ───────────────────────────────────────────────────────────────────

async function createBrowser(): Promise<{
  browser: Browser;
  context: BrowserContext;
}> {
  const browser = await chromium.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "en-US",
    extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
    viewport: { width: 1280, height: 900 },
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });
  return { browser, context };
}

// ── 상세 스크래핑 ─────────────────────────────────────────────────────────────

async function scrapeAppDetail(
  page: Page,
  url: string,
  platform: string,
): Promise<ScrapedApp> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2000);
  const html = await page.content();

  if (!html) throw new Error("HTML 취득 실패");

  const $ = cheerio.load(html);

  // JSON-LD
  const ldList: any[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).text());
      Array.isArray(parsed) ? ldList.push(...parsed) : ldList.push(parsed);
    } catch {
      /**/
    }
  });
  const ldApp =
    ldList.find((x) => x["@type"] === "SoftwareApplication") ?? null;
  const ldBreadcrumb =
    ldList.find((x) => x["@type"] === "BreadcrumbList") ?? null;

  const qt = (sel: string) => $(sel).first().text().trim() || "";
  const qa = (sel: string) =>
    $(sel)
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);
  const qaAttr = (sel: string, attr: string) =>
    $(sel)
      .map(
        (_, el) =>
          $(el).attr(attr) ||
          $(el).attr(`data-${attr}`) ||
          $(el).attr("data-lazy-src") ||
          "",
      )
      .get()
      .filter(Boolean);

  const name =
    qt('h1[itemprop="name"], h1.program-header__name, .program-header h1') ||
    qt("h1");
  const version = qt('[class*="version"], [itemprop="softwareVersion"]')
    .replace(/^v/i, "")
    .trim();
  const ratingText = qt(
    '[itemprop="ratingValue"], [class*="rating-value"], [class*="stars-number"]',
  );
  const reviewText = qt(
    '[itemprop="ratingCount"], [class*="rating-count"], [class*="review-count"]',
  );
  const downloadCount = qt(
    '[class*="download-count"], [class*="downloads-count"]',
  );
  const licenseText = qt(
    '[itemprop="offers"] [itemprop="price"], [class*="license"], [class*="type-tag"]',
  );
  const developer =
    qt('[itemprop="author"] [itemprop="name"], [class*="developer-name"]') ||
    $('a[href*="/publisher/"], a[href*="/author/"]').first().text().trim();

  let fileSize = "",
    osReq = "",
    lastUpdated = "",
    langStr = "";
  $(
    '[class*="specs"] [class*="item"], [class*="tech-specs"] li, .technical-sheet li',
  ).each((_, el) => {
    const txt = $(el).text().trim();
    if (txt.match(/MB|KB|GB/i)) fileSize = txt;
    else if (txt.match(/Windows|Mac|Android|iOS|Linux/i) && !osReq) osReq = txt;
    else if (txt.match(/202[0-9]|201[0-9]/)) lastUpdated = txt;
    else if (txt.match(/Language/i)) langStr = txt;
  });
  if (!fileSize) fileSize = qt('[class*="file-size"], [class*="filesize"]');
  if (!osReq) osReq = qt('[itemprop="operatingSystem"]');
  if (!lastUpdated) lastUpdated = qt('[class*="updated"], time[datetime]');

  const languages = qa('[class*="languages"] li')
    .concat(langStr ? [langStr] : [])
    .filter((v, i, a) => a.indexOf(v) === i);
  const securityText = qt(
    '[class*="security"], [class*="antivirus"], [class*="trusted"]',
  );
  const iconUrl =
    $('[class*="program-icon"] img, [class*="app-icon"] img, header img.icon')
      .first()
      .attr("src") ||
    ldApp?.image ||
    null;
  const screenshots = qaAttr(
    '[class*="screenshot"] img, [class*="gallery"] img',
    "src",
  ).filter((s) => s?.startsWith("http") && !s.includes("placeholder"));

  // 개발사 공식 사이트 추출
  let officialWebsiteUrl: string | null = null;
  $("h3").each((_, el) => {
    if (officialWebsiteUrl) return false;
    const text = $(el).text().trim();
    if (text === "Developer") {
      $(el)
        .closest("li")
        .find("a[href]")
        .each((__, a) => {
          const href = $(a).attr("href");
          if (
            href?.startsWith("http") &&
            !href.includes("softonic") &&
            !href.includes("sftcdn")
          ) {
            officialWebsiteUrl = href;
            return false;
          }
        });
    }
  });

  // 다운로드 URL
  let finalDownloadUrl = url;
  try {
    const dlRes = await fetch(url.replace(/\/$/, "") + "/download");
    if (dlRes.ok) {
      const $dl = cheerio.load(await dlRes.text());
      const external = $dl(
        'a[href*="store.microsoft.com"], a[href*="play.google.com"], a[href*="apple.com/app"], a.btn--external',
      )
        .first()
        .attr("href");
      const internal = $dl('a.js-download-btn-file, a[href*="post-download"]')
        .first()
        .attr("href");
      const extracted = external || internal;
      if (extracted) {
        if (extracted.startsWith("/")) {
          const u = new URL(url);
          finalDownloadUrl = `${u.protocol}//${u.hostname}${extracted}`;
        } else {
          finalDownloadUrl = extracted;
        }
      }
    }
  } catch {
    /**/
  }

  const pros = qa('[class*="pros"] li, [class*="good-things"] li');
  const cons = qa('[class*="cons"] li, [class*="bad-things"] li');
  const bodyEl = $(
    '[class*="article-text"], [class*="description-text"], [class*="program-description"]',
  ).first();
  const bodyHtml = bodyEl.html()?.trim() ?? "";
  const summary =
    $('[class*="description"] > p:first-child, [class*="intro"] p')
      .first()
      .text()
      .trim() || bodyEl.text().slice(0, 300).trim();

  // Editor Review (Clean HTML)
  const editorReviewEl = $('article[data-meta="editor-review"]').first();
  let editorReviewHtml = "";
  if (editorReviewEl.length) {
    editorReviewEl
      .find(
        '[data-meta="placeholder-slot"], [data-meta="prime-picks"], [id^="rscontainer"], svg, script, style, iframe, noscript',
      )
      .remove();
    const ALLOWED = new Set([
      "h2",
      "h3",
      "p",
      "strong",
      "em",
      "a",
      "ul",
      "ol",
      "li",
    ]);
    editorReviewEl.find("*").each((_, el) => {
      const tag = (el as any).tagName?.toLowerCase();
      if (!ALLOWED.has(tag)) $(el).replaceWith($(el).contents());
    });
    editorReviewEl.find("*").each((_, el) => {
      const tag = (el as any).tagName?.toLowerCase();
      const href = tag === "a" ? $(el).attr("href") : null;
      $(el)
        .removeAttr("class")
        .removeAttr("id")
        .removeAttr("style")
        .removeAttr("data-meta");
      if (href) $(el).attr("href", href);
    });
    editorReviewHtml = editorReviewEl.html()?.trim() ?? "";
  }

  const faqItems: FaqItem[] = [];
  $('[class*="faq"] [class*="item"], [class*="faq-item"]').each((_, el) => {
    const q = $(el).find('[class*="question"], [class*="title"]').text().trim();
    const a = $(el).find('[class*="answer"], [class*="body"]').text().trim();
    if (q && a) faqItems.push({ question: q, answer: a });
  });

  const breadcrumbItems = ldBreadcrumb?.itemListElement ?? [];
  const categoryMain =
    breadcrumbItems[2]?.item?.name ??
    $('meta[property="rv-main-category-id"]').attr("content") ??
    "";
  const categorySub = breadcrumbItems[3]?.item?.name ?? categoryMain;

  const ldRatingValue = parseFloat(ldApp?.aggregateRating?.ratingValue ?? "0");
  const ldBestRating = parseFloat(ldApp?.aggregateRating?.bestRating ?? "10");
  const ratingAvg =
    ldRatingValue > 0
      ? (ldRatingValue / ldBestRating) * 5
      : parseFloat(ratingText) || 0;
  const ratingCount =
    parseInt(ldApp?.aggregateRating?.ratingCount ?? reviewText ?? "0") || 0;

  const secLower = securityText.toLowerCase();
  const secStatus: SecurityStatus =
    secLower.includes("safe") || secLower.includes("clean")
      ? "Safe"
      : secLower.includes("warn")
        ? "Warning"
        : secLower.includes("danger")
          ? "Dangerous"
          : "Unknown";

  const finalName =
    name || ldApp?.name || $("title").text().split("-")[0].trim() || "Unknown";
  const finalDevName = (ldApp?.author?.name || developer || "Unknown").trim();

  let lastUpdatedIso: string | null = null;
  const dateStr = lastUpdated || ldApp?.dateModified;
  if (dateStr) {
    try {
      lastUpdatedIso = new Date(dateStr).toISOString();
    } catch {
      /**/
    }
  }

  const platformRaw = platform || "windows";
  const platformSlug = normalizePlatform(platformRaw).toLowerCase();
  const nameSlug = finalName
    .toLowerCase()
    .replace(/\s+for\s+(windows|mac|android|ios|iphone|ipad|linux)$/i, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    id: nameSlug,
    slug: `/${platformSlug}/${nameSlug}`,
    name: finalName,
    platform: normalizePlatform(platformRaw),
    developer_name: finalDevName,
    developer_website_url: officialWebsiteUrl || null,
    category_main: categoryMain,
    category_sub: categorySub,
    seo_title: $("title").text().trim(),
    seo_description: (
      $('meta[name="description"]').attr("content") ?? ""
    ).slice(0, 1000),
    download_url: officialWebsiteUrl || finalDownloadUrl,
    file_size: fileSize || ldApp?.fileSize || "N/A",
    license: normalizeLicense(licenseText || "free"),
    security_status: secStatus,
    rating_average: Math.min(5, Math.max(0, parseFloat(ratingAvg.toFixed(2)))),
    rating_total_count: ratingCount,
    icon_url: iconUrl,
    short_summary: summary,
    body_html: bodyHtml,
    editor_review_html: editorReviewHtml,
    pros:
      pros.length > 0
        ? pros
        : (ldApp?.review?.positiveNotes?.itemListElement ?? [])
            .map((x: any) => x.item ?? "")
            .filter(Boolean),
    cons:
      cons.length > 0
        ? cons
        : (ldApp?.review?.negativeNotes?.itemListElement ?? [])
            .map((x: any) => x.item ?? "")
            .filter(Boolean),
    os_requirements: osReq || ldApp?.operatingSystem || null,
    languages,
    last_updated_date: lastUpdatedIso,
  };
}

// ── Supabase ──────────────────────────────────────────────────────────────────

async function upsertApp(supabase: SupabaseClient, data: ScrapedApp) {
  const { error } = await supabase
    .from("software_applications")
    .upsert(data, { onConflict: "id" });
  if (error) {
    console.error("Supabase error details:", JSON.stringify(error, null, 2));
    console.error(
      "SUPABASE_URL:",
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "❌ undefined",
    );
    throw new Error(`Supabase upsert 실패: ${error.message}`);
  }
}

// ── pLimit ────────────────────────────────────────────────────────────────────

async function pLimit<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<void> {
  const executing = new Set<Promise<void>>();
  for (const task of tasks) {
    const p: Promise<void> = (async () => {
      await task();
    })().finally(() => executing.delete(p as any));
    (executing as any).add(p);
    if (executing.size >= concurrency) await Promise.race(executing);
  }
  await Promise.all(executing);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // 입력 파일 로드
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`입력 파일을 찾을 수 없습니다: ${INPUT_FILE}`);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8")) as {
    urls: UrlEntry[];
  };
  let urlEntries: UrlEntry[] = raw.urls ?? [];

  // 플랫폼 필터
  if (PLATFORM_FILTER) {
    urlEntries = urlEntries.filter((e) =>
      PLATFORM_FILTER!.includes(e.platform.toLowerCase()),
    );
  }

  // 진행 상황 로드
  const progress = loadProgress();
  if (!RESUME) {
    progress.processedUrls = [];
    progress.failedUrls = [];
  }
  const doneSet = new Set(progress.processedUrls);

  // 미처리 URL 필터
  let todoEntries = urlEntries.filter((e) => !doneSet.has(e.url));
  if (LIMIT > 0) todoEntries = todoEntries.slice(0, LIMIT);

  const total = urlEntries.length;
  const todo = todoEntries.length;

  console.log(`
╔══════════════════════════════════════╗
║  crawl-details.ts 시작               ║
╠══════════════════════════════════════╣
║  전체 URL    : ${String(total).padEnd(20)} ║
║  처리 예정   : ${String(todo).padEnd(20)} ║
║  이미 완료   : ${String(doneSet.size).padEnd(20)} ║
║  동시 처리   : ${String(CONCURRENCY).padEnd(20)} ║
║  Resume 모드 : ${String(RESUME).padEnd(20)} ║
╚══════════════════════════════════════╝
`);

  if (todo === 0) {
    console.log("처리할 URL이 없습니다.");
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { browser, context } = await createBrowser();
  const page = await context.newPage();
  await page.route("**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,eot}", (r) =>
    r.abort(),
  );

  let successCount = 0;
  let failCount = 0;

  try {
    const tasks = todoEntries.map(({ url, platform }, idx) => async () => {
      const label = `[${idx + 1}/${todo}]`;
      let lastErr: Error | null = null;
      for (let attempt = 1; attempt <= 4; attempt++) {
        try {
          if (attempt > 1) {
            log("INFO", `${label} 재시도 ${attempt - 1}/3 → ${url}`);
            await sleep(2000 * attempt);
          }
          const app = await scrapeAppDetail(page, url, platform);
          await upsertApp(supabase, app);
          progress.processedUrls.push(url);
          successCount++;
          log("OK", `${label} ${app.name} (${app.id})`);
          lastErr = null;
          break;
        } catch (err) {
          lastErr = err as Error;
        }
      }
      if (lastErr) {
        failCount++;
        log("ERROR", `${label} ${url} → ${lastErr.message}`);
      }

      saveProgress(progress);
      if (DELAY_MS > 0) await sleep(DELAY_MS);
    });

    await pLimit(tasks, CONCURRENCY);
  } finally {
    await browser.close();
    saveProgress(progress);
  }

  console.log(`
╔══════════════════════════════════════╗
║  완료                                ║
╠══════════════════════════════════════╣
║  성공 : ${String(successCount).padEnd(28)} ║
║  실패 : ${String(failCount).padEnd(28)} ║
╚══════════════════════════════════════╝
`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
