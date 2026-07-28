/**
 * 블로그 한국어 번역
 *
 * ssdown_blogs 의 영문 글(title/excerpt/content)을 한국어로 번역해 DB에 반영합니다.
 * 사이트가 한국어 전용으로 전환되면서 남은 영문 콘텐츠를 정리하기 위한 스크립트입니다.
 *
 * Usage:
 *   npx tsx scripts/translate-blog-to-korean.ts --dry-run --limit=1   # 결과만 출력 (DB 미반영)
 *   npx tsx scripts/translate-blog-to-korean.ts --limit=5             # 5개만 반영
 *   npx tsx scripts/translate-blog-to-korean.ts                       # 미번역 전체 반영
 *   npx tsx scripts/translate-blog-to-korean.ts --model=claude-sonnet-5
 *   npx tsx scripts/translate-blog-to-korean.ts --provider=ollama     # 로컬 무료 (기본 qwen3:30b-a3b)
 *   npx tsx scripts/translate-blog-to-korean.ts --provider=ollama --model=qwen2.5:latest
 *
 * 이미 번역된 글은 제목에 한글이 있는지로 판별해 건너뛰므로, 중간에 실패해도
 * 같은 명령을 다시 실행하면 남은 것만 이어서 처리합니다.
 *
 * 원문 보존: 최초 실행 시 title_en / excerpt_en / content_en 컬럼에 영문 원본을 백업합니다
 * (컬럼이 없으면 백업을 건너뛰고 경고만 출력).
 */

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// ── 설정 ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : Infinity;
const providerArg = args.find((a) => a.startsWith("--provider="));
const PROVIDER = (providerArg ? providerArg.split("=")[1] : "claude") as "claude" | "ollama";
const modelArg = args.find((a) => a.startsWith("--model="));
const MODEL = modelArg
  ? modelArg.split("=")[1]
  : PROVIDER === "ollama"
    ? "qwen3:30b-a3b"
    : "claude-opus-5";

const RETRY_LIMIT = 3;
const OLLAMA_BASE_URL = "http://localhost:11434";
const concArg = args.find((a) => a.startsWith("--concurrency="));
// 로컬 모델은 GPU 한 대를 공유하므로 병렬로 돌려도 이득이 없다.
const CONCURRENCY = concArg
  ? parseInt(concArg.split("=")[1], 10)
  : PROVIDER === "ollama"
    ? 1
    : 4;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 필요합니다 (.env.local)");
  process.exit(1);
}
if (PROVIDER === "claude" && !ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY 가 필요합니다 (.env.local) — 또는 --provider=ollama 사용");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

// ── 번역 스키마 ──────────────────────────────────────────────────────────────

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    excerpt: { type: "string" },
    content: { type: "string" },
  },
  required: ["title", "excerpt", "content"],
  additionalProperties: false,
} as const;

type Translation = { title: string; excerpt: string; content: string };

interface BlogRow {
  id: string;
  title: string;
  excerpt: string;
  content: string;
}

// ── 프롬프트 ─────────────────────────────────────────────────────────────────

function buildPrompt(post: BlogRow): string {
  return `아래는 영어로 작성된 블로그 글입니다. 한국어 사용자를 위한 자연스러운 한국어로 번역해 주세요.

번역 규칙:
- 기계적인 직역이 아니라, 한국어 기술 블로그 글로 읽히도록 자연스럽게 옮길 것
- 본문은 HTML(<h2>, <p>, <ul>, <table>, <pre> 등)이며, 태그 구조를 하나도
  바꾸지 말고 태그 사이의 텍스트만 번역할 것. 태그를 마크다운으로 바꾸지 말 것
- <pre>/<code> 안의 코드와 주석, 인라인 코드는 번역하지 말고 그대로 둘 것
- 링크의 href 는 그대로 두고 링크 텍스트만 번역할 것
- 브랜드·제품·서비스명(SSDown, TikTok, Instagram, YouTube, Windows, PDF, MP4 등)은 원문 유지
  단, 문맥상 한국에서 통용되는 표기가 있으면 그것을 사용 (예: 틱톡, 인스타그램, 유튜브)
- 기술 용어는 국내에서 실제로 쓰이는 표현을 사용할 것
- 원문에 없는 내용을 덧붙이거나 임의로 요약하지 말 것 — 분량과 정보를 보존할 것
- excerpt 는 목록에 노출되는 짧은 요약이므로 원문 길이에 맞춰 간결하게

제목:
${post.title}

요약(excerpt):
${post.excerpt}

본문(HTML):
${post.content}`;
}

