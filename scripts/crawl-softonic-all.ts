/**
 * en.softonic.com 전체 앱 크롤러 (최적화 버전)
 *
 * PHASE 1: Playwright를 사용하여 카테고리 페이지에서 앱 URL 수집
 * PHASE 2: Fetch + Cheerio를 사용하여 상세 페이지 초고속 스크래핑 및 DB 저장
 */

import { chromium, Browser, BrowserContext } from 'playwright';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

dotenv.config({ path: '.env.local' });

// ── 설정 ───────────────────────────────────────────────────────────────────────

const PLATFORMS = ['windows', 'mac', 'android', 'iphone'] as const;
type Platform = typeof PLATFORMS[number];

const BASE_URL = 'https://en.softonic.com';

const CATEGORIES = [
  'ai',
  'games',
  'browsers',
  'security-privacy',
  'productivity',
  'internet-network',
  'multimedia',
  'development',
  'education-reference',
  'personalization',
  'lifestyle',
  'social-communication',
  'travel-navigation',
  'utilities-tools',
] as const;

// 각 플랫폼+카테고리 조합의 마지막 페이지 (2026-03-16 기준 스캔값)
// 500은 실제 상한선이므로 크롤러가 앱 없을 때 조기 종료됨
const LAST_PAGES: Record<string, Record<string, number>> = {
  'ai':                  { windows: 3,   mac: 2,   android: 2,   iphone: 3   },
  'games':               { windows: 500, mac: 500, android: 500, iphone: 500 },
  'browsers':            { windows: 46,  mac: 13,  android: 13,  iphone: 5   },
  'security-privacy':    { windows: 77,  mac: 16,  android: 288, iphone: 55  },
  'productivity':        { windows: 174, mac: 55,  android: 500, iphone: 500 },
  'internet-network':    { windows: 34,  mac: 15,  android: 3,   iphone: 1   },
  'multimedia':          { windows: 303, mac: 108, android: 500, iphone: 500 },
  'development':         { windows: 130, mac: 30,  android: 5,   iphone: 2   },
  'education-reference': { windows: 60,  mac: 32,  android: 500, iphone: 500 },
  'personalization':     { windows: 123, mac: 28,  android: 500, iphone: 2   },
  'lifestyle':           { windows: 36,  mac: 12,  android: 500, iphone: 500 },
  'social-communication':{ windows: 36,  mac: 15,  android: 500, iphone: 402 },
  'travel-navigation':   { windows: 1,   mac: 1,   android: 500, iphone: 500 },
  'utilities-tools':     { windows: 500, mac: 271, android: 500, iphone: 500 },
};

const PLATFORM_MAP: Record<string, string> = {
  windows: 'Windows',
  mac: 'Mac',
  android: 'Android',
  iphone: 'iOS',
  pwa: 'Web',
  'web-apps': 'Web',
  linux: 'Linux',
};

type LicenseType = 'Free' | 'Trial' | 'Paid' | 'Open Source' | 'Freemium';
type PlatformType = 'Windows' | 'Mac' | 'Android' | 'iOS' | 'Web' | 'Linux';
type SecurityStatus = 'Safe' | 'Warning' | 'Dangerous' | 'Unknown';

interface FaqItem {
  question: string;
  answer: string;
}

interface ScrapedApp {
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
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  seo_og_image: string | null;
  seo_structured_data: Record<string, unknown> | null;
  download_url: string;
  file_size: string;
  download_count: string | null;
  license: LicenseType;
  price: number | null;
  currency: string | null;
  security_status: SecurityStatus;
  security_last_scanned_at: string | null;
  security_scan_provider: string | null;
  rating_average: number;
  rating_total_count: number;
  rating_editor_score: number | null;
  icon_url: string | null;
  screenshot_urls: string[];
  video_url: string | null;
  short_summary: string;
  body_html: string;
  editor_review_html: string;
  pros: string[];
  cons: string[];
  features: string[];
  faq: FaqItem[];
  os_requirements: string | null;
  languages: string[];
  last_updated_date: string | null;
  related_article_ids: string[];
}

