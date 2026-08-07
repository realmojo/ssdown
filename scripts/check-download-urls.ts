/**
 * check-download-urls.ts
 *
 * software_applications.download_url 이 살아 있는 링크인지 전수 검사합니다.
 *
 * 같은 URL 이 여러 행에 쓰이므로 URL 단위로 중복을 제거해 한 번씩만 요청합니다.
 * 본문은 받지 않습니다 — HEAD 를 먼저 쓰고, HEAD 를 막는 서버에는 Range 헤더를
 * 붙인 GET 으로 첫 바이트만 요청합니다.
 *
 * Usage:
 *   npx tsx scripts/check-download-urls.ts                 # 전수 검사
 *   npx tsx scripts/check-download-urls.ts --limit=200      # 앞 200개만 (시험용)
 *   npx tsx scripts/check-download-urls.ts --concurrency=30 # 동시 요청 수 (기본 20)
 *   npx tsx scripts/check-download-urls.ts --timeout=15000  # 요청 제한 시간(ms, 기본 10000)
 *
 * 결과는 scripts/.download-url-report.json 에 저장됩니다.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

const args = process.argv.slice(2);
const getArg = (p: string) => args.find((a) => a.startsWith(p))?.split("=")[1];

const LIMIT = Number(getArg("--limit=") ?? 0);
const CONCURRENCY = Number(getArg("--concurrency=") ?? 20);
const TIMEOUT = Number(getArg("--timeout=") ?? 10000);

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

type Verdict = "ok" | "redirect-offsite" | "notfound" | "servererror" | "blocked" | "network";

interface Result {
  url: string;
  verdict: Verdict;
  status: number | null;
  finalUrl: string | null;
  error?: string;
  ids: string[];
}

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 환경변수가 필요합니다.");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** 링크 하나를 검사한다. 본문은 받지 않는다. */
async function check(url: string): Promise<Omit<Result, "url" | "ids">> {
  const attempt = async (method: "HEAD" | "GET") => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
    try {
      return await fetch(url, {
        method,
        redirect: "follow",
        signal: ctrl.signal,
        headers: {
          "User-Agent": UA,
          "Accept-Language": "ko,en;q=0.8",
          // GET 이어도 첫 바이트만 받는다.
          ...(method === "GET" ? { Range: "bytes=0-0" } : {}),
        },
      });
    } finally {
      clearTimeout(timer);
    }
  };

  let res: Response;
  try {
    res = await attempt("HEAD");
    // HEAD 를 지원하지 않는 서버가 많아 405/501 이면 GET 으로 다시 시도한다.
    if (res.status === 405 || res.status === 501 || res.status === 403) {
      res = await attempt("GET");
    }
  } catch (e) {
    try {
      res = await attempt("GET");
    } catch (e2) {
      const msg = e2 instanceof Error ? e2.message : String(e2);
      return {
        verdict: "network",
        status: null,
        finalUrl: null,
        error: /abort/i.test(msg) ? "시간 초과" : msg.slice(0, 120),
      };
    }
  }

  const status = res.status;
  const finalUrl = res.url || url;

  let host = "";
  let finalHost = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
    finalHost = new URL(finalUrl).hostname.replace(/^www\./, "");
  } catch {
    /* 주소 파싱 실패는 아래 상태 코드 판정으로 넘긴다 */
  }

  if (status >= 200 && status < 300) {
    // 다른 도메인으로 넘어갔으면 원래 파일이 아닐 수 있으니 따로 표시한다.
    if (host && finalHost && host !== finalHost) {
      return { verdict: "redirect-offsite", status, finalUrl };
    }
    return { verdict: "ok", status, finalUrl };
  }
  // 406·412 는 봇을 막는 사이트가 흔히 돌려준다(softonic 등). 링크가 죽은 게 아니다.
  if ([401, 403, 406, 412, 429].includes(status)) {
    return { verdict: "blocked", status, finalUrl };
  }
  if (status >= 400 && status < 500) {
    return { verdict: "notfound", status, finalUrl };
  }
  return { verdict: "servererror", status, finalUrl };
}

/** 동시 실행 수를 제한하며 순회한다. */
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
  onProgress?: (done: number, total: number) => void,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  let done = 0;

  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i], i);
      done++;
      if (onProgress && done % 100 === 0) onProgress(done, items.length);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  onProgress?.(done, items.length);
  return out;
}

async function main() {
  const sb = db();

  // http(s) 형태만 검사 대상. '#' 자리표시자는 애초에 링크가 없는 항목이다.
  const byUrl = new Map<string, string[]>();
  let placeholder = 0;
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("software_applications")
      .select("id,download_url")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    for (const r of data) {
      const u = (r.download_url ?? "").trim();
      if (!u || u === "#") {
        placeholder++;
        continue;
      }
      if (!/^https?:\/\//i.test(u)) continue;
      const list = byUrl.get(u) ?? [];
      list.push(r.id);
      byUrl.set(u, list);
    }
    if (data.length < 1000) break;
  }

  let urls = [...byUrl.keys()];
  if (LIMIT > 0) urls = urls.slice(0, LIMIT);

  console.log(`검사 대상 URL: ${urls.length}개 (중복 제거 전 ${[...byUrl.values()].flat().length}행)`);
  console.log(`링크 없음('#'): ${placeholder}행`);
  console.log(`동시 ${CONCURRENCY} / 제한시간 ${TIMEOUT}ms\n`);

  const started = Date.now();
  const results = await mapLimit(
    urls,
    CONCURRENCY,
    async (url): Promise<Result> => ({
      url,
      ids: byUrl.get(url) ?? [],
      ...(await check(url)),
    }),
    (done, total) => {
      const sec = Math.round((Date.now() - started) / 1000);
      console.log(`  ${done}/${total}  (${sec}초)`);
    },
  );

  const byVerdict: Record<string, Result[]> = {};
  for (const r of results) (byVerdict[r.verdict] ??= []).push(r);

  const LABEL: Record<Verdict, string> = {
    ok: "정상",
    "redirect-offsite": "다른 도메인으로 이동",
    notfound: "없는 페이지(4xx)",
    servererror: "서버 오류(5xx)",
    blocked: "접근 차단(401/403/429)",
    network: "연결 실패·시간 초과",
  };

  console.log("\n=== 결과 ===");
  const order: Verdict[] = ["ok", "redirect-offsite", "blocked", "notfound", "servererror", "network"];
  for (const v of order) {
    const list = byVerdict[v] ?? [];
    const rows = list.reduce((n, r) => n + r.ids.length, 0);
    console.log(`  ${LABEL[v].padEnd(22)} URL ${String(list.length).padStart(5)}개 / 행 ${String(rows).padStart(5)}개`);
  }

  const reportPath = path.join(__dirname, ".download-url-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 1));
  console.log(`\n상세: ${reportPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
