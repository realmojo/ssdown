/**
 * Softonic 스크래퍼
 *
 * Usage:
 *   npx tsx scripts/scrape-softonic.ts <URL> [--platform=Mac] [--ai] [--insert]
 *
 * Examples:
 *   npx tsx scripts/scrape-softonic.ts https://desmume.softonic.kr/
 *   npx tsx scripts/scrape-softonic.ts https://desmume.softonic.kr/ --platform=Mac --ai --insert
 */

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ── 타입 ──────────────────────────────────────────────────────────────────────

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
  platform: PlatformType;
  supported_platforms: PlatformType[];
  developer_name: string;
  developer_website_url: string | null;
  category_main: string;
  category_sub: string;
  // SEO
  seo_title: string;
  seo_description: string;
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
  // Rating
  rating_average: number;
  rating_total_count: number;
  // Content
  icon_url: string | null;
  short_summary: string;
  body_html: string;
  pros: string[];
  cons: string[];
  // Specs
  os_requirements: string | null;
  languages: string[];
  last_updated_date: string | null;
  // Relations
}

// ── 정규화 헬퍼 ────────────────────────────────────────────────────────────────

function normalizePlatform(raw: string): PlatformType {
  const map: Record<string, PlatformType> = {
    windows: 'Windows', mac: 'Mac', android: 'Android',
    ios: 'iOS', web: 'Web', linux: 'Linux',
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

function parseDownloadCount(raw: string): number {
  const s = raw.replace(/[^\d.KMkm]/g, '');
  if (s.toLowerCase().endsWith('m')) return Math.round(parseFloat(s) * 1_000_000);
  if (s.toLowerCase().endsWith('k')) return Math.round(parseFloat(s) * 1_000);
  return parseInt(s) || 0;
}

// ── 스크래퍼 메인 ─────────────────────────────────────────────────────────────

async function scrapeSoftonic(url: string): Promise<ScrapedApp> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'ko-KR',
    extraHTTPHeaders: { 'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8' },
  });
  const page = await context.newPage();

  console.log(`[scrape] 페이지 로딩: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(2000);

  // ── 1. dataLayer ──────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dlData: any = await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dl = (window as any).dataLayer ?? [];
    return dl.find((e: any) => e.programName || e.program_name) ?? {};
  });

  // ── 2. JSON-LD ────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ldList: any[] = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    return els.flatMap(el => {
      try {
        const parsed = JSON.parse(el.textContent ?? '');
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch { return []; }
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ldApp = ldList.find((x: any) => x['@type'] === 'SoftwareApplication') as any ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ldBreadcrumb = ldList.find((x: any) => x['@type'] === 'BreadcrumbList') as any ?? null;

  // ── 3. 메타 태그 ──────────────────────────────────────────────────────────
  const meta = await page.evaluate(() => ({
    title: document.title,
    description: (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content ?? '',
    ogImage: (document.querySelector('meta[property="og:image"]') as HTMLMetaElement)?.content ?? null,
    keywords: (document.querySelector('meta[name="keywords"]') as HTMLMetaElement)?.content ?? '',
  }));

  // ── 4. 페이지 본문 스크래핑 ───────────────────────────────────────────────
  const scraped = await page.evaluate(() => {
    const qt = (sel: string) => (document.querySelector(sel) as HTMLElement)?.textContent?.trim() ?? '';
    const qa = (sel: string) => Array.from(document.querySelectorAll(sel))
      .map(el => (el as HTMLElement).textContent?.trim() ?? '').filter(Boolean);
    const qaSrc = (sel: string, attr = 'src') => Array.from(document.querySelectorAll(sel))
      .map(el => (el as HTMLImageElement)[attr as 'src'] || el.getAttribute(`data-${attr}`) || el.getAttribute('data-lazy-src') || '').filter(Boolean);

    // ── 앱명/버전/플랫폼 ──
    const name = qt('h1[itemprop="name"],h1.program-header__name,.program-header h1,[class*="app-name"] h1')
      || qt('h1');
    const version = qt('[class*="version"],[itemprop="softwareVersion"],.program-header__version')
      .replace(/^v/i, '').trim();

    // ── 평점/리뷰 ──
    const ratingText = qt('[itemprop="ratingValue"],[class*="rating-value"],[class*="stars-number"],.rating__value');
    const reviewText = qt('[itemprop="ratingCount"],[class*="rating-count"],[class*="review-count"],[class*="nr-reviews"]');

    // ── 다운로드 수 ──
    const downloadCount = qt('[class*="download-count"],[class*="downloads-count"],[class*="program-header__downloads"]')
      || qt('[class*="stat"][class*="download"]');

    // ── 라이선스 ──
    const licenseText = qt('[itemprop="offers"] [itemprop="price"],[class*="license"],[class*="type-tag"]')
      || qt('[class*="program-header"] [class*="free"],[class*="tag--free"]');

    // ── 개발사 ──
    const developer = qt('[itemprop="author"] [itemprop="name"],[class*="developer-name"],[class*="author-name"]')
      || ((document.querySelector('a[href*="/publisher/"]') as HTMLElement)?.textContent?.trim() ?? '');

    // ── 파일크기 / OS / 업데이트 날짜 / 언어 ──
    const specItems = Array.from(document.querySelectorAll('[class*="specs"] [class*="item"],[class*="tech-specs"] li,.technical-sheet li,.specs-table tr'));
    let fileSize = '', osReq = '', lastUpdated = '', langStr = '';
    specItems.forEach(el => {
      const txt = (el as HTMLElement).textContent?.trim() ?? '';
      if (txt.match(/MB|KB|GB/i)) fileSize = txt;
      else if (txt.match(/Windows|Mac|Android|iOS|Linux/i) && !osReq) osReq = txt;
      else if (txt.match(/202[0-9]|201[0-9]/)) lastUpdated = txt;
      else if (txt.match(/Language|언어|語/i)) langStr = txt;
    });
    // fallback selectors
    if (!fileSize) fileSize = qt('[class*="file-size"],[class*="filesize"],[class*="size"]');
    if (!osReq) osReq = qt('[itemprop="operatingSystem"],[class*="os-req"],[class*="system-req"]');
    if (!lastUpdated) lastUpdated = qt('[class*="updated"],[class*="date-modified"],time[datetime]');
    const languages = qa('[class*="languages"] li,[class*="language-list"] li')
      .concat(langStr ? [langStr] : [])
      .filter((v, i, a) => a.indexOf(v) === i);

    // ── 보안 ──
    const securityText = qt('[class*="security"],[class*="antivirus"],[class*="trusted"],[class*="virus-free"]');

    // ── 아이콘 ──
    const iconEl = document.querySelector(
      '[class*="program-icon"] img,[class*="app-icon"] img,[class*="application-icon"] img,header img.icon'
    ) as HTMLImageElement | null;
    const icon = iconEl?.src ?? null;

    // ── 스크린샷 ──
    const screenshots = qaSrc(
      '[class*="screenshot"] img,[class*="gallery"] img,[class*="slider"] img,[data-testid*="screenshot"] img'
    ).filter(s => s.startsWith('http') && !s.includes('placeholder'));

    // ── 장점/단점 ──
    const pros = qa('[class*="pros"] li,[class*="good-things"] li,[class*="positive"] li');
    const cons = qa('[class*="cons"] li,[class*="bad-things"] li,[class*="negative"] li');

    // ── 본문 ──
    const bodyEl = document.querySelector(
      '[class*="article-text"],[class*="description-text"],[class*="program-description"],[class*="body-copy"] .content,article .body'
    ) as HTMLElement | null;
    const bodyHtml = bodyEl?.innerHTML?.trim() ?? '';
    const summaryEl = document.querySelector(
      '[class*="description"] > p:first-child,[class*="intro"] p,[class*="lead"] p'
    ) as HTMLElement | null;
    const summary = summaryEl?.textContent?.trim() ?? bodyEl?.textContent?.slice(0, 300).trim() ?? '';

    // ── FAQ ──
    const faqItems: { question: string; answer: string }[] = [];
    // 방법 1: 명시적 FAQ 컨테이너
    document.querySelectorAll('[class*="faq"] [class*="item"],[class*="faq-item"]').forEach(el => {
      const q = (el.querySelector('[class*="question"],[class*="title"]') as HTMLElement)?.textContent?.trim();
      const a = (el.querySelector('[class*="answer"],[class*="body"],[class*="content"]') as HTMLElement)?.textContent?.trim();
      if (q && a) faqItems.push({ question: q, answer: a });
    });
    // 방법 2: details/summary
    if (faqItems.length === 0) {
      document.querySelectorAll('details').forEach(el => {
        const q = (el.querySelector('summary') as HTMLElement)?.textContent?.trim();
        const a = el.textContent?.replace(q ?? '', '').trim();
        if (q && a) faqItems.push({ question: q, answer: a });
      });
    }

    // ── 대체 앱 ──
    const alternatives = Array.from(document.querySelectorAll('[class*="alternative"] [class*="name"],[class*="related-app"] h3'))
      .map(el => (el as HTMLElement).textContent?.trim() ?? '').filter(Boolean).slice(0, 6);

    return {
      name, version, ratingText, reviewText, downloadCount, licenseText,
      developer, fileSize, osReq, lastUpdated, languages, securityText,
      icon, screenshots, pros, cons, bodyHtml, summary, faqItems, alternatives,
    };
  });

  await browser.close();

  // ── 5. 데이터 조합 ────────────────────────────────────────────────────────

  const breadcrumbItems = ldBreadcrumb?.itemListElement ?? [];
  const categoryMain = breadcrumbItems[2]?.item?.name ?? dlData.categoryId ?? '';
  const categorySub  = breadcrumbItems[3]?.item?.name ?? categoryMain;

  const iconUrl = ldApp?.image ?? scraped.icon ?? null;

  const coverImg = ldApp?.mainEntityOfPage?.thumbnailUrl;
  const screenshots = scraped.screenshots.length > 0 ? scraped.screenshots : (coverImg ? [coverImg] : []);

  const bodyHtml = scraped.bodyHtml || ldApp?.mainEntityOfPage?.description || ldApp?.description || '';
  const summary = scraped.summary || ldApp?.description || '';

  const prosFromLd: string[] = (ldApp?.review?.positiveNotes?.itemListElement ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((x: any) => x.item ?? '').filter(Boolean);
  const consFromLd: string[] = (ldApp?.review?.negativeNotes?.itemListElement ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((x: any) => x.item ?? '').filter(Boolean);

  // 평점
  const ldRatingValue = parseFloat(ldApp?.aggregateRating?.ratingValue ?? '0');
  const ldBestRating  = parseFloat(ldApp?.aggregateRating?.bestRating ?? '10');
  const ratingAvg = ldRatingValue > 0
    ? (ldRatingValue / ldBestRating) * 5
    : parseFloat(scraped.ratingText) || parseFloat(dlData.program_user_score ?? '0') / 2;
  const ratingCount = parseInt(ldApp?.aggregateRating?.ratingCount ?? scraped.reviewText ?? dlData.nr_reviews ?? '0') || 0;

  // 날짜
  let lastUpdated: string | null = null;
  const dateStr = ldApp?.dateModified || scraped.lastUpdated || dlData.program_review_modification_date;
  if (dateStr) {
    try { lastUpdated = new Date(dateStr).toISOString(); } catch { lastUpdated = null; }
  }

  // 보안
  let secStatus: SecurityStatus = 'Unknown';
  const secLower = scraped.securityText.toLowerCase();
  if (secLower.includes('safe') || secLower.includes('안전') || secLower.includes('신뢰') || secLower.includes('clean')) secStatus = 'Safe';
  else if (secLower.includes('warn') || secLower.includes('경고')) secStatus = 'Warning';
  else if (secLower.includes('danger') || secLower.includes('위험')) secStatus = 'Dangerous';

  // 라이선스
  const licenseRaw = dlData.program_licence || scraped.licenseText || 'free';

  const programName = dlData.programName || dlData.program_name || scraped.name || ldApp?.name || 'Unknown';
  const version = dlData.versionId || scraped.version || ldApp?.softwareVersion || '';
  const platformRaw = dlData.platformId || 'windows';

  const urlObj    = new URL(url);
  const appSlug   = urlObj.hostname.split('.')[0];
  const platformSlug = normalizePlatform(platformRaw).toLowerCase();
  const appId     = String(dlData.programId || `${appSlug}-${platformSlug}`);

  const result: ScrapedApp = {
    id: appId,
    slug: `/${platformSlug}/${appSlug}`,
    name: programName,
    version,
    platform: normalizePlatform(platformRaw),
    supported_platforms: [normalizePlatform(platformRaw)],
    developer_name: (ldApp?.review?.author?.name || scraped.developer || 'Unknown').trim(),
    developer_website_url: ldApp?.review?.author?.['@id'] ?? null,
    category_main: categoryMain,
    category_sub: categorySub,
    // SEO
    seo_title: meta.title,
    seo_description: meta.description,
    seo_og_image: meta.ogImage ?? coverImg ?? null,
    seo_structured_data: ldList.length > 0 ? ({ items: ldList } as Record<string, unknown>) : null,
    // Download
    download_url: url,
    file_size: scraped.fileSize || ldApp?.fileSize || 'N/A',
    license: normalizeLicense(licenseRaw),
    price: ldApp?.offers?.price === 0 ? 0 : null,
    currency: ldApp?.offers?.priceCurrency ?? null,
    // Security
    security_status: secStatus,
    security_last_scanned_at: new Date().toISOString(),
    // Rating
    rating_average: Math.min(5, Math.max(0, parseFloat(ratingAvg.toFixed(2)))),
    rating_total_count: ratingCount,
    // Content
    icon_url: iconUrl,
    short_summary: summary,
    body_html: bodyHtml,
    pros: prosFromLd.length > 0 ? prosFromLd : scraped.pros,
    cons: consFromLd.length > 0 ? consFromLd : scraped.cons,
    // Specs
    os_requirements: ldApp?.operatingSystem || scraped.osReq || null,
    languages: scraped.languages,
    last_updated_date: lastUpdated,
    // Relations
  };

  return result;
}

// ── Cloudflare AI ─────────────────────────────────────────────────────────────

async function cfAI(prompt: string): Promise<string> {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken  = process.env.CF_API_TOKEN;
  if (!accountId || !apiToken) throw new Error('CF_ACCOUNT_ID / CF_API_TOKEN 환경변수가 없습니다.');

  const model = '@cf/meta/llama-3.1-8b-instruct';
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], max_tokens: 2048 }),
    }
  );
  if (!res.ok) throw new Error(`Cloudflare AI 오류: ${res.status} ${await res.text()}`);
  const json = await res.json() as { result?: { response?: string } };
  return json.result?.response?.trim() ?? '';
}

async function generateAppContent(
  raw: ScrapedApp
): Promise<Pick<ScrapedApp, 'short_summary' | 'body_html' | 'pros' | 'cons' | 'features' | 'faq'>> {
  console.log('[AI] 콘텐츠 생성 중...');

  const ctx = `
앱명: ${raw.name}
플랫폼: ${raw.platform}
버전: ${raw.version}
개발사: ${raw.developer_name}
카테고리: ${raw.category_main} > ${raw.category_sub}
라이선스: ${raw.license}
파일크기: ${raw.file_size}
다운로드수: ${raw.download_count ?? ''}
OS 요구사항: ${raw.os_requirements ?? ''}
원본 요약: ${raw.short_summary}
원본 장점: ${raw.pros.join(' / ')}
원본 단점: ${raw.cons.join(' / ')}
원본 FAQ: ${raw.faq.map(f => `Q: ${f.question} A: ${f.answer}`).join(' | ')}
`.trim();

  const summaryPrompt = `다음 앱 정보를 바탕으로 한국어로 2~3문장의 자연스럽고 매력적인 소개 문장을 작성해줘.
원본을 번역하지 말고 새롭게 재구성해. 마크다운 없이 텍스트만 출력해.

${ctx}`;

  const bodyPrompt = `다음 앱 정보를 바탕으로 한국어 앱 소개 글을 작성해줘.
규칙:
- 본문만 출력 (제목 없음)
- HTML 태그 <p>, <h3>, <ul>, <li>, <strong>만 사용
- 600~900자 분량
- 원본을 번역하지 말고 새롭게 재구성
- 주요 기능, 특징, 추천 대상 포함

${ctx}`;

  const prosConsPrompt = `다음 앱 정보를 바탕으로 JSON만 출력해줘. 다른 텍스트 없음.
형식: {"pros":["장점1","장점2","장점3"],"cons":["단점1","단점2"],"features":["기능1","기능2","기능3"]}
- 장점 3~5개, 단점 2~3개, 주요기능 3~5개 (한국어)

${ctx}`;

  const faqPrompt = `다음 앱 정보를 바탕으로 자주 묻는 질문(FAQ) 3개를 한국어로 작성해줘.
JSON만 출력해. 다른 텍스트 없음.
형식: [{"question":"질문1","answer":"답변1"},{"question":"질문2","answer":"답변2"},{"question":"질문3","answer":"답변3"}]

${ctx}`;

  const [summaryRaw, bodyRaw, prosConsRaw, faqRaw] = await Promise.all([
    cfAI(summaryPrompt),
    cfAI(bodyPrompt),
    cfAI(prosConsPrompt),
    cfAI(faqPrompt),
  ]);

  // pros/cons/features JSON 파싱
  let pros = raw.pros;
  let cons = raw.cons;
  let features = raw.features;
  try {
    const match = prosConsRaw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed.pros)) pros = parsed.pros;
      if (Array.isArray(parsed.cons)) cons = parsed.cons;
      if (Array.isArray(parsed.features)) features = parsed.features;
    }
  } catch {
    console.warn('[AI] pros/cons JSON 파싱 실패 → 원본 유지');
  }

  // FAQ JSON 파싱
  let faq = raw.faq;
  try {
    const match = faqRaw.match(/\[[\s\S]*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) faq = parsed;
    }
  } catch {
    console.warn('[AI] FAQ JSON 파싱 실패 → 원본 유지');
  }

  return { short_summary: summaryRaw, body_html: bodyRaw, pros, cons, features, faq };
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
  const args        = process.argv.slice(2);
  const url         = args.find(a => a.startsWith('http'));
  const platformArg = args.find(a => a.startsWith('--platform='))?.split('=')[1];
  const doAI        = args.includes('--ai');
  const doInsert    = args.includes('--insert');

  if (!url) {
    console.error('Usage: npx tsx scripts/scrape-softonic.ts <URL> [--platform=Mac] [--ai] [--insert]');
    process.exit(1);
  }

  const data = await scrapeSoftonic(url);

  if (platformArg) {
    const normalized = normalizePlatform(platformArg);
    data.platform = normalized;
    data.supported_platforms = [normalized];
    data.slug = data.slug.replace(/^\/(windows|mac|android|ios|linux|web)\//, `/${normalized.toLowerCase()}/`);
    data.id   = data.id.replace(/-(windows|mac|android|ios|linux|web)$/, `-${normalized.toLowerCase()}`);
    console.log(`[override] platform → ${normalized}`);
  }

  if (doAI) {
    const generated = await generateAppContent(data);
    Object.assign(data, generated);
    console.log('[AI] 콘텐츠 생성 완료');
  }

  console.log('\n──────────────── 추출 결과 ────────────────');
  console.log(JSON.stringify(data, null, 2));
  console.log('──────────────────────────────────────────\n');

  if (doInsert) {
    await insertToSupabase(data);
    console.log('Supabase에 저장 완료!');
  } else {
    console.log('(--insert 없이 실행 → DB 저장 생략)');
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
