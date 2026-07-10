"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Clock,
  Copy,
  ArrowRight,
  CalendarClock,
  Hourglass,
  Lightbulb,
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

const FALLBACK_FAQ = [
  {
    question: "What is a Unix timestamp?",
    answer:
      "A Unix timestamp is the number of seconds that have elapsed since the Unix epoch, which is 00:00:00 UTC on January 1, 1970. It is a compact, timezone-independent way to represent a specific point in time and is used extensively across programming languages, databases, and APIs.",
  },
  {
    question:
      "Why does JavaScript use milliseconds while Unix and most systems use seconds?",
    answer:
      "JavaScript's Date.now() and getTime() return the number of milliseconds since the epoch for higher precision, whereas most Unix tools, databases, and APIs (like the standard time() call) use seconds. This 1000x difference is a common source of bugs, so always confirm which unit an API expects.",
  },
  {
    question: "How do I convert between seconds and milliseconds?",
    answer:
      "To convert seconds to milliseconds, multiply by 1000. To convert milliseconds to seconds, divide by 1000 (and typically floor the result to drop the fractional part). This tool auto-detects the unit based on digit count, treating values with 13 or more digits as milliseconds.",
  },
  {
    question: "What timezone does this tool use for local time?",
    answer:
      "Local time is displayed using your browser's own system timezone, which is detected automatically. The tool also shows the detected timezone name alongside the UTC and ISO 8601 representations so you can compare them directly.",
  },
  {
    question: "Is this tool accurate and private?",
    answer:
      "Yes. All conversions happen locally in your browser using the native JavaScript Date object. Nothing is sent to a server, so your data stays private and results are instant with no network round-trip.",
  },
];

interface ParsedTimestamp {
  date: Date;
  local: string;
  utc: string;
  iso: string;
  relative: string;
  timezone: string;
}

const RELATIVE_UNITS: { limit: number; divisor: number; unit: string }[] = [
  { limit: 60, divisor: 1, unit: "second" },
  { limit: 3600, divisor: 60, unit: "minute" },
  { limit: 86400, divisor: 3600, unit: "hour" },
  { limit: 2592000, divisor: 86400, unit: "day" },
  { limit: 31536000, divisor: 2592000, unit: "month" },
  { limit: Infinity, divisor: 31536000, unit: "year" },
];

function formatRelative(targetMs: number): string {
  const diffSeconds = Math.round((targetMs - Date.now()) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 5) return "just now";

  for (const { limit, divisor, unit } of RELATIVE_UNITS) {
    if (absSeconds < limit) {
      const value = Math.floor(absSeconds / divisor);
      const plural = value === 1 ? unit : `${unit}s`;
      return diffSeconds < 0
        ? `${value} ${plural} ago`
        : `in ${value} ${plural}`;
    }
  }
  return "just now";
}