// ── Claude 호출 ──────────────────────────────────────────────────────────────

/** 크레딧 소진처럼 재시도해도 소용없는 오류인지. */
function isFatal(err: unknown): boolean {
  const m = err instanceof Error ? err.message : String(err);
  return /credit balance is too low|authentication_error|permission_error/.test(m);
}

async function translateOllama(post: BlogRow, attempt = 1): Promise<Translation | null> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content:
              buildPrompt(post) +
              `\n\n반드시 아래 형태의 JSON 하나만 출력하세요(설명 금지):\n{"title": "...", "excerpt": "...", "content": "..."}`,
          },
        ],
        stream: false,
        format: "json",
        options: { num_ctx: 32768, num_predict: 16384 },
      }),
    });
    if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { message?: { content?: string } };
    const text = (data.message?.content ?? "")
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .trim();
    return JSON.parse(text) as Translation;
  } catch (err) {
    if (attempt <= RETRY_LIMIT) {
      await new Promise((r) => setTimeout(r, attempt * 5_000));
      return translateOllama(post, attempt + 1);
    }
    console.error("    번역 실패:", err instanceof Error ? err.message : err);
    return null;
  }
}

async function translate(post: BlogRow, attempt = 1): Promise<Translation | null> {
  if (PROVIDER === "ollama") return translateOllama(post);
  try {
    // 본문이 길어 출력 토큰이 크므로 스트리밍 사용 (HTTP 타임아웃 방지)
    const stream = anthropic!.messages.stream({
      model: MODEL,
      max_tokens: 32000,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: SCHEMA },
      },
      messages: [{ role: "user", content: buildPrompt(post) }],
    });
    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      console.error(`    거부됨 (${message.stop_details?.category ?? "unknown"})`);
      return null;
    }
    if (message.stop_reason === "max_tokens") {
      console.error("    출력이 max_tokens 에 걸려 잘렸습니다");
      return null;
    }

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;
    return JSON.parse(textBlock.text) as Translation;
  } catch (err) {
    // 크레딧 소진·인증 오류는 재시도해도 동일하게 실패한다. 남은 글까지
    // 헛되이 재시도하지 않도록 전체를 중단한다.
    if (isFatal(err)) {
      console.error(`\n중단 — ${err instanceof Error ? err.message : err}`);
      fatalStop = true;
      return null;
    }
    if (attempt <= RETRY_LIMIT) {
      const wait = attempt * 5_000;
      console.warn(`    재시도 ${attempt}/${RETRY_LIMIT} (${wait / 1000}s 후)…`);
      await new Promise((r) => setTimeout(r, wait));
      return translate(post, attempt + 1);
    }
    console.error("    번역 실패:", err instanceof Error ? err.message : err);
    return null;
  }
}

let fatalStop = false;

// ── 구조 검증 ────────────────────────────────────────────────────────────────

/**
 * 번역본이 원문의 마크다운 구조를 보존했는지 확인한다. 번역 과정에서 문단이
 * 통째로 빠지거나 요약되는 사고를 잡아내기 위한 것으로, 개수가 어긋난 항목만
 * 돌려준다.
 */
