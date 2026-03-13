/**
 * Softonic 스크래퍼
 *
 * Usage:
 *   npx tsx scripts/scrape-softonic.ts https://desmume.softonic.kr/
 *   npx tsx scripts/scrape-softonic.ts https://desmume.softonic.kr/ --insert
 */

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ── 타입 ──────────────────────────────────────────────────────────────────────

type LicenseType = 'Free' | 'Trial' | 'Paid' | 'Open Source' | 'Freemium';
type PlatformType = 'Windows' | 'Mac' | 'Android' | 'iOS' | 'Web' | 'Linux';
type SecurityStatus = 'Safe' | 'Warning' | 'Dangerous' | 'Unknown';

interface ScrapedApp {
  // Core
  id: string;
  slug: string;
  name: string;
  version: string;
  platform: PlatformType;
  supported_platforms: PlatformType[];
  developer_name: string;
  developer_website_url: string | null;
  category_main: string;
  category_sub: string;
  // SEO
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  seo_og_image: string | null;
  seo_structured_data: Record<string, unknown> | null;
  // Download
  download_url: string;
  file_size: string;
  license: LicenseType;
  price: number | null;
  currency: string | null;
  // Security
  security_status: SecurityStatus;
  security_last_scanned_at: string | null;
  security_scan_provider: string | null;
  // Rating
  rating_average: number;
  rating_total_count: number;
  rating_editor_score: number | null;
  // Content
  icon_url: string | null;
  screenshot_urls: string[];
  video_url: string | null;
  short_summary: string;
  body_html: string;
  pros: string[];
  cons: string[];
  features: string[];
  // Specs
  os_requirements: string | null;
  languages: string[];
  last_updated_date: string | null;
  // Relations
  related_article_ids: string[];
}

// ── 플랫폼 정규화 ──────────────────────────────────────────────────────────────

function normalizePlatform(raw: string): PlatformType {
  const map: Record<string, PlatformType> = {
    windows: 'Windows',
    mac: 'Mac',
    android: 'Android',
    ios: 'iOS',
    web: 'Web',
    linux: 'Linux',
  };
  return map[raw.toLowerCase()] ?? 'Windows';
}

function normalizeLicense(raw: string): LicenseType {
  const map: Record<string, LicenseType> = {
    free: 'Free',
    trial: 'Trial',
    paid: 'Paid',
    'open source': 'Open Source',
    freemium: 'Freemium',
  };
  return map[raw.toLowerCase()] ?? 'Free';
}

// ── 스크래퍼 메인 ─────────────────────────────────────────────────────────────

