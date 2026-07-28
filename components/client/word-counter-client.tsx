"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Type,
  FileText,
  Hash,
  Clock,
  AlignLeft,
  Lightbulb,
  ArrowRight,
  Trash2,
  BookOpen,
  LetterText,
  Ruler,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  averageWordLength: number;
}

function analyzeText(text: string): TextStats {
  if (!text.trim()) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: 0,
      averageWordLength: 0,
    };
  }

  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences = text
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0).length;
  const paragraphs = text
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  const averageWordLength =
    words > 0 ? Math.round((charactersNoSpaces / words) * 10) / 10 : 0;

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTime,
    averageWordLength,
  };
}

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. This classic pangram contains every letter of the English alphabet at least once. It has been used by typists and designers for decades.

Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line spacing, and letter spacing.

Good writing is clear thinking made visible. Whether you are crafting a blog post, an academic paper, or a social media caption, knowing your word count helps you stay on target. Most online articles perform best between 1,500 and 2,500 words, while social media posts should be concise and impactful.`;

export function WordCounterClient({ dict }: { dict?: any }) {
  const [text, setText] = useState("");

  const stats = useMemo(() => analyzeText(text), [text]);

  const handleClear = useCallback(() => {
    setText("");
  }, []);

  const handleSampleText = useCallback(() => {
    setText(SAMPLE_TEXT);
  }, []);

  const statCards = [
    {
      label: "Words",
      value: stats.words,
      icon: Type,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Characters",
      value: stats.characters,
      icon: LetterText,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "No Spaces",
      value: stats.charactersNoSpaces,
      icon: Hash,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "Sentences",
      value: stats.sentences,
      icon: AlignLeft,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      label: "Paragraphs",
      value: stats.paragraphs,
      icon: FileText,
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-900/20",
    },
    {
      label: "읽는 데 걸리는 시간",
      value: stats.readingTime > 0 ? `${stats.readingTime} min` : "0 min",
      icon: Clock,
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
    },
    {
      label: "평균 단어 길이",
      value: stats.averageWordLength > 0 ? stats.averageWordLength : 0,
      icon: Ruler,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-5xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 mb-6">
              <Type className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {dict?.word_counter?.title || "Word Counter"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {dict?.word_counter?.subtitle ||
                "Count words, characters, sentences, and paragraphs in real-time. Completely free, no signup required."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Stats Grid */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className={`flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 ${card.bg}`}
                >
                  <card.icon className={`w-5 h-5 ${card.color} mb-2`} />
                  <span className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {card.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Text Area */}
            <Card className="w-full border-emerald-100 dark:border-emerald-900/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                  입력한 텍스트
                </CardTitle>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSampleText}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
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
                  placeholder="여기에 텍스트를 입력하거나 붙여넣으세요…"
                  className="w-full min-h-[300px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors placeholder:text-muted-foreground"
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
                  몇 초 만에 정확한 텍스트 통계를 확인하세요.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: "붙여넣기 또는 입력",
                    desc: "직접 입력하거나 어디서든 내용을 붙여넣으세요.",
                    icon: Type,
                  },
                  {
                    step: 2,
                    title: "통계 보기",
                    desc: "단어, 글자, 문장, 문단 수 등을 실시간으로 확인할 수 있습니다.",
                    icon: ArrowRight,
                  },
                  {
                    step: 3,
                    title: "콘텐츠 다듬기",
                    desc: "통계를 활용해 분량을 맞추고 가독성을 높이며 글을 다듬어 보세요.",
                    icon: BookOpen,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">글쓰기 팁</h2>
                  <p className="text-muted-foreground">
                    글자 수 통계를 더 잘 활용하는 방법입니다.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "블로그 글 분량",
                      desc: "검색 최적화를 노린 블로그 글은 1,500~2,500단어를 목표로 하세요. 긴 글이 검색 결과에서 더 높은 순위를 얻는 경향이 있습니다.",
                    },
                    {
                      title: "소셜 미디어 게시물",
                      desc: "트윗은 280자, 인스타그램 캡션은 2,200자, 링크드인 게시물은 3,000자 이내로 유지하세요.",
                    },
                    {
                      title: "읽는 시간이 중요합니다",
                      desc: "읽는 데 7분 걸리는 글이 가장 반응이 좋습니다. 읽기 시간 통계로 분량을 가늠해 보세요.",
                    },
                    {
                      title: "문장 길이의 변화",
                      desc: "짧은 문장과 긴 문장을 섞어 쓰세요. 평균 단어 길이가 길다면 더 쉬운 표현으로 바꿔 가독성을 높이는 것이 좋습니다.",
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

            {/* FAQ */}
            <section className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4">자주 묻는 질문</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    q: "글자 수 세기는 어떻게 동작하나요?",
                    a: "Simply type or paste your text into the text area. The tool instantly analyzes your text and displays word count, character count (with and without spaces), sentence count, paragraph count, estimated reading time, and average word length.",
                  },
                  {
                    q: "글자 수나 단어 수 제한이 있나요?",
                    a: "No, there is no limit. You can paste text of any length and the counter will analyze it in real-time. The tool processes everything locally in your browser.",
                  },
                  {
                    q: "읽기 시간은 어떻게 계산되나요?",
                    a: "Reading time is estimated based on the average adult reading speed of 200 words per minute. The minimum displayed reading time is 1 minute.",
                  },
                  {
                    q: "문장 수는 어떻게 세나요?",
                    a: "Sentences are counted by detecting sentence-ending punctuation marks such as periods (.), exclamation marks (!), and question marks (?). Multiple consecutive punctuation marks (e.g., '...') are treated as a single sentence boundary.",
                  },
                  {
                    q: "제 텍스트는 안전한가요?",
                    a: "Yes, absolutely. All text analysis happens entirely in your browser. Your text is never sent to any server or stored anywhere. Close the tab and your text is gone.",
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