function checkStructure(src: string, out: string): string[] {
  // 코드 영역은 번역 대상이 아니고, 그 안의 `#` 주석이 마크다운 제목으로
  // 오인되므로 세기 전에 걷어낸다.
  const strip = (s: string) =>
    s.replace(/<pre[\s\S]*?<\/pre>/gi, "").replace(/```[\s\S]*?```/g, "");

  const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;
  const checks: [string, RegExp][] = [
    // 본문은 HTML 이 섞여 있어 양쪽 표기를 모두 센다.
    ["제목", /<h[1-6][\s>]/gi],
    ["문단", /<p[\s>]/gi],
    ["목록 항목", /<li[\s>]/gi],
    ["표 셀", /<t[dh][\s>]/gi],
    ["코드영역", /<pre[\s>]/gi],
    ["링크", /<a\s[^>]*href=/gi],
    ["md 제목", /^#{1,6}\s/gm],
    ["md 코드블록", /```/g],
  ];
  const diffs: string[] = [];
  for (const [label, re] of checks) {
    const a = count(label.startsWith("md") ? strip(src) : src, re);
    const b = count(label.startsWith("md") ? strip(out) : out, re);
    if (a !== b) diffs.push(`${label} ${a}→${b}`);
  }
  return diffs;
}

// ── 원문 백업 ────────────────────────────────────────────────────────────────

let backupAvailable: boolean | null = null;

async function backupOriginal(post: BlogRow): Promise<void> {
  if (backupAvailable === false) return;
  const { error } = await supabase
    .from("ssdown_blogs")
    .update({ title_en: post.title, excerpt_en: post.excerpt, content_en: post.content })
    .eq("id", post.id);
  if (error) {
    if (backupAvailable === null) {
      console.warn(`  ⚠ 원문 백업 컬럼(title_en/excerpt_en/content_en)이 없어 백업을 건너뜁니다.`);
      console.warn(`    → ${error.message}`);
    }
    backupAvailable = false;
    return;
  }
  backupAvailable = true;
}

// ── 메인 ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`모델: ${MODEL}${DRY_RUN ? "  (dry-run — DB 미반영)" : ""}`);

  const { data, error } = await supabase
    .from("ssdown_blogs")
    .select("id, title, excerpt, content")
    .order("published_at", { ascending: false });

  if (error || !data) {
    console.error("블로그 조회 실패:", error);
    process.exit(1);
  }

  // 제목에 한글이 없는 글 = 미번역
  const targets = (data as BlogRow[])
    .filter((p) => !/[가-힣]/.test(p.title ?? ""))
    .slice(0, LIMIT);

  console.log(`전체 ${data.length}개 중 미번역 ${targets.length}개 처리\n`);

  let ok = 0;
  let fail = 0;
  let done = 0;

  async function handle(post: BlogRow): Promise<void> {
    const t = await translate(post);
    const n = ++done;
    const head = `[${n}/${targets.length}] ${post.id}`;

    if (!t) {
      fail++;
      console.log(`${head}\n  ✗ 번역 실패\n`);
      return;
    }

    const parity = checkStructure(post.content, t.content);
    const lines = [
      head,
      `  원문: ${post.title}`,
      `  번역: ${t.title}`,
      `  본문: ${t.content.length}자 (원문 ${post.content.length}자)`,
      `  구조: ${parity.length ? `⚠ 불일치 — ${parity.join(", ")}` : "일치"}`,
    ];

    if (DRY_RUN) {
      console.log(lines.join("\n") + "\n");
      ok++;
      return;
    }

    await backupOriginal(post);
    const { error: upErr } = await supabase
      .from("ssdown_blogs")
      .update({ title: t.title, excerpt: t.excerpt, content: t.content })
      .eq("id", post.id);

    if (upErr) {
      fail++;
      console.log(lines.concat(`  ✗ DB 반영 실패: ${upErr.message}`).join("\n") + "\n");
      return;
    }
    ok++;
    console.log(lines.concat("  ✓ 반영 완료").join("\n") + "\n");
  }

  // 동시 처리 — 순차로는 80건에 두 시간 넘게 걸린다.
  const queue = [...targets];
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      for (;;) {
        if (fatalStop) return;
        const post = queue.shift();
        if (!post) return;
        await handle(post);
      }
    }),
  );

  console.log(`완료 — 성공 ${ok}, 실패 ${fail}${fatalStop ? " (중단됨)" : ""}`);
  if (fatalStop) {
    console.log("남은 글은 같은 명령을 다시 실행하면 이어서 처리됩니다.");
    console.log("무료로 진행하려면: --provider=ollama");
  }
  if (backupAvailable === false && !DRY_RUN) {
    console.log("⚠ 원문 백업 없이 덮어썼습니다.");
  }
}

main();
