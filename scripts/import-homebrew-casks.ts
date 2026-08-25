/**
 * import-homebrew-casks.ts
 *
 * Homebrew Cask 공식 API(formulae.brew.sh/api/cask.json — 무료, 키 불필요)로
 * 맥 소프트웨어 목록을 가져와 "사실 정보만" software_applications 에 뼈대
 * 레코드로 등록한다. 전체 카탈로그(약 7,700개)를 한 번에 내려주는 정적 JSON이라
 * Play/Steam/Apple 처럼 별도 "목록 조회" 단계가 필요 없다.
 *
 * 저작권 정책: desc 필드는 한 줄짜리 사실 태그라인("Real-time strategy game"
 * 같은 장르 요약)이라 그대로 옮겨도 저작권 문제가 없다. 긴 설명·스크린샷은
 * 원래 이 API에 없다. 리뷰(ai_review_html)는 generate-bilingual-reviews.ts 가
 * 새로 생성한다.
 *
 * 한계: 이 API에는 라이선스(무료/유료) 구분과 아이콘이 없다. license 는
 * import-play-apps.ts 와 같은 관례로 기본값 "Free" 를 쓰지만 실제로는 유료
 * 소프트웨어도 섞여 있다 — 화면 표시용 배지 정도로만 참고할 것. 아이콘은
 * 비워 두고 별도 백필 스크립트로 채운다.
 *
 * Usage:
 *   npx tsx scripts/import-homebrew-casks.ts --limit=500          # dry-run
 *   npx tsx scripts/import-homebrew-casks.ts --limit=500 --insert
 *   npx tsx scripts/import-homebrew-casks.ts --insert              # 전체
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

const args = process.argv.slice(2);
const getArg = (p: string) => args.find((a) => a.startsWith(p))?.split("=")[1];
const DO_INSERT = args.includes("--insert");
const LIMIT = Number(getArg("--limit=") ?? 0);

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

interface Cask {
  token: string;
  name: string[];
  desc: string | null;
  homepage: string | null;
  deprecated: boolean;
  disabled: boolean;
}

function db(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

function slugify(token: string, taken: Set<string>): string {
  const base = token
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!base) return `cask-${Math.random().toString(36).slice(2, 8)}`;
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

async function fetchCasks(): Promise<Cask[]> {
  const res = await fetch("https://formulae.brew.sh/api/cask.json", { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Cask[];
}

async function main() {
  console.log("Homebrew Cask 목록 수집 중...");
  const all = await fetchCasks();
  console.log(`전체 ${all.length}개\n`);

  const sb = db();
  const existingIds = new Set<string>();
  const existingNames = new Set<string>();
  const existingHomepages = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("ssdown_software_applications")
      .select("id,name,name_kr,download_url,developer_website_url")
      .eq("platform", "Mac")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    for (const row of data ?? []) {
      existingIds.add(row.id);
      for (const n of [row.name, row.name_kr]) if ((n ?? "").trim()) existingNames.add(n.trim().toLowerCase());
      for (const u of [row.download_url, row.developer_website_url]) {
        if (u) existingHomepages.add(String(u).replace(/\/$/, "").toLowerCase());
      }
    }
    if (!data || data.length < 1000) break;
  }
  console.log(`기존 Mac DB: id ${existingIds.size}개 / 이름 ${existingNames.size}개 / 홈페이지 ${existingHomepages.size}개\n`);

  // deprecated·disabled(단종/차단) 캐스크는 제외한다 — 죽은 소프트웨어를 새로 등록하지 않기 위해.
  let candidates = all.filter((c) => !c.deprecated && !c.disabled && c.name?.[0] && c.homepage);
  candidates = candidates.filter((c) => {
    const name = c.name[0].trim().toLowerCase();
    const hp = (c.homepage ?? "").replace(/\/$/, "").toLowerCase();
    return !existingIds.has(c.token) && !existingNames.has(name) && !existingHomepages.has(hp);
  });
  console.log(`유효(비단종) + 신규 후보: ${candidates.length}개`);
  if (LIMIT > 0) candidates = candidates.slice(0, LIMIT);
  console.log(`이번 실행 대상: ${candidates.length}개\n`);

  const taken = new Set(existingIds);
  const rows: Record<string, unknown>[] = [];
  for (const c of candidates) {
    const id = slugify(c.token, taken);
    taken.add(id);
    const name = c.name[0].trim();
    rows.push({
      id,
      slug: `/mac/${id}`,
      name,
      name_kr: null,
      platform: "Mac",
      developer_name: "",
      developer_website_url: c.homepage,
      category_main: "Utilities & Tools",
      category_sub: "Utilities",
      seo_title: "",
      seo_description: "",
      seo_title_kr: null,
      seo_description_kr: null,
      download_url: c.homepage,
      file_size: "",
      license: "Free",
      security_status: "Unknown",
      rating_average: 0,
      rating_total_count: 0,
      icon_url: null,
      short_summary: c.desc ?? "",
      short_summary_kr: null,
      body_html: "",
      editor_review_html: "",
      ai_review_html: "",
      ai_review_html_kr: null,
      pros: [],
      cons: [],
      os_requirements: "macOS",
      languages: ["Korean"],
      last_updated_date: new Date().toISOString(),
    });
  }

  const previewPath = path.join(__dirname, ".homebrew-cask-preview.json");
  fs.writeFileSync(previewPath, JSON.stringify(rows, null, 1));
  console.log(`미리보기: ${previewPath}`);

  if (!DO_INSERT) {
    console.log("\n[dry-run] 삽입하지 않았습니다. --insert 를 붙이세요.");
    return;
  }

  let inserted = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await sb.from("ssdown_software_applications").upsert(chunk, { onConflict: "id", ignoreDuplicates: true });
    if (error) {
      console.error(`  삽입 실패 (${i}~): ${error.message}`);
      continue;
    }
    inserted += chunk.length;
    console.log(`  삽입 ${inserted}/${rows.length}`);
  }

  const idsPath = path.join(__dirname, ".homebrew-cask-ids.json");
  fs.writeFileSync(idsPath, JSON.stringify(rows.map((r) => r.id), null, 1));
  console.log(`\n삽입 완료: ${inserted}건`);
  console.log(`대상 id 목록: ${idsPath}`);
  console.log("아이콘이 없는 상태입니다 — 이름/개발사 기반 백필이 필요합니다.");
  console.log("리뷰가 채워지기 전까지는 목록·사이트맵에 노출되지 않습니다.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
