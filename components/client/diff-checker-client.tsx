"use client";

import { useState, useMemo, useCallback } from "react";
import {
  GitCompare,
  Trash2,
  Columns2,
  Rows3,
  Plus,
  Minus,
  Lightbulb,
  HelpCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

const FALLBACK_FAQ: FaqItem[] = [
  {
    question: "Is my text uploaded anywhere when I compare it?",
    answer:
      "No. The comparison runs entirely in your browser using JavaScript. Neither the original nor the changed text ever leaves your device, so your data stays completely private.",
  },
  {
    question: "What's the difference between side-by-side and unified view?",
    answer:
      "Side-by-side view shows the original and changed text in two parallel columns, making it easy to scan line-by-line. Unified view stacks the changes in a single column with added and removed lines interleaved, similar to a Git diff.",
  },
  {
    question: "What does 'ignore whitespace' do?",
    answer:
      "When enabled, lines that differ only by leading, trailing, or repeated spaces and tabs are treated as identical. This is helpful when indentation or formatting changed but the actual content did not.",
  },
  {
    question: "How is the diff calculated?",
    answer:
      "The tool uses a line-based longest common subsequence (LCS) algorithm to find the smallest set of additions and removals that turn the original text into the changed text — the same core approach used by tools like Git and diff.",
  },
  {
    question: "Can I compare code, JSON, or logs?",
    answer:
      "Yes. The diff checker is line-based and content-agnostic, so it works well for source code, configuration files, JSON, CSV, logs, or any plain text you paste in.",
  },
];

const SAMPLE_ORIGINAL = `function greet(name) {
  console.log("Hello " + name);
  return true;
}`;

const SAMPLE_CHANGED = `function greet(name) {
  console.log(\`Hello \${name}!\`);
  return name.length > 0;
}`;

type DiffType = "unchanged" | "added" | "removed";
type ViewMode = "split" | "unified";

interface DiffOp {
  type: DiffType;
  text: string;
}

interface CompareOptions {
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
}

function normalizeLine(line: string, options: CompareOptions): string {
  let result = line;
  if (options.ignoreWhitespace) result = result.trim().replace(/\s+/g, " ");
  if (options.ignoreCase) result = result.toLowerCase();
  return result;
}

/**
 * Line-based longest common subsequence diff. Builds an LCS length table and
 * backtracks to emit the minimal sequence of removed/added/unchanged lines.
 */
function computeDiff(
  original: string,
  changed: string,
  options: CompareOptions,
): DiffOp[] {
  const a = original.split("\n");
  const b = changed.split("\n");
  const normA = a.map((line) => normalizeLine(line, options));
  const normB = b.map((line) => normalizeLine(line, options));
  const n = a.length;
  const m = b.length;

  const table: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i][j] =
        normA[i] === normB[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (normA[i] === normB[j]) {
      ops.push({ type: "unchanged", text: a[i] });
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      ops.push({ type: "removed", text: a[i] });
      i++;
    } else {
      ops.push({ type: "added", text: b[j] });
      j++;
    }
  }
  while (i < n) ops.push({ type: "removed", text: a[i++] });
  while (j < m) ops.push({ type: "added", text: b[j++] });
  return ops;
}

interface SplitRow {
  left: { num: number; text: string } | null;
  right: { num: number; text: string } | null;
  leftType: DiffType | "empty";
  rightType: DiffType | "empty";
}

function toSplitRows(ops: DiffOp[]): SplitRow[] {
  const rows: SplitRow[] = [];
  let leftNum = 0;
  let rightNum = 0;
  let i = 0;
  while (i < ops.length) {
    if (ops[i].type === "unchanged") {
      leftNum++;
      rightNum++;
      rows.push({
        left: { num: leftNum, text: ops[i].text },
        right: { num: rightNum, text: ops[i].text },
        leftType: "unchanged",
        rightType: "unchanged",
      });
      i++;
      continue;
    }
    const removed: DiffOp[] = [];
    const added: DiffOp[] = [];
    while (i < ops.length && ops[i].type !== "unchanged") {
      if (ops[i].type === "removed") removed.push(ops[i]);
      else added.push(ops[i]);
      i++;
    }
    const max = Math.max(removed.length, added.length);
    for (let k = 0; k < max; k++) {
      const left = removed[k] ? { num: ++leftNum, text: removed[k].text } : null;
      const right = added[k] ? { num: ++rightNum, text: added[k].text } : null;
      rows.push({
        left,
        right,
        leftType: left ? "removed" : "empty",
        rightType: right ? "added" : "empty",
      });
    }
  }
  return rows;
}

interface UnifiedRow {
  type: DiffType;
  leftNum: number | null;
  rightNum: number | null;
  text: string;
}

