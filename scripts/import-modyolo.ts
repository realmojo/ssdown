/**
 * import-modyolo.ts
 *
 * modyolo.com(WordPress, MOD APK 사이트)의 글 목록을 읽어 software_applications 에
 * 등록합니다. 다른 임포터(import-download-beer.ts 등)와 정책이 다릅니다 — 사용자
 * 요청에 따라 이 스크립트만 예외적으로 본문을 "번역"해서 그대로 저장합니다.
 *
 * 이름 · 개발사 · 카테고리 · 한국어 정식 명칭 · 다운로드 링크는 modyolo 를 신뢰하지
 * 않습니다. modyolo 는 "OO MOD APK" 같은 변형판 글이라 그대로 쓰면 안 됩니다.
 * 대신 정제한 이름으로 구글 플레이를 검색해 공식 페이지를 찾고, 그 페이지에서
 * 사실 정보(한국어 이름·개발사·장르·공식 스토어 주소)를 가져옵니다. 매칭이
 * 애매하면(이름 겹침이 없으면) 건너뛰고 .modyolo-unmatched.json 에 기록합니다.
 *
 * 이미지: modyolo 글의 대표 이미지(아이콘)를 그대로 받아 S3 에 올립니다(사용자 지시).
 * 본문: modyolo 글 본문을 정제해 영어 리뷰로 저장하고, Ollama 로 "새로 쓰지 않고
 * 그대로 번역"해 한국어 리뷰를 만듭니다. generate-bilingual-reviews.ts 의
 * buildKrPrompt 와 달리 여기서는 의도적으로 재작성이 아니라 축자 번역을 시킵니다.
 *
 * 성인/도박 카테고리(Games > NSFW, Porn, Sex 등)는 ALLOWED_CATEGORIES 화이트리스트에
 * 아예 넣지 않는 방식으로 원천 차단합니다.
 *
 * Usage:
 *   npx tsx scripts/import-modyolo.ts --pages=5                      # dry-run (page당 100건)
 *   npx tsx scripts/import-modyolo.ts --pages=5 --limit=20            # 앞 20개만
 *   npx tsx scripts/import-modyolo.ts --pages=5 --insert              # 실제 삽입
 *   npx tsx scripts/import-modyolo.ts --pages=5 --insert --model=gemma3:latest
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

const PAGES = Number(getArg("--pages=") ?? 3);
const DO_INSERT = args.includes("--insert");
const NO_ICONS = args.includes("--no-icons");
const LIMIT = Number(getArg("--limit=") ?? 0);
const CONCURRENCY = Number(getArg("--concurrency=") ?? 4);
const OLLAMA_MODEL = getArg("--model=") ?? "gemma3:latest";
const OLLAMA_BASE_URL = "http://localhost:11434";
const RETRY_LIMIT = 3;

const REGION = process.env.AWS_REGION ?? "";
const BUCKET = process.env.S3_BUCKET ?? "";
const PUBLIC_BASE =
  process.env.S3_PUBLIC_BASE?.replace(/\/$/, "") ??
  (BUCKET && REGION ? `https://${BUCKET}.s3.${REGION}.amazonaws.com` : "");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const SITE = "https://modyolo.com";

// ── modyolo 카테고리 화이트리스트 ────────────────────────────────────────────
// id 로만 매칭한다. 여기 없는 카테고리(NSFW/Porn/Sex/기타 잡음 태그 포함)의 글은
// 전부 건너뛴다 — 이름 문자열 매칭이 아니라 화이트리스트 방식이라 새 성인 카테고리가
// 생겨도 자동으로는 절대 통과하지 못한다.
const ALLOWED_MODYOLO_CATEGORIES = new Set<number>([
  4152, 4174, 4218, 4207, 4261, 4144, 4194, 4150, 4183, 4140, 4215, 4163,
  4200, 4169, 4179, 4171, 4198, 4300, 4167, 4187, 4160, 4755, 4202, 4147,
  4373, 4209, 4332, 4165, 4274, 4327, 4980, 4450, 4472, 4154, 4294, 4498,
  5785, 4718, 4537, 4280, 4454, 4443, 5313, 4816,
  // parent 없이 남아있는 구 분류(카운트 있는 것만)
  9844, 13817, 13834, 13826, 13795, 13953, 9673, 13860, 13876, 13880, 4920,
  14193, 14063, 4793,
]);

/** 플레이 스토어 카테고리 코드 → 우리 DB 의 category_main / category_sub. */
const GENRE_MAP: Record<string, { main: string; sub: string }> = {
  GAME_ACTION: { main: "Games", sub: "Action" },
  GAME_ADVENTURE: { main: "Games", sub: "Adventure" },
  GAME_ARCADE: { main: "Games", sub: "Arcade" },
  GAME_BOARD: { main: "Games", sub: "Board" },
  GAME_CARD: { main: "Games", sub: "Card" },
  GAME_CASINO: { main: "Games", sub: "Casino" },
  GAME_CASUAL: { main: "Games", sub: "Casual" },
  GAME_EDUCATIONAL: { main: "Education & Reference", sub: "Education" },
  GAME_MUSIC: { main: "Multimedia", sub: "Music" },
  GAME_PUZZLE: { main: "Games", sub: "Puzzle" },
  GAME_RACING: { main: "Games", sub: "Racing" },
  GAME_ROLE_PLAYING: { main: "Games", sub: "RPG" },
  GAME_SIMULATION: { main: "Games", sub: "Simulation" },
  GAME_SPORTS: { main: "Games", sub: "Sports" },
  GAME_STRATEGY: { main: "Games", sub: "Strategy" },
  GAME_TRIVIA: { main: "Games", sub: "Trivia" },
  GAME_WORD: { main: "Games", sub: "Word" },
  FAMILY: { main: "Games", sub: "Family" },
  EDUCATION: { main: "Education & Reference", sub: "Education" },
  BOOKS_AND_REFERENCE: { main: "Education & Reference", sub: "Books & Reference" },
  PARENTING: { main: "Education & Reference", sub: "Parenting" },
  ENTERTAINMENT: { main: "Multimedia", sub: "Entertainment" },
  VIDEO_PLAYERS: { main: "Multimedia", sub: "Video Players" },
  MUSIC_AND_AUDIO: { main: "Multimedia", sub: "Music" },
  PHOTOGRAPHY: { main: "Multimedia", sub: "Photo Editors" },
  ART_AND_DESIGN: { main: "Multimedia", sub: "Art & Design" },
  COMICS: { main: "Multimedia", sub: "Comics" },
  COMMUNICATION: { main: "Social & Communication", sub: "Messaging" },
  SOCIAL: { main: "Social & Communication", sub: "Social" },
  DATING: { main: "Social & Communication", sub: "Dating" },
  TOOLS: { main: "Utilities & Tools", sub: "Utilities" },
  PERSONALIZATION: { main: "Personalization", sub: "Personalization" },
  PRODUCTIVITY: { main: "Productivity", sub: "Productivity" },
  BUSINESS: { main: "Productivity", sub: "Business" },
  FINANCE: { main: "Lifestyle", sub: "Finance" },
  SHOPPING: { main: "Lifestyle", sub: "Shopping" },
  FOOD_AND_DRINK: { main: "Lifestyle", sub: "Food & Drink" },
  HEALTH_AND_FITNESS: { main: "Lifestyle", sub: "Health & Fitness" },
  MEDICAL: { main: "Lifestyle", sub: "Medical" },
  HOUSE_AND_HOME: { main: "Lifestyle", sub: "House & Home" },
  LIFESTYLE: { main: "Lifestyle", sub: "Lifestyle" },
  BEAUTY: { main: "Lifestyle", sub: "Beauty" },
  EVENTS: { main: "Lifestyle", sub: "Events" },
  SPORTS: { main: "Lifestyle", sub: "Sports" },
  TRAVEL_AND_LOCAL: { main: "Travel & Navigation", sub: "Travel" },
  MAPS_AND_NAVIGATION: { main: "Travel & Navigation", sub: "Navigation" },
  AUTO_AND_VEHICLES: { main: "Travel & Navigation", sub: "Auto & Vehicles" },
  NEWS_AND_MAGAZINES: { main: "Multimedia", sub: "News" },
  WEATHER: { main: "Utilities & Tools", sub: "Weather" },
  LIBRARIES_AND_DEMO: { main: "Development & IT", sub: "Developer Tools" },
};

