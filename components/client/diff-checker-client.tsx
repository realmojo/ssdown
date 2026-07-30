"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Diff,
  ArrowRight,
  Trash2,
  FileText,
  ArrowLeftRight,
  GitCompareArrows,
  Lightbulb,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

type DiffType = "added" | "removed" | "unchanged";

interface DiffRow {
  type: DiffType;
  text: string;
  originalLine: number | null;
  changedLine: number | null;
}

interface DiffOptions {
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
}

function normalizeLine(line: string, options: DiffOptions): string {
  let result = line;
  if (options.ignoreCase) result = result.toLowerCase();
  if (options.ignoreWhitespace) result = result.replace(/\s+/g, "");
  return result;
}

// Line-based diff using an LCS dynamic-programming table.
function computeDiff(
  original: string,
  changed: string,
  options: DiffOptions
): DiffRow[] {
  const originalLines = original.length ? original.split("\n") : [];
  const changedLines = changed.length ? changed.split("\n") : [];

  const a = originalLines.map((line) => normalizeLine(line, options));
  const b = changedLines.map((line) => normalizeLine(line, options));
  const n = a.length;
  const m = b.length;

  // dp[i][j] = LCS length of a[i:] and b[j:]
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0)
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const rows: DiffRow[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      rows.push({
        type: "unchanged",
        text: originalLines[i],
        originalLine: i + 1,
        changedLine: j + 1,
      });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({
        type: "removed",
        text: originalLines[i],
        originalLine: i + 1,
        changedLine: null,
      });
      i++;
    } else {
      rows.push({
        type: "added",
        text: changedLines[j],
        originalLine: null,
        changedLine: j + 1,
      });
      j++;
    }
  }
  while (i < n) {
    rows.push({
      type: "removed",
      text: originalLines[i],
      originalLine: i + 1,
      changedLine: null,
    });
    i++;
  }
  while (j < m) {
    rows.push({
      type: "added",
      text: changedLines[j],
      originalLine: null,
      changedLine: j + 1,
    });
    j++;
  }

  return rows;
}

const SAMPLE_ORIGINAL = `The quick brown fox jumps over the lazy dog.
Typography is the art of arranging type.
Good writing is clear thinking made visible.
This line will be removed.
Version 1.0 of the document.`;

const SAMPLE_CHANGED = `The quick brown fox jumps over the lazy dog.
Typography is the art and craft of arranging type.
Good writing is clear thinking made visible.
Version 2.0 of the document.
A brand new closing line was added.`;

