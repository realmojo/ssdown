/**
 * backfill-android-download-url.ts
 *
 * download_url이 "#"(빈 값)인 Android 항목 중 이미 노출 중인(ai_review_html_kr이
 * 있는) 것들을 대상으로, 앱 이름으로 구글 플레이를 검색해 공식 페이지를 찾아
 * download_url / developer_website_url / name_kr / developer_name / icon_url /
 * category_main·sub 를 채운다.
 *
 * 이름 유사도가 낮으면(동명이인 앱 오매칭 방지) 건너뛰고 .backfill-unmatched.json
 * 에 기록한다. import-modyolo.ts 의 매칭 로직과 동일한 기준을 쓴다.
 *
 * Usage:
 *   npx tsx scripts/backfill-android-download-url.ts                # dry-run
 *   npx tsx scripts/backfill-android-download-url.ts --update        # 실제 반영
 *   npx tsx scripts/backfill-android-download-url.ts --limit=10
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
const DO_UPDATE = args.includes("--update");
const LIMIT = Number(getArg("--limit=") ?? 0);
const CONCURRENCY = Number(getArg("--concurrency=") ?? 4);

const REGION = process.env.AWS_REGION ?? "";
const BUCKET = process.env.S3_BUCKET ?? "";
const PUBLIC_BASE =
  process.env.S3_PUBLIC_BASE?.replace(/\/$/, "") ??
  (BUCKET && REGION ? `https://${BUCKET}.s3.${REGION}.amazonaws.com` : "");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

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

/** "OO APK for Android", "OO MOD APK" 같은 임포터 꼬리표를 걷어낸 검색어를 만든다. */
function cleanTitle(raw: string): string {
  return decodeEntities(raw)
    .replace(/\bmod\s*apk\b/gi, "")
    .replace(/\bapk\s*for\s*android\b/gi, "")
    .replace(/\bapk\b/gi, "")
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

function nameSimilarity(a: string, b: string): number {
  const ta = normTokens(a);
  const tb = normTokens(b);
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / new Set([...ta, ...tb]).size;
}

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

interface MatchResult {
  meta: PlayMeta;
  score: number;
  /** true면 자동 반영, false면 애매해서 사람 확인이 필요한 등급. */
  confident: boolean;
}

/**
 * 자카드 유사도만으로는 "레전드 오브 이미르" vs "레전드 오브 룬테라"처럼 공통
 * 수식어만 겹치는 다른 게임을 걸러내지 못한다. 신뢰 등급을 나눈다:
 *  - confident: 정제한 검색어 토큰이 후보 이름 토큰에 (거의) 전부 포함되는
 *    경우만. "쿠키런: 오븐브레이크" ⊆ "쿠키런: 오븐브레이크" 같은 사실상
 *    동일/부분열 관계에만 자동 반영한다.
 *  - 그 외 0.5 이상은 사람이 한 번 봐야 하는 "review" 등급으로만 남긴다.
 */
async function matchOfficialApp(searchName: string): Promise<MatchResult | null> {
  const clean = cleanTitle(searchName);
  if (!clean) return null;
  // 토큰이 하나뿐인 이름("PASS", "yes24")은 자카드 유사도가 쉽게 높게 나와도
  // 실제로는 전혀 다른 회사의 동명 앱일 위험이 커서 자동 매칭 대상에서 뺀다.
  const queryTokens = normTokens(clean);
  if (queryTokens.size < 2) return null;
  const candidates = await searchPlayCandidates(clean, 5);
  if (!candidates.length) return null;
  const metas = await Promise.all(candidates.map(fetchPlayMeta));
  let best: { meta: PlayMeta; score: number; containment: number } | null = null;
  for (const meta of metas) {
    if (meta.status !== 200 || !meta.nameEn) continue;
    const score = Math.max(nameSimilarity(clean, meta.nameEn), nameSimilarity(clean, meta.nameKr));
    const candTokens = new Set([...normTokens(meta.nameEn), ...normTokens(meta.nameKr)]);
    let hit = 0;
    for (const t of queryTokens) if (candTokens.has(t)) hit++;
    const containment = hit / queryTokens.size;
    if (!best || score > best.score) best = { meta, score, containment };
  }
  if (!best || best.score < 0.5) return null;
  // containment === 1: 검색어의 모든 토큰이 후보 이름 안에 그대로 들어있다.
  // ("레전드 오브 이미르"는 "레전드","오브"만 걸리고 "이미르"가 안 걸려 통과 못함)
  return { meta: best.meta, score: best.score, confident: best.containment === 1 };
}

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

function db(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 환경변수가 필요합니다.");
  return createClient(url, key, { auth: { persistSession: false } });
}

interface TargetRow {
  id: string;
  name: string;
  name_kr: string | null;
  icon_url: string | null;
}

async function main() {
  const sb = db();
  const isEmptyStr = (v: unknown) => !v || String(v).trim() === "";

  let data: any[] = [];
  for (let from = 0; ; from += 1000) {
    const { data: page, error } = await sb
      .from("ssdown_software_applications")
      .select("id,name,name_kr,icon_url,download_url,ai_review_html_kr")
      .eq("platform", "Android")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    data = data.concat(page);
    if (page.length < 1000) break;
  }

  // 이미 다른 행이 쓰고 있는 패키지를 추적한다. 검색이 "같은 회사의 다른 앱"으로
  // 잘못 매칭했을 때(예: "yes24" → 예스24 티켓, 실제 메인 앱은 이미 "commerce"
  // 행에 등록되어 있었음) 그 패키지를 또 다른 행에 붙이지 않기 위한 안전장치다.
  const existPkgs = new Set<string>();
  for (const r of data ?? []) {
    const m = String(r.download_url ?? "").match(/[?&]id=([^&\s]+)/);
    if (m) existPkgs.add(m[1]);
  }

  let targets = (data ?? []).filter(
    (r) => !isEmptyStr(r.ai_review_html_kr) && (isEmptyStr(r.download_url) || r.download_url === "#"),
  ) as TargetRow[];
  if (LIMIT > 0) targets = targets.slice(0, LIMIT);

  console.log(`대상: ${targets.length}개\n`);

  const started = Date.now();
  const rawMatches = await mapLimit(
    targets,
    CONCURRENCY,
    (t) => matchOfficialApp(t.name_kr || t.name),
    (d, t) => console.log(`  매칭 ${d}/${t} (${Math.round((Date.now() - started) / 1000)}초)`),
  );

  /**
   * containment===1 이어도 후보 이름이 조회어보다 훨씬 길면(부가 단어가
   * 붙으면) 다른 앱일 수 있다 — 실제로 직접 확인해서 걸러낸 두 건.
   *  - mushwarrior "버섯커 키우기" → "버섯커 키우기 쿠폰" (게임 본체가 아니라
   *    쿠폰/코드 안내용 별도 앱)
   *  - rpg-maker-mv "RPG Maker MV" → "Legend of RPG Maker MV: mmorpg" (정식
   *    앱을 사칭한 이름의 무관한 게임)
   */
  const MANUAL_EXCLUDE = new Set(["mushwarrior", "rpg-maker-mv"]);

  const matched: { row: TargetRow; meta: PlayMeta; score: number }[] = [];
  const needsReview: { row: TargetRow; meta: PlayMeta; score: number }[] = [];
  const unmatched: string[] = [];
  const dupSkipped: string[] = [];
  rawMatches.forEach((m, i) => {
    if (!m) {
      unmatched.push(`${targets[i].id} (${targets[i].name})`);
    } else if (existPkgs.has(m.meta.pkg)) {
      dupSkipped.push(`${targets[i].id} (${targets[i].name}) → ${m.meta.pkg} (이미 다른 행이 사용 중)`);
    } else if (m.confident && !MANUAL_EXCLUDE.has(targets[i].id)) {
      matched.push({ row: targets[i], meta: m.meta, score: m.score });
    } else {
      needsReview.push({ row: targets[i], meta: m.meta, score: m.score });
    }
  });

  console.log(
    `\n자동 반영 대상 ${matched.length} / 사람 확인 필요 ${needsReview.length} / 매칭 실패 ${unmatched.length} / 다른 행과 중복이라 스킵 ${dupSkipped.length}`,
  );
  const unmatchedPath = path.join(__dirname, ".backfill-android-unmatched.json");
  fs.writeFileSync(unmatchedPath, JSON.stringify({ unmatched, dupSkipped }, null, 1));
  console.log(`매칭 실패/중복 목록: ${unmatchedPath} (수동 확인용)`);

  const toPreviewRow = ({ row, meta, score }: { row: TargetRow; meta: PlayMeta; score: number }) => {
    const cat = GENRE_MAP[meta.genre] ?? fallbackCategory(meta.genre);
    const storeUrl = `https://play.google.com/store/apps/details?id=${meta.pkg}`;
    return {
      id: row.id,
      before_name: row.name,
      after_name_kr: meta.nameKr || row.name_kr || row.name,
      score,
      download_url: storeUrl,
      developer_website_url: storeUrl,
      developer_name: meta.developer,
      category_main: cat.main,
      category_sub: cat.sub,
      needs_icon: !row.icon_url,
      icon_source: meta.iconUrl,
    };
  };
  const previewPath = path.join(__dirname, ".backfill-android-preview.json");
  fs.writeFileSync(previewPath, JSON.stringify(matched.map(toPreviewRow), null, 1));
  console.log(`자동 반영 미리보기: ${previewPath}`);
  const reviewPath = path.join(__dirname, ".backfill-android-needs-review.json");
  fs.writeFileSync(reviewPath, JSON.stringify(needsReview.map(toPreviewRow), null, 1));
  console.log(`사람 확인 필요 목록(자동 반영 안 함): ${reviewPath}`);

  if (!DO_UPDATE) {
    console.log("\n[dry-run] 반영하지 않았습니다. --update 를 붙이세요.");
    return;
  }

  const client = s3IfConfigured();
  let updated = 0;
  let iconsUploaded = 0;
  for (const { row, meta } of matched) {
    const cat = GENRE_MAP[meta.genre] ?? fallbackCategory(meta.genre);
    const storeUrl = `https://play.google.com/store/apps/details?id=${meta.pkg}`;
    const update: Record<string, unknown> = {
      download_url: storeUrl,
      developer_website_url: storeUrl,
    };
    if (meta.developer) update.developer_name = meta.developer;
    if (cat) {
      update.category_main = cat.main;
      update.category_sub = cat.sub;
    }
    if (isEmptyStr(row.name_kr) && meta.nameKr) update.name_kr = meta.nameKr;
    if (!row.icon_url && meta.iconUrl && client) {
      const uploaded = await uploadIcon(client, row.id, meta.iconUrl);
      if (uploaded) {
        update.icon_url = uploaded;
        iconsUploaded++;
      }
    }
    const { error: upErr } = await sb.from("ssdown_software_applications").update(update).eq("id", row.id);
    if (upErr) {
      console.error(`  업데이트 실패 (${row.id}): ${upErr.message}`);
      continue;
    }
    updated++;
  }

  console.log(`\n반영 완료: ${updated}건 (아이콘 채움 ${iconsUploaded}건)`);
}

function s3IfConfigured(): S3Client | null {
  const id = process.env.AWS_ACCESS_KEY_ID;
  const secret = process.env.AWS_SECRET_ACCESS_KEY;
  if (!id || !secret || !process.env.AWS_REGION || !process.env.S3_BUCKET) return null;
  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: { accessKeyId: id, secretAccessKey: secret },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
