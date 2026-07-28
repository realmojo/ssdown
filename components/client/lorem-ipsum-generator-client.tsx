"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Pilcrow,
  Lightbulb,
  ArrowRight,
  Trash2,
  Copy,
  RefreshCw,
  Settings2,
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

type Unit = "paragraphs" | "sentences" | "words";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur",
  "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui",
  "officia", "deserunt", "mollit", "anim", "id", "est", "laborum",
];

const CLASSIC_OPENING = ["lorem", "ipsum", "dolor", "sit", "amet"];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWord(): string {
  return LOREM_WORDS[randomInt(0, LOREM_WORDS.length - 1)];
}

function buildSentence(seed?: string[]): string {
  const length = randomInt(5, 15);
  const words: string[] = [];

  for (let i = 0; i < length; i += 1) {
    words.push(seed && seed[i] ? seed[i] : pickWord());
  }

  // Occasionally insert a comma somewhere in the middle.
  if (length > 6 && Math.random() < 0.5) {
    const commaIndex = randomInt(2, length - 3);
    words[commaIndex] = `${words[commaIndex]},`;
  }

  const sentence = words.join(" ");
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
}

function buildParagraph(startClassic: boolean): string {
  const count = randomInt(3, 6);
  const sentences: string[] = [];

  for (let i = 0; i < count; i += 1) {
    const seed = startClassic && i === 0 ? CLASSIC_OPENING : undefined;
    sentences.push(buildSentence(seed));
  }

  return sentences.join(" ");
}

interface GenerateOptions {
  unit: Unit;
  count: number;
  startClassic: boolean;
  wrapTags: boolean;
}

function generateLorem({ unit, count, startClassic, wrapTags }: GenerateOptions): string {
  const safeCount = Math.min(100, Math.max(1, count));

  if (unit === "words") {
    const words: string[] = [];
    for (let i = 0; i < safeCount; i += 1) {
      words.push(startClassic && i < CLASSIC_OPENING.length ? CLASSIC_OPENING[i] : pickWord());
    }
    const text = words.join(" ");
    return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
  }

  if (unit === "sentences") {
    const sentences: string[] = [];
    for (let i = 0; i < safeCount; i += 1) {
      sentences.push(buildSentence(startClassic && i === 0 ? CLASSIC_OPENING : undefined));
    }
    return sentences.join(" ");
  }

  const paragraphs: string[] = [];
  for (let i = 0; i < safeCount; i += 1) {
    const paragraph = buildParagraph(startClassic && i === 0);
    paragraphs.push(wrapTags ? `<p>${paragraph}</p>` : paragraph);
  }
  return paragraphs.join("\n\n");
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter((w) => w.length > 0).length;
}

