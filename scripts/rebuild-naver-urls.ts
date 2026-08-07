/**
 * rebuild-naver-urls.ts
 *
 * naver-indexing/urls.txt 를 현재 사이트맵 기준으로 다시 만듭니다.
 *
 * 사이트맵은 이미 "한국어 콘텐츠가 있는 것만" 이라는 노출 규칙을 담고 있으므로,
 * DB 를 다시 뒤지지 않고 사이트맵을 그대로 따른다. 색인에서 뺀 페이지
 * (글쓰기 화면, 앱 다운로드 안내 페이지 등)는 애초에 사이트맵에 없다.
 *
 * urls-success.txt 에서 더 이상 존재하지 않는 URL 도 함께 걷어낸다.
 *
 * Usage:
 *   npx tsx scripts/rebuild-naver-urls.ts                     # dry-run
 *   npx tsx scripts/rebuild-naver-urls.ts --write             # 실제 반영
 *   npx tsx scripts/rebuild-naver-urls.ts --base=http://localhost:3777 --write
 */

import * as fs from "fs";
import * as path from "path";

const args = process.argv.slice(2);
const getArg = (p: string) => args.find((a) => a.startsWith(p))?.split("=")[1];

const DO_WRITE = args.includes("--write");
const BASE = getArg("--base=") ?? "https://ssdown.app";
const SITE = "https://ssdown.app";

const DIR = path.join(process.cwd(), "naver-indexing");
const URLS = path.join(DIR, "urls.txt");
const SUCCESS = path.join(DIR, "urls-success.txt");

async function locs(url: string): Promise<string[]> {
  const res = await fetch(url, { headers: { "User-Agent": "ssdown-sitemap-reader" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
  // 사이트맵 인덱스 → 하위 사이트맵 → URL
  const subs = await locs(`${BASE}/sitemap.xml`);
  console.log(`하위 사이트맵 ${subs.length}개`);

  const fresh = new Set<string>();
  for (const sub of subs) {
    // 인덱스에는 운영 도메인이 적혀 있으므로 조회는 BASE 로 바꿔 부른다.
    const readUrl = sub.replace(SITE, BASE);
    const list = await locs(readUrl);
    for (const u of list) fresh.add(u.replace(BASE, SITE));
    console.log(`  ${sub.split("/").pop()}: ${list.length}개`);
  }

  const before = fs.existsSync(URLS)
    ? fs.readFileSync(URLS, "utf8").split("\n").map((l) => l.trim()).filter(Boolean)
    : [];
  const beforeSet = new Set(before);

  const next = [...fresh].sort();
  const removed = before.filter((u) => !fresh.has(u));
  const added = next.filter((u) => !beforeSet.has(u));

  console.log(`\nurls.txt  ${before.length} → ${next.length}`);
  console.log(`  사라진 URL: ${removed.length}개`);
  console.log(`  새로 생긴 URL: ${added.length}개`);
  if (removed.length) console.log(`  예: ${removed.slice(0, 3).join(", ")}`);

  // 제출 완료 목록도 현재 존재하는 URL 만 남긴다.
  const success = fs.existsSync(SUCCESS)
    ? fs.readFileSync(SUCCESS, "utf8").split("\n").map((l) => l.trim()).filter(Boolean)
    : [];
  const successNext = success.filter((u) => fresh.has(u));
  console.log(`urls-success.txt  ${success.length} → ${successNext.length}`);

  if (!DO_WRITE) {
    console.log("\n[dry-run] 파일을 바꾸지 않았습니다. --write 를 붙이세요.");
    return;
  }

  fs.writeFileSync(URLS, next.join("\n") + "\n");
  fs.writeFileSync(SUCCESS, successNext.length ? successNext.join("\n") + "\n" : "");
  console.log("\n반영 완료");
  console.log(`  남은 미제출: ${next.length - successNext.length}개`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