function fallbackCategory(code: string): { main: string; sub: string } {
  return code.startsWith("GAME_") || code === "FAMILY"
    ? { main: "Games", sub: "Games" }
    : { main: "Utilities & Tools", sub: "Utilities" };
}

const GENERIC_SEGMENTS = new Set([
  "normal", "global", "gp", "google", "googleplay", "play", "android", "aos", "ios",
  "kr", "ww", "en", "us", "jp", "free", "premium", "pro", "lite", "full", "app",
  "apps", "game", "games", "mobile", "client", "release", "prod", "main", "std",
]);

interface ModyoloPost {
  id: number;
  title: string;
  slug: string;
  link: string;
  excerpt: string;
  content: string;
  categoryId: number | null;
  iconUrl: string | null;
}

interface MatchedApp {
  post: ModyoloPost;
  cleanTitle: string;
  pkg: string;
  nameKr: string;
  developer: string;
  genre: string;
}

function db(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 환경변수가 필요합니다.");
  return createClient(url, key, { auth: { persistSession: false } });
}

function s3(): S3Client {
  const id = process.env.AWS_ACCESS_KEY_ID;
  const secret = process.env.AWS_SECRET_ACCESS_KEY;
  if (!id || !secret || !REGION || !BUCKET) throw new Error("S3 환경변수가 필요합니다.");
  return new S3Client({ region: REGION, credentials: { accessKeyId: id, secretAccessKey: secret } });
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#8211;|&#8212;/g, "-")
    .replace(/&#8217;|&#8216;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function slugFromPackage(pkg: string, taken: Set<string>): string {
  const parts = pkg
    .split(".")
    .filter((p) => !/^(com|net|org|air|jp|co|de|se|fi|my|me|io|tv)$/i.test(p))
    .filter((p) => !GENERIC_SEGMENTS.has(p.toLowerCase()));
  const norm = (s: string) =>
    s
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const tail = norm(parts[parts.length - 1] ?? pkg);
  const candidates = [tail, norm(`${parts[parts.length - 2] ?? ""}-${tail}`), norm(pkg)].filter(
    (c) => c && c.length >= 3,
  );
  for (const c of candidates) if (!taken.has(c)) return c;
  let n = 2;
  while (taken.has(`${tail}-${n}`)) n++;
  return `${tail}-${n}`;
}

/**
 * "ONEWallet MOD APK – Cards Wallet v1.2.3 (Premium Unlocked)" 같은 modyolo
 * 제목에서 모드 표기 · 버전 번호를 걷어내 검색·표시에 쓸 이름을 뽑는다.
 * 완벽하지 않다 — 못 걸러낸 표기가 남으면 이름 유사도 매칭에서 걸러진다.
 */
function cleanTitle(raw: string): string {
  return decodeEntities(raw)
    .replace(/\bmod\s*apk\b/gi, "")
    .replace(/\bapk\s*mod\b/gi, "")
    .replace(/\b(premium|pro|full|mega|latest)?\s*(unlocked|unlimited)\b[\w\s,]*?(?=[-–(]|$)/gi, "")
    .replace(/\bno\s*ads?\b/gi, "")
    .replace(/\bfree\s*download\b/gi, "")
    .replace(/\bv?\d+(\.\d+){1,3}(\.\d+)?\b/gi, "")
    .replace(/\([^)]*\)\s*$/g, "")
    .replace(/[-–]\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function normTokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 2),
  );
}