// ── 진행 상황 파일 ──────────────────────────────────────────────────────────────

const PROGRESS_FILE = path.join(process.cwd(), 'scripts', '.crawl-progress.json');

interface Progress {
  scrapedUrls: string[];
  processedUrls: string[];
  failedUrls: string[];
  startedAt: string;
  lastUpdated: string;
}

function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    } catch { /* ignore */ }
  }
  return { scrapedUrls: [], processedUrls: [], failedUrls: [], startedAt: new Date().toISOString(), lastUpdated: new Date().toISOString() };
}

function saveProgress(progress: Progress) {
  progress.lastUpdated = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// ── 헬퍼 ───────────────────────────────────────────────────────────────────────

function normalizePlatform(raw: string): PlatformType {
  const map: Record<string, PlatformType> = {
    windows: 'Windows', mac: 'Mac', android: 'Android',
    ios: 'iOS', iphone: 'iOS', web: 'Web', linux: 'Linux', pwa: 'Web',
    'web-apps': 'Web',
  };
  return map[raw.toLowerCase()] ?? 'Windows';
}

function normalizeLicense(raw: string): LicenseType {
  const lower = raw.toLowerCase();
  if (lower.includes('open source') || lower.includes('오픈')) return 'Open Source';
  if (lower.includes('trial') || lower.includes('평가')) return 'Trial';
  if (lower.includes('freemium') || lower.includes('부분')) return 'Freemium';
  if (lower.includes('paid') || lower.includes('유료')) return 'Paid';
  return 'Free';
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', msg: string) {
  const icons = { INFO: '📌', WARN: '⚠️', ERROR: '❌', SUCCESS: '✅' };
  console.log(`${icons[level]} [${new Date().toLocaleTimeString()}] ${msg}`);
}

// ── 브라우저 팩토리 ────────────────────────────────────────────────────────────

async function createBrowser(): Promise<{ browser: Browser; context: BrowserContext }> {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US',
    extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
    viewport: { width: 1280, height: 900 },
  });
  // 봇 탐지 우회
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });
  return { browser, context };
}

// ── 카테고리 페이지에서 앱 URL 수집 ───────────────────────────────────────────

async function collectAppUrlsFromCategory(
  context: BrowserContext,
  platform: string,
  category: string,
  maxPages: number,
  delayMs: number,
): Promise<string[]> {
  const urls: string[] = [];
  const page = await context.newPage();
  await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,eot}', route => route.abort());

  try {
    const baseUrl = `${BASE_URL}/${platform}/${category}:date`;
    // LAST_PAGES 상수에서 마지막 페이지 조회 (없으면 maxPages 사용)
    const totalPages = Math.min(LAST_PAGES[category]?.[platform] ?? maxPages, maxPages);
    log('INFO', `${platform}/${category}: 총 ${totalPages}페이지 수집 예정`);

    // Step 2: 1~totalPages 순회
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const categoryUrl = `${baseUrl}/${pageNum}`;
      try {
        log('INFO', `카테고리 수집: ${categoryUrl}`);
        await page.goto(categoryUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(800);

        const rawUrls = await page.evaluate(() => {
          // data-meta="program" 링크만 수집 (앱 카드 링크)
          const links = Array.from(document.querySelectorAll('a[data-meta="program"]')) as HTMLAnchorElement[];
          return [...new Set(links.map(a => a.href).filter(Boolean))];
        });

        // windows는 href에 /windows 경로가 없으므로 플랫폼 경로 정규화
        // https://{slug}.en.softonic.com/ → https://{slug}.en.softonic.com/windows
        const pageUrls = rawUrls.map(href => {
          try {
            const u = new URL(href);
            if (u.pathname === '/' || u.pathname === '') {
              return `${u.origin}/${platform}`;
            }
            return href;
          } catch { return href; }
        });

        if (pageUrls.length === 0) {
          log('INFO', `  → 앱 없음, 수집 종료`);
          break;
        }

        urls.push(...pageUrls);
        log('SUCCESS', `  → p${pageNum}/${totalPages}: ${pageUrls.length}개 앱 (누적 ${urls.length}개)`);
        await sleep(delayMs / 2);
      } catch (err) {
        log('WARN', `페이지 오류 (${categoryUrl}): ${(err as Error).message}`);
        break;
      }
    }
  } finally {
    await page.close();
  }

  return [...new Set(urls)];
}

