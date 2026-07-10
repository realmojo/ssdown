"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Binary,
  Copy,
  Trash2,
  ArrowLeftRight,
  BookOpen,
  Lightbulb,
  FileInput,
  FileOutput,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

type Mode = "base64-encode" | "base64-decode" | "url-encode" | "url-decode";

interface ModeOption {
  value: Mode;
  label: string;
}

const MODES: ModeOption[] = [
  { value: "base64-encode", label: "Base64 Encode" },
  { value: "base64-decode", label: "Base64 Decode" },
  { value: "url-encode", label: "URL Encode" },
  { value: "url-decode", label: "URL Decode" },
];

const INVERSE_MODE: Record<Mode, Mode> = {
  "base64-encode": "base64-decode",
  "base64-decode": "base64-encode",
  "url-encode": "url-decode",
  "url-decode": "url-encode",
};

const FALLBACK_FAQ = [
  {
    question: "What is Base64 encoding used for?",
    answer:
      "Base64 encoding converts binary data into an ASCII text string. It's commonly used to embed small images as data URIs, attach files in emails, or safely transmit binary data through channels that only reliably handle text.",
  },
  {
    question: "Is Base64 the same as encryption?",
    answer:
      "No. Base64 is a reversible encoding, not encryption. Anyone can decode a Base64 string instantly, so it provides no security. Never use it to hide passwords, tokens, or other sensitive data.",
  },
  {
    question: "What is URL encoding (percent-encoding) used for?",
    answer:
      "URL encoding converts special characters (spaces, &, =, ?, and non-ASCII characters) into a percent-encoded format so they can be safely included in a URL or query string without breaking its structure.",
  },
  {
    question: "Does this tool support Korean and other Unicode text?",
    answer:
      "Yes. Both the Base64 and URL modes are fully UTF-8 safe, so Korean, Japanese, emoji, and any other Unicode characters are encoded and decoded correctly without corruption.",
  },
  {
    question: "Is my text sent to any server?",
    answer:
      "No. All encoding and decoding happens entirely in your browser using JavaScript. Your text never leaves your device and is never uploaded or stored anywhere.",
  },
];

interface ConversionResult {
  output: string;
  error: string | null;
}

function convert(mode: Mode, input: string): ConversionResult {
  if (!input) {
    return { output: "", error: null };
  }

  try {
    switch (mode) {
      case "base64-encode":
        return {
          output: btoa(unescape(encodeURIComponent(input))),
          error: null,
        };
      case "base64-decode":
        return {
          output: decodeURIComponent(escape(atob(input))),
          error: null,
        };
      case "url-encode":
        return { output: encodeURIComponent(input), error: null };
      case "url-decode":
        return { output: decodeURIComponent(input), error: null };
      default:
        return { output: "", error: null };
    }
  } catch {
    const isBase64 = mode === "base64-decode";
    return {
      output: "",
      error: isBase64 ? "Invalid Base64 input" : "Invalid URL-encoded input",
    };
  }
}

