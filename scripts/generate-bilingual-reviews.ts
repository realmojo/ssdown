/**
 * generate-bilingual-reviews.ts
 *
 * AI로 영어/한국어 콘텐츠를 새로 생성해 software_applications 에 저장합니다.
 * (download.beer 등 외부 사이트 본문은 사용하지 않음 — 앱 이름/카테고리 등 사실 정보만 컨텍스트로 제공)
 *
 * 제공자:
 *  --provider=ollama (기본) : 로컬 Ollama. 무료지만 품질은 모델에 따라 다름.
 *  --provider=claude        : Claude API (claude-opus-4-8). 가장 정확. ANTHROPIC_API_KEY 필요.
 *
 * 두 가지 모드:
 *  1) 신규 앱 (기본): scripts/.download-beer-ids.json 의 id 대상.
 *     영어 정식 명칭 + EN/KR 리뷰·요약·SEO 필드를 모두 생성.
 *  2) --backfill-kr : 이미 영어 ai_review_html 이 있는 기존 앱에
 *     한국어 버전(ai_review_html_kr 등)만 생성.
 *
 * Usage:
 *   npx tsx scripts/generate-bilingual-reviews.ts --provider=claude              # 신규 앱 전체 (Claude)
 *   npx tsx scripts/generate-bilingual-reviews.ts --provider=claude --id=discord # 단일 앱 테스트
 *   npx tsx scripts/generate-bilingual-reviews.ts --limit=5                      # Ollama로 5개만
 *   npx tsx scripts/generate-bilingual-reviews.ts --provider=claude --backfill-kr --limit=100
 *   npx tsx scripts/generate-bilingual-reviews.ts --model=qwen3:30b-a3b          # Ollama 모델 지정
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

const OLLAMA_BASE_URL = "http://localhost:11434";
const CLAUDE_MODEL = "claude-haiku-4-5";
const RETRY_LIMIT = 3;

const MODEL_ALIASES: Record<string, string> = {
  qwen: "qwen2.5:7b",
  "exaone-deep": "exaone-deep:latest",
  exaone: "exaone-deep:latest",
};

const args = process.argv.slice(2);
const getArg = (prefix: string) =>
  args.find((a) => a.startsWith(prefix))?.split("=")[1];

const SINGLE_ID = getArg("--id=");
const LIMIT = parseInt(getArg("--limit=") ?? "0", 10) || Infinity;
const BACKFILL_KR = args.includes("--backfill-kr");
const PROVIDER = getArg("--provider=") ?? "ollama";
const modelKey = getArg("--model=") ?? "qwen";
const OLLAMA_MODEL = MODEL_ALIASES[modelKey] ?? modelKey;
// 대상 id 목록. 임포터마다 파일이 다르므로 --ids= 로 바꿀 수 있다.
//   예) --ids=.downloadziper-ids.json
const IDS_FILE = path.join(
  process.cwd(),
  "scripts",
  getArg("--ids=") ?? ".download-beer-ids.json",
);

const anthropic = PROVIDER === "claude" ? new Anthropic() : null;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface AppRow {
  id: string;
  name: string;
  name_kr: string | null;
  platform: string;
  category_main: string;
  category_sub: string;
  short_summary: string;
  ai_review_html: string;
  ai_review_html_kr: string | null;
  download_url: string | null;
}

/**
 * 플레이 스토어 소개글을 사실 확인용으로만 가져온다.
 * 반환값은 프롬프트에만 들어가고 DB 에 저장하지 않는다. 모델은 이 문장을
 * 베끼지 않고 새로 쓰도록 프롬프트에서 지시한다.
 */
async function fetchStoreBlurb(downloadUrl: string | null): Promise<string> {
  const pkg = String(downloadUrl ?? "").match(/[?&]id=([^&\s]+)/)?.[1];
  if (!pkg) return "";
  try {
    const res = await fetch(
      `https://play.google.com/store/apps/details?id=${pkg}&hl=ko&gl=KR`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept-Language": "ko",
        },
      },
    );
    if (!res.ok) return "";
    const html = await res.text();
    const m = html.match(/<div[^>]+data-g-id="description"[^>]*>([\s\S]*?)<\/div>/);
    if (!m) return "";
    return stripHtml(m[1].replace(/<br\s*\/?>/gi, "\n")).slice(0, 3000);
  } catch {
    return "";
  }
}

