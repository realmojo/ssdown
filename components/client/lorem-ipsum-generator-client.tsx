"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Text,
  Copy,
  RefreshCw,
  Code2,
  Lightbulb,
  HelpCircle,
  Settings2,
  MousePointerClick,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    question: "What is Lorem Ipsum?",
    answer:
      "Lorem Ipsum is placeholder text derived from a passage of classical Latin literature. Designers and developers use it to fill layouts with realistic-looking text so they can focus on visual design without being distracted by readable content.",
  },
  {
    question: "Why use placeholder text instead of real content?",
    answer:
      "Placeholder text lets you evaluate typography, spacing, and layout before the final copy is ready. Because Lorem Ipsum has a natural distribution of word lengths, it looks like real prose without drawing the reader's attention to the words themselves.",
  },
  {
    question: "Is the generated text private?",
    answer:
      "Yes. Everything is generated locally in your browser using JavaScript. No text is sent to a server, and nothing you generate is logged or stored anywhere.",
  },
  {
    question: "Can I generate words, sentences, or paragraphs?",
    answer:
      "Yes. You can choose to generate a specific number of words, sentences, or paragraphs, and optionally wrap paragraphs in HTML <p> tags for pasting directly into markup.",
  },
  {
    question: 'What does "start with Lorem ipsum dolor sit amet" do?',
    answer:
      "When enabled, the output begins with the traditional opening phrase 'Lorem ipsum dolor sit amet' before continuing with randomized words, matching the classic placeholder text convention.",
  },
];

const WORD_BANK = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et",
  "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis",
  "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea",
  "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit",
  "voluptate", "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur",
  "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt",
  "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est",
  "laborum", "perspiciatis", "unde", "omnis", "iste", "natus", "error",
  "accusantium", "doloremque", "laudantium", "totam", "rem", "aperiam",
  "eaque", "quae", "ab", "illo", "inventore", "veritatis", "quasi", "architecto",
  "beatae", "vitae", "dicta", "explicabo", "nemo", "ipsam", "quia", "voluptas",
];

const OPENER = "lorem ipsum dolor sit amet consectetur adipiscing elit";

type GenType = "paragraphs" | "sentences" | "words";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomWord(): string {
  return WORD_BANK[randomInt(0, WORD_BANK.length - 1)];
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function makeSentence(opener?: string): string {
  const length = randomInt(8, 16);
  const words: string[] = [];
  if (opener) words.push(...opener.split(" "));
  while (words.length < length) words.push(randomWord());
  return capitalize(words.join(" ")) + ".";
}

function makeParagraph(opener?: string): string {
  const sentenceCount = randomInt(3, 6);
  const sentences: string[] = [];
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(makeSentence(i === 0 ? opener : undefined));
  }
  return sentences.join(" ");
}

