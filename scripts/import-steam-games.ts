/**
 * import-steam-games.ts
 *
 * 인기 순 스팀 게임을 software_applications 에 등록한다.
 *
 * 목록 소스: SteamSpy(https://steamspy.com/api.php?request=all&page=N) — API 키
 * 불필요, 소유자 수 기준 정렬(대략 인기 순), 페이지당 1000개.
 * 상세 정보 소스: 스팀 공식 스토어 API
 * (https://store.steampowered.com/api/appdetails?appids=ID&l=korean) — 이것도
 * 키 불필요. l=korean 을 붙이면 이름·장르·짧은 설명이 스팀이 제공하는 한국어
 * 그대로 온다(별도 AI 번역 불필요).
 *
 * 저작권 정책: 스토어의 긴 설명(long description)·스크린샷은 가져오지 않는다.
 * 가져오는 것은 사실 정보 + 스팀이 직접 제공하는 짧은 한 줄 소개뿐이다.
 * 상세 리뷰(ai_review_html)는 generate-bilingual-reviews.ts 가 새로 생성한다.
 *
 * 속도 제한: 스팀 스토어 API는 비공식으로 5분에 약 200회 수준의 제한이 있다고
 * 알려져 있다. 기본 동시성 2 + 요청 간 텀으로 보수적으로 돈다. 429 를 받으면
 * 지수 백오프로 재시도한다.
 *
 * Usage:
 *   npx tsx scripts/import-steam-games.ts --top=1000                  # dry-run
 *   npx tsx scripts/import-steam-games.ts --top=1000 --insert
 *   npx tsx scripts/import-steam-games.ts --top=50 --insert           # 소규모 테스트
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

const TOP = Number(getArg("--top=") ?? 1000);
const DO_INSERT = args.includes("--insert");
const NO_ICONS = args.includes("--no-icons");
const CONCURRENCY = Number(getArg("--concurrency=") ?? 2);

const REGION = process.env.AWS_REGION ?? "";
const BUCKET = process.env.S3_BUCKET ?? "";
const PUBLIC_BASE =
  process.env.S3_PUBLIC_BASE?.replace(/\/$/, "") ??
  (BUCKET && REGION ? `https://${BUCKET}.s3.${REGION}.amazonaws.com` : "");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** 스팀 장르 id(로케일 안 바뀜) → 우리 DB 카테고리. 못 찾으면 Games/Games. */
const GENRE_ID_MAP: Record<string, { main: string; sub: string }> = {
  "1": { main: "Games", sub: "Action" },
  "25": { main: "Games", sub: "Adventure" },
  "23": { main: "Games", sub: "Games" }, // Indie — 별도 하위분류 없어 그대로 둠
  "3": { main: "Games", sub: "RPG" },
  "28": { main: "Games", sub: "Simulation" },
  "2": { main: "Games", sub: "Strategy" },
  "9": { main: "Games", sub: "Racing" },
  "18": { main: "Games", sub: "Sports" },
  "4": { main: "Games", sub: "Casual" },
  "29": { main: "Games", sub: "Games" }, // Massively Multiplayer
  "70": { main: "Games", sub: "Games" }, // Early Access
  "37": { main: "Games", sub: "Games" }, // Free to Play (부가 태그일 때가 많음)
  "50": { main: "Games", sub: "Games" }, // Violent
  "51": { main: "Games", sub: "Games" }, // Gore
  "52": { main: "Games", sub: "Games" }, // Nudity
  "53": { main: "Games", sub: "Games" }, // Sexual Content
  "58": { main: "Utilities & Tools", sub: "Utilities" }, // Utilities
  "54": { main: "Education & Reference", sub: "Education" }, // Education
  "59": { main: "Development & IT", sub: "Developer Tools" }, // Game Development
  "60": { main: "Multimedia", sub: "Video Players" }, // Animation & Modeling
  "57": { main: "Multimedia", sub: "Art & Design" }, // Design & Illustration
};
// 우선순위: 더 구체적인 장르(액션/RPG/전략 등)를 부가 태그(무료 플레이 등)보다 먼저 고른다.
const GENRE_PRIORITY = ["1", "25", "3", "28", "2", "9", "18", "4", "23", "29", "70", "37", "50", "51", "52", "53", "58", "54", "59", "60", "57"];

function pickCategory(genres: { id: string; description: string }[]): { main: string; sub: string } {
  const ids = new Set(genres.map((g) => g.id));
  for (const id of GENRE_PRIORITY) {
    if (ids.has(id)) return GENRE_ID_MAP[id];
  }
  return { main: "Games", sub: "Games" };
}

