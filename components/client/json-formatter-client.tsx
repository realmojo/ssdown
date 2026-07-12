"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Braces,
  Copy,
  Download,
  Trash2,
  Sparkles,
  Minimize2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

interface FaqItem {
  question: string;
  answer: string;
}

const FALLBACK_FAQ: FaqItem[] = [
  {
    question: "Is my JSON data uploaded to a server?",
    answer:
      "No. All formatting, minifying, and validation happens locally in your browser using JavaScript. Your JSON never leaves your device — it is never uploaded, logged, or stored anywhere.",
  },
  {
    question: "What's the difference between Format and Minify?",
    answer:
      "Format (also called beautify or pretty-print) adds indentation and line breaks to make JSON human-readable. Minify strips all unnecessary whitespace to produce the smallest possible output, which is ideal for transmitting data or reducing file size.",
  },
  {
    question: "How does validation report errors?",
    answer:
      "When your JSON is invalid, the tool shows the parser's error message along with the exact line and column where the problem occurs, so you can jump straight to the issue and fix it.",
  },
  {
    question: "What does the 'sort keys' option do?",
    answer:
      "Sort keys recursively reorders every object's properties alphabetically. This is useful for producing deterministic output, making diffs cleaner, or comparing two JSON documents that contain the same data in a different order.",
  },
  {
    question: "Is there a size limit for JSON?",
    answer:
      "There is no fixed limit. Because everything runs in your browser, you can format very large JSON documents, though extremely large files may be constrained by your device's available memory.",
  },
];

const SAMPLE_JSON =
  '{"name":"SSDown","type":"utility","tags":["json","formatter"],"nested":{"active":true,"count":42},"empty":null}';

type IndentType = "2" | "4" | "tab";

interface ParseError {
  message: string;
  line: number;
  column: number;
}

