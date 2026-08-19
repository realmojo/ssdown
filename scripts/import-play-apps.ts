/**
 * import-play-apps.ts
 *
 * 구글 플레이 패키지 ID 목록을 받아 사실 정보만으로 software_applications 에
 * 등록합니다. 아이콘은 내려받아 WebP 로 바꾼 뒤 S3 에 올립니다.
 *
 * 저작권 정책: 스토어의 설명문·스크린샷은 가져오지 않습니다.
 * 가져오는 것은 사실 정보뿐입니다 — 한국어 앱 이름, 패키지 ID, 개발사, 장르,
 * 스토어 주소, 아이콘. 리뷰·요약·SEO 는 generate-bilingual-reviews.ts 가 새로 만듭니다.
 *
 * 평점은 넣지 않습니다. 플레이 스토어 평점은 그 스토어 이용자의 것이라
 * 우리 사이트 평점으로 표시하면 사실과 다릅니다.
 *
 * Usage:
 *   npx tsx scripts/import-play-apps.ts --file=/tmp/ziper/urls.txt              # dry-run
 *   npx tsx scripts/import-play-apps.ts --file=... --limit=10                   # 앞 10개만
 *   npx tsx scripts/import-play-apps.ts --file=... --insert                     # 실제 삽입
 *   npx tsx scripts/import-play-apps.ts --file=... --insert --no-icons          # 아이콘 생략
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

const FILE = getArg("--file=") ?? "";
const DO_INSERT = args.includes("--insert");
const NO_ICONS = args.includes("--no-icons");
const LIMIT = Number(getArg("--limit=") ?? 0);
const CONCURRENCY = Number(getArg("--concurrency=") ?? 6);

const REGION = process.env.AWS_REGION ?? "";
const BUCKET = process.env.S3_BUCKET ?? "";
const PUBLIC_BASE =
  process.env.S3_PUBLIC_BASE?.replace(/\/$/, "") ??
  (BUCKET && REGION ? `https://${BUCKET}.s3.${REGION}.amazonaws.com` : "");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/**
 * 플레이 스토어 카테고리 코드 → 우리 DB 의 category_main / category_sub
 * 한국어 라벨 대신 코드(GAME_PUZZLE 등)로 잡는다. 표기가 바뀌어도 안 깨진다.
 */
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
  // 게임이 아닌 카테고리
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

/**
 * 매핑에 없는 카테고리의 기본값.
 * 게임 코드(GAME_*)와 그 밖을 갈라야 한다. 예전엔 무조건 "Games" 로 떨어져
 * 인스타그램·크롬 같은 앱까지 게임으로 분류됐다.
 */
function fallbackCategory(code: string): { main: string; sub: string } {
  return code.startsWith("GAME_") || code === "FAMILY"
    ? { main: "Games", sub: "Games" }
    : { main: "Utilities & Tools", sub: "Utilities" };
}

/**
 * 패키지 뒷마디에 흔히 붙는 배포용 꼬리표. slug 를 만들 때 건너뛴다.
 * (com.com2us.es.android.google.kr.normal → "normal" 이 되는 것을 막는다)
 */
const GENERIC_SEGMENTS = new Set([
  "normal", "global", "gp", "google", "googleplay", "play", "android", "aos", "ios",
  "kr", "ww", "en", "us", "jp", "free", "premium", "pro", "lite", "full", "app",
  "apps", "game", "games", "mobile", "client", "release", "prod", "main", "std",
]);

interface AppMeta {
  pkg: string;
  id: string;
  nameKr: string;
  developer: string;
  genre: string;
  iconUrl: string;
  status: number;
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
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/**
 * 패키지 ID 에서 우리 DB 의 기본키로 쓸 slug 를 만든다.
 * 보통 마지막 마디가 앱 이름이라 그걸 쓰고, 너무 짧거나 흔하면 앞 마디를 붙인다.
 */
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
  const candidates = [
    tail,
    norm(`${parts[parts.length - 2] ?? ""}-${tail}`),
    norm(pkg),
  ].filter((c) => c && c.length >= 3);

  for (const c of candidates) {
    if (!taken.has(c)) return c;
  }
  // 그래도 겹치면 번호를 붙인다.
  let n = 2;
  while (taken.has(`${tail}-${n}`)) n++;
  return `${tail}-${n}`;
}

/** 스토어 페이지에서 사실 정보만 뽑는다. 설명문은 읽지 않는다. */
async function fetchMeta(pkg: string): Promise<Omit<AppMeta, "id"> | null> {
  const url = `https://play.google.com/store/apps/details?id=${pkg}&hl=ko&gl=KR`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "ko" } });
  } catch {
    return { pkg, nameKr: "", developer: "", genre: "", iconUrl: "", status: 0 };
  }
  if (!res.ok) return { pkg, nameKr: "", developer: "", genre: "", iconUrl: "", status: res.status };

  const html = await res.text();
  const pick = (re: RegExp) => {
    const m = html.match(re);
    return m ? decodeEntities(m[1]) : "";
  };

  const nameKr = pick(/<meta property="og:title" content="([^"]+)"/).replace(
    /\s*-\s*Google Play\s*(앱|게임)?\s*$/,
    "",
  );
  const developer =
    pick(/<a[^>]+href="\/store\/apps\/dev(?:eloper)?\?id=[^"]*"[^>]*><span[^>]*>([^<]+)</) ||
    pick(/"([^"]{2,60})"\],null,null,\[\[\["https:\/\/play-lh/);
  // href="/store/apps/category/GAME_PUZZLE" aria-label="퍼즐" 형태에서 코드만 가져온다.
  const genre = pick(/\/store\/apps\/category\/([A-Z_]+)"\s+aria-label=/);
  const iconUrl = pick(/<meta property="og:image" content="([^"]+)"/).replace(/=w\d+-h\d+.*$/, "=w512");

  return { pkg, nameKr, developer, genre, iconUrl, status: 200 };
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
      if (tick && done % 25 === 0) tick(done, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, w));
  tick?.(done, items.length);
  return out;
}