export function LoremIpsumGeneratorClient({ dict }: { dict?: any }) {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [startClassic, setStartClassic] = useState(true);
  const [wrapTags, setWrapTags] = useState(false);
  const [output, setOutput] = useState("");

  const handleGenerate = useCallback(() => {
    setOutput(generateLorem({ unit, count, startClassic, wrapTags }));
  }, [unit, count, startClassic, wrapTags]);

  // Generate an initial sample after mount to avoid SSR/client hydration mismatch.
  useEffect(() => {
    setOutput(generateLorem({ unit: "paragraphs", count: 3, startClassic: true, wrapTags: false }));
  }, []);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("클립보드에 복사했습니다");
    } catch {
      toast.error("복사하지 못했습니다");
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setOutput("");
  }, []);

  const wordCount = countWords(output);
  const charCount = output.length;
  const wrapDisabled = unit !== "paragraphs";

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-5xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-100 to-pink-100 dark:from-fuchsia-900/30 dark:to-pink-900/30 mb-6">
              <Pilcrow className="w-10 h-10 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              로렘 입숨 생성기
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              디자인과 시안에 쓸 더미 문단, 문장, 단어를 만들어 줍니다.
            </p>

            <Adsense slotId="7759160077" />

            {/* Options */}
            <Card className="w-full border-fuchsia-100 dark:border-fuchsia-900/50 shadow-sm mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-fuchsia-500" />
                  Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label
                      htmlFor="lorem-unit"
                      className="block text-sm font-medium mb-1.5 text-muted-foreground"
                    >
                      Type
                    </label>
                    <select
                      id="lorem-unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as Unit)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-colors"
                    >
                      <option value="paragraphs">문단</option>
                      <option value="sentences">문장</option>
                      <option value="words">단어</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="lorem-count"
                      className="block text-sm font-medium mb-1.5 text-muted-foreground"
                    >
                      Count (1–100)
                    </label>
                    <input
                      id="lorem-count"
                      type="number"
                      min={1}
                      max={100}
                      value={count}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setCount(Number.isNaN(next) ? 1 : Math.min(100, Math.max(1, next)));
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={startClassic}
                      onChange={(e) => setStartClassic(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-fuchsia-600 focus:ring-fuchsia-500/50 accent-fuchsia-600"
                    />
                    <span className="text-sm">
                      &quot;Lorem ipsum dolor sit amet…&quot;으로 시작
                    </span>
                  </label>
                  <label
                    className={`inline-flex items-center gap-2.5 select-none ${
                      wrapDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={wrapTags && !wrapDisabled}
                      disabled={wrapDisabled}
                      onChange={(e) => setWrapTags(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-fuchsia-600 focus:ring-fuchsia-500/50 accent-fuchsia-600 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm">
                      문단을 &lt;p&gt; 태그로 감싸기
                    </span>
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-5">
                  <button
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {output ? "Regenerate" : "Generate"}
                  </button>
                  <button
                    onClick={handleCopy}
                    disabled={!output}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 hover:border-fuchsia-300 dark:hover:border-fuchsia-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={!output}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Output */}
            <Card className="w-full border-fuchsia-100 dark:border-fuchsia-900/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Pilcrow className="w-5 h-5 text-fuchsia-500" />
                  생성된 텍스트
                </CardTitle>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{wordCount} words</span>
                  <span>{charCount} characters</span>
                </div>
              </CardHeader>
              <CardContent>
                <textarea
                  value={output}
                  readOnly
                  placeholder="생성된 더미 텍스트가 여기에 표시됩니다…"
                  className="w-full min-h-[300px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-colors placeholder:text-muted-foreground"
                />
              </CardContent>
            </Card>
          </div>

          {/* Guide, Tips, FAQ */}
          <div className="w-full max-w-5xl mx-auto mt-16 px-4 space-y-16">
            {/* How to Use */}
            <section>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  이용 방법
                </h2>
                <p className="text-muted-foreground">
                  몇 초 만에 더미 텍스트를 만들어 보세요.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: "옵션 선택",
                    desc: "문단, 문장, 단어 중에서 고르고 레이아웃에 필요한 개수를 정하세요.",
                    icon: Settings2,
                  },
                  {
                    step: 2,
                    title: "Generate",
                    desc: "생성을 누르면 브라우저에서 즉시 로렘 입숨 더미 텍스트가 만들어집니다.",
                    icon: ArrowRight,
                  },
                  {
                    step: 3,
                    title: "Copy & Paste",
                    desc: "결과를 복사해 디자인이나 시안, HTML에 붙여넣으세요.",
                    icon: Copy,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/20 dark:to-pink-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-fuchsia-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">더미 텍스트 팁</h2>
                  <p className="text-muted-foreground">
                    더미 텍스트를 더 잘 활용하는 방법입니다.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "실제 분량에 맞추기",
                      desc: "실제 원고와 비슷한 분량으로 만들면 레이아웃이 현실적인 밀도를 반영합니다.",
                    },
                    {
                      title: "HTML 태그 활용",
                      desc: "Enable the <p> tag option to paste structured, markup-ready paragraphs directly into your HTML or CMS.",
                    },
                    {
                      title: "중립적인 내용 유지",
                      desc: "로렘 입숨의 뜻 없는 라틴어는 보는 사람이 문구를 읽고 반응하는 대신 디자인에 집중하게 해 줍니다.",
                    },
                    {
                      title: "배포 전에 교체하기",
                      desc: "더미 텍스트는 시안용입니다. 그대로 배포되는 일이 없도록 공개 전에 반드시 실제 내용으로 바꾸세요.",
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-fuchsia-600 dark:text-fuchsia-400 mb-2">
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
                <h2 className="text-2xl font-bold tracking-tight mb-4">자주 묻는 질문</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    q: "로렘 입숨이 무엇인가요?",
                    a: "Lorem Ipsum is placeholder text derived from a Latin passage by Cicero. It has been the industry-standard dummy text since the 1500s, used to fill layouts and mockups so designers can focus on visual structure without the distraction of readable content.",
                  },
                  {
                    q: "이 로렘 입숨 생성기는 어떻게 쓰나요?",
                    a: "Choose whether you want paragraphs, sentences, or words, set how many you need, then click Generate. Toggle the options to start with the classic 'Lorem ipsum dolor sit amet' opening or to wrap each paragraph in HTML <p> tags, and copy the result with one click.",
                  },
                  {
                    q: "이 로렘 입숨 생성기는 무료이고 안전한가요?",
                    a: "Yes. The tool is completely free with no signup required, and all text is generated locally in your browser. Nothing you generate is ever sent to a server or stored anywhere.",
                  },
                  {
                    q: "HTML에 바로 쓸 수 있는 더미 텍스트도 만들 수 있나요?",
                    a: "Absolutely. Enable the 'Wrap paragraphs in <p> 태그 옵션을 켜면 각 문단이 다음 태그로 감싸집니다: <p> element, ready to paste straight into your HTML markup or CMS.",
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
        <aside className="hidden lg:block w-64 shrink-0">
          <ToolsSidebar category="utility" dict={dict} />
        </aside>
      </div>
    </div>
  );
}
