"use client";

import { useState, useCallback } from "react";
import {
  Braces,
  Sparkles,
  Minimize2,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  Trash2,
  FileJson,
  Lightbulb,
  ArrowRight,
  Wand2,
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

type IndentOption = "2" | "4" | "tab";

type Status =
  | { type: "idle" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const INDENT_OPTIONS: { value: IndentOption; label: string }[] = [
  { value: "2", label: "2 Spaces" },
  { value: "4", label: "4 Spaces" },
  { value: "tab", label: "Tab" },
];

const SAMPLE_JSON = `{
  "name": "SSDown",
  "type": "utility",
  "version": 1.4,
  "active": true,
  "tags": ["json", "formatter", "validator"],
  "author": {
    "name": "SSDown Team",
    "url": "https://ssdown.app"
  },
  "features": [
    { "id": 1, "title": "Beautify" },
    { "id": 2, "title": "Minify" },
    { "id": 3, "title": "Validate" }
  ]
}`;

function getIndent(option: IndentOption): string | number {
  if (option === "tab") return "\t";
  return option === "4" ? 4 : 2;
}

function getErrorMessage(error: unknown, source: string): string {
  const raw = error instanceof Error ? error.message : "Invalid JSON.";
  const match = raw.match(/position (\d+)/i);
  if (!match) return raw;

  const position = Number(match[1]);
  if (!Number.isFinite(position)) return raw;

  const upToError = source.slice(0, position);
  const line = upToError.split("\n").length;
  const column = position - upToError.lastIndexOf("\n");
  return `${raw} (line ${line}, column ${column})`;
}

export function JsonFormatterClient({ dict }: { dict?: any }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState<IndentOption>("2");
  const [status, setStatus] = useState<Status>({ type: "idle" });

  const transform = useCallback(
    (mode: "beautify" | "minify" | "validate") => {
      if (!input.trim()) {
        setOutput("");
        setStatus({ type: "error", message: "Please enter some JSON first." });
        return;
      }

      try {
        const parsed: unknown = JSON.parse(input);
        if (mode === "beautify") {
          setOutput(JSON.stringify(parsed, null, getIndent(indent)));
        } else if (mode === "minify") {
          setOutput(JSON.stringify(parsed));
        } else {
          setOutput(JSON.stringify(parsed, null, getIndent(indent)));
        }
        setStatus({ type: "success", message: "Valid JSON" });
      } catch (error: unknown) {
        setOutput("");
        setStatus({ type: "error", message: getErrorMessage(error, input) });
      }
    },
    [input, indent]
  );

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Output copied to clipboard");
    } catch {
      toast.error("Failed to copy output");
    }
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "formatted.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Downloaded formatted.json");
  }, [output]);

  const handleSample = useCallback(() => {
    setInput(SAMPLE_JSON);
    setOutput("");
    setStatus({ type: "idle" });
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setStatus({ type: "idle" });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-5xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 mb-6">
              <Braces className="w-10 h-10 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              JSON Formatter
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              Beautify, minify, and validate JSON with clear error messages and
              one-click copy.
            </p>

            <Adsense slotId="7759160077" />

            {/* Toolbar */}
            <div className="w-full flex flex-wrap items-center gap-3 mb-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Indent:</span>
                <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5">
                  {INDENT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setIndent(option.value)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        indent === option.value
                          ? "bg-amber-500 text-white"
                          : "text-muted-foreground hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                <button
                  onClick={() => transform("beautify")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Beautify
                </button>
                <button
                  onClick={() => transform("minify")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  Minify
                </button>
                <button
                  onClick={() => transform("validate")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Validate
                </button>
              </div>
            </div>

            {/* Status */}
            {status.type !== "idle" && (
              <div
                className={`w-full mb-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
                  status.type === "success"
                    ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                    : "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                )}
                <span className="font-medium break-words">{status.message}</span>
              </div>
            )}

            {/* Input + Output */}
            <div className="w-full grid lg:grid-cols-2 gap-4">
              <Card className="w-full border-amber-100 dark:border-amber-900/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Braces className="w-5 h-5 text-amber-500" />
                    Input
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSample}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                    >
                      <FileJson className="w-3.5 h-3.5" />
                      Sample
                    </button>
                    <button
                      onClick={handleClear}
                      disabled={!input && !output}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    spellCheck={false}
                    placeholder='{ "hello": "world" }'
                    className="w-full min-h-[360px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors placeholder:text-muted-foreground"
                  />
                </CardContent>
              </Card>

              <Card className="w-full border-amber-100 dark:border-amber-900/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Output
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      disabled={!output}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={!output}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={output}
                    readOnly
                    spellCheck={false}
                    placeholder="Formatted JSON will appear here..."
                    className="w-full min-h-[360px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors placeholder:text-muted-foreground"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Guide, Tips, FAQ */}
          <div className="w-full max-w-5xl mx-auto mt-16 px-4 space-y-16">
            {/* How to Use */}
            <section>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  How to Use
                </h2>
                <p className="text-muted-foreground">
                  Clean up and validate your JSON in seconds.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: "Paste Your JSON",
                    desc: "Type or paste raw JSON into the input area. Load the sample to see how it works.",
                    icon: Braces,
                  },
                  {
                    step: 2,
                    title: "Choose an Action",
                    desc: "Pick an indent size, then Beautify to format, Minify to compress, or Validate to check syntax.",
                    icon: ArrowRight,
                  },
                  {
                    step: 3,
                    title: "Copy or Download",
                    desc: "Copy the result to your clipboard or download it as a .json file for reuse.",
                    icon: Wand2,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">JSON Tips</h2>
                  <p className="text-muted-foreground">
                    Work with JSON like a pro.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Beautify for Reading",
                      desc: "Use 2-space indentation for compact readability or 4 spaces for extra clarity when debugging deeply nested structures.",
                    },
                    {
                      title: "Minify for Production",
                      desc: "Strip whitespace before shipping JSON in API responses or config bundles to reduce payload size and speed up transfers.",
                    },
                    {
                      title: "Watch Your Commas",
                      desc: "Trailing commas and single quotes are the most common causes of invalid JSON. The validator points to the exact line and column.",
                    },
                    {
                      title: "Keys Need Quotes",
                      desc: "Unlike JavaScript objects, every JSON key must be wrapped in double quotes. Booleans and null must be lowercase.",
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">
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
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4">FAQ</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    q: "How do I format or beautify JSON?",
                    a: "Paste your JSON into the input area, choose an indentation size (2 spaces, 4 spaces, or Tab), and click Beautify. The tool parses your JSON and re-prints it with clean, consistent indentation so it is easy to read.",
                  },
                  {
                    q: "How do I minify JSON?",
                    a: "Click the Minify button to remove all unnecessary whitespace and line breaks. This produces the smallest valid representation of your JSON, which is ideal for reducing payload size in APIs and config files.",
                  },
                  {
                    q: "What happens when my JSON is invalid?",
                    a: "If the input cannot be parsed, the tool shows a red error message describing what went wrong. When possible, it also points to the line and column of the problem so you can locate and fix the syntax error quickly.",
                  },
                  {
                    q: "Is my JSON data private and secure?",
                    a: "Yes. All parsing, formatting, and validation happen entirely in your browser using JavaScript. Your JSON is never uploaded to any server or stored anywhere. Close the tab and your data is gone.",
                  },
                ].map((item, idx) => (
                  <AccordionItem key={idx} value={`item-${idx + 1}`}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
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