/** 자카드 유사도. 공통 토큰이 없으면 0 — 다른 앱을 잘못 연결하지 않기 위한 최소 안전장치. */
function nameSimilarity(a: string, b: string): number {
  const ta = normTokens(a);
  const tb = normTokens(b);
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / new Set([...ta, ...tb]).size;
}

// ── modyolo 글 목록 가져오기 ──────────────────────────────────────────────────

async function fetchModyoloPosts(pages: number): Promise<ModyoloPost[]> {
  const out: ModyoloPost[] = [];
  for (let page = 1; page <= pages; page++) {
    const url = `${SITE}/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed=1&_fields=id,slug,link,title,excerpt,content,categories,_links,_embedded`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) break;
    const data = (await res.json()) as Array<Record<string, any>>;
    if (!Array.isArray(data) || !data.length) break;
    for (const p of data) {
      const categoryId: number | null = Array.isArray(p.categories) ? p.categories[0] ?? null : null;
      const fm = p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
      out.push({
        id: p.id,
        title: decodeEntities(p.title?.rendered ?? ""),
        slug: p.slug,
        link: p.link,
        excerpt: decodeEntities((p.excerpt?.rendered ?? "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim(),
        content: p.content?.rendered ?? "",
        categoryId,
        iconUrl: fm,
      });
    }
    console.log(`  글 목록 ${page}/${pages}페이지 (누적 ${out.length}건)`);
  }
  return out;
}

// ── 구글 플레이 검색으로 공식 앱 매칭 ────────────────────────────────────────

/** 검색 결과 페이지에서 등장 순서대로 패키지 id 를 최대 topN개 뽑는다. */
async function searchPlayCandidates(name: string, topN = 3): Promise<string[]> {
  const q = encodeURIComponent(name);
  const url = `https://play.google.com/store/search?q=${q}&c=apps&hl=en&gl=US`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en" } });
    if (!res.ok) return [];
    const html = await res.text();
    const seen = new Set<string>();
    const out: string[] = [];
    for (const m of html.matchAll(/\/store\/apps\/details\?id=([a-zA-Z0-9_.]+)/g)) {
      if (!seen.has(m[1])) {
        seen.add(m[1]);
        out.push(m[1]);
        if (out.length >= topN) break;
      }
    }
    return out;
  } catch {
    return [];
  }
}

