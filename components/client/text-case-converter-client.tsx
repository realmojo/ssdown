"use client";

import { useState, useMemo, useCallback } from "react";
import {
  CaseSensitive,
  Copy,
  Trash2,
  Type,
  ArrowRight,
  Lightbulb,
  ClipboardCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

const FALLBACK_FAQ: FaqItem[] = [
  {
    question: "What is camelCase used for?",
    answer:
      "camelCase is the standard naming convention for variables, functions, and object properties in JavaScript and TypeScript. It joins words together without spaces, lowercasing the first word and capitalizing every subsequent word (e.g. myVariableName).",
  },
  {
    question: "What's the difference between snake_case and kebab-case?",
    answer:
      "Both join words in lowercase, but snake_case uses underscores (my_variable_name) while kebab-case uses hyphens (my-variable-name). snake_case is common in Python and database columns, whereas kebab-case is used for URLs, file names, and CSS class names.",
  },
  {
    question: "Is my text stored anywhere?",
    answer:
      "No. All conversion happens locally in your browser using JavaScript. Your text is never uploaded to a server or stored anywhere, so it stays completely private.",
  },
  {
    question: "Does it support non-English or Unicode text?",
    answer:
      "Partially. Case conversion works reliably for Latin-based scripts. Scripts without a concept of letter casing, such as Korean, Chinese, or Japanese, will pass through unchanged for upper/lowercase transforms, and word-splitting formats may not produce meaningful results for them.",
  },
  {
    question: "Is there a text length limit?",
    answer:
      "No. You can paste text of any length and it will be converted instantly. Because everything runs in your browser, there are no upload limits or server-side restrictions.",
  },
];

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog.";

// --- Pure string-transform helpers ---

/**
 * Split text into words on whitespace, hyphens, underscores, and existing
 * camelCase boundaries so the tool can convert *between* naming conventions.
 */
function splitWords(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s\-_]+/)
    .filter(Boolean);
}

function capitalize(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function toUpperCaseText(text: string): string {
  return text.toUpperCase();
}

function toLowerCaseText(text: string): string {
  return text.toLowerCase();
}

function toTitleCase(text: string): string {
  return text.toLowerCase().replace(/(^|\s)(\S)/g, (m) => m.toUpperCase());
}

function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (m) => m.toUpperCase());
}

function toCamelCase(text: string): string {
  return splitWords(text)
    .map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word)))
    .join("");
}

function toPascalCase(text: string): string {
  return splitWords(text).map(capitalize).join("");
}

function toSnakeCase(text: string): string {
  return splitWords(text)
    .map((word) => word.toLowerCase())
    .join("_");
}

function toKebabCase(text: string): string {
  return splitWords(text)
    .map((word) => word.toLowerCase())
    .join("-");
}

function toConstantCase(text: string): string {
  return splitWords(text)
    .map((word) => word.toUpperCase())
    .join("_");
}

function toAlternatingCase(text: string): string {
  return Array.from(text)
    .map((ch, index) => (index % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase()))
    .join("");
}

function toInverseCase(text: string): string {
  return Array.from(text)
    .map((ch) =>
      ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase(),
    )
    .join("");
}

interface CaseType {
  id: string;
  label: string;
  transform: (text: string) => string;
}

