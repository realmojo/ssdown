"use client";

import { useState, useMemo, useCallback } from "react";
import {
  CaseSensitive,
  Type,
  ArrowRight,
  Copy,
  Check,
  Trash2,
  FileText,
  Lightbulb,
  ClipboardCheck,
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

function tokenize(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^a-zA-Z0-9]+/)
    .filter((word) => word.length > 0);
}

function toUpperCase(text: string): string {
  return text.toUpperCase();
}

function toLowerCase(text: string): string {
  return text.toLowerCase();
}

function toTitleCase(text: string): string {
  return text.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
}

function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s*\w)/g, (chunk) => chunk.toUpperCase());
}

function toCamelCase(text: string): string {
  return tokenize(text)
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join("");
}

function toPascalCase(text: string): string {
  return tokenize(text)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

function toSnakeCase(text: string): string {
  return tokenize(text)
    .map((word) => word.toLowerCase())
    .join("_");
}

function toKebabCase(text: string): string {
  return tokenize(text)
    .map((word) => word.toLowerCase())
    .join("-");
}

function toConstantCase(text: string): string {
  return tokenize(text)
    .map((word) => word.toUpperCase())
    .join("_");
}

function toAlternatingCase(text: string): string {
  let letterIndex = 0;
  return text
    .split("")
    .map((char) => {
      if (!/[a-zA-Z]/.test(char)) return char;
      const result =
        letterIndex % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
      letterIndex += 1;
      return result;
    })
    .join("");
}

function toInverseCase(text: string): string {
  return text
    .split("")
    .map((char) =>
      char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase(),
    )
    .join("");
}

interface CaseConversion {
  key: string;
  label: string;
  transform: (text: string) => string;
}

const CONVERSIONS: CaseConversion[] = [
  { key: "uppercase", label: "UPPERCASE", transform: toUpperCase },
  { key: "lowercase", label: "lowercase", transform: toLowerCase },
  { key: "title", label: "Title Case", transform: toTitleCase },
  { key: "sentence", label: "Sentence case", transform: toSentenceCase },
  { key: "camel", label: "camelCase", transform: toCamelCase },
  { key: "pascal", label: "PascalCase", transform: toPascalCase },
  { key: "snake", label: "snake_case", transform: toSnakeCase },
  { key: "kebab", label: "kebab-case", transform: toKebabCase },
  { key: "constant", label: "CONSTANT_CASE", transform: toConstantCase },
  { key: "alternating", label: "alternating case", transform: toAlternatingCase },
  { key: "inverse", label: "InVeRsE case", transform: toInverseCase },
];

const SAMPLE_TEXT =
  "The quick brown fox jumps over the lazy dog. Convert this text into any case you need!";

const FAQ_ITEMS = [
  {
    q: "What is a text case converter?",
    a: "A text case converter is a free online tool that instantly transforms your text into different letter cases such as UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case. Just type or paste your text and copy the result you need.",
  },
  {
    q: "Is my text private and secure?",
    a: "Yes. All conversions happen entirely in your browser using JavaScript. Your text is never uploaded to a server or stored anywhere. Close the tab and your text is gone.",
  },
  {
    q: "What is the difference between camelCase, PascalCase, and snake_case?",
    a: "camelCase joins words with the first word lowercase and each following word capitalized (myVariableName). PascalCase capitalizes every word (MyVariableName). snake_case joins words with underscores in lowercase (my_variable_name). These are commonly used naming conventions in programming.",
  },
  {
    q: "Is there a character limit?",
    a: "No. There is no limit. You can paste text of any length and every conversion updates in real-time as you type, all processed locally in your browser.",
  },
];

export function TextCaseConverterClient({ dict }: { dict?: any }) {
  const [text, setText] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const results = useMemo(
    () =>
      CONVERSIONS.map((conversion) => ({
        key: conversion.key,
        label: conversion.label,
        value: conversion.transform(text),
      })),
    [text],
  );

  const charCount = text.length;
  const wordCount = useMemo(
    () => text.trim().split(/\s+/).filter((word) => word.length > 0).length,
    [text],
  );

  const handleClear = useCallback(() => {
    setText("");
  }, []);

  const handleSampleText = useCallback(() => {
    setText(SAMPLE_TEXT);
  }, []);

  const handleCopy = useCallback(async (key: string, value: string) => {
    if (!value) {
      toast.error("Nothing to copy yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      toast.success("Copied to clipboard!");
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      toast.error("Failed to copy. Please try again.");
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-5xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 mb-6">
              <CaseSensitive className="w-10 h-10 text-teal-600 dark:text-teal-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Text Case Converter
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              Convert text between UPPERCASE, lowercase, Title Case, camelCase,
              snake_case and more, instantly.
            </p>

            <Adsense slotId="7759160077" />

            {/* Input */}
            <Card className="w-full border-teal-100 dark:border-teal-900/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-teal-500" />
                  Your Text
                  <span className="text-sm font-normal text-muted-foreground">
                    {charCount} chars &middot; {wordCount} words
                  </span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSampleText}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Sample
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={!text}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type or paste your text here..."
                  className="w-full min-h-[180px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors placeholder:text-muted-foreground"
                />
              </CardContent>
            </Card>

            {/* Conversion Results */}
            <div className="w-full grid sm:grid-cols-2 gap-3 mt-6">
              {results.map((result) => (
                <div
                  key={result.key}
                  className="flex flex-col p-4 rounded-xl border border-teal-100 dark:border-teal-900/40 bg-teal-50/40 dark:bg-teal-900/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                      {result.label}
                    </span>
                    <button
                      onClick={() => handleCopy(result.key, result.value)}
                      aria-label={`Copy ${result.label}`}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                    >
                      {copiedKey === result.key ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copiedKey === result.key ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 break-words min-h-[1.25rem] whitespace-pre-wrap">
                    {result.value || (
                      <span className="text-muted-foreground italic">
                        Result will appear here
                      </span>
                    )}
                  </p>
                </div>
              ))}
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
                  Change your text case in three simple steps.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: "Enter Your Text",
                    desc: "Type directly or paste content from any source into the input box.",
                    icon: Type,
                  },
                  {
                    step: 2,
                    title: "See Every Case",
                    desc: "All conversions update live, from UPPERCASE to camelCase and snake_case.",
                    icon: ArrowRight,
                  },
                  {
                    step: 3,
                    title: "Copy & Use",
                    desc: "Click the copy button next to the case you need and paste it anywhere.",
                    icon: ClipboardCheck,
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-teal-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Handy Tips</h2>
                  <p className="text-muted-foreground">
                    Pick the right case for the right job.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Code Naming Conventions",
                      desc: "Use camelCase for JavaScript variables, PascalCase for classes and React components, and snake_case for Python and database columns.",
                    },
                    {
                      title: "Clean Up SHOUTY Text",
                      desc: "Accidentally typed with Caps Lock on? Paste it here and grab the Sentence case or lowercase version in one click.",
                    },
                    {
                      title: "Headlines & Titles",
                      desc: "Title Case makes headings look polished for blog posts, articles, and slide decks.",
                    },
                    {
                      title: "URLs & Slugs",
                      desc: "kebab-case is the standard for readable, SEO-friendly URL slugs and CSS class names.",
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-teal-600 dark:text-teal-400 mb-2">
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
                {FAQ_ITEMS.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx + 1}`}>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
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
