/**
 * discover-play-categories.ts
 *
 * Play 스토어 카테고리/차트 페이지(정적 HTML에 패키지 ID가 그대로 박혀 있어
 * plain fetch로 충분하다 — softonic.kr 과 달리 봇 차단 없음, 확인됨)에서
 * 한국(gl=KR) 기준 패키지 ID만 모아 텍스트 파일로 저장한다.
 *
 * 이 파일은 기존 import-play-apps.ts 의 --file= 입력으로 그대로 쓴다.
 * (사실 정보 임포트 + 아이콘 다운로드 + dedup 은 이미 그 스크립트가 처리한다.
 *  이 스크립트는 "어떤 패키지를 볼지"만 찾아준다.)
 *
 * Usage:
 *   npx tsx scripts/discover-play-categories.ts                       # 전체 카테고리
 *   npx tsx scripts/discover-play-categories.ts --categories=GAME,SOCIAL
 *   npx tsx scripts/discover-play-categories.ts --out=scripts/.my-pkgs.txt
 */

import * as fs from "fs";
import * as path from "path";

const args = process.argv.slice(2);
const getArg = (p: string) => args.find((a) => a.startsWith(p))?.split("=")[1];

// import-play-apps.ts 의 GENRE_MAP 과 같은 코드 체계를 쓴다 — 그대로 재사용된다.
const ALL_CATEGORIES = [
  "GAME",
  "COMMUNICATION",
  "SOCIAL",
  "PRODUCTIVITY",
  "TOOLS",
  "ENTERTAINMENT",
  "PHOTOGRAPHY",
  "MUSIC_AND_AUDIO",
  "VIDEO_PLAYERS",
  "BOOKS_AND_REFERENCE",
  "BUSINESS",
  "EDUCATION",
  "FINANCE",
  "FOOD_AND_DRINK",
  "HEALTH_AND_FITNESS",
  "LIFESTYLE",
  "MAPS_AND_NAVIGATION",
  "NEWS_AND_MAGAZINES",
  "PERSONALIZATION",
  "SHOPPING",
  "SPORTS",
  "TRAVEL_AND_LOCAL",
  "WEATHER",
  "ART_AND_DESIGN",
  "AUTO_AND_VEHICLES",
  "DATING",
  "PARENTING",
];

const CATEGORIES = (getArg("--categories=") ?? ALL_CATEGORIES.join(",")).split(",").map((c) => c.trim());
const DELAY_MS = parseInt(getArg("--delay=") ?? "800", 10) || 800;
const OUT = getArg("--out=") ?? path.join(process.cwd(), "scripts", ".play-discovered-pkgs.txt");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPackages(url: string): Promise<string[]> {
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "ko" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const matches = [...html.matchAll(/\/store\/apps\/details\?id=([a-zA-Z0-9_.]+)/g)].map((m) => m[1]);
  return [...new Set(matches)];
}

async function main() {
  console.log(`Play 스토어 카테고리 ${CATEGORIES.length}개 수집 (gl=KR)\n`);

  const all = new Set<string>();

  // 종합 인기 차트도 함께
  try {
    const top = await fetchPackages("https://play.google.com/store/apps/top?hl=ko&gl=KR");
    top.forEach((p) => all.add(p));
    console.log(`  [top]: ${top.length}개 (누적 ${all.size})`);
  } catch (e) {
    console.warn(`  [top] 실패: ${e instanceof Error ? e.message : e}`);
  }
  await sleep(DELAY_MS);

  for (const cat of CATEGORIES) {
    try {
      const url = `https://play.google.com/store/apps/category/${cat}?hl=ko&gl=KR`;
      const pkgs = await fetchPackages(url);
      pkgs.forEach((p) => all.add(p));
      console.log(`  [${cat}]: ${pkgs.length}개 (누적 ${all.size})`);
    } catch (e) {
      console.warn(`  [${cat}] 실패: ${e instanceof Error ? e.message : e}`);
    }
    await sleep(DELAY_MS);
  }

  fs.writeFileSync(OUT, [...all].join("\n") + "\n", "utf-8");
  console.log(`\n총 ${all.size}개 패키지 ID 저장: ${OUT}`);
  console.log(`다음 단계: npx tsx scripts/import-play-apps.ts --file=${OUT} --insert`);
}

main().catch((e) => {
  console.error("오류:", e);
  process.exit(1);
});
