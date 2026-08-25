/**
 * import-flathub.ts
 *
 * Flathub 공식 API(flathub.org/api/v2 — 무료, 키 불필요)로 리눅스 소프트웨어를
 * "사실 정보만" ssdown_software_applications 에 뼈대 레코드로 등록한다.
 *
 * 이 소스가 좋은 이유: Homebrew Cask 와 달리 아이콘·카테고리·라이선스·개발사가
 * 전부 들어 있다. 그래서 아이콘 백필과 카테고리 재분류라는 후처리 두 단계가
 * 통째로 필요 없다.
 *
 * 저작권 정책: summary 는 한 줄 태그라인이라 그대로 옮겨도 문제가 없다.
 * 긴 description 은 옮기지 않는다 — 리뷰(ai_review_html)는
 * generate-bilingual-reviews.ts 가 새로 생성한다.
 *
 * Usage:
 *   npx tsx scripts/import-flathub.ts --limit=50            # dry-run
 *   npx tsx scripts/import-flathub.ts --limit=50 --insert
 *   npx tsx scripts/import-flathub.ts --insert              # 전체
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
const CONCURRENCY = Number(getArg("--concurrency=") ?? 8);

const API = "https://flathub.org/api/v2";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

interface AppStream {
  id: string;
  name?: string;
  summary?: string;
  developer_name?: string;
  project_license?: string;
  categories?: string[];
  icon?: string;
  is_eol?: boolean;
  is_free_license?: boolean;
  urls?: { homepage?: string | null };
}

/**
 * Flathub(=freedesktop) 카테고리를 lib/categories.ts 의 nameEn 으로 옮긴다.
 * 앞에 있는 항목이 우선한다 — 한 앱이 ["Graphics","2DGraphics"] 처럼 여러 개를
 * 갖기 때문에, 더 구체적인 쪽을 먼저 보도록 순서를 잡았다.
 */
const CATEGORY_RULES: [string, string, string][] = [
  // [freedesktop 카테고리, category_main, category_sub]
  ["Game", "Games", "Games"],
  ["Development", "Development & IT", "Developer Tools"],
  ["IDE", "Development & IT", "Developer Tools"],
  ["WebBrowser", "Browsers", "Browsers"],
  ["Security", "Security & Privacy", "Security"],
  ["Network", "Internet & Network", "Internet"],
  ["Email", "Social & Communication", "Communication"],
  ["Chat", "Social & Communication", "Communication"],
  ["InstantMessaging", "Social & Communication", "Communication"],
  ["Telephony", "Social & Communication", "Communication"],
  ["AudioVideo", "Multimedia", "Media"],
  ["Audio", "Multimedia", "Media"],
  ["Video", "Multimedia", "Media"],
  ["Graphics", "Multimedia", "Graphics"],
  ["Photography", "Multimedia", "Graphics"],
  ["Office", "Productivity", "Office"],
  ["Spreadsheet", "Productivity", "Office"],
  ["WordProcessor", "Productivity", "Office"],
  ["ProjectManagement", "Productivity", "Office"],
  ["Education", "Education & Reference", "Education"],
  ["Science", "Education & Reference", "Education"],
  ["Math", "Education & Reference", "Education"],
  ["Astronomy", "Education & Reference", "Education"],
  ["Maps", "Travel & Navigation", "Navigation"],
  ["Geography", "Travel & Navigation", "Navigation"],
  ["Settings", "Personalization", "Personalization"],
  ["DesktopSettings", "Personalization", "Personalization"],
  ["Utility", "Utilities & Tools", "Utilities"],
  ["System", "Utilities & Tools", "Utilities"],
];

function pickCategory(cats: string[] | undefined): { main: string; sub: string } {
  for (const [key, main, sub] of CATEGORY_RULES) {
    if ((cats ?? []).includes(key)) return { main, sub };
  }
  return { main: "Utilities & Tools", sub: "Utilities" };
}