/** 아이콘을 내려받아 WebP 로 바꾼 뒤 S3 에 올린다. */
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

async function main() {
  if (!FILE || !fs.existsSync(FILE)) throw new Error("--file= 로 패키지 ID 목록 파일을 지정하세요.");

  // 파일에는 패키지 ID 나 스토어 URL 이 섞여 있을 수 있다.
  const raw = fs.readFileSync(FILE, "utf8").split("\n").map((l) => l.trim()).filter(Boolean);
  const pkgs = [...new Set(raw.map((l) => l.match(/[?&]id=([^&\s]+)/)?.[1] ?? l))];
  const targets = LIMIT > 0 ? pkgs.slice(0, LIMIT) : pkgs;

  console.log(`입력 ${raw.length}줄 → 중복 제거 ${pkgs.length}개 → 대상 ${targets.length}개\n`);

  const sb = db();

  // 이미 있는 것 걸러내기: id / 한국어 이름 / 스토어 주소
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

  const started = Date.now();
  const metas = await mapLimit(targets, CONCURRENCY, fetchMeta, (d, t) =>
    console.log(`  메타 수집 ${d}/${t} (${Math.round((Date.now() - started) / 1000)}초)`),
  );

  const taken = new Set(existIds);
  const rows: Record<string, unknown>[] = [];
  const skipped: string[] = [];
  const dead: string[] = [];
  const chosen: AppMeta[] = [];

  for (const m of metas) {
    if (!m) continue;
    if (m.status !== 200 || !m.nameKr) {
      dead.push(`${m.pkg} (${m.status || "연결실패"})`);
      continue;
    }
    if (existPkgs.has(m.pkg) || existNames.has(m.nameKr)) {
      skipped.push(m.nameKr);
      continue;
    }
    const id = slugFromPackage(m.pkg, taken);
    taken.add(id);
    const cat = GENRE_MAP[m.genre] ?? fallbackCategory(m.genre);
    const storeUrl = `https://play.google.com/store/apps/details?id=${m.pkg}`;

    chosen.push({ ...m, id });
    rows.push({
      id,
      slug: `/android/${id}`,
      name: m.nameKr,
      name_kr: m.nameKr,
      platform: "Android",
      developer_name: m.developer,
      developer_website_url: storeUrl,
      category_main: cat.main,
      category_sub: cat.sub,
      seo_title: "",
      seo_description: "",
      seo_title_kr: null,
      seo_description_kr: null,
      download_url: storeUrl,
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
      os_requirements: "",
      languages: ["Korean"],
      last_updated_date: new Date().toISOString(),
    });
  }

  console.log(`\n신규 ${rows.length} / 중복 스킵 ${skipped.length} / 실패 ${dead.length}`);
  if (skipped.length) console.log(`  스킵 예: ${skipped.slice(0, 6).join(", ")}`);
  if (dead.length) console.log(`  실패 예: ${dead.slice(0, 6).join(", ")}`);

  const byGenre: Record<string, number> = {};
  for (const m of chosen) byGenre[m.genre || "(장르없음)"] = (byGenre[m.genre || "(장르없음)"] ?? 0) + 1;
  console.log("\n장르 분포:");
  Object.entries(byGenre).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${String(v).padStart(4)}  ${k}`));

  const preview = path.join(__dirname, ".play-import-preview.json");
  fs.writeFileSync(preview, JSON.stringify(chosen, null, 1));
  console.log(`\n미리보기: ${preview}`);

  if (!DO_INSERT) {
    console.log("\n[dry-run] 삽입하지 않았습니다. --insert 를 붙이세요.");
    return;
  }

  // 아이콘 업로드
  if (!NO_ICONS) {
    const client = s3();
    const iconStart = Date.now();
    const urls = await mapLimit(chosen, CONCURRENCY, (m) => uploadIcon(client, m.id, m.iconUrl), (d, t) =>
      console.log(`  아이콘 ${d}/${t} (${Math.round((Date.now() - iconStart) / 1000)}초)`),
    );
    let n = 0;
    chosen.forEach((m, i) => {
      if (urls[i]) {
        (rows[i] as Record<string, unknown>).icon_url = urls[i];
        n++;
      }
    });
    console.log(`아이콘 업로드: ${n}/${chosen.length}`);
  }

  let inserted = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await sb
      .from("ssdown_software_applications")
      .upsert(chunk, { onConflict: "id", ignoreDuplicates: true });
    if (error) {
      console.error(`  삽입 실패 (${i}~): ${error.message}`);
      continue;
    }
    inserted += chunk.length;
  }

  const idsPath = path.join(__dirname, ".play-import-ids.json");
  fs.writeFileSync(idsPath, JSON.stringify(rows.map((r) => r.id), null, 1));
  console.log(`\n삽입 완료: ${inserted}건`);
  console.log(`대상 id 목록: ${idsPath}`);
  console.log("리뷰가 채워지기 전까지는 목록·사이트맵에 노출되지 않습니다.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