export function DiffCheckerClient({ dict }: { dict?: any }) {
  const [original, setOriginal] = useState("");
  const [changed, setChanged] = useState("");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const rows = useMemo(
    () => computeDiff(original, changed, { ignoreWhitespace, ignoreCase }),
    [original, changed, ignoreWhitespace, ignoreCase]
  );

  const summary = useMemo(() => {
    let additions = 0;
    let deletions = 0;
    for (const row of rows) {
      if (row.type === "added") additions++;
      else if (row.type === "removed") deletions++;
    }
    return { additions, deletions };
  }, [rows]);

  const hasInput = original.length > 0 || changed.length > 0;

  const handleSwap = useCallback(() => {
    setOriginal(changed);
    setChanged(original);
    toast.success("두 텍스트를 서로 바꿨습니다");
  }, [original, changed]);

  const handleClear = useCallback(() => {
    setOriginal("");
    setChanged("");
    toast.success("Cleared");
  }, []);

  const handleSample = useCallback(() => {
    setOriginal(SAMPLE_ORIGINAL);
    setChanged(SAMPLE_CHANGED);
  }, []);

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex w-full flex-col">
            <div className="hidden">
              <Diff className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
              텍스트 비교기
            </h1>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              두 텍스트를 나란히 놓고 추가·삭제된 줄을 즉시 표시해 줍니다.
            </p>

            <Adsense slotId="7759160077" />

            {/* Options */}
            <div className="w-full flex flex-wrap items-center justify-center gap-4 mb-2">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm font-medium">
                <input
                  type="checkbox"
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500/50 accent-purple-600"
                />
                공백 무시
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm font-medium">
                <input
                  type="checkbox"
                  checked={ignoreCase}
                  onChange={(e) => setIgnoreCase(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500/50 accent-purple-600"
                />
                대소문자 무시
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Sample
                </button>
                <button
                  onClick={handleSwap}
                  disabled={!hasInput}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  Swap
                </button>
                <button
                  onClick={handleClear}
                  disabled={!hasInput}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            </div>

            {/* Input Textareas */}
            <div className="w-full grid md:grid-cols-2 gap-4 mb-2">
              <Card className="border-purple-100 dark:border-purple-900/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Minus className="w-4 h-4 text-red-500" />
                    Original
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={original}
                    onChange={(e) => setOriginal(e.target.value)}
                    placeholder="원본 텍스트를 여기에 붙여넣으세요…"
                    className="w-full min-h-[240px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors placeholder:text-muted-foreground"
                  />
                </CardContent>
              </Card>
              <Card className="border-purple-100 dark:border-purple-900/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Plus className="w-4 h-4 text-green-500" />
                    Changed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={changed}
                    onChange={(e) => setChanged(e.target.value)}
                    placeholder="변경된 텍스트를 여기에 붙여넣으세요…"
                    className="w-full min-h-[240px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors placeholder:text-muted-foreground"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Result */}
            <Card className="w-full border-purple-100 dark:border-purple-900/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2">
                  <GitCompareArrows className="w-5 h-5 text-purple-500" />
                  Differences
                </CardTitle>
                <div className="flex items-center gap-3 text-sm font-medium">
                  <span className="text-green-600 dark:text-green-400">
                    +{summary.additions} additions
                  </span>
                  <span className="text-red-600 dark:text-red-400">
                    -{summary.deletions} deletions
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {rows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-3 text-center text-muted-foreground">
                    <GitCompareArrows className="w-10 h-10 mb-3 opacity-40" />
                    <p>양쪽에 텍스트를 입력하면 차이가 표시됩니다.</p>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="min-w-full font-mono text-sm">
                      {rows.map((row, idx) => {
                        const rowClass =
                          row.type === "added"
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                            : row.type === "removed"
                              ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                              : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300";
                        const sign =
                          row.type === "added"
                            ? "+"
                            : row.type === "removed"
                              ? "-"
                              : " ";
                        return (
                          <div
                            key={idx}
                            className={`flex items-start ${rowClass}`}
                          >
                            <span className="shrink-0 w-10 px-2 py-1 text-right text-xs text-muted-foreground select-none border-r border-gray-200 dark:border-gray-700">
                              {row.originalLine ?? ""}
                            </span>
                            <span className="shrink-0 w-10 px-2 py-1 text-right text-xs text-muted-foreground select-none border-r border-gray-200 dark:border-gray-700">
                              {row.changedLine ?? ""}
                            </span>
                            <span className="shrink-0 w-6 px-1 py-1 text-center select-none">
                              {sign}
                            </span>
                            <span className="flex-1 px-2 py-1 whitespace-pre-wrap break-words">
                              {row.text || " "}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Guide, Tips, FAQ */}
          <div className="w-full max-w-5xl mx-auto mt-3 px-4 space-y-3">
            {/* How to Use */}
            <section>
              <div className="text-center mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  이용 방법
                </h2>
                <p className="text-muted-foreground">
                  두 텍스트의 모든 차이를 몇 초 만에 찾아냅니다.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-2">
                {[
                  {
                    step: 1,
                    title: "두 텍스트 붙여넣기",
                    desc: "왼쪽에 원본을, 오른쪽에 변경된 내용을 입력하세요.",
                    icon: FileText,
                  },
                  {
                    step: 2,
                    title: "줄 단위 비교",
                    desc: "두 텍스트를 줄 단위로 맞춰 추가되거나 삭제된 줄을 모두 표시해 줍니다.",
                    icon: ArrowRight,
                  },
                  {
                    step: 3,
                    title: "변경 내용 확인",
                    desc: "추가된 줄은 초록색, 삭제된 줄은 빨간색으로 표시되며 변경 요약도 확인할 수 있습니다.",
                    icon: GitCompareArrows,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-2 text-purple-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">비교 팁</h2>
                  <p className="text-muted-foreground">
                    더 깔끔하고 의미 있는 비교 결과를 얻는 방법입니다.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "공백 무시",
                      desc: "들여쓰기나 서식만 바뀌어 내용은 같은데 줄이 달라 보일 때는 '공백 무시'를 켜세요.",
                    },
                    {
                      title: "대소문자 무시",
                      desc: "대소문자만 다른 경우라면 '대소문자 무시'를 켜서 실제 내용 변화에만 집중하세요.",
                    },
                    {
                      title: "위치 바꾸기",
                      desc: "교체 버튼으로 원본과 변경본을 서로 바꿀 수 있어, 변경 사항을 되돌리는 관점에서 보기에 편리합니다.",
                    },
                    {
                      title: "줄 단위 비교 방식",
                      desc: "이 도구는 줄 단위로 비교합니다. 한 줄에 한 문장씩 두면 가장 정확하고 읽기 좋은 결과가 나옵니다.",
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
                        {tip.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {tip.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto">
              <div className="text-center mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">자주 묻는 질문</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    q: "텍스트 비교기는 어떻게 동작하나요?",
                    a: "Paste your original text on the left and the changed text on the right, then click Compare. The tool aligns the two texts line by line using a longest-common-subsequence algorithm and highlights every added, removed, and unchanged line.",
                  },
                  {
                    q: "제 텍스트는 안전한가요?",
                    a: "Yes. All comparison happens entirely in your browser. Your text is never uploaded to any server or stored anywhere. Close the tab and your data is gone.",
                  },
                  {
                    q: "색상은 무엇을 뜻하나요?",
                    a: "Green lines with a plus sign were added in the changed text, red lines with a minus sign were removed from the original, and neutral lines are unchanged between the two versions.",
                  },
                  {
                    q: "공백이나 대소문자를 무시할 수 있나요?",
                    a: "Yes. Enable the 'Ignore whitespace' option to treat lines that differ only in spacing as identical, and enable 'Ignore case' to treat uppercase and lowercase letters as the same when comparing.",
                  },
                ].map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx + 1}`}>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>
        </div>
        <aside className="hidden shrink-0 xl:block xl:w-[200px]">
          <ToolsSidebar category="utility" dict={dict} />
        </aside>
      </div>
    </div>
  );
}