interface SteamSpyEntry {
  appid: number;
  name: string;
}

interface AppDetail {
  appid: number;
  nameKr: string;
  developer: string;
  publisher: string;
  shortSummaryKr: string;
  genres: { id: string; description: string }[];
  headerImage: string;
  isFree: boolean;
  platforms: { windows: boolean; mac: boolean; linux: boolean };
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

/**
 * SteamSpy "all" 요청은 page 당 1000개, 원문 텍스트 순서가 소유자 수
 * 내림차순(대략 인기 순)이다. 응답은 { "appid": {...} } 형태의 객체인데,
 * JS는 정수처럼 생긴 키를 가진 객체를 순회할 때 원래 순서 대신 숫자
 * 오름차순으로 재정렬해버린다(ECMAScript 스펙의 "정수 인덱스 키" 규칙).
 * Object.values() 를 쓰면 인기 순서가 사라지고 appid 순으로 뒤바뀌므로,
 * 원문 텍스트에서 "appid":숫자 순서를 직접 뽑아 순서를 지킨다.
 */
async function fetchSteamSpyTop(limit: number): Promise<SteamSpyEntry[]> {
  const out: SteamSpyEntry[] = [];
  for (let page = 0; out.length < limit; page++) {
    const res = await fetch(`https://steamspy.com/api.php?request=all&page=${page}`, {
      headers: { "User-Agent": UA },
    });
    if (!res.ok) break;
    const text = await res.text();
    const json = JSON.parse(text) as Record<string, { appid: number; name: string }>;
    const orderedIds: number[] = [];
    for (const m of text.matchAll(/"appid":(\d+)/g)) orderedIds.push(Number(m[1]));
    if (!orderedIds.length) break;
    for (const appid of orderedIds) {
      const e = json[String(appid)];
      if (e) out.push({ appid: e.appid, name: e.name });
    }
    if (orderedIds.length < 1000) break; // 마지막 페이지
  }
  return out.slice(0, limit);
}

async function fetchAppDetail(appid: number, attempt = 1): Promise<AppDetail> {
  const empty: AppDetail = {
    appid,
    nameKr: "",
    developer: "",
    publisher: "",
    shortSummaryKr: "",
    genres: [],
    headerImage: "",
    isFree: false,
    platforms: { windows: true, mac: false, linux: false },
    status: 0,
  };
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&l=korean`,
      { headers: { "User-Agent": UA } },
    );
    if (res.status === 429) {
      if (attempt <= 4) {
        await new Promise((r) => setTimeout(r, attempt * 5_000));
        return fetchAppDetail(appid, attempt + 1);
      }
      return { ...empty, status: 429 };
    }
    if (!res.ok) return { ...empty, status: res.status };
    const json = (await res.json()) as Record<string, { success: boolean; data?: any }>;
    const entry = json[String(appid)];
    if (!entry?.success || !entry.data || entry.data.type !== "game") {
      return { ...empty, status: 204 }; // DLC·사운드트랙·데모 등은 건너뜀
    }
    const d = entry.data;
    return {
      appid,
      nameKr: d.name ?? "",
      developer: (d.developers ?? [])[0] ?? "",
      publisher: (d.publishers ?? [])[0] ?? "",
      shortSummaryKr: d.short_description ?? "",
      genres: d.genres ?? [],
      headerImage: d.header_image ?? "",
      isFree: Boolean(d.is_free),
      platforms: {
        windows: Boolean(d.platforms?.windows),
        mac: Boolean(d.platforms?.mac),
        linux: Boolean(d.platforms?.linux),
      },
      status: 200,
    };
  } catch {
    return empty;
  }
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
      // 순차 스로틀 — 워커 하나당 요청 사이 텀을 둬서 전체 동시성을 낮춘다.
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, w));
  tick?.(done, items.length);
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

function slugFromName(name: string, appid: number, taken: Set<string>): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const candidates = [base, `${base}-${appid}`].filter((c) => c && c.length >= 2);
  for (const c of candidates) if (!taken.has(c)) return c;
  return `steam-${appid}`;
}

async function main() {
  console.log(`SteamSpy 인기 순 상위 ${TOP}개 목록 수집 중...`);
  const list = await fetchSteamSpyTop(TOP);
  console.log(`목록 ${list.length}개 확보\n`);

  const sb = db();

  const existIds = new Set<string>();
  const existNames = new Set<string>();
  const existAppIds = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("ssdown_software_applications")
      .select("id,name,name_kr,download_url")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    for (const r of data) {
      existIds.add(r.id);
      for (const n of [r.name_kr, r.name]) if ((n ?? "").trim()) existNames.add(n.trim());
      const m = String(r.download_url ?? "").match(/store\.steampowered\.com\/app\/(\d+)/);
      if (m) existAppIds.add(m[1]);
    }
    if (data.length < 1000) break;
  }
  console.log(`기존 DB: id ${existIds.size} / 이름 ${existNames.size} / 스팀 appid ${existAppIds.size}\n`);

  const targets = list.filter((e) => !existAppIds.has(String(e.appid)));
  console.log(`이미 등록된 ${list.length - targets.length}개 제외 → 대상 ${targets.length}개\n`);

  const started = Date.now();
  const details = await mapLimit(
    targets,
    CONCURRENCY,
    (e) => fetchAppDetail(e.appid),
    (d, t) => console.log(`  상세 조회 ${d}/${t} (${Math.round((Date.now() - started) / 1000)}초)`),
  );

  const taken = new Set(existIds);
  const rows: Record<string, unknown>[] = [];
  const chosen: AppDetail[] = [];
  const skippedDup: string[] = [];
  const skippedNonGame: string[] = [];
  const failed: string[] = [];

  details.forEach((d, i) => {
    const src = targets[i];
    if (d.status === 204) {
      skippedNonGame.push(`${src.appid} (${src.name})`);
      return;
    }
    if (d.status !== 200 || !d.nameKr) {
      failed.push(`${src.appid} (${src.name}) status=${d.status}`);
      return;
    }
    if (existNames.has(d.nameKr)) {
      skippedDup.push(d.nameKr);
      return;
    }
    const id = slugFromName(d.nameKr, d.appid, taken);
    taken.add(id);
    const cat = pickCategory(d.genres);
    const platform = d.platforms.windows ? "Windows" : d.platforms.mac ? "Mac" : "Windows";
    const storeUrl = `https://store.steampowered.com/app/${d.appid}/`;

    chosen.push(d);
    rows.push({
      id,
      slug: `/${platform.toLowerCase()}/${id}`,
      name: d.nameKr,
      name_kr: d.nameKr,
      platform,
      developer_name: d.developer || d.publisher,
      developer_website_url: storeUrl,
      category_main: cat.main,
      category_sub: cat.sub,
      seo_title: "",
      seo_description: "",
      seo_title_kr: `${d.nameKr} 다운로드`,
      seo_description_kr: d.shortSummaryKr.slice(0, 150) || null,
      download_url: storeUrl,
      file_size: "",
      license: d.isFree ? "Free" : "Paid",
      security_status: "Unknown",
      rating_average: 0,
      rating_total_count: 0,
      icon_url: null,
      short_summary: "",
      short_summary_kr: d.shortSummaryKr.slice(0, 300) || null,
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
  });

  console.log(
    `\n신규 ${rows.length} / 이름 중복 스킵 ${skippedDup.length} / 게임 아님(DLC 등) 스킵 ${skippedNonGame.length} / 실패 ${failed.length}`,
  );
  if (failed.length) console.log(`  실패 예: ${failed.slice(0, 6).join(", ")}`);

  const byCat: Record<string, number> = {};
  for (const r of rows) {
    const k = `${(r as any).category_main}/${(r as any).category_sub}`;
    byCat[k] = (byCat[k] ?? 0) + 1;
  }
  console.log("\n카테고리 분포:");
  Object.entries(byCat).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${String(v).padStart(4)}  ${k}`));

  const preview = path.join(__dirname, ".steam-import-preview.json");
  fs.writeFileSync(preview, JSON.stringify(chosen.map((d, i) => ({ ...rows[i], appid: d.appid })), null, 1));
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
      (d) => (d.headerImage ? uploadIcon(client, String(rows[chosen.indexOf(d)].id), d.headerImage) : Promise.resolve(null)),
      (d, t) => console.log(`  아이콘 ${d}/${t} (${Math.round((Date.now() - iconStart) / 1000)}초)`),
    );
    let n = 0;
    chosen.forEach((_d, i) => {
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

  const idsPath = path.join(__dirname, ".steam-import-ids.json");
  fs.writeFileSync(idsPath, JSON.stringify(rows.map((r) => r.id), null, 1));
  console.log(`\n삽입 완료: ${inserted}건`);
  console.log(`대상 id 목록: ${idsPath}`);
  console.log("리뷰가 채워지기 전까지는 목록·사이트맵에 노출되지 않습니다.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
