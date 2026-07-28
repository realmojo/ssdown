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
const modelArg = args.find((a) => a.startsWith("--model="));
const MODEL = modelArg ? modelArg.split("=")[1] : "claude-opus-5";

const RETRY_LIMIT = 3;
const concArg = args.find((a) => a.startsWith("--concurrency="));
const CONCURRENCY = concArg ? parseInt(concArg.split("=")[1], 10) : 4;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 필요합니다 (.env.local)");
  process.exit(1);
}
if (!ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY 가 필요합니다 (.env.local)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

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
- 마크다운 구조(제목 #, 목록, 표, 인용, 굵게/기울임)를 그대로 유지할 것
- 코드 블록(\`\`\` ... \`\`\`)과 인라인 코드(\` \`) 안의 내용은 번역하지 말고 그대로 둘 것
- 링크의 URL은 그대로 두고 링크 텍스트만 번역할 것
- 브랜드·제품·서비스명(SSDown, TikTok, Instagram, YouTube, Windows, PDF, MP4 등)은 원문 유지
  단, 문맥상 한국에서 통용되는 표기가 있으면 그것을 사용 (예: 틱톡, 인스타그램, 유튜브)
- 기술 용어는 국내에서 실제로 쓰이는 표현을 사용할 것
- 원문에 없는 내용을 덧붙이거나 임의로 요약하지 말 것 — 분량과 정보를 보존할 것
- excerpt 는 목록에 노출되는 짧은 요약이므로 원문 길이에 맞춰 간결하게

제목:
${post.title}

요약(excerpt):
${post.excerpt}

본문(마크다운):
${post.content}`;
}

// ── Claude 호출 ──────────────────────────────────────────────────────────────

async function translate(post: BlogRow, attempt = 1): Promise<Translation | null> {
  try {
    // 본문이 길어 출력 토큰이 크므로 스트리밍 사용 (HTTP 타임아웃 방지)
    const stream = anthropic.messages.stream({
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
    if (attempt <= RETRY_LIMIT) {
      const wait = attempt * 5_000;
      console.warn(`    재시도 ${attempt}/${RETRY_LIMIT} (${wait / 1000}s 후)…`);
      await new Promise((r) => setTimeout(r, wait));
      return translate(post, attempt + 1);
    }
    console.error("    번역 실패:", err);
    return null;
  }
}

// ── 구조 검증 ────────────────────────────────────────────────────────────────

/**
 * 번역본이 원문의 마크다운 구조를 보존했는지 확인한다. 번역 과정에서 문단이
 * 통째로 빠지거나 요약되는 사고를 잡아내기 위한 것으로, 개수가 어긋난 항목만
 * 돌려준다.
 */
function checkStructure(src: string, out: string): string[] {
  const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;
  const checks: [string, RegExp][] = [
    ["제목(#)", /^#{1,6}\s/gm],
    ["코드블록", /```/g],
    ["목록", /^\s*[-*+]\s|^\s*\d+\.\s/gm],
    ["표 행", /^\|/gm],
    ["링크", /\[[^\]]*\]\([^)]*\)/g],
  ];
  const diffs: string[] = [];
  for (const [label, re] of checks) {
    const a = count(src, re);
    const b = count(out, re);
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
        const post = queue.shift();
        if (!post) return;
        await handle(post);
      }
    }),
  );

  console.log(`완료 — 성공 ${ok}, 실패 ${fail}`);
  if (backupAvailable === false && !DRY_RUN) {
    console.log("⚠ 원문 백업 없이 덮어썼습니다.");
  }
}

main();