interface PlayMeta {
  pkg: string;
  nameKr: string;
  nameEn: string;
  developer: string;
  genre: string;
  iconUrl: string;
  status: number;
}

async function fetchPlayMeta(pkg: string): Promise<PlayMeta> {
  const empty = { pkg, nameKr: "", nameEn: "", developer: "", genre: "", iconUrl: "", status: 0 };
  try {
    const [krRes, enRes] = await Promise.all([
      fetch(`https://play.google.com/store/apps/details?id=${pkg}&hl=ko&gl=KR`, {
        headers: { "User-Agent": UA, "Accept-Language": "ko" },
      }),
      fetch(`https://play.google.com/store/apps/details?id=${pkg}&hl=en&gl=US`, {
        headers: { "User-Agent": UA, "Accept-Language": "en" },
      }),
    ]);
    if (!krRes.ok) return { ...empty, status: krRes.status };
    const krHtml = await krRes.text();
    const enHtml = enRes.ok ? await enRes.text() : "";
    const pick = (html: string, re: RegExp) => {
      const m = html.match(re);
      return m ? decodeEntities(m[1]) : "";
    };
    const nameKr = pick(krHtml, /<meta property="og:title" content="([^"]+)"/).replace(
      /\s*-\s*Google Play\s*(앱|게임)?\s*$/,
      "",
    );
    const nameEn = pick(enHtml, /<meta property="og:title" content="([^"]+)"/).replace(
      /\s*-\s*Apps on Google Play\s*$/,
      "",
    );
    const developer =
      pick(krHtml, /<a[^>]+href="\/store\/apps\/dev(?:eloper)?\?id=[^"]*"[^>]*><span[^>]*>([^<]+)</) ||
      pick(krHtml, /"([^"]{2,60})"\],null,null,\[\[\["https:\/\/play-lh/);
    const genre = pick(krHtml, /\/store\/apps\/category\/([A-Z_]+)"\s+aria-label=/);
    const iconUrl = pick(krHtml, /<meta property="og:image" content="([^"]+)"/).replace(/=w\d+-h\d+.*$/, "=w512");
    return { pkg, nameKr, nameEn: nameEn || nameKr, developer, genre, iconUrl, status: 200 };
  } catch {
    return empty;
  }
}

/** modyolo 글 하나를 공식 플레이스토어 앱에 매칭한다. 확신 없으면 null. */
async function matchOfficialApp(post: ModyoloPost): Promise<MatchedApp | null> {
  const clean = cleanTitle(post.title);
  if (!clean) return null;
  const candidates = await searchPlayCandidates(clean, 3);
  if (!candidates.length) return null;

  const metas = await Promise.all(candidates.map(fetchPlayMeta));
  let best: { meta: PlayMeta; score: number } | null = null;
  for (const meta of metas) {
    if (meta.status !== 200 || !meta.nameEn) continue;
    const score = Math.max(nameSimilarity(clean, meta.nameEn), nameSimilarity(clean, meta.nameKr));
    if (!best || score > best.score) best = { meta, score };
  }
  if (!best || best.score < 0.34) return null;

  return {
    post,
    cleanTitle: clean,
    pkg: best.meta.pkg,
    nameKr: best.meta.nameKr,
    developer: best.meta.developer,
    genre: best.meta.genre,
  };
}

