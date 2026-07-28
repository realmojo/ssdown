"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Clock,
  Copy,
  ArrowRight,
  Calendar,
  Hash,
  Lightbulb,
  AlertCircle,
  Timer,
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

type TimestampUnit = "seconds" | "milliseconds";

interface DateBreakdown {
  local: string;
  utc: string;
  iso: string;
  relative: string;
}

const RELATIVE_UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
  { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
  { unit: "day", ms: 1000 * 60 * 60 * 24 },
  { unit: "hour", ms: 1000 * 60 * 60 },
  { unit: "minute", ms: 1000 * 60 },
  { unit: "second", ms: 1000 },
];

function formatRelative(targetMs: number, nowMs: number): string {
  const diff = targetMs - nowMs;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const { unit, ms } of RELATIVE_UNITS) {
    if (abs >= ms || unit === "second") {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return "now";
}

function toBreakdown(date: Date, nowMs: number): DateBreakdown {
  return {
    local: date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }),
    utc: date.toUTCString(),
    iso: date.toISOString(),
    relative: formatRelative(date.getTime(), nowMs),
  };
}

function toDatetimeLocalValue(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function TimestampConverterClient({ dict }: { dict?: any }) {
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [tsInput, setTsInput] = useState("");
  const [unit, setUnit] = useState<TimestampUnit>("seconds");
  const [dateInput, setDateInput] = useState("");

  // Initialize clock in effect to avoid hydration mismatch.
  useEffect(() => {
    setNowMs(Date.now());
    setDateInput(toDatetimeLocalValue(new Date()));
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleCopy = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label}을(를) 클립보드에 복사했습니다`);
    } catch {
      toast.error("복사하지 못했습니다");
    }
  }, []);

  const tsResult = useMemo<
    { ok: true; data: DateBreakdown } | { ok: false; error: string } | null
  >(() => {
    if (!tsInput.trim()) return null;
    if (!/^-?\d+$/.test(tsInput.trim())) {
      return { ok: false, error: "올바른 정수 타임스탬프를 입력해 주세요." };
    }
    const raw = Number(tsInput.trim());
    const ms = unit === "seconds" ? raw * 1000 : raw;
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) {
      return { ok: false, error: "타임스탬프가 유효 범위를 벗어났습니다." };
    }
    return { ok: true, data: toBreakdown(date, nowMs ?? Date.now()) };
  }, [tsInput, unit, nowMs]);

  const dateResult = useMemo<
    { ok: true; seconds: number; ms: number } | { ok: false; error: string } | null
  >(() => {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) {
      return { ok: false, error: "올바른 날짜와 시각을 선택해 주세요." };
    }
    return {
      ok: true,
      seconds: Math.floor(date.getTime() / 1000),
      ms: date.getTime(),
    };
  }, [dateInput]);

  const liveSeconds = nowMs !== null ? Math.floor(nowMs / 1000) : null;
  const liveMs = nowMs;

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-5xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 mb-6">
              <Clock className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              타임스탬프 변환기
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              유닉스 타임스탬프를 사람이 읽는 날짜로, 또는 그 반대로 변환합니다. 실시간 시계를 제공하며 초와 밀리초를 모두 지원합니다.
            </p>

            <Adsense slotId="7759160077" />

            {/* Live Clock */}
            <Card className="w-full border-indigo-100 dark:border-indigo-900/50 shadow-sm mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-indigo-500" />
                  현재 유닉스 시간
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-indigo-50/60 dark:bg-indigo-900/20">
                    <div className="min-w-0">
                      <span className="block text-xs text-muted-foreground mb-1">
                        Seconds
                      </span>
                      <span className="block text-2xl font-bold font-mono tabular-nums text-indigo-700 dark:text-indigo-300">
                        {liveSeconds ?? "—"}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        liveSeconds !== null &&
                        handleCopy(String(liveSeconds), "Timestamp (s)")
                      }
                      disabled={liveSeconds === null}
                      className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors disabled:opacity-40"
                      aria-label="초 단위 복사"
                    >
                      <Copy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-violet-50/60 dark:bg-violet-900/20">
                    <div className="min-w-0">
                      <span className="block text-xs text-muted-foreground mb-1">
                        Milliseconds
                      </span>
                      <span className="block text-2xl font-bold font-mono tabular-nums text-violet-700 dark:text-violet-300">
                        {liveMs ?? "—"}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        liveMs !== null &&
                        handleCopy(String(liveMs), "Timestamp (ms)")
                      }
                      disabled={liveMs === null}
                      className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-100 dark:hover:bg-violet-900/40 hover:border-violet-300 dark:hover:border-violet-700 transition-colors disabled:opacity-40"
                      aria-label="밀리초 단위 복사"
                    >
                      <Copy className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timestamp -> Date */}
            <Card className="w-full border-indigo-100 dark:border-indigo-900/50 shadow-sm mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-indigo-500" />
                  타임스탬프 → 날짜
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={tsInput}
                    onChange={(e) => setTsInput(e.target.value)}
                    placeholder="e.g. 1710000000"
                    className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors placeholder:text-muted-foreground"
                  />
                  <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-gray-50 dark:bg-gray-800 shrink-0">
                    {(["seconds", "milliseconds"] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => setUnit(u)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          unit === u
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {u === "seconds" ? "Seconds" : "Milliseconds"}
                      </button>
                    ))}
                  </div>
                </div>

                {tsResult && !tsResult.ok && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {tsResult.error}
                  </div>
                )}

                {tsResult && tsResult.ok && (
                  <div className="grid gap-2">
                    {(
                      [
                        { label: "Local", value: tsResult.data.local },
                        { label: "UTC", value: tsResult.data.utc },
                        { label: "ISO 8601", value: tsResult.data.iso },
                        { label: "Relative", value: tsResult.data.relative },
                      ] as const
                    ).map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40"
                      >
                        <div className="min-w-0">
                          <span className="block text-xs text-muted-foreground">
                            {row.label}
                          </span>
                          <span className="block text-sm font-medium break-all">
                            {row.value}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(row.value, row.label)}
                          className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                          aria-label={`${row.label} 복사`}
                        >
                          <Copy className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Date -> Timestamp */}
            <Card className="w-full border-indigo-100 dark:border-indigo-900/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  날짜 → 타임스탬프
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="datetime-local"
                  value={dateInput}
                  step={1}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                />

                {dateResult && !dateResult.ok && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {dateResult.error}
                  </div>
                )}

                {dateResult && dateResult.ok && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(
                      [
                        { label: "Unix (seconds)", value: String(dateResult.seconds) },
                        { label: "Unix (milliseconds)", value: String(dateResult.ms) },
                      ] as const
                    ).map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40"
                      >
                        <div className="min-w-0">
                          <span className="block text-xs text-muted-foreground">
                            {row.label}
                          </span>
                          <span className="block text-sm font-mono font-medium break-all">
                            {row.value}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(row.value, row.label)}
                          className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                          aria-label={`${row.label} 복사`}
                        >
                          <Copy className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  에포크 시간과 사람이 읽는 날짜를 몇 초 만에 변환하세요.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: "값 입력",
                    desc: "유닉스 타임스탬프를 입력하거나 날짜 선택기로 날짜와 시각을 고르세요.",
                    icon: Hash,
                  },
                  {
                    step: 2,
                    title: "결과 확인",
                    desc: "현지 시각, UTC, ISO 8601, 상대 시간, 유닉스 초·밀리초를 즉시 확인할 수 있습니다.",
                    icon: ArrowRight,
                  },
                  {
                    step: 3,
                    title: "즉시 복사",
                    desc: "복사 버튼을 누르면 값이 바로 클립보드에 담깁니다.",
                    icon: Copy,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-indigo-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">에포크 시간 팁</h2>
                  <p className="text-muted-foreground">
                    유닉스 타임스탬프를 정확하게 다루는 방법입니다.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "초와 밀리초의 차이",
                      desc: "10자리 숫자는 보통 초, 13자리 숫자는 밀리초입니다. 자바스크립트의 Date.now()는 밀리초를 반환하는 반면 대부분의 데이터베이스는 초 단위로 저장합니다.",
                    },
                    {
                      title: "에포크 기준 시각",
                      desc: "유닉스 시간은 1970년 1월 1일 00:00:00 UTC부터 시작합니다. 타임스탬프 0이 바로 그 시점이며, 음수는 그 이전 날짜를 뜻합니다.",
                    },
                    {
                      title: "저장은 항상 UTC로",
                      desc: "에포크 시간은 시간대와 무관합니다. 타임스탬프는 UTC로 저장하고 표시할 때만 현지 시각으로 바꾸면 시간이 어긋나는 오류를 피할 수 있습니다.",
                    },
                    {
                      title: "2038년 문제",
                      desc: "타임스탬프를 부호 있는 32비트 정수로 저장하는 시스템은 2038년 1월 19일에 값이 넘칩니다. 최신 시스템은 이를 피하려 64비트 정수를 씁니다.",
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
                <h2 className="text-2xl font-bold tracking-tight mb-4">자주 묻는 질문</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    q: "유닉스 타임스탬프가 무엇인가요?",
                    a: "A Unix timestamp (also called epoch time) is the number of seconds that have elapsed since 00:00:00 UTC on January 1, 1970, not counting leap seconds. It is a standard way to represent a point in time across systems and programming languages.",
                  },
                  {
                    q: "초와 밀리초는 무엇이 다른가요?",
                    a: "Unix timestamps are commonly stored in seconds (10 digits for current dates), but many systems such as JavaScript use milliseconds (13 digits). Our converter lets you toggle between the two so you can work with either format correctly.",
                  },
                  {
                    q: "이 변환기는 현지 시간대를 쓰나요, UTC를 쓰나요?",
                    a: "Both. The tool shows the converted date in your browser's local time zone, in UTC, and in ISO 8601 format, so you can compare them side by side without any manual offset calculation.",
                  },
                  {
                    q: "제 데이터는 안전한가요?",
                    a: "Yes. All conversions happen entirely in your browser using JavaScript. No timestamps or dates are ever sent to a server or stored anywhere, so your data stays completely private.",
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
