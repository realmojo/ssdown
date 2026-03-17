/**
 * AI Review Generator
 *
 * editor_review_html 컬럼을 읽어 로컬 Ollama qwen2.5:7b 모델로 SEO 최적화된
 * ai_review_html 을 생성하고 DB에 저장합니다.
 *
 * Usage:
 *   npx tsx scripts/generate-ai-reviews.ts          # 전체 처리
 *   npx tsx scripts/generate-ai-reviews.ts --resume  # 미처리 행만 처리
 *   npx tsx scripts/generate-ai-reviews.ts --limit=50 # 50개만 처리
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// ── 설정 ─────────────────────────────────────────────────────────────────────

const CONCURRENCY = 1;   // 순차 처리 (1개씩)
const RETRY_LIMIT = 3;
const OLLAMA_BASE_URL = 'http://localhost:11434';
const OLLAMA_MODEL = 'qwen2.5:7b';

const args = process.argv.slice(2);
const RESUME = args.includes('--resume');
const limitArg = args.find(a => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

// ── 클라이언트 ─────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ── 프롬프트 빌더 ──────────────────────────────────────────────────────────────

function buildPrompt(app: {
  name: string;
  platform: string;
  category_main: string;
  short_summary: string;
  pros: string[];
  cons: string[];
  editor_review_html: string;
}): string {
  const prosList = app.pros?.length ? app.pros.map(p => `- ${p}`).join('\n') : 'N/A';
  const consList = app.cons?.length ? app.cons.map(c => `- ${c}`).join('\n') : 'N/A';

  return `You are an expert software reviewer writing SEO-optimized content for a software download website.

Based on the [software spec data] provided below, write a detailed SEO-optimized article for an IT blog. Do not make up any facts beyond what is provided.

Output ONLY valid HTML (no markdown, no code fences, no explanations). Use only these tags: <h2>, <h3>, <p>, <strong>, <em>, <ul>, <ol>, <li>. No class, id, or style attributes.

Requirements:
- Between 1000 and 2000 characters in the HTML output (do not exceed 2000 characters)
- Natural keyword integration (app name, platform, category)
- Clear structure with h2/h3 headings
- Cover: what the app does, key features, use cases, pros/cons, who it's for, tips
- Engaging, informative tone suitable for English-speaking users
- Do NOT copy the original review verbatim — rewrite and expand significantly

App Information:
- Name: ${app.name}
- Platform: ${app.platform}
- Category: ${app.category_main}
- Summary: ${app.short_summary || 'N/A'}

Pros:
${prosList}

Cons:
${consList}

Original Review (use as context, do not copy):
${app.editor_review_html ? stripHtmlTags(app.editor_review_html).slice(0, 3000) : 'N/A'}

Write the full HTML review now:`;
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── AI 리뷰 생성 ───────────────────────────────────────────────────────────────

async function generateReview(app: Record<string, unknown>, attempt = 1): Promise<string | null> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          {
            role: 'user',
            content: buildPrompt({
              name: app.name as string,
              platform: app.platform as string,
              category_main: app.category_main as string,
              short_summary: app.short_summary as string,
              pros: (app.pros as string[]) ?? [],
              cons: (app.cons as string[]) ?? [],
              editor_review_html: app.editor_review_html as string,
            }),
          },
        ],
        stream: false,
        options: { num_predict: 1024 },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json() as { message: { content: string } };
    const text = data.message?.content ?? '';
    // Remove any accidental markdown code fences
    return text.replace(/^```html?\n?/i, '').replace(/```$/m, '').trim();
  } catch (err) {
    if (attempt <= RETRY_LIMIT) {
      const wait = attempt * 5_000;
      console.warn(`  Error, retrying in ${wait / 1000}s (attempt ${attempt})...`);
      await new Promise(r => setTimeout(r, wait));
      return generateReview(app, attempt + 1);
    }
    console.error(`  Unexpected error:`, err);
    return null;
  }
}

// ── Supabase 저장 ──────────────────────────────────────────────────────────────

async function saveReview(id: string, aiReviewHtml: string): Promise<void> {
  const { error } = await supabase
    .from('software_applications')
    .update({ ai_review_html: aiReviewHtml })
    .eq('id', id);
  if (error) throw new Error(`Supabase update failed for ${id}: ${error.message}`);
}

// ── 동시 처리 헬퍼 ─────────────────────────────────────────────────────────────

async function processChunk(rows: Record<string, unknown>[]): Promise<void> {
  for (const row of rows) {
    const id = row.id as string;
    const name = row.name as string;
    process.stdout.write(`  Processing: ${name} (${id}) ...`);
    const html = await generateReview(row);
    if (html) {
      await saveReview(id, html);
      console.log(` ✓ (${html.length} chars)`);
    } else {
      console.log(` ✗ skipped`);
    }
  }
}

// ── 메인 ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== AI Review Generator ===');
  console.log(`Concurrency: ${CONCURRENCY}`);
  if (LIMIT !== Infinity) console.log(`Limit: ${LIMIT}`);
  console.log('');

  // ai_review_html 이 없는 행만 조회
  let query = supabase
    .from('software_applications')
    .select('id, name, platform, category_main, short_summary, pros, cons, editor_review_html')
    .not('editor_review_html', 'is', null)
    .neq('editor_review_html', '')
    .or('ai_review_html.is.null,ai_review_html.eq.');

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch rows:', error.message);
    process.exit(1);
  }

  const rows = (data ?? []).slice(0, LIMIT === Infinity ? undefined : LIMIT);
  console.log(`Found ${rows.length} rows to process.\n`);

  if (rows.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  let processed = 0;
  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    const chunk = rows.slice(i, i + CONCURRENCY);
    console.log(`[${i + 1}~${Math.min(i + CONCURRENCY, rows.length)} / ${rows.length}]`);
    await processChunk(chunk);
    processed += chunk.length;
    // Rate limit buffer between chunks
    if (i + CONCURRENCY < rows.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\nDone. Processed ${processed} rows.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