// ── 본문 정제 + 번역 ──────────────────────────────────────────────────────────

const ALLOWED_TAGS = ["h2", "h3", "p", "strong", "em", "ul", "ol", "li"];

function sanitizeContent(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<h1\b[^>]*>/gi, "<h2>")
    .replace(/<\/h1>/gi, "</h2>")
    .replace(/<h4\b[^>]*>/gi, "<h3>")
    .replace(/<\/h4>/gi, "</h3>")
    .replace(new RegExp(`<(?!\\/?(?:${ALLOWED_TAGS.join("|")})\\b)[^>]*>`, "gi"), "")
    .replace(new RegExp(`<(${ALLOWED_TAGS.join("|")})\\s+[^>]*>`, "gi"), "<$1>")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim()
    .slice(0, 6000);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * 번역 결과가 실제로 한국어인지 대충 검증한다. 작은 로컬 모델은 가끔
 * 영어 원문을 거의 그대로 돌려주거나(gemma3:latest 에서 관찰됨) 중국어를
 * 섞어 쓰는(qwen2.5 에서 관찰됨) 경우가 있어, 한글 비율이 너무 낮으면
 * 번역 실패로 간주하고 재시도한다.
 */
function looksTranslated(text: string): boolean {
  const letters = text.replace(/<[^>]*>/g, "").replace(/[^\p{L}]/gu, "");
  if (letters.length < 10) return false;
  const hangul = (letters.match(/[가-힣]/g) ?? []).length;
  return hangul / letters.length >= 0.4;
}

/**
 * 로컬 모델 하나로는 안정적이지 않아 순서대로 시도하는 폴백 체인을 둔다.
 * 관찰된 실패 패턴: gemma3:1b 는 긴 본문은 잘 옮기지만 가끔 특정 문장에서
 * 중국어로 새는 경우가 있고, gemma3:latest 는 짧은 문장은 잘 옮기지만 긴
 * 본문에서는 번역 없이 영어를 거의 그대로 돌려주는 경우가 있었다. 그래서
 * 1차 모델이 (한국어 비율 검증 기준) 계속 실패하면 2차 모델로 넘어간다.
 */
const TRANSLATE_MODEL_CHAIN = [OLLAMA_MODEL, "gemma3:latest", "gemma3:1b"].filter(
  (m, i, arr) => arr.indexOf(m) === i,
);

function buildTranslatePrompt(englishHtml: string): string {
  return `당신은 전문 영한 번역가입니다. 아래 영어 HTML 문서를 한국어로 번역하세요.

규칙:
- 출력은 반드시 100% 한국어여야 합니다. 중국어·일본어 등 다른 언어를 절대 섞지 마세요.
- 요약하거나 새로 쓰지 말고, 원문의 모든 문장을 빠짐없이 그대로 번역하세요.
- HTML 태그 구조(${ALLOWED_TAGS.join(", ")})는 유지하되 속성(id, class 등)은 추가하지 마세요.
- 다른 설명 없이 번역된 HTML만 출력하세요.

번역할 문서:
${englishHtml}`;
}