// ── 앱 상세 스크래핑 (최적화 버전: Fetch + Cheerio) ─────────────────────

async function scrapeAppDetail(
  context: BrowserContext | null,
  url: string,
  platform: string,
): Promise<ScrapedApp> {
  const fetchHeaders = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
  };

  try {
    let html = '';

    // 1차 시도: 고속 Fetch
    try {
      const response = await fetch(url, { headers: fetchHeaders });
      if (response.ok) {
        html = await response.text();
        // 챌린지 페이지 여부 확인
        if (html.includes('<title>Client Challenge</title>') || (html.includes('Challenge') && html.length < 5000)) {
          html = ''; // 챌린지 걸림 -> 브라우저 폴백 시도
        }
      }
    } catch (e) { /* ignore */ }

    // 2차 시도: 브라우저 폴백 (챌린지 해결용)
    if (!html && context) {
      const page = await context.newPage();
      try {
        await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,eot}', route => route.abort());
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        // 챌린지 해결 대기
        await page.waitForTimeout(2000);
        html = await page.content();
      } finally {
        await page.close();
      }
    }

    if (!html) throw new Error(`HTML을 가져올 수 없습니다. (Challenge 또는 네트워크 오류)`);

    const $ = cheerio.load(html);

    // JSON-LD 추출
    const ldList: any[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const text = $(el).text();
        if (text) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) ldList.push(...parsed);
          else ldList.push(parsed);
        }
      } catch { /* ignore */ }
    });

    const ldApp = ldList.find((x: any) => x['@type'] === 'SoftwareApplication') ?? null;
    const ldBreadcrumb = ldList.find((x: any) => x['@type'] === 'BreadcrumbList') ?? null;

    // dataLayer 유사 데이터 추출
    let dlData: any = {};
    $('script').each((_, el) => {
      const content = $(el).text();
      if (content.includes('programName') || content.includes('program_name')) {
        const match = content.match(/\{[^}]*"programName"[^}]*\}/) || content.match(/\{[^}]*"program_name"[^}]*\}/);
        if (match) {
          try { dlData = JSON.parse(match[0]); } catch { /* ignore */ }
        }
      }
    });

    // 헬퍼
    const qt = (sel: string) => $(sel).first().text().trim() || '';
    const qa = (sel: string) => $(sel).map((_, el) => $(el).text().trim()).get().filter(Boolean);
    const qaAttr = (sel: string, attr: string) => $(sel).map((_, el) => $(el).attr(attr) || $(el).attr(`data-${attr}`) || $(el).attr('data-lazy-src') || '').get().filter(Boolean);

    const name = qt('h1[itemprop="name"], h1.program-header__name, .program-header h1, [class*="app-name"] h1') || qt('h1');
    const version = qt('[class*="version"], [itemprop="softwareVersion"], .program-header__version').replace(/^v/i, '').trim();
    const ratingText = qt('[itemprop="ratingValue"], [class*="rating-value"], [class*="stars-number"], .rating__value');
    const reviewText = qt('[itemprop="ratingCount"], [class*="rating-count"], [class*="review-count"], [class*="nr-reviews"]');
    const downloadCount = qt('[class*="download-count"], [class*="downloads-count"], [class*="program-header__downloads"]') || qt('[class*="stat"][class*="download"]');
    const licenseText = qt('[itemprop="offers"] [itemprop="price"], [class*="license"], [class*="type-tag"]') || qt('[class*="program-header"] [class*="free"],[class*="tag--free"]');
    const developerEl = $('a[href*="/publisher/"], a[href*="/author/"]').first();
    const developer = qt('[itemprop="author"] [itemprop="name"], [class*="developer-name"], [class*="author-name"]') || developerEl.text().trim();

    let fileSize = '', osReq = '', lastUpdated = '', langStr = '';
    $('[class*="specs"] [class*="item"], [class*="tech-specs"] li, .technical-sheet li, .specs-table tr').each((_, el) => {
      const txt = $(el).text().trim();
      if (txt.match(/MB|KB|GB/i)) fileSize = txt;
      else if (txt.match(/Windows|Mac|Android|iOS|Linux/i) && !osReq) osReq = txt;
      else if (txt.match(/202[0-9]|201[0-9]/)) lastUpdated = txt;
      else if (txt.match(/Language|언어|語/i)) langStr = txt;
    });

    if (!fileSize) fileSize = qt('[class*="file-size"], [class*="filesize"], [class*="size"]');
    if (!osReq) osReq = qt('[itemprop="operatingSystem"], [class*="os-req"], [class*="system-req"]');
    if (!lastUpdated) lastUpdated = qt('[class*="updated"], [class*="date-modified"], time[datetime]');

    const languages = qa('[class*="languages"] li, [class*="language-list"] li').concat(langStr ? [langStr] : []).filter((v, i, a) => a.indexOf(v) === i);
    const securityText = qt('[class*="security"], [class*="antivirus"], [class*="trusted"], [class*="virus-free"]');
    const iconUrl = $('[class*="program-icon"] img, [class*="app-icon"] img, [class*="application-icon"] img, header img.icon').first().attr('src') || ldApp?.image || null;
    const screenshots = qaAttr('[class*="screenshot"] img, [class*="gallery"] img, [class*="slider"] img, [data-testid*="screenshot"] img', 'src')
      .filter(s => s && s.startsWith('http') && !s.includes('placeholder'));

    // --- 공식 개발자 웹사이트 추출 강화 ---
    let officialWebsiteUrl: string | null = null;
    
    // 방법 1: h3 "개발자" 아래의 리스트 분석 (사용자 제공 이미지 구조 대응)
    $('h3').each((_, el) => {
      const text = $(el).text().trim();
      if (text === '개발자' || text === 'Developer') {
        $(el).closest('li').find('a[href]').each((__, a) => {
          const href = $(a).attr('href');
          // Softonic 내부 링크(author, publisher 등) 및 자사 도메인 배제
          if (href &&
              href.startsWith('http') &&
              !href.includes('softonic.com') &&
              !href.includes('sftcdn.net')) {
            officialWebsiteUrl = href;
            return false;
          }
        });
      }
      if (officialWebsiteUrl) return false;
    });

    // 방법 2: DT/DD 구조 분석 (레거시 대응)
    if (!officialWebsiteUrl) {
      $('dt').each((_, el) => {
        const text = $(el).text().trim();
        if (text.includes('개발자') || text.includes('Developer')) {
          const dd = $(el).next('dd');
          dd.find('a[href]').each((__, a) => {
            const href = $(a).attr('href');
            if (href && href.startsWith('http') && !href.includes('softonic') && !href.includes('sftcdn')) {
              officialWebsiteUrl = href;
              return false;
            }
          });
        }
        if (officialWebsiteUrl) return false;
      });
    }

    // 방법 3: 페이지 전체에서 공식 사이트 키워드 기반 찾기
    if (!officialWebsiteUrl) {
      $('a[href^="http"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (href.includes('softonic') || href.includes('sftcdn')) return;
        const txt = $(el).text().toLowerCase();
        const parentTxt = $(el).parent().text().toLowerCase();
        if (txt.includes('visit') || txt.includes('official') || txt.includes('homepage') || 
            parentTxt.includes('개발자') || parentTxt.includes('developer') || 
            parentTxt.includes('publisher') || parentTxt.includes('공식 사이트')) {
          officialWebsiteUrl = href;
          return false;
        }
      });
    }

    // --- 실제 다운로드 링크 추출 (추가 페치) ---
    let finalDownloadUrl = url;
    try {
      const downloadPageUrl = url.endsWith('/') ? `${url}download` : `${url}/download`;
      const dlRes = await fetch(downloadPageUrl, { headers: fetchHeaders });
      if (dlRes.ok) {
        const dlHtml = await dlRes.text();
        const $dl = cheerio.load(dlHtml);
        
        // 1순위: 외부 파트너/스토어 링크
        const external = $dl('a[href*="leap.ldplayer"], a[href*="store.microsoft.com"], a[href*="play.google.com"], a[href*="apple.com/app"], a.btn--external').first().attr('href');
        // 2순위: Softonic 직접 다운로드 (post-download)
        const internal = $dl('a.js-download-btn-file, a[href*="post-download"]').first().attr('href');
        
        const extracted = external || internal;
        if (extracted) {
          if (extracted.startsWith('/')) {
            const u = new URL(url);
            finalDownloadUrl = `${u.protocol}//${u.hostname}${extracted}`;
          } else {
            finalDownloadUrl = extracted;
          }
        }
      }
    } catch (e) { /* ignore */ }

    // 다운로드 링크 최종 결정 순위:
    // 1. 개발사 공식 웹사이트 (사용자 최우선 요청 사항)
    // 2. 외부 스토어/파트너 링크 (LDPlayer, 스토어 등)
    // 3. Softonic 내부에서 추출한 최종 다운로드 링크
    const effectiveDownloadUrl = officialWebsiteUrl || finalDownloadUrl;

    const pros = qa('[class*="pros"] li, [class*="good-things"] li, [class*="positive"] li');
    const cons = qa('[class*="cons"] li, [class*="bad-things"] li, [class*="negative"] li');
    
    const bodyEl = $('[class*="article-text"], [class*="description-text"], [class*="program-description"], [class*="body-copy"] .content, article .body').first();
    const bodyHtml = bodyEl.html()?.trim() ?? '';
    const summary = $('[class*="description"] > p:first-child, [class*="intro"] p, [class*="lead"] p').first().text().trim() || bodyEl.text().slice(0, 300).trim() || '';

    // 에디터 리뷰 아티클 수집 (article[data-meta="editor-review"]) - Clean HTML
    const editorReviewEl = $('article[data-meta="editor-review"]').first();
    let editorReviewHtml = '';
    if (editorReviewEl.length) {
      // 광고/위젯 요소 제거
      editorReviewEl.find('[data-meta="placeholder-slot"], [data-meta="prime-picks"]').remove();
      editorReviewEl.find('[id^="rscontainer"]').remove();
      editorReviewEl.find('svg').remove();
      editorReviewEl.find('script, style, iframe, noscript').remove();
      // 허용 태그 외 제거 (h2, h3, p, strong, em, a, ul, ol, li 유지)
      const ALLOWED_TAGS = new Set(['h2', 'h3', 'p', 'strong', 'em', 'a', 'ul', 'ol', 'li']);
      editorReviewEl.find('*').each((_, el) => {
        const tagName = (el as any).tagName?.toLowerCase();
        if (!ALLOWED_TAGS.has(tagName)) {
          // 허용 안된 태그: 자식만 남기고 태그 제거
          $(el).replaceWith($(el).contents());
        }
      });
      // 모든 class, id, style 속성 제거 (a의 href는 유지)
      editorReviewEl.find('*').each((_, el) => {
        const kept: Record<string, string> = {};
        const tagName = (el as any).tagName?.toLowerCase();
        if (tagName === 'a') {
          const href = $(el).attr('href');
          if (href) kept['href'] = href;
        }
        $(el).removeAttr('class').removeAttr('id').removeAttr('style').removeAttr('data-meta');
        Object.entries(kept).forEach(([k, v]) => $(el).attr(k, v));
      });
      editorReviewHtml = editorReviewEl.html()?.trim() ?? '';
    }

    const faqItems: FaqItem[] = [];
    $('[class*="faq"] [class*="item"], [class*="faq-item"]').each((_, el) => {
      const q = $(el).find('[class*="question"], [class*="title"]').text().trim();
      const a = $(el).find('[class*="answer"], [class*="body"], [class*="content"]').text().trim();
      if (q && a) faqItems.push({ question: q, answer: a });
    });

    const alternatives = $('[class*="alternative"] [class*="name"], [class*="related-app"] h3').map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 6);

    // 데이터 조합
    const breadcrumbItems = ldBreadcrumb?.itemListElement ?? [];
    const categoryMain = breadcrumbItems[2]?.item?.name ?? dlData.categoryId ?? $('meta[property="rv-main-category-id"]').attr('content') ?? '';
    const categorySub = breadcrumbItems[3]?.item?.name ?? categoryMain;
    
    // 평점
    const ldRatingValue = parseFloat(ldApp?.aggregateRating?.ratingValue ?? '0');
    const ldBestRating = parseFloat(ldApp?.aggregateRating?.bestRating ?? '10');
    const ratingAvg = ldRatingValue > 0 
      ? (ldRatingValue / ldBestRating) * 5 
      : parseFloat(ratingText) || (parseFloat(dlData.program_user_score ?? '0') / 2) || 0;
    const ratingCount = parseInt(ldApp?.aggregateRating?.ratingCount ?? reviewText ?? dlData.nr_reviews ?? '0') || 0;

    const secLower = securityText.toLowerCase();
    let secStatus: SecurityStatus = 'Unknown';
    if (secLower.includes('safe') || secLower.includes('안전') || secLower.includes('신뢰') || secLower.includes('clean')) secStatus = 'Safe';
    else if (secLower.includes('warn') || secLower.includes('경고')) secStatus = 'Warning';
    else if (secLower.includes('danger') || secLower.includes('위험')) secStatus = 'Dangerous';

    const finalName = name || ldApp?.name || $('meta[property="og:title"]').attr('content') || $('meta[property="rv-program-name"]').attr('content') || $('title').text().split('-')[0].trim() || 'Unknown';
    const finalDevName = (ldApp?.author?.name || ldApp?.review?.author?.name || developer || $('meta[property="rv-author"]').attr('content') || 'Unknown').trim();

    let lastUpdatedIso: string | null = null;
    const dateStr = lastUpdated || ldApp?.dateModified || dlData.program_review_modification_date;
    if (dateStr) {
      try { lastUpdatedIso = new Date(dateStr).toISOString(); } catch { lastUpdatedIso = null; }
    }

    const urlObj = new URL(url);
    const appSlugFromUrl = urlObj.hostname.split('.')[0];
    const platformRaw = dlData.platformId || platform || $('meta[property="rv-platform-id"]').attr('content') || 'windows';
    const platformSlug = normalizePlatform(platformRaw).toLowerCase();
    
    // 사용자가 요청한 '프로그램 이름 기반 ID' 생성
    const nameSlug = finalName.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const appId = `${nameSlug}-${platformSlug}`;

    return {
      id: appId,
      slug: `/${platformSlug}/${nameSlug}`, // ID와 일관성 유지
      name: finalName,
      version: version || ldApp?.softwareVersion || '',
      platform: normalizePlatform(platformRaw),
      supported_platforms: [normalizePlatform(platformRaw)],
      developer_name: finalDevName,
      developer_website_url: officialWebsiteUrl || ldApp?.author?.['@id'] || ldApp?.review?.author?.['@id'] || null,
      category_main: categoryMain,
      category_sub: categorySub,
      seo_title: $('title').text().trim(),
      seo_description: ($('meta[name="description"]').attr('content') ?? '').slice(0, 1000),
      seo_keywords: ($('meta[name="keywords"]').attr('content') ?? '').split(',').map(k => k.trim()).filter(Boolean),
      seo_og_image: $('meta[property="og:image"]').attr('content') || iconUrl || null,
      seo_structured_data: ldList.length > 0 ? ({ items: ldList } as Record<string, unknown>) : null,
      download_url: effectiveDownloadUrl,
      file_size: fileSize || ldApp?.fileSize || 'N/A',
      download_count: downloadCount || null,
      license: normalizeLicense(licenseText || dlData.program_licence || 'free'),
      price: ldApp?.offers?.price === 0 ? 0 : null,
      currency: ldApp?.offers?.priceCurrency ?? null,
      security_status: secStatus,
      security_last_scanned_at: new Date().toISOString(),
      security_scan_provider: null,
      rating_average: Math.min(5, Math.max(0, parseFloat(ratingAvg.toFixed(2)))),
      rating_total_count: ratingCount,
      rating_editor_score: null,
      icon_url: iconUrl,
      screenshot_urls: screenshots,
      video_url: null,
      short_summary: summary,
      body_html: bodyHtml,
      editor_review_html: editorReviewHtml,
      pros: pros.length > 0 ? pros : (ldApp?.review?.positiveNotes?.itemListElement ?? []).map((x: any) => x.item ?? '').filter(Boolean),
      cons: cons.length > 0 ? cons : (ldApp?.review?.negativeNotes?.itemListElement ?? []).map((x: any) => x.item ?? '').filter(Boolean),
      features: [],
      faq: faqItems,
      os_requirements: osReq || ldApp?.operatingSystem || null,
      languages,
      last_updated_date: lastUpdatedIso,
      related_article_ids: alternatives,
    };
  } catch (err) {
    throw new Error(`Scraping failed (${url}): ${(err as Error).message}`);
  }
}