async function scrapeSoftonic(url: string): Promise<ScrapedApp> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ko-KR',
  });
  const page = await context.newPage();

  console.log(`[scrape] 페이지 로딩: ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // ── 1. dataLayer에서 핵심 메타데이터 추출 ────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dlData: any = await page.evaluate('(function(){ var dl = window.dataLayer || []; return dl.find(function(e){ return e.programName || e.program_name; }) || {}; })()');

  // ── 2. installerScriptParams JWT에서 추가 데이터 ─────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const installerParams: any = await page.evaluate('(function(){ try { var scripts = Array.from(document.querySelectorAll("script")); for (var i=0;i<scripts.length;i++){ var m=scripts[i].textContent.match(/installerScriptParams\\s*=\\s*(\\{[^;]+\\})/); if(m) return JSON.parse(m[1]); } } catch(e){} return {}; })()');

  // ── 3. 메타 태그 ─────────────────────────────────────────────────────────
  const meta: { title: string; description: string; ogImage: string | null; keywords: string } = await page.evaluate('(function(){ var q=function(s){ return document.querySelector(s); }; return { title: document.title, description: (q("meta[name=\'description\']")||{content:""}).content||"", ogImage: (q("meta[property=\'og:image\']")||{content:null}).content||null, keywords: (q("meta[name=\'keywords\']")||{content:""}).content||"" }; })()');

  // ── 4. JSON-LD 구조화 데이터 ─────────────────────────────────────────────
  const structuredData: Record<string, unknown> | null = await page.evaluate('(function(){ var el=document.querySelector("script[type=\'application/ld+json\']"); try{ return el ? JSON.parse(el.textContent||"") : null; }catch(e){ return null; } })()');

  // ── 5. 본문 콘텐츠 (JS 렌더링 후) ────────────────────────────────────────

  const content: {
    pros: string[]; cons: string[]; features: string[];
    screenshots: string[]; icon: string | null;
    developer: string; fileSize: string; osReq: string;
    langs: string[]; body: string; summary: string;
    securityText: string; ratingText: string; reviewCountText: string;
  } = await page.evaluate(`(function(){
    function qt(sel){ var el=document.querySelector(sel); return el ? (el.textContent||"").trim() : ""; }
    function qa(sel){ return Array.from(document.querySelectorAll(sel)).map(function(el){ return (el.textContent||"").trim(); }).filter(Boolean); }
    function flatSel(sels){ var r=[]; sels.forEach(function(s){ r=r.concat(qa(s)); }); return r.filter(Boolean); }

    var pros = flatSel([".pros li",".pros-list li","[class*=\\"pros\\"] li","[data-type=\\"pros\\"] li",".good-things li",".pros-cons__pros li"]);
    var cons = flatSel([".cons li",".cons-list li","[class*=\\"cons\\"] li","[data-type=\\"cons\\"] li",".bad-things li",".pros-cons__cons li"]);
    var features = flatSel([".features li","[class*=\\"feature\\"] li",".key-features li",".specs-list li",".technical-sheet li"]);

    var screenshots = Array.from(document.querySelectorAll(".screenshots img,.gallery img,[class*=\\"screenshot\\"] img,[class*=\\"gallery\\"] img")).map(function(img){ return img.src||img.dataset.src||img.getAttribute("data-lazy-src")||""; }).filter(function(s){ return s && s.includes("sftcdn.net"); });

    var iconEl = document.querySelector(".app-icon img,[class*=\\"program-icon\\"] img,header img[alt]");
    var icon = iconEl ? iconEl.src : null;

    var developer = qt("[class*=\\"developer\\"]") || qt("[class*=\\"author\\"]") || qt("a[href*=\\"/publisher/\\"]") || "";
    var fileSize = qt("[class*=\\"file-size\\"]") || qt("[class*=\\"filesize\\"]") || "";
    var osReq = qt("[class*=\\"os-requirements\\"]") || qt("[class*=\\"system-requirements\\"]") || "";
    var langs = qa("[class*=\\"languages\\"] li,[class*=\\"language\\"] li");

    var bodyEl = document.querySelector("[class*=\\"description\\"] .content,article .body,[class*=\\"body-copy\\"]");
    var body = bodyEl ? bodyEl.innerHTML : "";

    var summaryEl = document.querySelector("[class*=\\"description\\"] p,[class*=\\"summary\\"] p,[class*=\\"intro\\"] p");
    var summary = summaryEl ? (summaryEl.textContent||"").trim() : "";

    var secEl = document.querySelector("[class*=\\"security\\"],[class*=\\"antivirus\\"],[class*=\\"virus\\"]");
    var securityText = secEl ? (secEl.textContent||"").trim() : "";

    var ratingEl = document.querySelector("[class*=\\"rating\\"],[class*=\\"score\\"],[itemprop=\\"ratingValue\\"]");
    var ratingText = ratingEl ? (ratingEl.textContent||"").trim() : "";

    var reviewEl = document.querySelector("[itemprop=\\"reviewCount\\"],[class*=\\"review-count\\"],[class*=\\"nr-reviews\\"]");
    var reviewCountText = reviewEl ? (reviewEl.textContent||"").trim() : "";

    return { pros:pros, cons:cons, features:features, screenshots:screenshots, icon:icon, developer:developer, fileSize:fileSize, osReq:osReq, langs:langs, body:body, summary:summary, securityText:securityText, ratingText:ratingText, reviewCountText:reviewCountText };
  })()`
  );

  await browser.close();

  // ── 6. 데이터 조합 ────────────────────────────────────────────────────────

  // JSON-LD에서 SoftwareApplication 항목 추출
  const ldList = Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ldApp = ldList.find((x: any) => x['@type'] === 'SoftwareApplication') as any ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ldBreadcrumb = ldList.find((x: any) => x['@type'] === 'BreadcrumbList') as any ?? null;

  // 카테고리: BreadcrumbList의 3번째(main), 4번째(sub) 항목
  const breadcrumbItems = ldBreadcrumb?.itemListElement ?? [];
  const categoryMain = breadcrumbItems[2]?.item?.name ?? dlData.categoryId ?? '';
  const categorySub = breadcrumbItems[3]?.item?.name ?? categoryMain;

  // 개발자
  const developerName = (ldApp?.review?.author?.name ?? content.developer) || 'Unknown';
  const developerUrl = ldApp?.review?.author?.['@id'] ?? null;

  // 아이콘: JSON-LD image 필드 우선 (installer params의 SVG 말고)
  const iconUrl = ldApp?.image ?? installerParams.programIconURL ?? content.icon ?? null;

  // 스크린샷: JSON-LD mainEntityOfPage.thumbnailUrl 포함
  const coverImg = ldApp?.mainEntityOfPage?.thumbnailUrl;
  const screenshots = content.screenshots.length > 0
    ? content.screenshots
    : coverImg ? [coverImg] : [];

  // 본문 설명
  const bodyText = ldApp?.mainEntityOfPage?.description ?? ldApp?.description ?? content.body ?? '';
  const summary = content.summary || ldApp?.description || bodyText.slice(0, 200);

  // pros / cons: JSON-LD review.positiveNotes / negativeNotes
  const prosFromLd: string[] = (ldApp?.review?.positiveNotes?.itemListElement ?? [])
    .map((x: any) => x.item ?? '')
    .filter(Boolean);
  const consFromLd: string[] = (ldApp?.review?.negativeNotes?.itemListElement ?? [])
    .map((x: any) => x.item ?? '')
    .filter(Boolean);

  // 평점: JSON-LD aggregateRating 우선 (10점 → 5점 변환)
  const ldRatingValue = parseFloat(ldApp?.aggregateRating?.ratingValue ?? '0');
  const ldBestRating = parseFloat(ldApp?.aggregateRating?.bestRating ?? '10');
  const ratingAvg = ldRatingValue > 0
    ? (ldRatingValue / ldBestRating) * 5
    : parseFloat(dlData.program_user_score ?? '0') / 2;
  const ratingCount = parseInt(ldApp?.aggregateRating?.ratingCount ?? dlData.nr_reviews ?? '0') || 0;

  // OS 요구사항
  const osReq = ldApp?.operatingSystem ?? content.osReq ?? null;

  // 언어
  const inLanguage = ldApp?.inLanguage;
  const languages = content.langs.length > 0 ? content.langs : inLanguage ? [inLanguage] : [];

  // 라이선스: offers.price === 0 이면 Free
  const ldPrice = ldApp?.offers?.price ?? null;
  const licenseRaw = dlData.program_licence ?? (ldPrice === 0 ? 'free' : 'free');

  const programName = dlData.programName ?? dlData.program_name ?? installerParams.programName ?? ldApp?.name ?? 'Unknown';
  const version = dlData.versionId ?? installerParams.versionId ?? '';
  const platformRaw = dlData.platformId ?? installerParams.platformId ?? 'windows';

  // slug을 URL에서 추출
  const urlObj = new URL(url);
  const pathParts = urlObj.hostname.split('.');  // desmume.softonic.kr
  const appSlug = pathParts[0];
  const platformSlug = normalizePlatform(platformRaw).toLowerCase();

  // 보안 상태 판단
  let secStatus: SecurityStatus = 'Unknown';
  const secLower = content.securityText.toLowerCase();
  if (secLower.includes('safe') || secLower.includes('안전') || secLower.includes('clean')) secStatus = 'Safe';
  else if (secLower.includes('warn') || secLower.includes('경고')) secStatus = 'Warning';
  else if (secLower.includes('danger') || secLower.includes('위험')) secStatus = 'Dangerous';

  const appId = dlData.programId ?? installerParams.programId ?? `${appSlug}-${platformSlug}`;

  // 날짜
  const lastUpdated = ldApp?.dateModified
    ? new Date(ldApp.dateModified).toISOString()
    : dlData.program_review_modification_date
    ? new Date(dlData.program_review_modification_date).toISOString()
    : null;

  const result: ScrapedApp = {
    id: appId,
    slug: `/${platformSlug}/${appSlug}`,
    name: programName,
    version,
    platform: normalizePlatform(platformRaw),
    supported_platforms: [normalizePlatform(platformRaw)],
    developer_name: developerName,
    developer_website_url: developerUrl,
    category_main: categoryMain,
    category_sub: categorySub,
    // SEO
    seo_title: meta.title,
    seo_description: meta.description,
    seo_keywords: meta.keywords ? meta.keywords.split(',').map((k) => k.trim()) : [],
    seo_og_image: meta.ogImage ?? coverImg ?? null,
    seo_structured_data: structuredData,
    // Download
    download_url: url,
    file_size: content.fileSize || 'N/A',
    license: normalizeLicense(licenseRaw),
    price: ldPrice === 0 ? 0 : null,
    currency: ldApp?.offers?.priceCurrency ?? null,
    // Security
    security_status: secStatus,
    security_last_scanned_at: new Date().toISOString(),
    security_scan_provider: null,
    // Rating
    rating_average: Math.min(5, Math.max(0, parseFloat(ratingAvg.toFixed(2)))),
    rating_total_count: ratingCount,
    rating_editor_score: null,
    // Content
    icon_url: iconUrl,
    screenshot_urls: screenshots,
    video_url: null,
    short_summary: summary,
    body_html: bodyText,
    pros: prosFromLd.length > 0 ? prosFromLd : content.pros,
    cons: consFromLd.length > 0 ? consFromLd : content.cons,
    features: content.features,
    // Specs
    os_requirements: osReq,
    languages,
    last_updated_date: lastUpdated,
    // Relations
    related_article_ids: [],
  };

  return result;
}

// ── Supabase 삽입 ──────────────────────────────────────────────────────────────

async function insertToSupabase(data: ScrapedApp) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from('software_applications')
    .upsert(data, { onConflict: 'id' });

  if (error) throw new Error(`Supabase insert error: ${error.message}`);
  console.log('[insert] 완료:', data.id);
}

// ── CLI 진입점 ─────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const url = args.find((a) => a.startsWith('http'));
  const doInsert = args.includes('--insert');

  if (!url) {
    console.error('Usage: npx tsx scripts/scrape-softonic.ts <URL> [--insert]');
    process.exit(1);
  }

  const data = await scrapeSoftonic(url);

  console.log('\n──────────────── 추출 결과 ────────────────');
  console.log(JSON.stringify(data, null, 2));
  console.log('──────────────────────────────────────────\n');

  if (doInsert) {
    await insertToSupabase(data);
    console.log('Supabase에 저장 완료!');
  } else {
    console.log('(--insert 플래그 없이 실행 → DB 저장 생략)');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