const CASE_TYPES: CaseType[] = [
  { id: "upper", label: "UPPERCASE", transform: toUpperCaseText },
  { id: "lower", label: "lowercase", transform: toLowerCaseText },
  { id: "title", label: "Title Case", transform: toTitleCase },
  { id: "sentence", label: "Sentence case", transform: toSentenceCase },
  { id: "camel", label: "camelCase", transform: toCamelCase },
  { id: "pascal", label: "PascalCase", transform: toPascalCase },
  { id: "snake", label: "snake_case", transform: toSnakeCase },
  { id: "kebab", label: "kebab-case", transform: toKebabCase },
  { id: "constant", label: "CONSTANT_CASE", transform: toConstantCase },
  { id: "alternating", label: "aLtErNaTiNg", transform: toAlternatingCase },
  { id: "inverse", label: "InVeRsE", transform: toInverseCase },
];

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function TextCaseConverterClient({ dict }: { dict?: any }) {
  const t = dict?.text_case_converter || {};
  const [text, setText] = useState("");
  const [activeCase, setActiveCase] = useState<string | null>(null);

  const output = useMemo(() => {
    if (!activeCase) return "";
    const found = CASE_TYPES.find((c) => c.id === activeCase);
    return found ? found.transform(text) : "";
  }, [text, activeCase]);

  const wordCount = useMemo(() => countWords(text), [text]);
  const charCount = text.length;

  const handleClear = useCallback(() => {
    setText("");
    setActiveCase(null);
  }, []);

  const handleSample = useCallback(() => {
    setText(SAMPLE_TEXT);
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

  const faqItems: FaqItem[] = dict?.page_text_case_converter?.faq || FALLBACK_FAQ;

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-5xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-6">
              <CaseSensitive className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t.title || "Text Case Converter"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {t.subtitle ||
                "Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, and more — instantly and privately in your browser."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Case type buttons */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {CASE_TYPES.map((caseType) => {
                const isActive = activeCase === caseType.id;
                return (
                  <button
                    key={caseType.id}
                    onClick={() => setActiveCase(caseType.id)}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-medium border transition-colors text-center truncate",
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-transparent shadow-sm"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
                    )}
                  >
                    {caseType.label}
                  </button>
                );
              })}
            </div>

            {/* Input + Output panes */}
            <div className="w-full grid md:grid-cols-2 gap-6 items-start">
              {/* Input */}
              <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Type className="w-5 h-5 text-indigo-500" />
                    {t.input_label || "Your Text"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSample}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                    >
                      {t.sample || "Sample"}
                    </button>
                    <button
                      onClick={handleClear}
                      disabled={!text}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t.clear || "Clear"}
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      t.input_placeholder || "Type or paste your text here..."
                    }
                    className="w-full min-h-[280px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors placeholder:text-muted-foreground"
                  />
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {wordCount} {t.words || "words"}
                    </span>
                    <span>
                      {charCount} {t.characters || "characters"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Output */}
              <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardCheck className="w-5 h-5 text-indigo-500" />
                    {t.output_label || "Result"}
                  </CardTitle>
                  <button
                    onClick={handleCopy}
                    disabled={!output}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {t.copy || "Copy Result"}
                  </button>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={output}
                    readOnly
                    placeholder={
                      t.output_placeholder ||
                      "Pick a case format above to see the result here..."
                    }
                    className="w-full min-h-[280px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-muted/30 text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors placeholder:text-muted-foreground"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Guide, Tips, FAQ */}
          <div className="w-full max-w-5xl mx-auto mt-16 px-4 space-y-16">
            {/* How it Works */}
            <section>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  {t.guide_title || "How it Works"}
                </h2>
                <p className="text-muted-foreground">
                  {t.guide_desc ||
                    "Convert text to any case format in three simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: t.step1_title || "Paste or Type",
                    desc:
                      t.step1_desc ||
                      "Enter your text in the input box by typing or pasting from any source.",
                    icon: Type,
                  },
                  {
                    step: 2,
                    title: t.step2_title || "Pick a Case Format",
                    desc:
                      t.step2_desc ||
                      "Click any case format such as UPPERCASE, camelCase, or snake_case to transform your text.",
                    icon: ArrowRight,
                  },
                  {
                    step: 3,
                    title: t.step3_title || "Copy the Result",
                    desc:
                      t.step3_desc ||
                      "Click Copy Result to copy the converted text to your clipboard.",
                    icon: Copy,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    {t.tips_title || "Case Convention Tips"}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.tips_desc ||
                      "Choose the right case for the right context."}
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: t.tip1_title || "camelCase & PascalCase",
                      desc:
                        t.tip1_desc ||
                        "Use camelCase for JavaScript and TypeScript variables and functions, and PascalCase for class names, components, and types.",
                    },
                    {
                      title: t.tip2_title || "snake_case",
                      desc:
                        t.tip2_desc ||
                        "Use snake_case for Python variables and functions, and for database column and table names.",
                    },
                    {
                      title: t.tip3_title || "kebab-case",
                      desc:
                        t.tip3_desc ||
                        "Use kebab-case for URLs, file names, and CSS class names, since hyphens are URL-safe and readable.",
                    },
                    {
                      title: t.tip4_title || "Title Case",
                      desc:
                        t.tip4_desc ||
                        "Use Title Case for headlines, article titles, and headings to give them a polished, professional look.",
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
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
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  {t.faq_title || "FAQ"}
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
