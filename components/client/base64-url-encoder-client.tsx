"use client";

import { useState, useCallback } from "react";
import {
  Binary,
  ArrowRight,
  Trash2,
  Copy,
  ArrowDownUp,
  Lock,
  Lightbulb,
  Link2,
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

type Mode = "base64" | "url";

function encodeBase64(input: string): string {
  return btoa(unescape(encodeURIComponent(input)));
}

function decodeBase64(input: string): string {
  return decodeURIComponent(escape(atob(input)));
}

function byteLength(input: string): number {
  return new TextEncoder().encode(input).length;
}

export function Base64UrlEncoderClient({ dict }: { dict?: any }) {
  const [mode, setMode] = useState<Mode>("base64");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [encodeFullUrl, setEncodeFullUrl] = useState(false);

  const handleEncode = useCallback(() => {
    if (!input) return;
    try {
      if (mode === "base64") {
        setOutput(encodeBase64(input));
      } else {
        setOutput(encodeFullUrl ? encodeURI(input) : encodeURIComponent(input));
      }
    } catch {
      toast.error(mode === "base64" ? "올바르지 않은 Base64 입력입니다" : "올바르지 않은 URL 입력입니다");
    }
  }, [input, mode, encodeFullUrl]);

  const handleDecode = useCallback(() => {
    if (!input) return;
    try {
      if (mode === "base64") {
        setOutput(decodeBase64(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch {
      toast.error(mode === "base64" ? "올바르지 않은 Base64 입력입니다" : "올바르지 않은 URL 입력입니다");
    }
  }, [input, mode]);

  const handleSwap = useCallback(() => {
    if (!output) return;
    setInput(output);
    setOutput("");
  }, [output]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("결과를 클립보드에 복사했습니다");
    } catch {
      toast.error("결과를 복사하지 못했습니다");
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
  }, []);

  const modeTabs: { value: Mode; label: string; icon: typeof Binary }[] = [
    { value: "base64", label: "Base64", icon: Binary },
    { value: "url", label: "URL", icon: Link2 },
  ];

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex w-full flex-col">
            <div className="hidden">
              <Binary className="w-10 h-10 text-lime-600 dark:text-lime-400" />
            </div>
            <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
              {dict?.base64_url_encoder?.title || "Base64 / URL 인코더"}
            </h1>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              {dict?.base64_url_encoder?.subtitle ||
                "브라우저에서 Base64와 URL 텍스트를 즉시 안전하게 인코딩·디코딩하세요."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Mode Toggle */}
            <div className="w-full flex justify-center mb-2">
              <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                {modeTabs.map((tab) => {
                  const active = mode === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setMode(tab.value)}
                      className={`inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                        active
                          ? "bg-lime-500 text-white shadow-sm"
                          : "text-muted-foreground hover:bg-lime-50 dark:hover:bg-lime-900/20"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Converter */}
            <Card className="w-full border-lime-100 dark:border-lime-900/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Binary className="w-5 h-5 text-lime-500" />
                  {mode === "base64" ? "Base64 Converter" : "URL Converter"}
                </CardTitle>
                <div className="flex items-center gap-2">
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
              <CardContent className="space-y-4">
                {/* Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      입력
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {byteLength(input)} bytes
                    </span>
                  </div>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="여기에 텍스트를 입력하거나 붙여넣으세요…"
                    className="w-full min-h-[160px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500 transition-colors placeholder:text-muted-foreground font-mono"
                  />
                </div>

                {/* URL full-encode option */}
                {mode === "url" && (
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={encodeFullUrl}
                      onChange={(e) => setEncodeFullUrl(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500/50 accent-lime-500"
                    />
                    전체 URL 인코딩 (encodeURI) — 다음 문자는 보존됩니다: <code className="px-1">:/?#</code>
                  </label>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleEncode}
                    disabled={!input}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-lime-500 text-white hover:bg-lime-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Encode
                  </button>
                  <button
                    onClick={handleDecode}
                    disabled={!input}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg border border-lime-300 dark:border-lime-800 text-lime-700 dark:text-lime-300 hover:bg-lime-50 dark:hover:bg-lime-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Decode
                  </button>
                  <button
                    onClick={handleSwap}
                    disabled={!output}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-lime-50 dark:hover:bg-lime-900/20 hover:border-lime-300 dark:hover:border-lime-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowDownUp className="w-4 h-4" />
                    Swap
                  </button>
                </div>

                {/* Output */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Output
                    </label>
                    <button
                      onClick={handleCopy}
                      disabled={!output}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-lime-50 dark:hover:bg-lime-900/20 hover:border-lime-300 dark:hover:border-lime-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </button>
                  </div>
                  <textarea
                    value={output}
                    readOnly
                    placeholder="결과가 여기에 표시됩니다…"
                    className="w-full min-h-[160px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500 transition-colors placeholder:text-muted-foreground font-mono"
                  />
                </div>
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
                  몇 초 만에 Base64와 URL 텍스트를 변환하세요.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-2">
                {[
                  {
                    step: 1,
                    title: "모드 선택",
                    desc: "필요한 변환 종류에 따라 Base64와 URL을 전환하세요.",
                    icon: Binary,
                  },
                  {
                    step: 2,
                    title: "인코딩 또는 디코딩",
                    desc: "Paste your text into the input, then press 인코딩 또는 디코딩 to transform it instantly.",
                    icon: ArrowRight,
                  },
                  {
                    step: 3,
                    title: "결과 복사",
                    desc: "결과를 클립보드에 복사하거나, 교체 기능으로 결과를 다시 입력해 역변환해 보세요.",
                    icon: Copy,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-lime-100 dark:bg-lime-900/30 text-lime-600 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-900/20 dark:to-green-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-2 text-lime-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">인코딩 팁</h2>
                  <p className="text-muted-foreground">
                    Base64·URL 변환을 더 잘 활용하는 방법입니다.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Base64는 암호화가 아닙니다",
                      desc: "Base64는 데이터를 ASCII로 안전하게 표현할 뿐이며 쉽게 되돌릴 수 있습니다. 비밀번호나 기밀을 보호하는 용도로는 절대 쓰지 마세요.",
                    },
                    {
                      title: "UTF-8 안전 처리",
                      desc: "이 도구는 Base64로 바꾸기 전에 UTF-8 바이트로 변환해 이모지와 악센트 문자를 올바르게 처리하며, 흔한 btoa() 오류를 피합니다.",
                    },
                    {
                      title: "부분 URL과 전체 URL",
                      desc: "쿼리 값 하나만 다룰 때는 일반 URL 인코딩을, 슬래시와 콜론을 유지한 완전한 링크가 필요할 때는 '전체 URL 인코딩'을 사용하세요.",
                    },
                    {
                      title: "교체 기능으로 확인하기",
                      desc: "인코딩한 뒤 교체와 디코딩을 눌러 원래 텍스트가 그대로 나오는지 확인해 보세요. 간단한 왕복 검증입니다.",
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-lime-600 dark:text-lime-400 mb-2">
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

            {/* Privacy note */}
            <section className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <Lock className="w-4 h-4 text-lime-500" />
              모든 변환은 브라우저 안에서 이뤄집니다. 어떤 데이터도 기기를 벗어나지 않습니다.
            </section>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto">
              <div className="text-center mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">자주 묻는 질문</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    q: "제 텍스트가 서버로 전송되나요?",
                    a: "No. All Base64 and URL encoding or decoding happens entirely in your browser using native JavaScript. Your text never leaves your device and is never uploaded or stored anywhere.",
                  },
                  {
                    q: "Base64 인코딩이 유니코드와 이모지를 지원하나요?",
                    a: "Yes. This tool is fully UTF-8 safe. It correctly encodes and decodes non-ASCII characters, accented letters, and emoji by handling the UTF-8 byte sequence before applying Base64.",
                  },
                  {
                    q: "URL 인코딩과 encodeURI는 무엇이 다른가요?",
                    a: "Standard URL encode (encodeURIComponent) escapes every reserved character, making it ideal for encoding a single query parameter value. The 'Encode full URL' option (encodeURI) preserves characters like :/?# so a complete URL stays valid and clickable.",
                  },
                  {
                    q: "Why do I get an '올바르지 않은 Base64 입력입니다' error?",
                    a: "That error appears when the input is not valid Base64, such as containing spaces, line breaks, or characters outside the Base64 alphabet. Make sure you are decoding a properly encoded Base64 string, or switch the mode to encode first.",
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