export function Base64UrlEncoderClient({ dict }: { dict?: any }) {
  const t = dict?.base64_url_encoder || {};
  const faqItems = dict?.page_base64_url_encoder?.faq || FALLBACK_FAQ;

  const [mode, setMode] = useState<Mode>("base64-encode");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => convert(mode, input), [mode, input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success(t.copied || "Result copied to clipboard!");
    } catch {
      toast.error(t.copy_failed || "Failed to copy");
    }
  }, [output, t.copied, t.copy_failed]);

  const handleSwap = useCallback(() => {
    if (!output) return;
    setInput(output);
    setMode((prev) => INVERSE_MODE[prev]);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-5xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-100 dark:bg-cyan-900/30 mb-6">
              <Binary className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t.title || "Base64 & URL Encoder/Decoder"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {t.subtitle ||
                "Encode or decode Base64 and URL-encoded text instantly in your browser. Free, fast, UTF-8 safe, and fully private."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Mode Selector */}
            <div className="w-full flex flex-wrap justify-center gap-2 mb-6">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    mode === m.value
                      ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                  )}
                >
                  {t[`mode_${m.value.replace(/-/g, "_")}`] || m.label}
                </button>
              ))}
            </div>

            {/* Input / Output */}
            <Card className="w-full border-cyan-100 dark:border-cyan-900/50 shadow-sm">
              <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
                {/* Input */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                    <FileInput className="w-4 h-4 text-cyan-500" />
                    {t.input_label || "Input"}
                  </div>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      t.input_placeholder || "Type or paste your text here..."
                    }
                    className="w-full min-h-[260px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors placeholder:text-muted-foreground font-mono"
                  />
                </div>

                {/* Output */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                    <FileOutput className="w-4 h-4 text-cyan-500" />
                    {t.output_label || "Result"}
                  </div>
                  <textarea
                    value={error ? "" : output}
                    readOnly
                    placeholder={
                      error || t.output_placeholder || "Result appears here..."
                    }
                    className={cn(
                      "w-full min-h-[260px] p-4 rounded-xl border bg-gray-50 dark:bg-gray-900/60 text-base leading-relaxed resize-y focus:outline-none transition-colors font-mono",
                      error
                        ? "border-red-300 dark:border-red-800 placeholder:text-red-500 dark:placeholder:text-red-400"
                        : "border-gray-200 dark:border-gray-700 placeholder:text-muted-foreground",
                    )}
                  />
                </div>
              </CardContent>
              <CardHeader className="flex flex-row flex-wrap items-center justify-end gap-2 pt-0">
                <button
                  onClick={handleSwap}
                  disabled={!output}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  {t.swap || "Swap"}
                </button>
                <button
                  onClick={handleClear}
                  disabled={!input}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t.clear || "Clear"}
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-sm hover:from-cyan-600 hover:to-sky-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {t.copy || "Copy Result"}
                </button>
              </CardHeader>
            </Card>
          </div>

          {/* Guide, Tips, FAQ */}
          <div className="w-full max-w-5xl mx-auto mt-16 px-4 space-y-16">
            {/* How it Works */}
            <section>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  {t.how_title || "How it Works"}
                </h2>
                <p className="text-muted-foreground">
                  {t.how_desc ||
                    "Convert between Base64, URL encoding, and plain text in seconds."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: t.step1_title || "Choose a Mode",
                    desc:
                      t.step1_desc ||
                      "Pick Base64 or URL, and whether you want to encode or decode your text.",
                    icon: Binary,
                  },
                  {
                    step: 2,
                    title: t.step2_title || "Paste Your Text",
                    desc:
                      t.step2_desc ||
                      "Type or paste your text into the input box. The result is computed live as you type.",
                    icon: FileInput,
                  },
                  {
                    step: 3,
                    title: t.step3_title || "Copy the Result",
                    desc:
                      t.step3_desc ||
                      "Copy the converted output with one click, or hit Swap to reverse the conversion.",
                    icon: ClipboardCheck,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-900/20 dark:to-sky-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    {t.tips_title || "Tips & Facts"}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.tips_desc ||
                      "Understand what these encodings do and when to use them."}
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: t.tip1_title || "Data URIs & Transport",
                      desc:
                        t.tip1_desc ||
                        "Base64 is commonly used to embed small images as data URIs or to safely transmit binary data as text.",
                    },
                    {
                      title: t.tip2_title || "Safe Query Strings",
                      desc:
                        t.tip2_desc ||
                        "URL encoding is needed for special characters in query strings, such as spaces, &, and = signs.",
                    },
                    {
                      title: t.tip3_title || "Not Encryption",
                      desc:
                        t.tip3_desc ||
                        "Base64 is NOT encryption. Anyone can decode it, so don't use it to hide sensitive data.",
                    },
                    {
                      title: t.tip4_title || "Unicode Ready",
                      desc:
                        t.tip4_desc ||
                        "This tool correctly handles Korean and other non-Latin text thanks to full UTF-8 support.",
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-cyan-600 dark:text-cyan-400 mb-2">
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
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-100 dark:bg-cyan-900/30 mb-4">
                  <BookOpen className="w-7 h-7 text-cyan-500" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  {t.faq_title || "Frequently Asked Questions"}
                </h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map(
                  (
                    faq: { question: string; answer: string },
                    idx: number,
                  ) => (
                    <AccordionItem key={idx} value={`item-${idx + 1}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ),
                )}
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