const ALLOWED_TAGS = "<h2>, <h3>, <p>, <strong>, <em>, <ul>, <ol>, <li>";

// ── 프롬프트 ─────────────────────────────────────────────────────────────────

function buildEnPrompt(app: AppRow, storeBlurb: string): string {
  /*
    storeBlurb 는 스토어 소개글이다. 사실 확인용으로만 프롬프트에 넣고 저장하지
    않는다. 모델은 이 내용을 베끼지 않고 자기 문장으로 새로 써야 한다.
    이게 없으면 모델이 앱을 모를 때 기능을 지어내는 문제가 있었다.
  */
  const reference = storeBlurb
    ? `\nWhat the app actually does (reference only — never copy any phrase from this, write your own sentences):\n${storeBlurb.slice(0, 2500)}\n`
    : `\nNo reference text is available for this app. If you do not genuinely know it, keep the article general: describe what apps in this category typically do and how to install one, and do NOT state specific features, modes, or mechanics as facts.\n`;

  return `You are an expert software reviewer for a software download website. Write completely original content — do not copy sentences or phrasing from any existing website.

App facts:
- Korean name: ${app.name_kr ?? app.name}
- Slug: ${app.id}
- Platform: ${app.platform}
- Category: ${app.category_main} / ${app.category_sub}
${reference}
Never use emoji. Respond with a single JSON object, no other text:
{
  "name": "official English app name. If the app has no established English name, repeat the Korean name exactly as given — never transliterate it letter by letter and never guess a translation",
  "seo_title": "SEO page title, max 60 characters, must include the app name and the word Download",
  "seo_description": "SEO meta description, 120-155 characters",
  "short_summary": "1-2 sentence summary of what the app does",
  "review_html": "SEO-optimized review article as HTML, 1000-2000 characters. Only these tags: ${ALLOWED_TAGS}. No attributes. Cover: what the app does, key features, use cases, who it's for, tips. Do not invent specific version numbers, prices, or statistics."
}`;
}

function buildKrPrompt(app: AppRow, englishReview: string): string {
  return `당신은 소프트웨어 다운로드 사이트의 전문 리뷰어입니다. 아래 영어 리뷰를 참고하되 단순 번역이 아니라 한국어 사용자에게 자연스러운 완전히 새로운 글로 작성하세요.

앱 정보:
- 이름: ${app.name_kr ?? app.name} (${app.name})
- 플랫폼: ${app.platform}
- 카테고리: ${app.category_main} / ${app.category_sub}

영어 리뷰 (사실 관계 참고용):
${stripHtml(englishReview).slice(0, 3000)}

이모지는 절대 사용하지 마세요. 다른 텍스트 없이 JSON 객체 하나로만 응답하세요:
{
  "seo_title_kr": "SEO 페이지 제목, 60자 이내, 앱 이름과 '다운로드' 포함",
  "seo_description_kr": "SEO 메타 설명, 80~120자",
  "short_summary_kr": "앱을 소개하는 1~2문장 요약",
  "review_html_kr": "한국어 SEO 리뷰 기사 HTML, 1000~2000자. 허용 태그: ${ALLOWED_TAGS}. 속성 금지. 구체적인 버전 번호, 가격, 통계를 지어내지 마세요.",
  "pros_kr": ["장점 3~5개. 각 항목은 40자 이내의 한국어 구절"],
  "cons_kr": ["단점 2~4개. 각 항목은 40자 이내의 한국어 구절"]
}`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// ── JSON 스키마 (Claude structured outputs 용) ───────────────────────────────

const EN_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    seo_title: { type: "string" },
    seo_description: { type: "string" },
    short_summary: { type: "string" },
    review_html: { type: "string" },
  },
  required: ["name", "seo_title", "seo_description", "short_summary", "review_html"],
  additionalProperties: false,
} as const;

const KR_SCHEMA = {
  type: "object",
  properties: {
    seo_title_kr: { type: "string" },
    seo_description_kr: { type: "string" },
    short_summary_kr: { type: "string" },
    review_html_kr: { type: "string" },
    pros_kr: { type: "array", items: { type: "string" } },
    cons_kr: { type: "array", items: { type: "string" } },
  },
  required: ["seo_title_kr", "seo_description_kr", "short_summary_kr", "review_html_kr", "pros_kr", "cons_kr"],
  additionalProperties: false,
} as const;

