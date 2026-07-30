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
        setStatus({ type: "error", message: "먼저 JSON을 입력해 주세요." });
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
        setStatus({ type: "success", message: "올바른 JSON입니다" });
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
      toast.success("결과를 클립보드에 복사했습니다");
    } catch {
      toast.error("결과를 복사하지 못했습니다");
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
    toast.success("formatted.json 파일을 내려받았습니다");
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
    <div className="w-full">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex w-full flex-col">
            <div className="hidden">
              <Braces className="w-10 h-10 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
              JSON 포매터
            </h1>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              JSON을 정렬·압축·검사하고, 명확한 오류 메시지와 한 번의 클릭으로 복사할 수 있습니다.
            </p>

            <Adsense slotId="7759160077" />

            {/* Toolbar */}
            <div className="w-full flex flex-wrap items-center gap-3 mb-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">들여쓰기:</span>
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
                    입력
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
                      다운로드
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={output}
                    readOnly
                    spellCheck={false}
                    placeholder="정리된 JSON이 여기에 표시됩니다…"
                    className="w-full min-h-[360px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors placeholder:text-muted-foreground"
                  />
                </CardContent>
              </Card>
            </div>
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
                  몇 초 만에 JSON을 정리하고 검사하세요.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-2">
                {[
                  {
                    step: 1,
                    title: "JSON 붙여넣기",
                    desc: "입력창에 JSON을 입력하거나 붙여넣으세요. 샘플을 불러오면 동작 방식을 확인할 수 있습니다.",
                    icon: Braces,
                  },
                  {
                    step: 2,
                    title: "작업 선택",
                    desc: "들여쓰기 크기를 고른 뒤 정렬, 압축, 검사 중 원하는 작업을 누르세요.",
                    icon: ArrowRight,
                  },
                  {
                    step: 3,
                    title: "복사 또는 다운로드",
                    desc: "결과를 클립보드에 복사하거나 .json 파일로 내려받아 재사용하세요.",
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
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-2 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">JSON 팁</h2>
                  <p className="text-muted-foreground">
                    JSON을 능숙하게 다루는 방법입니다.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "읽기 좋게 정렬하기",
                      desc: "간결하게 보려면 공백 2칸을, 깊게 중첩된 구조를 살펴볼 때는 4칸을 쓰세요.",
                    },
                    {
                      title: "배포용으로 압축하기",
                      desc: "API 응답이나 설정 파일에 JSON을 담기 전에 공백을 제거하면 용량이 줄고 전송이 빨라집니다.",
                    },
                    {
                      title: "쉼표에 주의하세요",
                      desc: "끝에 남은 쉼표와 작은따옴표가 JSON 오류의 가장 흔한 원인입니다. 검사기가 정확한 줄과 열을 알려 줍니다.",
                    },
                    {
                      title: "키에는 따옴표가 필요합니다",
                      desc: "자바스크립트 객체와 달리 JSON의 모든 키는 큰따옴표로 감싸야 합니다. 불리언과 null은 소문자여야 합니다.",
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
              <div className="text-center mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">자주 묻는 질문</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    q: "JSON을 어떻게 정렬하나요?",
                    a: "입력창에 JSON을 붙여넣고 들여쓰기 크기(공백 2칸, 4칸, 탭)를 고른 뒤 정렬을 누르세요. JSON을 해석해 읽기 쉽도록 일관된 들여쓰기로 다시 출력해 줍니다.",
                  },
                  {
                    q: "JSON을 어떻게 압축하나요?",
                    a: "압축 버튼을 누르면 불필요한 공백과 줄바꿈이 모두 제거됩니다. 유효한 JSON 중 가장 작은 형태가 되어 API 응답이나 설정 파일의 용량을 줄이는 데 적합합니다.",
                  },
                  {
                    q: "JSON이 올바르지 않으면 어떻게 되나요?",
                    a: "입력을 해석할 수 없으면 무엇이 잘못됐는지 설명하는 빨간 오류 메시지가 표시됩니다. 가능한 경우 문제가 있는 줄과 열까지 알려 주어 문법 오류를 빠르게 찾아 고칠 수 있습니다.",
                  },
                  {
                    q: "제 JSON 데이터는 안전한가요?",
                    a: "네. 해석, 정렬, 검사가 모두 자바스크립트로 전적으로 브라우저 안에서 이뤄집니다. JSON이 서버로 업로드되거나 저장되지 않습니다. 탭을 닫으면 데이터는 사라집니다.",
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
        <aside className="hidden shrink-0 xl:block xl:w-[200px]">
          <ToolsSidebar category="utility" dict={dict} />
        </aside>
      </div>
    </div>
  );
}