/** Build the raw text blocks (paragraphs, sentences, or a single words block). */
function generateBlocks(
  type: GenType,
  count: number,
  startWithLorem: boolean,
): string[] {
  const safeCount = Math.max(1, count);
  if (type === "words") {
    const words: string[] = [];
    if (startWithLorem) words.push(...OPENER.split(" "));
    while (words.length < safeCount) words.push(randomWord());
    return [capitalize(words.slice(0, safeCount).join(" ")) + "."];
  }
  if (type === "sentences") {
    const sentences: string[] = [];
    for (let i = 0; i < safeCount; i++) {
      sentences.push(makeSentence(i === 0 && startWithLorem ? OPENER : undefined));
    }
    return [sentences.join(" ")];
  }
  const paragraphs: string[] = [];
  for (let i = 0; i < safeCount; i++) {
    paragraphs.push(makeParagraph(i === 0 && startWithLorem ? OPENER : undefined));
  }
  return paragraphs;
}

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function LoremIpsumGeneratorClient({ dict }: { dict?: any }) {
  const t = dict?.lorem_ipsum_generator || {};
  const faqItems: FaqItem[] =
    dict?.page_lorem_ipsum_generator?.faq || FALLBACK_FAQ;

  const [type, setType] = useState<GenType>("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [htmlOutput, setHtmlOutput] = useState(false);
  const [blocks, setBlocks] = useState<string[]>([]);

  const generate = useCallback(() => {
    setBlocks(generateBlocks(type, count, startWithLorem));
  }, [type, count, startWithLorem]);

  // Regenerate whenever options change (client-only, so no hydration mismatch
  // from Math.random). Runs on mount to show an initial sample.
  useEffect(() => {
    setBlocks(generateBlocks(type, count, startWithLorem));
  }, [type, count, startWithLorem]);

  const output = useMemo(() => {
    if (!blocks.length) return "";
    if (htmlOutput) return blocks.map((b) => `<p>${b}</p>`).join("\n");
    return blocks.join("\n\n");
  }, [blocks, htmlOutput]);

  const plainText = useMemo(() => blocks.join(" "), [blocks]);
  const wordCount = useMemo(() => countWords(plainText), [plainText]);
  const charCount = output.length;

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success(t.copied || "Copied to clipboard!");
    } catch {
      toast.error(t.copy_failed || "Failed to copy");
    }
  }, [output, t.copied, t.copy_failed]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-6">
              <Text className="w-10 h-10 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t.title || "Lorem Ipsum Generator"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {t.subtitle ||
                "Generate placeholder text by paragraphs, sentences, or words — instantly and privately in your browser."}
            </p>

            <Adsense slotId="7759160077" />

            <Card className="w-full border-amber-100 dark:border-amber-900/50 shadow-sm">
              <CardContent className="pt-6 space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      {t.type_label || "Generate"}
                    </label>
                    <Select
                      value={type}
                      onValueChange={(val) => setType(val as GenType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paragraphs">
                          {t.type_paragraphs || "Paragraphs"}
                        </SelectItem>
                        <SelectItem value="sentences">
                          {t.type_sentences || "Sentences"}
                        </SelectItem>
                        <SelectItem value="words">
                          {t.type_words || "Words"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      {t.count_label || "How many?"}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={count}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setCount(
                          Number.isNaN(val) ? 1 : Math.min(500, Math.max(1, val)),
                        );
                      }}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                    <Checkbox
                      checked={startWithLorem}
                      onCheckedChange={(checked) =>
                        setStartWithLorem(checked === true)
                      }
                      className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                    />
                    <span className="text-sm">
                      {t.start_with_lorem ||
                        'Start with "Lorem ipsum dolor sit amet"'}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                    <Checkbox
                      checked={htmlOutput}
                      onCheckedChange={(checked) =>
                        setHtmlOutput(checked === true)
                      }
                      className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                    />
                    <span className="text-sm inline-flex items-center gap-1.5">
                      <Code2 className="w-4 h-4" />
                      {t.html_output || "Wrap in HTML <p> tags"}
                    </span>
                  </label>
                </div>

                <button
                  onClick={generate}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 transition-opacity"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t.generate || "Generate"}
                </button>

                {/* Output */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      {t.output_label || "Result"}
                    </label>
                    <button
                      onClick={handleCopy}
                      disabled={!output}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {t.copy || "Copy"}
                    </button>
                  </div>
                  <textarea
                    value={output}
                    readOnly
                    placeholder={
                      t.output_placeholder ||
                      "Generated placeholder text will appear here..."
                    }
                    className="w-full min-h-[280px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-muted/30 text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors placeholder:text-muted-foreground"
                  />
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {wordCount} {t.words || "words"}
                    </span>
                    <span>
                      {charCount} {t.characters || "characters"}
                    </span>
                  </div>
                </div>
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
                    "Create placeholder text in three simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: t.step1_title || "Choose the type",
                    desc:
                      t.step1_desc ||
                      "Pick whether to generate paragraphs, sentences, or individual words.",
                    icon: Settings2,
                  },
                  {
                    title: t.step2_title || "Set the amount",
                    desc:
                      t.step2_desc ||
                      "Enter how much text you need and toggle HTML output if you want <p> tags.",
                    icon: MousePointerClick,
                  },
                  {
                    title: t.step3_title || "Copy the text",
                    desc:
                      t.step3_desc ||
                      "Click Copy to grab the placeholder text and paste it into your design or code.",
                    icon: Copy,
                  },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    {t.tips_title || "Placeholder Tips"}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.tips_desc ||
                      "Get the most out of placeholder text with these tips."}
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: t.tip1_title || "Match the real content length",
                      desc:
                        t.tip1_desc ||
                        "Generate roughly the amount of text the final copy will use so your layout reflects real-world spacing.",
                    },
                    {
                      title: t.tip2_title || "Use HTML output for markup",
                      desc:
                        t.tip2_desc ||
                        "Enable the HTML option to get paragraphs wrapped in <p> tags you can paste straight into templates.",
                    },
                    {
                      title: t.tip3_title || "Words for labels and buttons",
                      desc:
                        t.tip3_desc ||
                        "Generate just a few words when you need placeholder labels, tags, or button text rather than full paragraphs.",
                    },
                    {
                      title: t.tip4_title || "Replace before you ship",
                      desc:
                        t.tip4_desc ||
                        "Placeholder text is for design only — always swap it for real content before publishing to avoid embarrassing leftovers.",
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

            <section className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-4">
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