// ── Claude API 호출 ──────────────────────────────────────────────────────────

async function claudeJson(
  prompt: string,
  schema: typeof EN_SCHEMA | typeof KR_SCHEMA,
): Promise<Record<string, unknown> | null> {
  try {
    const response = await anthropic!.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8192,
      output_config: { format: { type: "json_schema", schema } },
      messages: [{ role: "user", content: prompt }],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;
    return JSON.parse(textBlock.text);
  } catch (err) {
    // 잔액 부족·인증 오류는 남은 행에서도 똑같이 실패하므로 전체를 중단한다.
    // (중단하지 않으면 수천 건이 순서대로 같은 오류를 반복한다.)
    if (isFatal(err)) {
      console.error(`\n중단 — ${err instanceof Error ? err.message : err}`);
      fatalStop = true;
      return null;
    }
    console.error("    Claude API 호출 실패:", err instanceof Error ? err.message : err);
    return null;
  }
}

/** 재시도해도 결과가 달라지지 않는 오류인지. */
function isFatal(err: unknown): boolean {
  const m = err instanceof Error ? err.message : String(err);
  return /credit balance is too low|authentication_error|permission_error/.test(m);
}

let fatalStop = false;

// ── Ollama 호출 ──────────────────────────────────────────────────────────────

async function ollamaJson(prompt: string, attempt = 1): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        format: "json",
        options: { num_predict: 2048 },
      }),
    });
    if (!response.ok) {
      throw new Error(`Ollama API error ${response.status}: ${await response.text()}`);
    }
    const data = (await response.json()) as { message: { content: string } };
    const text = (data.message?.content ?? "")
      .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .trim();
    return JSON.parse(text);
  } catch (err) {
    if (attempt <= RETRY_LIMIT) {
      const wait = attempt * 5_000;
      console.warn(`    재시도 ${attempt}/${RETRY_LIMIT} (${wait / 1000}s 후)...`);
      await new Promise((r) => setTimeout(r, wait));
      return ollamaJson(prompt, attempt + 1);
    }
    console.error("    Ollama 호출 실패:", err);
    return null;
  }
}

function sanitizeHtml(html: string): string {
  // 허용 태그 외 제거 + 속성 제거
  return html
    .replace(/<(?!\/?(h2|h3|p|strong|em|ul|ol|li)\b)[^>]*>/gi, "")
    .replace(/<(h2|h3|p|strong|em|ul|ol|li)\s+[^>]*>/gi, "<$1>")
    .trim();
}

// ── 처리 ─────────────────────────────────────────────────────────────────────

function generateJson(
  prompt: string,
  schema: typeof EN_SCHEMA | typeof KR_SCHEMA,
): Promise<Record<string, unknown> | null> {
  return PROVIDER === "claude" ? claudeJson(prompt, schema) : ollamaJson(prompt);
}

async function processNewApp(app: AppRow): Promise<boolean> {
  // 1) 영어 콘텐츠
  if (!app.ai_review_html) {
    const en = await generateJson(buildEnPrompt(app, await fetchStoreBlurb(app.download_url)), EN_SCHEMA);
    if (!en?.review_html) return false;
    const update = {
      name: (en.name ?? app.name).slice(0, 100),
      seo_title: (en.seo_title ?? "").slice(0, 70),
      seo_description: (en.seo_description ?? "").slice(0, 170),
      short_summary: (en.short_summary ?? "").slice(0, 300),
      ai_review_html: sanitizeHtml(en.review_html),
    };
    const { error } = await supabase
      .from("software_applications")
      .update(update)
      .eq("id", app.id);
    if (error) throw new Error(`EN 저장 실패 (${app.id}): ${error.message}`);
    app.ai_review_html = update.ai_review_html;
    app.name = update.name;
    console.log(`    EN 저장 ✓ (${update.ai_review_html.length}자, name: ${update.name})`);
  }

  // 2) 한국어 콘텐츠
  if (!app.ai_review_html_kr) {
    const kr = await generateJson(buildKrPrompt(app, app.ai_review_html), KR_SCHEMA);
    if (!kr?.review_html_kr) return false;
    const update = {
      seo_title_kr: (kr.seo_title_kr ?? "").slice(0, 70),
      seo_description_kr: (kr.seo_description_kr ?? "").slice(0, 170),
      short_summary_kr: (kr.short_summary_kr ?? "").slice(0, 300),
      ai_review_html_kr: sanitizeHtml(kr.review_html_kr),
      // 장단점이 비어 있으면 상세 페이지의 장단점 섹션이 통째로 사라진다.
      ...(Array.isArray(kr.pros_kr) && kr.pros_kr.length
        ? { pros: (kr.pros_kr as string[]).slice(0, 6).map((x) => String(x).slice(0, 60)) }
        : {}),
      ...(Array.isArray(kr.cons_kr) && kr.cons_kr.length
        ? { cons: (kr.cons_kr as string[]).slice(0, 5).map((x) => String(x).slice(0, 60)) }
        : {}),
    };
    const { error } = await supabase
      .from("software_applications")
      .update(update)
      .eq("id", app.id);
    if (error) throw new Error(`KR 저장 실패 (${app.id}): ${error.message}`);
    console.log(`    KR 저장 ✓ (${update.ai_review_html_kr.length}자)`);
  }

  return true;
}