/** Compute 1-based line/column from a character offset into the source text. */
function positionToLineCol(text: string, position: number): {
  line: number;
  column: number;
} {
  const clamped = Math.max(0, Math.min(position, text.length));
  const upto = text.slice(0, clamped);
  const lines = upto.split("\n");
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

/** Extract a character position from a native JSON.parse error message. */
function extractPosition(message: string): number | null {
  const match = message.match(/position (\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

function parseJson(
  text: string,
): { ok: true; value: unknown } | { ok: false; error: ParseError } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON";
    const position = extractPosition(message);
    const { line, column } =
      position !== null
        ? positionToLineCol(text, position)
        : { line: 0, column: 0 };
    return { ok: false, error: { message, line, column } };
  }
}

/** Recursively sort object keys alphabetically for deterministic output. */
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

function indentValue(indent: IndentType): string | number {
  if (indent === "tab") return "\t";
  return parseInt(indent, 10);
}

function countKeys(value: unknown): number {
  if (Array.isArray(value)) {
    return value.reduce<number>((acc, item) => acc + countKeys(item), 0);
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.keys(obj).reduce<number>(
      (acc, key) => acc + 1 + countKeys(obj[key]),
      0,
    );
  }
  return 0;
}

function maxDepth(value: unknown): number {
  if (Array.isArray(value)) {
    return 1 + value.reduce<number>((acc, item) => Math.max(acc, maxDepth(item)), 0);
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return (
      1 +
      Object.values(obj).reduce<number>(
        (acc, item) => Math.max(acc, maxDepth(item)),
        0,
      )
    );
  }
  return 0;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface Stats {
  keys: number;
  depth: number;
  size: string;
}

export function JsonFormatterClient({ dict }: { dict?: any }) {
  const t = dict?.json_formatter || {};
  const faqItems: FaqItem[] = dict?.page_json_formatter?.faq || FALLBACK_FAQ;

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState<IndentType>("2");
  const [sortKeys, setSortKeys] = useState(false);
  const [error, setError] = useState<ParseError | null>(null);
  const [valid, setValid] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  const runProcess = useCallback(
    (mode: "format" | "minify") => {
      if (!input.trim()) {
        setError(null);
        setValid(null);
        setOutput("");
        setStats(null);
        return;
      }
      const parsed = parseJson(input);
      if (!parsed.ok) {
        setError(parsed.error);
        setValid(false);
        setOutput("");
        setStats(null);
        return;
      }
      const value = sortKeys ? sortKeysDeep(parsed.value) : parsed.value;
      const result =
        mode === "minify"
          ? JSON.stringify(value)
          : JSON.stringify(value, null, indentValue(indent));
      setOutput(result);
      setError(null);
      setValid(true);
      setStats({
        keys: countKeys(parsed.value),
        depth: maxDepth(parsed.value),
        size: formatBytes(new Blob([result]).size),
      });
    },
    [input, indent, sortKeys],
  );

  const handleValidate = useCallback(() => {
    if (!input.trim()) {
      setError(null);
      setValid(null);
      setStats(null);
      return;
    }
    const parsed = parseJson(input);
    if (!parsed.ok) {
      setError(parsed.error);
      setValid(false);
      setStats(null);
      return;
    }
    setError(null);
    setValid(true);
    setStats({
      keys: countKeys(parsed.value),
      depth: maxDepth(parsed.value),
      size: formatBytes(new Blob([input]).size),
    });
    toast.success(t.valid_toast || "Valid JSON");
  }, [input, t.valid_toast]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
    setValid(null);
    setStats(null);
  }, []);

  const handleSample = useCallback(() => {
    setInput(SAMPLE_JSON);
    setError(null);
    setValid(null);
    setOutput("");
    setStats(null);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success(t.copied || "Result copied to clipboard!");
    } catch {
      toast.error(t.copy_failed || "Failed to copy");
    }
  }, [output, t.copied, t.copy_failed]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "formatted.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const errorLabel = useMemo(() => {
    if (!error) return "";
    if (error.line > 0) {
      return `${t.error_at || "Error at line"} ${error.line}, ${
        t.column || "column"
      } ${error.column}: ${error.message}`;
    }
    return error.message;
  }, [error, t.error_at, t.column]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-5xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6">
              <Braces className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t.title || "JSON Formatter & Validator"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {t.subtitle ||
                "Beautify, minify, and validate JSON instantly — privately in your browser. Nothing is ever sent to a server."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Controls */}
            <div className="w-full flex flex-wrap items-center gap-3 mb-4">
              <button
                onClick={() => runProcess("format")}
                disabled={!input.trim()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                {t.format || "Format"}
              </button>
              <button
                onClick={() => runProcess("minify")}
                disabled={!input.trim()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minimize2 className="w-4 h-4" />
                {t.minify || "Minify"}
              </button>
              <button
                onClick={handleValidate}
                disabled={!input.trim()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                {t.validate || "Validate"}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">
                  {t.indent || "Indent"}
                </span>
                <Select
                  value={indent}
                  onValueChange={(val) => setIndent(val as IndentType)}
                >
                  <SelectTrigger className="w-28 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">{t.spaces_2 || "2 spaces"}</SelectItem>
                    <SelectItem value="4">{t.spaces_4 || "4 spaces"}</SelectItem>
                    <SelectItem value="tab">{t.tab || "Tab"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={sortKeys}
                  onCheckedChange={(checked) => setSortKeys(checked === true)}
                  className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
                <span className="text-sm">{t.sort_keys || "Sort keys"}</span>
              </label>
            </div>

            {/* Status banner */}
            {valid === true && !error && (
              <div className="w-full mb-4 flex items-center gap-2 p-3 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t.valid_message || "Valid JSON"}</span>
              </div>
            )}
            {error && (
              <div className="w-full mb-4 flex items-start gap-2 p-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="break-words">{errorLabel}</span>
              </div>
            )}

            {/* Input + Output panes */}
            <div className="w-full grid md:grid-cols-2 gap-6 items-start">
              <Card className="border-emerald-100 dark:border-emerald-900/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Braces className="w-5 h-5 text-emerald-500" />
                    {t.input_label || "Input JSON"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSample}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                    >
                      {t.sample || "Sample"}
                    </button>
                    <button
                      onClick={handleClear}
                      disabled={!input}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t.clear || "Clear"}
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setError(null);
                      setValid(null);
                    }}
                    placeholder={
                      t.input_placeholder || "Paste or type your JSON here..."
                    }
                    spellCheck={false}
                    className="w-full min-h-[320px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors placeholder:text-muted-foreground"
                  />
                </CardContent>
              </Card>

              <Card className="border-emerald-100 dark:border-emerald-900/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    {t.output_label || "Result"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      disabled={!output}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {t.copy || "Copy"}
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={!output}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t.download || "Download"}
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={output}
                    readOnly
                    placeholder={
                      t.output_placeholder ||
                      "Formatted JSON will appear here..."
                    }
                    spellCheck={false}
                    className="w-full min-h-[320px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-muted/30 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors placeholder:text-muted-foreground"
                  />
                  {stats && (
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {stats.keys} {t.keys || "keys"}
                      </span>
                      <span>
                        {t.depth || "depth"} {stats.depth}
                      </span>
                      <span>{stats.size}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
                    "Clean up and validate your JSON in three simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: t.step1_title || "Paste your JSON",
                    desc:
                      t.step1_desc ||
                      "Type or paste any JSON into the input box — valid or messy, it's fine.",
                    icon: Braces,
                  },
                  {
                    title: t.step2_title || "Choose an action",
                    desc:
                      t.step2_desc ||
                      "Format to beautify, Minify to compress, or Validate to check for errors.",
                    icon: ArrowRight,
                  },
                  {
                    title: t.step3_title || "Copy or download",
                    desc:
                      t.step3_desc ||
                      "Copy the result to your clipboard or download it as a .json file.",
                    icon: Download,
                  },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    {t.tips_title || "JSON Tips"}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.tips_desc ||
                      "Work with JSON more effectively with these tips."}
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: t.tip1_title || "Format before reviewing",
                      desc:
                        t.tip1_desc ||
                        "Beautified JSON with consistent indentation is far easier to read, review, and debug than a single compressed line.",
                    },
                    {
                      title: t.tip2_title || "Minify for production",
                      desc:
                        t.tip2_desc ||
                        "Strip whitespace before sending JSON over the network or storing it to reduce payload size and improve performance.",
                    },
                    {
                      title: t.tip3_title || "Sort keys for clean diffs",
                      desc:
                        t.tip3_desc ||
                        "Alphabetically sorting keys makes two JSON documents easier to compare and produces smaller, clearer version-control diffs.",
                    },
                    {
                      title: t.tip4_title || "Watch for trailing commas",
                      desc:
                        t.tip4_desc ||
                        "Unlike JavaScript objects, JSON does not allow trailing commas. The validator points you to the exact line and column when one slips in.",
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
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
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-4">
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
