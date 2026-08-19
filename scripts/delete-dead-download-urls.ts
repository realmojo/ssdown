/**
 * delete-dead-download-urls.ts
 *
 * check-download-urls.ts 의 보고서에서 "죽은 링크"로 판정된 행을
 * software_applications 에서 삭제합니다.
 *
 * 죽은 링크로 보는 것: notfound(4xx) / servererror(5xx) / network(연결 실패·시간 초과)
 * 삭제하지 않는 것:
 *   - blocked(401/403/406/412/429) : 봇을 막는 사이트다. 링크는 살아 있다.
 *   - redirect-offsite             : 응답이 200 이었고 도메인만 바뀐 경우다.
 *   - download_url 이 '#'          : 애초에 링크가 없는 항목이라 검사 대상이 아니다.
 *
 * 삭제는 되돌릴 수 없으므로 지우기 전에 대상 행 전체를 파일로 남깁니다.
 *
 * Usage:
 *   npx tsx scripts/delete-dead-download-urls.ts            # dry-run (백업만 만든다)
 *   npx tsx scripts/delete-dead-download-urls.ts --delete   # 실제 삭제
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

const DO_DELETE = process.argv.includes("--delete");

const REPORT = path.join(__dirname, ".download-url-report.json");
const BACKUP = path.join(__dirname, ".deleted-dead-rows.json");

const DEAD_VERDICTS = new Set(["notfound", "servererror", "network"]);

interface ReportEntry {
  url: string;
  verdict: string;
  status: number | null;
  error?: string;
  ids: string[];
}

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 환경변수가 필요합니다.");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function main() {
  if (!fs.existsSync(REPORT)) {
    throw new Error(`보고서가 없습니다: ${REPORT}\n먼저 check-download-urls.ts 를 실행하세요.`);
  }

  const report: ReportEntry[] = JSON.parse(fs.readFileSync(REPORT, "utf8"));
  const dead = report.filter((r) => DEAD_VERDICTS.has(r.verdict));

  // id → 왜 죽었는지. 백업 파일에 함께 남긴다.
  const reason = new Map<string, string>();
  for (const r of dead) {
    for (const id of r.ids) reason.set(id, `${r.verdict} ${r.status ?? r.error ?? ""}`.trim());
  }
  const ids = [...reason.keys()];

  console.log(`보고서 항목: ${report.length}개 URL`);
  console.log(`죽은 링크 URL: ${dead.length}개 → 대상 행 ${ids.length}개\n`);

  const sb = db();

  // 1) 삭제 전 전체 행을 백업한다.
  const backup: Record<string, unknown>[] = [];
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200);
    const { data, error } = await sb.from("ssdown_software_applications").select("*").in("id", chunk);
    if (error) throw new Error(error.message);
    for (const row of data) backup.push({ ...row, _deleted_reason: reason.get(row.id) });
  }
  fs.writeFileSync(BACKUP, JSON.stringify(backup, null, 1));
  console.log(`백업 저장: ${BACKUP}  (${backup.length}행)`);

  // 노출 중이던 행이 몇 개인지 함께 알려 준다.
  const visible = backup.filter((r) => String(r.ai_review_html_kr ?? "").trim()).length;
  console.log(`  이 중 사이트에 노출 중이던 행: ${visible}개`);

  if (!DO_DELETE) {
    console.log("\n[dry-run] 삭제하지 않았습니다. 실제 삭제는 --delete 를 붙이세요.");
    return;
  }

  // 2) 삭제
  let deleted = 0;
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200);
    const { error } = await sb.from("ssdown_software_applications").delete().in("id", chunk);
    if (error) {
      console.error(`  삭제 실패 (${i}~): ${error.message}`);
      continue;
    }
    deleted += chunk.length;
    if (deleted % 1000 === 0 || deleted === ids.length) {
      console.log(`  ${deleted}/${ids.length} 삭제`);
    }
  }

  const { count } = await sb
    .from("ssdown_software_applications")
    .select("id", { count: "exact", head: true });

  console.log(`\n삭제 완료: ${deleted}행`);
  console.log(`남은 행: ${count}`);
  console.log(`되돌리려면 ${BACKUP} 의 내용을 다시 넣으면 됩니다.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
