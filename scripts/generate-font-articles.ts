/**
 * generate-font-articles.ts
 *
 * Homebrew Cask 로 등록된 Mac 폰트(font-*) 항목에 "서체 소개 + 설치법" 글을
 * 생성한다. 일반 소프트웨어 리뷰(generate-bilingual-reviews.ts)와 달리
 * 기능·사용법이 아니라 서체의 분류·인상·용도·설치 방법을 다룬다.
 *
 * 사실 근거 (지어내기 방지 — generate-bilingual-reviews.ts 와 같은 원칙):
 *   1) 구글폰트 메타데이터 API(https://fonts.google.com/metadata/fonts) 의
 *      category/designers/스타일 수. 약 1,900종을 덮는다.
 *   2) 없으면 공식 배포 페이지(주로 GitHub)의 og:description / description.
 *   3) 둘 다 없으면 생성하지 않고 건너뛴다.
 *
 *   원래는 근거가 없어도 "단정하지 말라"는 지시만 주고 생성했는데, 그것만으로는
 *   막히지 않았다. Academicons(학술 아이콘 폰트)를 "모던 sans-serif, 가독성이
 *   뛰어나 본문에 적합"이라고 서술한 사례가 나와 위 3단계로 바꿨다.
 *
 * Usage:
 *   npx tsx scripts/generate-font-articles.ts --limit=3          # 시험
 *   npx tsx scripts/generate-font-articles.ts                    # 전체
 *   npx tsx scripts/generate-font-articles.ts --model=gemma3:1b
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const args = process.argv.slice(2);
const getArg = (p: string) => args.find((a) => a.startsWith(p))?.split("=")[1];
const LIMIT = Number(getArg("--limit=") ?? 0) || Infinity;
const MODEL = getArg("--model=") ?? "gemma3:latest";
const OLLAMA_BASE_URL = "http://localhost:11434";
const RETRY_LIMIT = 3;
const ALLOWED_TAGS = "<h2>, <h3>, <p>, <strong>, <em>, <ul>, <ol>, <li>";

function db(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 환경변수가 필요합니다.");
  return createClient(url, key, { auth: { persistSession: false } });
}

interface FontMeta {
  category: string;
  designers: string[];
  weights: number;
}

/** 구글폰트 메타데이터를 family 이름으로 찾을 수 있게 Map 으로 만든다. */
async function loadGoogleFonts(): Promise<Map<string, FontMeta>> {
  const map = new Map<string, FontMeta>();
  try {
    const res = await fetch("https://fonts.google.com/metadata/fonts", {
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return map;
    // 구글은 JSON 앞에 XSSI 방어용 ")]}'" 를 붙여 보낸다.
    const text = (await res.text()).replace(/^\)\]\}'?\n?/, "");
    const json = JSON.parse(text) as {
      familyMetadataList?: {
        family: string;
        category: string;
        designers?: string[];
        fonts?: Record<string, unknown>;
      }[];
    };
    for (const f of json.familyMetadataList ?? []) {
      map.set(f.family.toLowerCase(), {
        category: f.category ?? "",
        designers: f.designers ?? [],
        weights: Object.keys(f.fonts ?? {}).length,
      });
    }
  } catch {
    /* 메타데이터를 못 받아도 근거 없는 모드로 계속 진행한다. */
  }
  return map;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** 허용 태그만 남긴다. generate-bilingual-reviews.ts 의 sanitize 와 같은 방침. */
function sanitize(html: string): string {
  return html
    .replace(/<(?!\/?(h2|h3|p|strong|em|ul|ol|li)\b)[^>]*>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 구글폰트에 없는 서체(주로 GitHub 배포)는 공식 페이지의 메타 설명을 근거로 쓴다.
 *
 * 이게 없으면 모델이 서체의 생김새를 지어낸다. 실제로 Academicons(학술 아이콘
 * 폰트)를 "모던 sans-serif, 가독성이 뛰어나 본문에 적합"이라고 서술한 사례가
 * 있었다 — 아이콘 폰트라 본문용이 아니다.
 */
async function fetchHomepageBlurb(url: string | null): Promise<string> {
  if (!/^https?:\/\//.test(String(url ?? ""))) return "";
  try {
    const res = await fetch(url!, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    const pick = (re: RegExp) => html.match(re)?.[1]?.trim() ?? "";
    const parts = [
      pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i),
      pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i),
    ].filter(Boolean);
    return [...new Set(parts)].join(" — ").slice(0, 800);
  } catch {
    return "";
  }
}

function buildPrompt(name: string, meta: FontMeta | undefined, blurb: string): string {
  const facts = meta
    ? `참고 사실 (구글폰트 공식 메타데이터):
- 분류: ${meta.category}
- 디자이너: ${meta.designers.join(", ") || "미상"}
- 제공 스타일 수: ${meta.weights}개`
    : `참고 사실 (공식 배포 페이지 설명 — 베끼지 말고 근거로만 쓰세요):
${blurb}

주의: 위 설명이 이 서체의 실제 성격입니다. 본문용 서체가 아니라 아이콘 폰트나
특수 목적 서체일 수 있으니, 위 설명에 없는 생김새(획·세리프·가독성 등)를
지어내지 마세요.`;

  return `당신은 타이포그래피에 밝은 편집자입니다. 아래 서체를 한국 사용자에게 소개하는 글을 쓰세요.

서체 이름: ${name}
${facts}

이 글은 프로그램 리뷰가 아니라 "서체 소개"입니다. 기능·업데이트·버전 이야기는 쓰지 마세요.
이모지를 쓰지 말고, 다른 텍스트 없이 JSON 객체 하나로만 응답하세요:
{
  "seo_title_kr": "60자 이내. 서체 이름과 '무료 다운로드' 포함",
  "seo_description_kr": "80~120자의 SEO 메타 설명",
  "short_summary_kr": "이 서체가 어떤 인상인지 1~2문장",
  "review_html_kr": "한국어 HTML 글, 800~1500자. 허용 태그: ${ALLOWED_TAGS}. 속성 금지. 서체의 인상과 분류, 어울리는 용도(제목/본문/로고 등), macOS 설치 방법, 사용 시 유의점 순서로 구성하세요. 없는 사실을 지어내지 마세요.",
  "pros_kr": ["장점 3~4개, 각 40자 이내"],
  "cons_kr": ["아쉬운 점 2~3개, 각 40자 이내"]
}`;
}

async function callOllama(prompt: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      stream: false,
      format: "json",
      options: { temperature: 0.6 },
    }),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}`);
  const data = (await res.json()) as { message?: { content?: string } };
  const text = (data.message?.content ?? "").trim();
  try {
    return JSON.parse(text);
  } catch {
    // 모델이 앞뒤에 설명을 붙이는 경우가 있어 첫 중괄호 블록만 뽑아 재시도한다.
    const m = text.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  }
}

/** 한글 비율이 낮으면 번역이 안 된 것으로 보고 재시도한다. */
function looksKorean(s: string): boolean {
  const letters = s.replace(/[^\p{L}]/gu, "");
  if (!letters) return false;
  const hangul = (letters.match(/[가-힣]/g) ?? []).length;
  return hangul / letters.length > 0.3;
}

async function main() {
  const sb = db();
  console.log("=== Font Article Generator ===");
  console.log(`Model: ${MODEL}\n`);

  const gfonts = await loadGoogleFonts();
  console.log(`구글폰트 메타데이터: ${gfonts.size}종\n`);

  let rows: { id: string; name: string; download_url: string | null; ai_review_html_kr: string | null }[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("ssdown_software_applications")
      .select("id,name,download_url,ai_review_html_kr")
      .eq("platform", "Mac")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    rows = rows.concat(data as never);
    if (!data || data.length < 1000) break;
  }

  const empty = (v: unknown) => !v || String(v).trim() === "";
  let targets = rows.filter(
    (r) =>
      empty(r.ai_review_html_kr) &&
      (/^font-/.test(r.id) || /fonts\.google\.com/.test(r.download_url ?? "")),
  );
  if (LIMIT !== Infinity) targets = targets.slice(0, LIMIT);
  console.log(`대상: ${targets.length}개\n`);

  let ok = 0;
  let fail = 0;
  let skipped = 0;
  for (let i = 0; i < targets.length; i++) {
    const r = targets[i];
    console.log(`[${i + 1}/${targets.length}] ${r.name} (${r.id})`);
    const meta = gfonts.get(r.name.toLowerCase());
    // 구글폰트 메타데이터가 없으면 공식 페이지 설명이라도 확보한다.
    const blurb = meta ? "" : await fetchHomepageBlurb(r.download_url);
    if (!meta && !blurb) {
      // 근거가 하나도 없으면 생성하지 않는다. 지어내느니 비워 두는 편이 낫다.
      console.log("    건너뜀: 근거 자료 없음");
      skipped++;
      continue;
    }

    let saved = false;
    for (let attempt = 1; attempt <= RETRY_LIMIT && !saved; attempt++) {
      try {
        const out = await callOllama(buildPrompt(r.name, meta, blurb));
        const html = String(out?.review_html_kr ?? "");
        if (!html || !looksKorean(stripHtml(html))) throw new Error("한국어 본문 없음");

        const update: Record<string, unknown> = {
          seo_title_kr: String(out?.seo_title_kr ?? "").slice(0, 70),
          seo_description_kr: String(out?.seo_description_kr ?? "").slice(0, 170),
          short_summary_kr: String(out?.short_summary_kr ?? "").slice(0, 300),
          ai_review_html_kr: sanitize(html),
          category_main: "Personalization",
          category_sub: "Fonts",
        };
        if (Array.isArray(out?.pros_kr) && out.pros_kr.length)
          update.pros = (out.pros_kr as string[]).slice(0, 6).map((x) => String(x).slice(0, 60));
        if (Array.isArray(out?.cons_kr) && out.cons_kr.length)
          update.cons = (out.cons_kr as string[]).slice(0, 5).map((x) => String(x).slice(0, 60));

        const { error } = await sb
          .from("ssdown_software_applications")
          .update(update)
          .eq("id", r.id);
        if (error) throw new Error(`저장 실패: ${error.message}`);

        console.log(`    저장 ✓ (${String(update.ai_review_html_kr).length}자${meta ? `, ${meta.category}` : ", 홈페이지 근거"})`);
        ok++;
        saved = true;
      } catch (err) {
        if (attempt === RETRY_LIMIT) {
          console.log(`    실패: ${(err as Error).message}`);
          fail++;
        } else {
          await new Promise((res) => setTimeout(res, attempt * 2_000));
        }
      }
    }
  }

  console.log(`\n완료: 성공 ${ok}, 실패 ${fail}, 근거없어 건너뜀 ${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