async function fetchTargets(): Promise<AppRow[]> {
  const columns =
    "id, name, name_kr, platform, category_main, category_sub, short_summary, ai_review_html, ai_review_html_kr, download_url";

  if (SINGLE_ID) {
    const { data, error } = await supabase
      .from("software_applications")
      .select(columns)
      .eq("id", SINGLE_ID);
    if (error) throw new Error(error.message);
    return (data ?? []) as AppRow[];
  }

  if (BACKFILL_KR) {
    // Supabase 는 한 번에 1000행까지만 돌려주므로, --limit 없이 돌릴 때는
    // range 로 끝까지 페이지네이션한다. (예전에는 1000건에서 잘렸다.)
    const PAGE = 1000;
    const rows: AppRow[] = [];
    for (let from = 0; rows.length < LIMIT; from += PAGE) {
      const take = Math.min(PAGE, LIMIT - rows.length);
      const { data, error } = await supabase
        .from("software_applications")
        .select(columns)
        .not("ai_review_html", "is", null)
        .neq("ai_review_html", "")
        .is("ai_review_html_kr", null)
        .order("rating_average", { ascending: false })
        .range(from, from + take - 1);
      if (error) throw new Error(error.message);
      const page = (data ?? []) as AppRow[];
      rows.push(...page);
      if (page.length < take) break;
    }
    return rows;
  }

  // 기본: 임포트된 id 목록
  if (!fs.existsSync(IDS_FILE)) {
    throw new Error(
      `${IDS_FILE} 없음 — 먼저 import-download-beer.ts --insert 를 실행하거나 --id/--backfill-kr 를 사용하세요.`,
    );
  }
  const ids: string[] = JSON.parse(fs.readFileSync(IDS_FILE, "utf-8"));
  const rows: AppRow[] = [];
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await supabase
      .from("software_applications")
      .select(columns)
      .in("id", ids.slice(i, i + 200));
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as AppRow[]));
  }
  // 미완료(EN 또는 KR 비어있음)만
  return rows.filter((r) => !r.ai_review_html || !r.ai_review_html_kr);
}

async function main() {
  console.log("=== Bilingual Review Generator ===");
  console.log(`Provider: ${PROVIDER}`);
  console.log(`Model: ${PROVIDER === "claude" ? CLAUDE_MODEL : OLLAMA_MODEL}`);
  console.log(`Mode: ${SINGLE_ID ? `single(${SINGLE_ID})` : BACKFILL_KR ? "backfill-kr" : "new apps"}`);
  console.log("");

  const targets = (await fetchTargets()).slice(0, LIMIT === Infinity ? undefined : LIMIT);
  console.log(`대상: ${targets.length}개\n`);

  let ok = 0;
  let failed = 0;
  for (let i = 0; i < targets.length; i++) {
    if (fatalStop) break;
    const app = targets[i];
    console.log(`[${i + 1}/${targets.length}] ${app.name_kr ?? app.name} (${app.id})`);
    try {
      const success = await processNewApp(app);
      success ? ok++ : failed++;
    } catch (e) {
      console.error(`    실패:`, e);
      failed++;
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n완료: 성공 ${ok}, 실패 ${failed}${fatalStop ? " (중단됨)" : ""}`);
  if (fatalStop) {
    console.log("남은 항목은 같은 명령을 다시 실행하면 이어서 처리됩니다.");
  }
}

main().catch((e) => {
  console.error("오류:", e);
  process.exit(1);
});