async function callOllamaTranslate(model: string, prompt: string, temperature: number): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      stream: false,
      options: { num_predict: 3072, temperature },
    }),
  });
  if (!response.ok) throw new Error(`Ollama API error ${response.status}`);
  const data = (await response.json()) as { message: { content: string } };
  let text = (data.message?.content ?? "")
    .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^```html\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  // 작은 모델이 가끔 "규칙 준수 완료." 같은 메타 발언을 본문 앞에 붙인다.
  // 결과는 항상 허용 태그로 시작해야 하므로, 첫 태그 앞에 남은 텍스트는 버린다.
  const firstTag = text.search(new RegExp(`<(${ALLOWED_TAGS.join("|")})>`, "i"));
  if (firstTag > 0) text = text.slice(firstTag);
  return text.trim();
}

/**
 * Ollama 로 영어 리뷰 HTML을 한국어로 "그대로" 번역한다.
 * generate-bilingual-reviews.ts 의 buildKrPrompt 와 달리 재작성이 아니라
 * 축자 번역을 명시적으로 지시한다 — modyolo 원문을 새로 쓰지 않고 옮기는 것이
 * 이 스크립트의 목적이기 때문이다.
 */
async function translateToKorean(englishHtml: string): Promise<string | null> {
  const prompt = buildTranslatePrompt(englishHtml);
  for (const model of TRANSLATE_MODEL_CHAIN) {
    for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
      try {
        const text = await callOllamaTranslate(model, prompt, attempt === 1 ? 0.2 : 0.7);
        if (!text || !looksTranslated(text)) {
          throw new Error(text ? "번역 결과가 한국어로 보이지 않음" : "빈 응답");
        }
        // 모델이 규칙을 어기고 추가한 속성을 다시 걷어낸다.
        return text.replace(new RegExp(`<(${ALLOWED_TAGS.join("|")})\\s+[^>]*>`, "gi"), "<$1>");
      } catch (err) {
        console.warn(
          `      ${model} 시도 ${attempt}/${RETRY_LIMIT} 실패 (${err instanceof Error ? err.message : err})`,
        );
        if (attempt < RETRY_LIMIT) await new Promise((r) => setTimeout(r, attempt * 3_000));
      }
    }
    console.warn(`      ${model} 전체 실패 — 다음 모델로 전환`);
  }
  console.error("      번역 실패: 모든 모델 소진");
  return null;
}

// ── 유틸 ──────────────────────────────────────────────────────────────────────

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T, i: number) => Promise<R>, tick?: (d: number, t: number) => void) {
  const out = new Array<R>(items.length);
  let next = 0, done = 0;
  async function w() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i], i);
      done++;
      if (tick) tick(done, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, w));
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
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: webp,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return `${PUBLIC_BASE}/${key}`;
  } catch {
    return null;
  }
}

// ── 메인 ─────────────────────────────────────────────────────────────────────

async function main() {
  const sb = db();

  console.log(`modyolo.com 글 목록 수집 (최대 ${PAGES}페이지)...`);
  const allPosts = await fetchModyoloPosts(PAGES);
  const posts = allPosts.filter((p) => p.categoryId !== null && ALLOWED_MODYOLO_CATEGORIES.has(p.categoryId));
  console.log(`\n전체 ${allPosts.length}건 → 화이트리스트 카테고리 ${posts.length}건 (성인/미분류 카테고리 제외)`);

  const targets = LIMIT > 0 ? posts.slice(0, LIMIT) : posts;

  // 기존 DB: id / 이름 / 패키지 dedup
  const existIds = new Set<string>();
  const existNames = new Set<string>();
  const existPkgs = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("ssdown_software_applications")
      .select("id,name,name_kr,developer_website_url,download_url")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    for (const r of data) {
      existIds.add(r.id);
      for (const n of [r.name_kr, r.name]) if ((n ?? "").trim()) existNames.add(n.trim());
      for (const u of [r.developer_website_url, r.download_url]) {
        const m = String(u ?? "").match(/[?&]id=([^&\s]+)/);
        if (m) existPkgs.add(m[1]);
      }
    }
    if (data.length < 1000) break;
  }
  console.log(`기존 DB: id ${existIds.size} / 이름 ${existNames.size} / 패키지 ${existPkgs.size}\n`);

  console.log("공식 플레이스토어 매칭 중...");
  const started = Date.now();
  const matches = await mapLimit(targets, CONCURRENCY, matchOfficialApp, (d, t) =>
    console.log(`  매칭 ${d}/${t} (${Math.round((Date.now() - started) / 1000)}초)`),
  );

  const unmatched: string[] = [];
  const skippedDup: string[] = [];
  const chosen: MatchedApp[] = [];
  const taken = new Set(existIds);

  for (let i = 0; i < targets.length; i++) {
    const m = matches[i];
    if (!m) {
      unmatched.push(targets[i].title);
      continue;
    }
    if (existPkgs.has(m.pkg) || existNames.has(m.nameKr)) {
      skippedDup.push(m.nameKr || m.cleanTitle);
      continue;
    }
    chosen.push(m);
  }

  console.log(
    `\n매칭 성공 ${chosen.length} / 매칭 실패(스킵) ${unmatched.length} / 중복 스킵 ${skippedDup.length}`,
  );
  if (unmatched.length) {
    const unmatchedPath = path.join(__dirname, ".modyolo-unmatched.json");
    fs.writeFileSync(unmatchedPath, JSON.stringify(unmatched, null, 1));
    console.log(`  매칭 실패 목록: ${unmatchedPath} (수동 확인용)`);
  }

  if (!chosen.length) {
    console.log("\n등록할 신규 항목이 없습니다.");
    return;
  }

  console.log("\n영어 본문 정제 + 한국어 번역 중...");
  const translateStarted = Date.now();
  const rows: Record<string, unknown>[] = [];
  let done = 0;
  for (const m of chosen) {
    const id = slugFromPackage(m.pkg, taken);
    taken.add(id);
    const cat = GENRE_MAP[m.genre] ?? fallbackCategory(m.genre);
    const storeUrl = `https://play.google.com/store/apps/details?id=${m.pkg}`;

    const enHtml = sanitizeContent(m.post.content);
    const enSummary = (m.post.excerpt || stripHtml(enHtml).slice(0, 200)).slice(0, 300);
    const krHtml = enHtml ? await translateToKorean(enHtml) : null;
    const krSummary = enSummary ? await translateToKorean(`<p>${enSummary}</p>`) : null;

    done++;
    console.log(`  [${done}/${chosen.length}] ${m.nameKr || m.cleanTitle} — EN ${enHtml.length}자 / KR ${krHtml ? "완료" : "실패"} (${Math.round((Date.now() - translateStarted) / 1000)}초)`);

    rows.push({
      id,
      slug: `/android/${id}`,
      name: m.nameKr || m.cleanTitle,
      name_kr: m.nameKr || m.cleanTitle,
      platform: "Android",
      developer_name: m.developer,
      developer_website_url: storeUrl,
      category_main: cat.main,
      category_sub: cat.sub,
      seo_title: `${(m.nameKr || m.cleanTitle).slice(0, 50)} - Download for Android`,
      seo_description: enSummary.slice(0, 155),
      seo_title_kr: `${(m.nameKr || m.cleanTitle).slice(0, 40)} 다운로드`,
      seo_description_kr: (stripHtml(krSummary ?? "").slice(0, 120)) || null,
      download_url: storeUrl,
      file_size: "",
      license: "Free",
      security_status: "Unknown",
      rating_average: 0,
      rating_total_count: 0,
      icon_url: null,
      short_summary: enSummary,
      short_summary_kr: stripHtml(krSummary ?? "") || null,
      body_html: "",
      editor_review_html: "",
      ai_review_html: enHtml,
      ai_review_html_kr: krHtml,
      pros: [],
      cons: [],
      os_requirements: "",
      languages: ["Korean"],
      last_updated_date: new Date().toISOString(),
    });
  }

  const preview = path.join(__dirname, ".modyolo-import-preview.json");
  fs.writeFileSync(preview, JSON.stringify(rows, null, 1));
  console.log(`\n미리보기: ${preview}`);

  if (!DO_INSERT) {
    console.log("\n[dry-run] 삽입하지 않았습니다. --insert 를 붙이세요.");
    return;
  }

  if (!NO_ICONS) {
    const client = s3();
    const iconStart = Date.now();
    const urls = await mapLimit(
      chosen,
      CONCURRENCY,
      (m, i) => (m.post.iconUrl ? uploadIcon(client, String(rows[i].id), m.post.iconUrl) : Promise.resolve(null)),
      (d, t) => console.log(`  아이콘 ${d}/${t} (${Math.round((Date.now() - iconStart) / 1000)}초)`),
    );
    let n = 0;
    chosen.forEach((_m, i) => {
      if (urls[i]) {
        rows[i].icon_url = urls[i];
        n++;
      }
    });
    console.log(`아이콘 업로드: ${n}/${chosen.length} (원본: modyolo.com)`);
  }

  let inserted = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await sb.from("ssdown_software_applications").upsert(chunk, { onConflict: "id", ignoreDuplicates: true });
    if (error) {
      console.error(`  삽입 실패 (${i}~): ${error.message}`);
      continue;
    }
    inserted += chunk.length;
  }

  console.log(`\n삽입 완료: ${inserted}건`);
  console.log("리뷰(ai_review_html_kr)가 채워진 항목은 바로 목록·사이트맵에 노출됩니다.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