// ── Supabase 저장 ──────────────────────────────────────────────────────────────

async function upsertToSupabase(supabase: SupabaseClient, data: ScrapedApp): Promise<void> {
  const { error } = await supabase
    .from('software_applications')
    .upsert(data, { onConflict: 'id' });
  if (error) throw new Error(`Supabase upsert 오류: ${error.message}`);
}

// ── Promise 제한 동시 실행 ─────────────────────────────────────────────────────

async function pLimit<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = [];
  const executing = new Set<Promise<void>>();

  for (const task of tasks) {
    const p: Promise<void> = (async () => {
      try {
        results.push({ status: 'fulfilled', value: await task() });
      } catch (e) {
        results.push({ status: 'rejected', reason: e });
      }
    })();
    executing.add(p);
    p.finally(() => executing.delete(p));
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
  return results;
}

// ── 메인 ───────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const getArg = (prefix: string) => args.find(a => a.startsWith(prefix))?.split('=')[1];
  const platformFilter = getArg('--platform')?.split(',').map(p => p.trim().toLowerCase()) ?? null;
  const categoryFilter = getArg('--category')?.split(',').map(c => c.trim().toLowerCase()) ?? null;
  const maxPages       = parseInt(getArg('--max-pages') ?? '500') || 500;
  const concurrency    = parseInt(getArg('--concurrency') ?? '10') || 10; // 상세 스크래핑 동시성 상향
  const delayMs          = parseInt(getArg('--delay') ?? '1000') || 1000; // 딜레이 축소
  const dryRun         = args.includes('--dry-run');
  const resume         = args.includes('--resume');
  const singleUrl      = getArg('--url');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // ── 단일 URL 직접 스크래핑 모드 ──────────────────────────────────────────
  if (singleUrl) {
    const platform = new URL(singleUrl).pathname.replace(/^\//, '').split('/')[0] || 'windows';
    log('INFO', `단일 URL 스크래핑: ${singleUrl} [${platform}]`);
    const { browser, context } = await createBrowser();
    try {
      const appData = await scrapeAppDetail(context, singleUrl, platform);
      log('INFO', `수집 결과:\n${JSON.stringify(appData, null, 2)}`);
      await upsertToSupabase(supabase, appData);
      log('SUCCESS', `DB 저장 완료: ${appData.name} [${appData.id}]`);
    } finally {
      await browser.close();
    }
    return;
  }

  const progress = loadProgress();
  if (!resume) {
    progress.scrapedUrls = [];
    progress.failedUrls = [];
    progress.processedUrls = [];
  }
  const skippedSet = new Set(progress.scrapedUrls);

  const targetPlatforms = platformFilter ? PLATFORMS.filter(p => platformFilter.includes(p)) : [...PLATFORMS];
  const targetCategories = categoryFilter ? CATEGORIES.filter(c => categoryFilter.includes(c)) : [...CATEGORIES];

  log('INFO', `PHASE 1: 앱 URL 수집 시작`);
  const allAppUrls: Array<{ url: string; platform: string }> = [];
  const { browser: collectorBrowser, context: collectorContext } = await createBrowser();

  try {
    for (const platform of targetPlatforms) {
      for (const category of targetCategories) {
        const urls = await collectAppUrlsFromCategory(collectorContext, platform, category, maxPages, delayMs);
        for (const url of urls) allAppUrls.push({ url, platform });
        await sleep(delayMs);
      }
    }

    // URL 자체에 platform이 포함되어 있으므로 URL로 중복 제거
    // (같은 앱이라도 /mac, /windows는 다른 URL → 다른 레코드)
    const uniqueUrls = [...new Map(allAppUrls.map(x => [x.url, x])).values()];

    log('SUCCESS', `총 ${uniqueUrls.length}개 유니크 앱 URL 수집 완료`);

    // 수집된 URL을 JSON 파일로 저장 (dry-run 여부와 관계없이)
    const outputFile = getArg('--output') ?? path.join(process.cwd(), 'scripts', '.crawl-urls.json');
    const outputData = {
      generatedAt: new Date().toISOString(),
      total: uniqueUrls.length,
      urls: uniqueUrls,
    };
    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
    log('SUCCESS', `URL 목록 저장: ${outputFile} (${uniqueUrls.length}개)`);

    if (dryRun) {
      console.log('\n── Dry Run (URL 목록) ──');
      uniqueUrls.forEach(({ url, platform }) => console.log(`  [${platform}] ${url}`));
      return;
    }

    log('INFO', `PHASE 2: 스크래핑 시작 (동시 ${concurrency}개, 도전 시 브라우저 자동 폴백)`);
    const todoUrls = uniqueUrls.filter(({ url }) => !skippedSet.has(url));
    let successCount = 0;
    let failCount = 0;

    const tasks = todoUrls.map(({ url, platform }) => async () => {
      try {
        const appData = await scrapeAppDetail(collectorContext, url, platform);
        if (supabase) await upsertToSupabase(supabase, appData);
        progress.scrapedUrls.push(url);
        successCount++;
        log('SUCCESS', `저장: ${appData.name.slice(0, 20)}... [${appData.id}]`);
        
        if (successCount % 10 === 0) saveProgress(progress);
        if (delayMs > 0) await sleep(delayMs);
      } catch (err) {
        progress.failedUrls.push(url);
        failCount++;
        log('ERROR', `실패: ${url} → ${(err as Error).message}`);
      }
    });

    await pLimit(tasks, concurrency);

    console.log(`
╔═══════════════════════════════╗
║   완료 요약                   ║
╠═══════════════════════════════╣
║  총      : ${String(uniqueUrls.length).padEnd(14)} ║
║  성공    : ${String(successCount).padEnd(14)} ║
║  실패    : ${String(failCount).padEnd(14)} ║
╚═══════════════════════════════╝
    `);

  } finally {
    await collectorBrowser.close();
    saveProgress(progress);
  }
}

main().catch(e => {
  console.error('Fatal Error:', e);
  process.exit(1);
});
