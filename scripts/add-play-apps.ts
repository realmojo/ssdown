/**
 * add-play-apps.ts
 *
 * 구글 플레이 앱을 사실 정보만으로 software_applications 에 등록합니다.
 *
 * 저작권 정책: 스토어의 설명문·스크린샷·아이콘은 가져오지 않습니다.
 * 가져오는 것은 사실 정보뿐입니다 — 한국어 앱 이름, 패키지 ID, 개발사, 스토어 주소.
 * 리뷰·요약·SEO 는 이후 generate-bilingual-reviews.ts 가 새로 생성합니다.
 *
 * 평점도 넣지 않습니다. 플레이 스토어 평점은 그 스토어 이용자의 것이라
 * 우리 사이트 평점으로 표시하면 사실과 다릅니다. rating_average 는 0 으로 둡니다.
 *
 * 등록 전에 스토어 주소가 실제로 살아 있는지(200) 확인합니다.
 *
 * Usage:
 *   npx tsx scripts/add-play-apps.ts             # dry-run
 *   npx tsx scripts/add-play-apps.ts --insert    # 실제 삽입
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

const DO_INSERT = process.argv.includes("--insert");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/**
 * 등록 대상. 한국어 이름과 개발사는 플레이 스토어에서 확인한 값이다.
 * id 는 우리 DB 의 기본키라 패키지 ID 를 그대로 쓰지 않고 짧은 slug 를 쓴다.
 */
const APPS: {
  id: string;
  pkg: string;
  nameKr: string;
  developer: string;
  main: string;
  sub: string;
}[] = [
  {
    id: "block-blast",
    pkg: "com.block.juggle",
    nameKr: "블록 블라스트 (Block Blast)",
    developer: "HungryStudio",
    main: "Games",
    sub: "Puzzle",
  },
  {
    id: "vita-mahjong",
    pkg: "com.vitastudio.mahjong",
    nameKr: "비타 마작 (Vita Mahjong)",
    developer: "Vita Studio",
    main: "Games",
    sub: "Puzzle",
  },
  {
    id: "color-by-number-coloring",
    pkg: "com.pcoloring.art.puzzle.color.by.number",
    nameKr: "번호 별 색상: 컬러링북 - 숫자 색칠 게임",
    developer: "Color Joy",
    main: "Games",
    sub: "Casual",
  },
  {
    id: "zen-color",
    pkg: "com.oakever.zencolor",
    nameKr: "Zen Color - 숫자별 색상",
    developer: "Oakever Games",
    main: "Games",
    sub: "Casual",
  },
  {
    id: "kalliu-game-world",
    pkg: "com.sinyee.babybus.gameworld.design.home.friends.fun.life.story",
    nameKr: "Kalliu Game World",
    developer: "Joltrix",
    main: "Games",
    sub: "Simulation",
  },
  {
    id: "snake-io",
    pkg: "com.amelosinteractive.snake",
    nameKr: "스네이크 아이오 - 재밌는 스네이크.io 게임들",
    developer: "Kooapps Games",
    main: "Games",
    sub: "Arcade",
  },
  {
    id: "math-games-rv",
    pkg: "com.rvappstudios.math.games.kids.addition.subtraction.multiplication.division",
    nameKr: "수학 게임 - 덧셈, 뺄셈, 곱셈, 나눗셈",
    developer: "RV AppStudios",
    main: "Education & Reference",
    sub: "Education",
  },
  {
    id: "rummikub",
    pkg: "com.rummikubfree",
    nameKr: "Rummikub",
    developer: "Kinkajoo",
    main: "Games",
    sub: "Board",
  },
];

function storeUrl(pkg: string) {
  return `https://play.google.com/store/apps/details?id=${pkg}`;
}

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 환경변수가 필요합니다.");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** 스토어 주소가 살아 있는지 확인한다. 죽은 링크를 새로 만들지 않기 위함이다. */
async function isAlive(url: string): Promise<number> {
  try {
    const res = await fetch(`${url}&hl=ko&gl=KR`, {
      headers: { "User-Agent": UA, "Accept-Language": "ko" },
      redirect: "follow",
    });
    return res.status;
  } catch {
    return 0;
  }
}

async function main() {
  const sb = db();

  const { data: existing, error } = await sb
    .from("ssdown_software_applications")
    .select("id,name_kr")
    .in("id", APPS.map((a) => a.id));
  if (error) throw new Error(error.message);
  const existingIds = new Set((existing ?? []).map((r) => r.id));

  const rows: Record<string, unknown>[] = [];
  const now = new Date().toISOString();

  for (const app of APPS) {
    const url = storeUrl(app.pkg);
    const status = await isAlive(url);
    const alive = status === 200;
    const dup = existingIds.has(app.id);

    console.log(
      `  ${alive ? "OK  " : `!! ${status}`}  ${app.nameKr}${dup ? "  (이미 있음 — 건너뜀)" : ""}`,
    );
    if (!alive || dup) continue;

    rows.push({
      id: app.id,
      slug: `/android/${app.id}`,
      name: app.nameKr,
      name_kr: app.nameKr,
      platform: "Android",
      developer_name: app.developer,
      developer_website_url: url,
      category_main: app.main,
      category_sub: app.sub,
      // 콘텐츠·SEO 는 비운다. generate-bilingual-reviews.ts 가 채운다.
      seo_title: "",
      seo_description: "",
      seo_title_kr: null,
      seo_description_kr: null,
      download_url: url,
      file_size: "",
      license: "Free",
      security_status: "Unknown",
      // 플레이 스토어 평점은 그 스토어 이용자의 것이라 가져오지 않는다.
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
      last_updated_date: now,
    });
  }

  console.log(`\n삽입 대상: ${rows.length}건`);
  if (!rows.length) return;

  if (!DO_INSERT) {
    console.log("[dry-run] 삽입하지 않았습니다. --insert 를 붙이세요.");
    return;
  }

  const { error: insErr } = await sb
    .from("ssdown_software_applications")
    .upsert(rows, { onConflict: "id", ignoreDuplicates: true });
  if (insErr) throw new Error(insErr.message);

  const idsPath = path.join(__dirname, ".play-apps-ids.json");
  fs.writeFileSync(idsPath, JSON.stringify(rows.map((r) => r.id), null, 1));

  console.log(`삽입 완료: ${rows.length}건`);
  console.log(`대상 id 목록: ${idsPath}`);
  console.log("\n다음 단계: generate-bilingual-reviews.ts --ids=.play-apps-ids.json");
  console.log("리뷰가 채워지기 전까지는 목록·사이트맵에 노출되지 않습니다.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