function toUnifiedRows(ops: DiffOp[]): UnifiedRow[] {
  const rows: UnifiedRow[] = [];
  let leftNum = 0;
  let rightNum = 0;
  for (const op of ops) {
    if (op.type === "unchanged") {
      leftNum++;
      rightNum++;
      rows.push({ type: op.type, leftNum, rightNum, text: op.text });
    } else if (op.type === "removed") {
      leftNum++;
      rows.push({ type: op.type, leftNum, rightNum: null, text: op.text });
    } else {
      rightNum++;
      rows.push({ type: op.type, leftNum: null, rightNum, text: op.text });
    }
  }
  return rows;
}

const CELL_BG: Record<DiffType | "empty", string> = {
  unchanged: "",
  added: "bg-green-100 dark:bg-green-900/30",
  removed: "bg-red-100 dark:bg-red-900/30",
  empty: "bg-gray-50 dark:bg-gray-900/40",
};

function LineNumber({ value }: { value: number | null }) {
  return (
    <span className="select-none inline-block w-10 shrink-0 pr-3 text-right text-xs text-muted-foreground tabular-nums">
      {value ?? ""}
    </span>
  );
}

export function DiffCheckerClient({ dict }: { dict?: any }) {
  const t = dict?.diff_checker || {};
  const faqItems: FaqItem[] = dict?.page_diff_checker?.faq || FALLBACK_FAQ;

  const [original, setOriginal] = useState("");
  const [changed, setChanged] = useState("");
  const [view, setView] = useState<ViewMode>("split");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const ops = useMemo(
    () =>
      computeDiff(original, changed, { ignoreWhitespace, ignoreCase }),
    [original, changed, ignoreWhitespace, ignoreCase],
  );

  const counts = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const op of ops) {
      if (op.type === "added") added++;
      else if (op.type === "removed") removed++;
    }
    return { added, removed };
  }, [ops]);

  const splitRows = useMemo(() => toSplitRows(ops), [ops]);
  const unifiedRows = useMemo(() => toUnifiedRows(ops), [ops]);

  const hasInput = original.length > 0 || changed.length > 0;

  const handleClear = useCallback(() => {
    setOriginal("");
    setChanged("");
  }, []);

  const handleSample = useCallback(() => {
    setOriginal(SAMPLE_ORIGINAL);
    setChanged(SAMPLE_CHANGED);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-6xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sky-100 dark:bg-sky-900/30 mb-6">
              <GitCompare className="w-10 h-10 text-sky-600 dark:text-sky-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t.title || "Diff Checker"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {t.subtitle ||
                "Compare two texts and instantly highlight added and removed lines — privately in your browser."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Inputs */}
            <div className="w-full grid md:grid-cols-2 gap-6 items-start">
              <Card className="border-sky-100 dark:border-sky-900/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-sky-500" />
                    {t.original_label || "Original"}
                  </CardTitle>
                  <button
                    onClick={handleSample}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
                  >
                    {t.sample || "Sample"}
                  </button>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={original}
                    onChange={(e) => setOriginal(e.target.value)}
                    placeholder={
                      t.original_placeholder || "Paste the original text..."
                    }
                    spellCheck={false}
                    className="w-full min-h-[220px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors placeholder:text-muted-foreground"
                  />
                </CardContent>
              </Card>

              <Card className="border-sky-100 dark:border-sky-900/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-sky-500" />
                    {t.changed_label || "Changed"}
                  </CardTitle>
                  <button
                    onClick={handleClear}
                    disabled={!hasInput}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t.clear || "Clear"}
                  </button>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={changed}
                    onChange={(e) => setChanged(e.target.value)}
                    placeholder={
                      t.changed_placeholder || "Paste the changed text..."
                    }
                    spellCheck={false}
                    className="w-full min-h-[220px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors placeholder:text-muted-foreground"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Toolbar */}
            <div className="w-full flex flex-wrap items-center gap-4 mt-6 mb-4">
              <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => setView("split")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors",
                    view === "split"
                      ? "bg-sky-500 text-white"
                      : "hover:bg-sky-50 dark:hover:bg-sky-900/20",
                  )}
                >
                  <Columns2 className="w-4 h-4" />
                  {t.split_view || "Side by side"}
                </button>
                <button
                  onClick={() => setView("unified")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors",
                    view === "unified"
                      ? "bg-sky-500 text-white"
                      : "hover:bg-sky-50 dark:hover:bg-sky-900/20",
                  )}
                >
                  <Rows3 className="w-4 h-4" />
                  {t.unified_view || "Unified"}
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={ignoreWhitespace}
                  onCheckedChange={(checked) =>
                    setIgnoreWhitespace(checked === true)
                  }
                  className="data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                />
                <span className="text-sm">
                  {t.ignore_whitespace || "Ignore whitespace"}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={ignoreCase}
                  onCheckedChange={(checked) => setIgnoreCase(checked === true)}
                  className="data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                />
                <span className="text-sm">
                  {t.ignore_case || "Ignore case"}
                </span>
              </label>

              {hasInput && (
                <div className="flex items-center gap-4 ml-auto text-sm">
                  <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                    <Plus className="w-4 h-4" />
                    {counts.added} {t.added || "added"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                    <Minus className="w-4 h-4" />
                    {counts.removed} {t.removed || "removed"}
                  </span>
                </div>
              )}
            </div>

            {/* Diff output */}
            <Card className="w-full border-sky-100 dark:border-sky-900/50 shadow-sm">
              <CardContent className="p-0">
                {!hasInput ? (
                  <div className="p-10 text-center text-muted-foreground text-sm">
                    {t.empty_hint ||
                      "Paste text into both boxes to see the differences here."}
                  </div>
                ) : view === "split" ? (
                  <div className="overflow-x-auto">
                    <div className="min-w-[640px] font-mono text-sm">
                      {splitRows.map((row, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                        >
                          <div
                            className={cn(
                              "flex items-start px-2 py-1 border-r border-gray-100 dark:border-gray-800",
                              CELL_BG[row.leftType],
                            )}
                          >
                            <LineNumber value={row.left?.num ?? null} />
                            <span className="whitespace-pre-wrap break-words">
                              {row.left?.text}
                            </span>
                          </div>
                          <div
                            className={cn(
                              "flex items-start px-2 py-1",
                              CELL_BG[row.rightType],
                            )}
                          >
                            <LineNumber value={row.right?.num ?? null} />
                            <span className="whitespace-pre-wrap break-words">
                              {row.right?.text}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-[420px] font-mono text-sm">
                      {unifiedRows.map((row, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-start px-2 py-1 border-b border-gray-100 dark:border-gray-800 last:border-0",
                            CELL_BG[row.type],
                          )}
                        >
                          <LineNumber value={row.leftNum} />
                          <LineNumber value={row.rightNum} />
                          <span className="select-none inline-block w-4 shrink-0 text-muted-foreground">
                            {row.type === "added"
                              ? "+"
                              : row.type === "removed"
                                ? "-"
                                : " "}
                          </span>
                          <span className="whitespace-pre-wrap break-words">
                            {row.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Guide, Tips, FAQ */}
          <div className="w-full max-w-5xl mx-auto mt-16 px-4 space-y-16">
            <section>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  {t.guide_title || "How it Works"}
                </h2>
                <p className="text-muted-foreground">
                  {t.guide_desc ||
                    "Spot every change between two texts in three simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: t.step1_title || "Paste the original",
                    desc:
                      t.step1_desc ||
                      "Add the first version of your text or code into the Original box.",
                    icon: FileText,
                  },
                  {
                    title: t.step2_title || "Paste the changed version",
                    desc:
                      t.step2_desc ||
                      "Add the updated version into the Changed box to compare against.",
                    icon: ArrowRight,
                  },
                  {
                    title: t.step3_title || "Review the highlights",
                    desc:
                      t.step3_desc ||
                      "Added lines appear in green and removed lines in red, in split or unified view.",
                    icon: GitCompare,
                  },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    {t.tips_title || "Diff Tips"}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.tips_desc ||
                      "Get cleaner comparisons with these tips."}
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: t.tip1_title || "Ignore whitespace for reformats",
                      desc:
                        t.tip1_desc ||
                        "If only indentation or spacing changed, enable Ignore whitespace so the diff focuses on real content changes.",
                    },
                    {
                      title: t.tip2_title || "Use unified view for reviews",
                      desc:
                        t.tip2_desc ||
                        "Unified view mirrors the Git diff format many developers already read in pull requests and commit history.",
                    },
                    {
                      title: t.tip3_title || "Split view for translations",
                      desc:
                        t.tip3_desc ||
                        "Side-by-side view is ideal when comparing two full documents, drafts, or translations line by line.",
                    },
                    {
                      title: t.tip4_title || "Ignore case for prose",
                      desc:
                        t.tip4_desc ||
                        "When capitalization is not meaningful, enable Ignore case to avoid flagging purely cosmetic differences.",
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-sky-600 dark:text-sky-400 mb-2">
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

            <section className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 mb-4">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  {t.faq_title || "Frequently Asked Questions"}
                </h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx + 1}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>
        </div>
        <aside className="hidden lg:block w-64 shrink-0">
          <ToolsSidebar category="utility" dict={dict} />
        </aside>
      </div>
    </div>
  );
}