function parseTimestamp(raw: string): ParsedTimestamp | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return null;

  // >= 13 digits => milliseconds, otherwise seconds
  const ms = trimmed.length >= 13 ? Number(trimmed) : Number(trimmed) * 1000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;

  return {
    date,
    local: date.toLocaleString(),
    utc: date.toUTCString(),
    iso: date.toISOString(),
    relative: formatRelative(ms),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function toLocalDatetimeInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function TimestampConverterClient({
  dict,
}: {
  dict?: any;
}) {
  const t = useMemo(() => dict?.timestamp_converter || {}, [dict]);
  const faqItems: { question: string; answer: string }[] =
    dict?.page_timestamp_converter?.faq || FALLBACK_FAQ;

  const [nowMs, setNowMs] = useState<number | null>(null);
  const [tsInput, setTsInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  useEffect(() => {
    const update = () => setNowMs(Date.now());
    const timeoutId = setTimeout(update, 0);
    const interval = setInterval(update, 1000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, []);

  const parsed = useMemo(() => parseTimestamp(tsInput), [tsInput]);
  const isInvalidInput = tsInput.trim().length > 0 && parsed === null;

  const dateToTimestamp = useMemo(() => {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return null;
    return { seconds: Math.floor(date.getTime() / 1000), ms: date.getTime() };
  }, [dateInput]);

  const copyValue = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} ${t.copied || "copied to clipboard"}`);
    } catch {
      toast.error(t.copy_failed || "Failed to copy");
    }
  }, [t]);

  const useCurrentDate = useCallback(() => {
    setDateInput(toLocalDatetimeInput(new Date()));
  }, []);

  const currentSeconds = nowMs !== null ? Math.floor(nowMs / 1000) : null;

  const howSteps = [
    {
      step: 1,
      title: t.step1_title || "See the Live Timestamp",
      desc:
        t.step1_desc ||
        "Watch the current Unix timestamp tick every second in both seconds and milliseconds.",
      icon: Clock,
    },
    {
      step: 2,
      title: t.step2_title || "Timestamp to Date",
      desc:
        t.step2_desc ||
        "Paste any Unix timestamp to convert it into local, UTC, and ISO 8601 dates.",
      icon: ArrowRight,
    },
    {
      step: 3,
      title: t.step3_title || "Date to Timestamp",
      desc:
        t.step3_desc ||
        "Pick a date and time to instantly get its Unix timestamp back.",
      icon: CalendarClock,
    },
  ];

  const tips = [
    {
      title: t.tip1_title || "Seconds vs Milliseconds",
      desc:
        t.tip1_desc ||
        "JavaScript's Date.now() returns milliseconds while most other languages and APIs use seconds. Watch out for the 1000x mismatch when passing values around.",
    },
    {
      title: t.tip2_title || "The Unix Epoch",
      desc:
        t.tip2_desc ||
        "Unix time counts from January 1, 1970 at 00:00:00 UTC. That moment is timestamp zero, and everything is measured relative to it.",
    },
    {
      title: t.tip3_title || "Timezone Independent",
      desc:
        t.tip3_desc ||
        "A timestamp represents the same instant everywhere on Earth. Only its display as a human-readable date depends on the chosen timezone.",
    },
    {
      title: t.tip4_title || "Everyday Uses",
      desc:
        t.tip4_desc ||
        "Timestamps are handy for API debugging, log analysis, and cache-busting where you need a unique, monotonic value.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-6">
              <Clock className="w-10 h-10 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t.title || "Unix Timestamp Converter"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {t.subtitle ||
                "Convert between Unix timestamps and human-readable dates instantly. See the current timestamp live, updated every second."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Section 1: Live current timestamp */}
            <Card className="w-full border-orange-100 dark:border-orange-900/50 shadow-sm mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hourglass className="w-5 h-5 text-orange-500" />
                  {t.current_title || "Current Unix Timestamp"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-5 rounded-xl border border-orange-100 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-900/10">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      {t.seconds_label || "Seconds"}
                    </span>
                    <span className="text-2xl md:text-3xl font-bold font-mono text-orange-600 dark:text-orange-400 tabular-nums">
                      {currentSeconds !== null ? currentSeconds : "—"}
                    </span>
                    <button
                      onClick={() =>
                        currentSeconds !== null &&
                        copyValue(
                          String(currentSeconds),
                          t.seconds_label || "Seconds"
                        )
                      }
                      disabled={currentSeconds === null}
                      className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {t.copy || "Copy"}
                    </button>
                  </div>
                  <div className="flex flex-col items-center p-5 rounded-xl border border-orange-100 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-900/10">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      {t.milliseconds_label || "Milliseconds"}
                    </span>
                    <span className="text-2xl md:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                      {nowMs !== null ? nowMs : "—"}
                    </span>
                    <button
                      onClick={() =>
                        nowMs !== null &&
                        copyValue(
                          String(nowMs),
                          t.milliseconds_label || "Milliseconds"
                        )
                      }
                      disabled={nowMs === null}
                      className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {t.copy || "Copy"}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Timestamp -> Date */}
            <Card className="w-full border-orange-100 dark:border-orange-900/50 shadow-sm mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-orange-500" />
                  {t.ts_to_date_title || "Timestamp to Date"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  inputMode="numeric"
                  value={tsInput}
                  onChange={(e) =>
                    setTsInput(e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder={
                    t.ts_input_placeholder ||
                    "Paste a Unix timestamp (e.g. 1704067200)"
                  }
                  className={`w-full p-4 rounded-xl border bg-white dark:bg-gray-900 text-base font-mono focus:outline-none focus:ring-2 transition-colors placeholder:font-sans placeholder:text-muted-foreground ${
                    isInvalidInput
                      ? "border-red-400 focus:ring-red-500/40 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus:ring-orange-500/50 focus:border-orange-500"
                  }`}
                />
                {isInvalidInput && (
                  <p className="mt-2 text-sm text-red-500">
                    {t.invalid_input ||
                      "Please enter a valid numeric timestamp."}
                  </p>
                )}

                {parsed ? (
                  <div className="mt-5 space-y-3">
                    {[
                      {
                        label: t.local_label || "Local Time",
                        value: `${parsed.local} (${parsed.timezone})`,
                      },
                      { label: t.utc_label || "UTC", value: parsed.utc },
                      { label: t.iso_label || "ISO 8601", value: parsed.iso },
                      {
                        label: t.relative_label || "Relative",
                        value: parsed.relative,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 rounded-lg bg-muted/40 border border-gray-100 dark:border-gray-800"
                      >
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:w-28 shrink-0">
                          {row.label}
                        </span>
                        <span className="text-sm font-mono break-all">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  !isInvalidInput && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {t.ts_empty_hint ||
                        "Enter a timestamp above to see the converted date."}
                    </p>
                  )
                )}
              </CardContent>
            </Card>

            {/* Section 3: Date -> Timestamp */}
            <Card className="w-full border-orange-100 dark:border-orange-900/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-orange-500" />
                  {t.date_to_ts_title || "Date to Timestamp"}
                </CardTitle>
                <button
                  onClick={useCurrentDate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  {t.now || "Now"}
                </button>
              </CardHeader>
              <CardContent>
                <input
                  type="datetime-local"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
                />

                {dateToTimestamp ? (
                  <div className="mt-5 grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-5 rounded-xl border border-orange-100 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-900/10">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                        {t.seconds_label || "Seconds"}
                      </span>
                      <span className="text-xl md:text-2xl font-bold font-mono text-orange-600 dark:text-orange-400 tabular-nums break-all text-center">
                        {dateToTimestamp.seconds}
                      </span>
                      <button
                        onClick={() =>
                          copyValue(
                            String(dateToTimestamp.seconds),
                            t.seconds_label || "Seconds"
                          )
                        }
                        className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {t.copy || "Copy"}
                      </button>
                    </div>
                    <div className="flex flex-col items-center p-5 rounded-xl border border-orange-100 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-900/10">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                        {t.milliseconds_label || "Milliseconds"}
                      </span>
                      <span className="text-xl md:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums break-all text-center">
                        {dateToTimestamp.ms}
                      </span>
                      <button
                        onClick={() =>
                          copyValue(
                            String(dateToTimestamp.ms),
                            t.milliseconds_label || "Milliseconds"
                          )
                        }
                        className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {t.copy || "Copy"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {t.date_empty_hint ||
                      "Pick a date and time above to get its Unix timestamp."}
                  </p>
                )}
              </CardContent>
            </Card>
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
                  {t.guide_subtitle ||
                    "Convert timestamps and dates in three simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {howSteps.map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    {t.tips_title || "Timestamp Tips"}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.tips_desc ||
                      "Understand how Unix time works to avoid common pitfalls."}
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {tips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">
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