function db(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

/** org.gimp.GIMP → gimp. 마지막 마디를 쓰되 겹치면 번호를 붙인다. */
function slugify(appId: string, taken: Set<string>): string {
  const last = appId.split(".").pop() ?? appId;
  const base = last.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!base) return `flatpak-${appId.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

async function fetchJson<T>(url: string, tries = 3): Promise<T | null> {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20_000) });
      if (res.ok) return (await res.json()) as T;
      if (res.status === 404) return null; // 목록에는 있는데 상세가 없는 앱이 더러 있다
    } catch {
      /* 재시도 */
    }
    if (i < tries) await new Promise((r) => setTimeout(r, i * 1_500));
  }
  return null;
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
      if (tick && done % 100 === 0) tick(done, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, w));
  tick?.(done, items.length);
  return out;
}

async function main() {
  console.log("Flathub 앱 목록 수집 중...");
  const ids = (await fetchJson<string[]>(`${API}/appstream`)) ?? [];
  console.log(`전체 ${ids.length}개\n`);
  if (!ids.length) throw new Error("목록을 받지 못했습니다.");

  const sb = db();
  // 리눅스는 신규 플랫폼이지만, 같은 소프트웨어가 다른 플랫폼으로 이미 있을 수
  // 있다. id 충돌만 피하면 되므로 id 는 전 플랫폼에서, 이름·홈페이지 중복은
  // Linux 안에서만 본다(VLC 처럼 Windows/Mac 에도 있는 앱은 정상 등록되어야 한다).
  const takenIds = new Set<string>();
  const existingNames = new Set<string>();
  const existingHomepages = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("ssdown_software_applications")
      .select("id,name,platform,download_url")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    for (const row of data ?? []) {
      takenIds.add(row.id);
      if (row.platform === "Linux") {
        if ((row.name ?? "").trim()) existingNames.add(row.name.trim().toLowerCase());
        if (row.download_url) existingHomepages.add(String(row.download_url).replace(/\/$/, "").toLowerCase());
      }
    }
    if (!data || data.length < 1000) break;
  }
  console.log(`기존 DB: id ${takenIds.size}개 / 기존 Linux 이름 ${existingNames.size}개\n`);

  let targets = ids;
  if (LIMIT > 0) targets = targets.slice(0, LIMIT);

  console.log(`상세 조회 ${targets.length}개 (동시 ${CONCURRENCY})...`);
  const details = await mapLimit(
    targets,
    CONCURRENCY,
    (id) => fetchJson<AppStream>(`${API}/appstream/${id}`),
    (d, t) => console.log(`  ${d}/${t}`),
  );

  const rows: Record<string, unknown>[] = [];
  const skipped = { noDetail: 0, eol: 0, noName: 0, dup: 0 };

  for (const app of details) {
    if (!app) { skipped.noDetail++; continue; }
    if (app.is_eol) { skipped.eol++; continue; }          // 단종된 앱은 새로 넣지 않는다
    const name = (app.name ?? "").trim();
    if (!name) { skipped.noName++; continue; }

    const homepage = app.urls?.homepage ?? `https://flathub.org/apps/${app.id}`;
    const hpKey = homepage.replace(/\/$/, "").toLowerCase();
    if (existingNames.has(name.toLowerCase()) || existingHomepages.has(hpKey)) { skipped.dup++; continue; }
    existingNames.add(name.toLowerCase());
    existingHomepages.add(hpKey);

    const id = slugify(app.id, takenIds);
    takenIds.add(id);
    const cat = pickCategory(app.categories);

    rows.push({
      id,
      slug: `/linux/${id}`,
      name,
      name_kr: null,
      platform: "Linux",
      developer_name: (app.developer_name ?? "").trim(),
      developer_website_url: app.urls?.homepage ?? null,
      category_main: cat.main,
      category_sub: cat.sub,
      seo_title: "",
      seo_description: "",
      seo_title_kr: null,
      seo_description_kr: null,
      // 설치는 Flathub 페이지에서 이뤄지므로 이쪽을 다운로드 링크로 쓴다.
      download_url: `https://flathub.org/apps/${app.id}`,
      file_size: "",
      // project_license 가 있으면 오픈소스로 본다. is_free_license 는 OSI 승인 여부다.
      license: app.is_free_license === false ? "Freemium" : "Free",
      security_status: "Unknown",
      rating_average: 0,
      rating_total_count: 0,
      icon_url: app.icon ?? null,
      short_summary: (app.summary ?? "").slice(0, 300),
      short_summary_kr: null,
      body_html: "",
      editor_review_html: "",
      ai_review_html: "",
      ai_review_html_kr: null,
      pros: [],
      cons: [],
      os_requirements: "Linux (Flatpak)",
      languages: ["Korean"],
      last_updated_date: new Date().toISOString(),
    });
  }

  console.log(`\n등록 대상: ${rows.length}개`);
  console.log(`  제외 — 상세없음 ${skipped.noDetail} / 단종 ${skipped.eol} / 이름없음 ${skipped.noName} / 중복 ${skipped.dup}`);

  const catCount: Record<string, number> = {};
  for (const r of rows) catCount[r.category_main as string] = (catCount[r.category_main as string] ?? 0) + 1;
  console.log("\n카테고리 분포:");
  Object.entries(catCount).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${String(v).padStart(5)} ${k}`));
  console.log(`\n아이콘 보유: ${rows.filter((r) => r.icon_url).length}/${rows.length}`);

  const previewPath = path.join(__dirname, ".flathub-preview.json");
  fs.writeFileSync(previewPath, JSON.stringify(rows.slice(0, 50), null, 1));
  console.log(`미리보기(상위 50): ${previewPath}`);

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

  const idsPath = path.join(__dirname, ".flathub-ids.json");
  fs.writeFileSync(idsPath, JSON.stringify(rows.map((r) => r.id), null, 1));
  console.log(`\n삽입 완료: ${inserted}건`);
  console.log(`대상 id 목록: ${idsPath}`);
  console.log("아이콘·카테고리는 이미 채워져 있습니다. 리뷰만 생성하면 노출됩니다:");
  console.log("  npx tsx scripts/generate-bilingual-reviews.ts --ids=.flathub-ids.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
