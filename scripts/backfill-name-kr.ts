/**
 * backfill-name-kr.ts
 *
 * ai_review_html_kr(한국어 리뷰)은 있는데 name_kr(한국어 이름)이 비어 있어
 * 상세 페이지 H1이 영문 그대로 뜨는 항목을 채운다.
 *
 * 대부분 Windows/Mac 데스크톱 소프트웨어라 구글 플레이 같은 "이름→공식 조회"
 * 수단이 없다. 대신 로컬 LLM에게 판단을 맡긴다 — 국내에 통용되는 한국어
 * 이름이 있으면 그 이름을, 없으면 억지로 번역하지 말고 영문 이름을 그대로
 * 쓰도록 지시한다(generate-bilingual-reviews.ts의 buildEnPrompt에 있는
 * "이름을 지어내지 말라"는 원칙과 동일).
 *
 * Usage:
 *   npx tsx scripts/backfill-name-kr.ts --limit=15                   # dry-run
 *   npx tsx scripts/backfill-name-kr.ts --update                      # 전체 반영
 *   npx tsx scripts/backfill-name-kr.ts --update --model=gemma3:1b
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

const args = process.argv.slice(2);
const getArg = (p: string) => args.find((a) => a.startsWith(p))?.split("=")[1];
const DO_UPDATE = args.includes("--update");
const LIMIT = Number(getArg("--limit=") ?? 0);
const CONCURRENCY = Number(getArg("--concurrency=") ?? 3);
const PRIMARY_MODEL = getArg("--model=") ?? "gemma3:latest";
const OLLAMA_BASE_URL = "http://localhost:11434";
const RETRY_LIMIT = 3;
const MODEL_CHAIN = [PRIMARY_MODEL, "gemma3:latest", "gemma3:1b"].filter((m, i, a) => a.indexOf(m) === i);

function db(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 환경변수가 필요합니다.");
  return createClient(url, key, { auth: { persistSession: false } });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function looksReasonable(name: string, original: string): boolean {
  const t = name.trim();
  if (!t || t.length > 120) return false;
  // 완전히 빈 문자열/따옴표만 있는 등 모델이 형식을 어긴 경우
  if (/^["'`]+$/.test(t)) return false;
  // 중국어(한자)만 잔뜩 섞여 나오는 경우 걸러낸다 (한국어 사이트에 안 맞음).
  const letters = t.replace(/[^\p{L}]/gu, "");
  const cjk = (letters.match(/[一-鿿]/g) ?? []).length;
  if (letters.length > 0 && cjk / letters.length > 0.3) return false;
  return true;
}

async function callOllama(model: string, prompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      stream: false,
      options: { num_predict: 128, temperature: 0.2 },
    }),
  });
  if (!response.ok) throw new Error(`Ollama API error ${response.status}`);
  const data = (await response.json()) as { message: { content: string } };
  return (data.message?.content ?? "")
    .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^```[a-z]*\s*/i, "")
    .replace(/```\s*$/, "")
    .replace(/^["'`]|["'`]$/g, "")
    .trim();
}

interface Row {
  id: string;
  name: string;
  platform: string;
  short_summary: string | null;
  ai_review_html: string | null;
}

function buildPrompt(row: Row): string {
  const context = stripHtml(row.short_summary || row.ai_review_html || "").slice(0, 300);
  return `당신은 한국 소프트웨어 다운로드 사이트의 편집자입니다. 아래 소프트웨어의 "한국에서 통용되는 이름"을 한 줄로 답하세요.

이름: ${row.name}
플랫폼: ${row.platform}
설명: ${context || "(설명 없음)"}

규칙:
- 한국 이용자들이 실제로 이 프로그램을 부를 때 쓰는 이름이 있다면(예: 잘 알려진 게임·서비스명) 그 이름을 쓰세요.
- 그런 이름이 딱히 없는 소프트웨어(개발자 도구, 서양 유틸리티 등)라면 절대 억지로 번역하거나 지어내지 말고, 영문 이름을 원문 그대로 답하세요.
- 다른 설명 없이 이름 한 줄만 출력하세요.`;
}

async function resolveNameKr(row: Row): Promise<string | null> {
  const prompt = buildPrompt(row);
  for (const model of MODEL_CHAIN) {
    for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
      try {
        const out = await callOllama(model, prompt);
        if (looksReasonable(out, row.name)) return out;
        throw new Error(`형식에 안 맞는 응답: "${out.slice(0, 60)}"`);
      } catch (err) {
        if (attempt < RETRY_LIMIT) await new Promise((r) => setTimeout(r, attempt * 2_000));
      }
    }
  }
  return null;
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

async function main() {
  const sb = db();
  const isEmptyStr = (v: unknown) => !v || String(v).trim() === "";

  let all: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("ssdown_software_applications")
      .select("id,name,platform,name_kr,short_summary,ai_review_html,ai_review_html_kr")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    all = all.concat(data as any);
    if (data.length < 1000) break;
  }

  let targets = all.filter(
    (r: any) => !isEmptyStr(r.ai_review_html_kr) && isEmptyStr(r.name_kr),
  ) as Row[];
  if (LIMIT > 0) targets = targets.slice(0, LIMIT);
  console.log(`대상: ${targets.length}개\n`);

  const started = Date.now();
  const results = await mapLimit(
    targets,
    CONCURRENCY,
    async (row) => ({ row, nameKr: await resolveNameKr(row) }),
    (d, t) => {
      if (d % 20 === 0 || d === t) console.log(`  진행 ${d}/${t} (${Math.round((Date.now() - started) / 1000)}초)`);
    },
  );

  const ok = results.filter((r) => r.nameKr);
  const failed = results.filter((r) => !r.nameKr);
  console.log(`\n이름 확보 ${ok.length} / 실패 ${failed.length}`);

  const preview = ok.map((r) => ({ id: r.row.id, before: r.row.name, after: r.nameKr }));
  const previewPath = path.join(__dirname, ".backfill-name-kr-preview.json");
  fs.writeFileSync(previewPath, JSON.stringify(preview, null, 1));
  console.log(`미리보기: ${previewPath}`);
  if (failed.length) {
    const failedPath = path.join(__dirname, ".backfill-name-kr-failed.json");
    fs.writeFileSync(failedPath, JSON.stringify(failed.map((r) => r.row.id), null, 1));
    console.log(`실패 목록: ${failedPath}`);
  }

  if (!DO_UPDATE) {
    console.log("\n[dry-run] 반영하지 않았습니다. --update 를 붙이세요.");
    return;
  }

  let updated = 0;
  for (const { row, nameKr } of ok) {
    const { error } = await sb.from("ssdown_software_applications").update({ name_kr: nameKr }).eq("id", row.id);
    if (error) {
      console.error(`  업데이트 실패 (${row.id}): ${error.message}`);
      continue;
    }
    updated++;
  }
  console.log(`\n반영 완료: ${updated}건`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
