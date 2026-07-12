"use client";

import { useState, useCallback } from "react";
import {
  Fingerprint,
  Copy,
  Check,
  Download,
  RefreshCw,
  CopyCheck,
  Lightbulb,
  HelpCircle,
  Settings2,
  MousePointerClick,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
    question: "Are these UUIDs generated privately?",
    answer:
      "Yes. Every UUID is generated locally in your browser using the cryptographically secure Web Crypto API. Nothing is sent to a server, logged, or stored — the values exist only on your device.",
  },
  {
    question: "What is the difference between UUID v4 and UUID v7?",
    answer:
      "UUID v4 is fully random, which makes each value unpredictable but unordered. UUID v7 embeds a Unix millisecond timestamp in its most significant bits, so v7 values are time-ordered and sort chronologically — a big advantage as database primary keys and indexes.",
  },
  {
    question: "Are these UUIDs guaranteed to be unique?",
    answer:
      "For all practical purposes, yes. A version 4 UUID has 122 random bits, giving roughly 5.3 x 10^36 possible values, so the chance of a collision is negligible. Version 7 adds a timestamp on top of random bits, making collisions even less likely.",
  },
  {
    question: "Can I generate UUIDs in bulk?",
    answer:
      "Yes. You can generate between 1 and 1000 UUIDs at once, copy them all with a single click, or download the entire list as a .txt file.",
  },
  {
    question: "What are the uppercase and no-hyphens options for?",
    answer:
      "Some systems expect UUIDs without hyphens (a plain 32-character hex string) or in uppercase. These formatting options let you match the exact format your database, API, or application requires.",
  },
];

type UuidVersion = "v4" | "v7";

const HEX = "0123456789abcdef";

function bytesToUuid(bytes: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < 16; i++) {
    hex += HEX[bytes[i] >> 4] + HEX[bytes[i] & 0x0f];
  }
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20,
  )}-${hex.slice(20)}`;
}

/**
 * UUID v7 per RFC 9562: 48-bit big-endian Unix millisecond timestamp,
 * followed by version/variant bits and random data. The timestamp is read
 * only here, at generation time — never during render.
 */
function uuidV7(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  const timestamp = Date.now();
  bytes[0] = Math.floor(timestamp / 2 ** 40) & 0xff;
  bytes[1] = Math.floor(timestamp / 2 ** 32) & 0xff;
  bytes[2] = Math.floor(timestamp / 2 ** 24) & 0xff;
  bytes[3] = Math.floor(timestamp / 2 ** 16) & 0xff;
  bytes[4] = Math.floor(timestamp / 2 ** 8) & 0xff;
  bytes[5] = timestamp & 0xff;

  bytes[6] = (bytes[6] & 0x0f) | 0x70; // version 7
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant

  return bytesToUuid(bytes);
}

function generateOne(version: UuidVersion): string {
  return version === "v7" ? uuidV7() : crypto.randomUUID();
}

interface FormatOptions {
  uppercase: boolean;
  noHyphens: boolean;
}

function applyFormat(uuid: string, options: FormatOptions): string {
  let result = uuid;
  if (options.noHyphens) result = result.replace(/-/g, "");
  if (options.uppercase) result = result.toUpperCase();
  return result;
}

const QUICK_COUNTS = [1, 5, 10, 50, 100];

export function UuidGeneratorClient({ dict }: { dict?: any }) {
  const t = dict?.uuid_generator || {};
  const faqItems: FaqItem[] = dict?.page_uuid_generator?.faq || FALLBACK_FAQ;

  const [version, setVersion] = useState<UuidVersion>("v4");
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generate = useCallback(() => {
    const safeCount = Math.min(1000, Math.max(1, count));
    const list = Array.from({ length: safeCount }, () =>
      applyFormat(generateOne(version), { uppercase, noHyphens }),
    );
    setUuids(list);
    setCopiedIndex(null);
    setCopiedAll(false);
  }, [count, version, uppercase, noHyphens]);

  const copyOne = useCallback(
    async (value: string, index: number) => {
      try {
        await navigator.clipboard.writeText(value);
        setCopiedIndex(index);
        toast.success(t.copied || "Copied to clipboard!");
        setTimeout(() => setCopiedIndex(null), 2000);
      } catch {
        toast.error(t.copy_failed || "Failed to copy");
      }
    },
    [t.copied, t.copy_failed],
  );

  const copyAll = useCallback(async () => {
    if (!uuids.length) return;
    try {
      await navigator.clipboard.writeText(uuids.join("\n"));
      setCopiedAll(true);
      toast.success(t.copied_all || "All UUIDs copied!");
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      toast.error(t.copy_failed || "Failed to copy");
    }
  }, [uuids, t.copied_all, t.copy_failed]);

  const download = useCallback(() => {
    if (!uuids.length) return;
    const blob = new Blob([uuids.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "uuids.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }, [uuids]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-3xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 mb-6">
              <Fingerprint className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t.title || "UUID Generator"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {t.subtitle ||
                "Generate random v4 and time-ordered v7 UUIDs instantly — privately in your browser."}
            </p>

            <Adsense slotId="7759160077" />

            <Card className="w-full border-violet-100 dark:border-violet-900/50 shadow-sm">
              <CardContent className="pt-6 space-y-6">
                {/* Version toggle */}
                <div>
                  <label className="text-sm font-medium block mb-3">
                    {t.version_label || "Version"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["v4", "v7"] as UuidVersion[]).map((ver) => (
                      <button
                        key={ver}
                        onClick={() => setVersion(ver)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-sm font-medium border transition-colors text-left",
                          version === ver
                            ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white border-transparent shadow-sm"
                            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20",
                        )}
                      >
                        <span className="block font-semibold">
                          {ver === "v4"
                            ? t.v4_title || "UUID v4"
                            : t.v7_title || "UUID v7"}
                        </span>
                        <span
                          className={cn(
                            "block text-xs mt-0.5",
                            version === ver
                              ? "text-white/80"
                              : "text-muted-foreground",
                          )}
                        >
                          {ver === "v4"
                            ? t.v4_desc || "Fully random"
                            : t.v7_desc || "Time-ordered"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Count */}
                <div>
                  <label className="text-sm font-medium block mb-3">
                    {t.count_label || "How many? (1–1000)"}
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={count}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setCount(
                          Number.isNaN(val)
                            ? 1
                            : Math.min(1000, Math.max(1, val)),
                        );
                      }}
                      className="w-24 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                    {QUICK_COUNTS.map((quick) => (
                      <button
                        key={quick}
                        onClick={() => setCount(quick)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                          count === quick
                            ? "border-violet-400 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                            : "border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700",
                        )}
                      >
                        {quick}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format options */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                    <Checkbox
                      checked={uppercase}
                      onCheckedChange={(checked) =>
                        setUppercase(checked === true)
                      }
                      className="data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                    />
                    <span className="text-sm">
                      {t.uppercase || "Uppercase"}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                    <Checkbox
                      checked={noHyphens}
                      onCheckedChange={(checked) =>
                        setNoHyphens(checked === true)
                      }
                      className="data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                    />
                    <span className="text-sm">
                      {t.no_hyphens || "No hyphens"}
                    </span>
                  </label>
                </div>

                <button
                  onClick={generate}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90 transition-opacity"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t.generate || "Generate"}
                </button>

                {/* Result list */}
                {uuids.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">
                        {uuids.length} {t.results || "UUIDs"}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={copyAll}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                        >
                          {copiedAll ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <CopyCheck className="w-3.5 h-3.5" />
                          )}
                          {t.copy_all || "Copy all"}
                        </button>
                        <button
                          onClick={download}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {t.download || "Download"}
                        </button>
                      </div>
                    </div>
                    <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                      {uuids.map((uuid, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                        >
                          <span className="flex-1 min-w-0 font-mono text-sm truncate">
                            {uuid}
                          </span>
                          <button
                            onClick={() => copyOne(uuid, idx)}
                            aria-label={t.copy || "Copy UUID"}
                            className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                          >
                            {copiedIndex === idx ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
                    "Generate unique identifiers in three simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: t.step1_title || "Pick a version",
                    desc:
                      t.step1_desc ||
                      "Choose UUID v4 for random identifiers or v7 for time-ordered ones.",
                    icon: Settings2,
                  },
                  {
                    title: t.step2_title || "Set count and format",
                    desc:
                      t.step2_desc ||
                      "Choose how many to generate and toggle uppercase or no-hyphen formatting.",
                    icon: MousePointerClick,
                  },
                  {
                    title: t.step3_title || "Copy or download",
                    desc:
                      t.step3_desc ||
                      "Copy a single UUID, copy them all, or download the whole list as a .txt file.",
                    icon: Download,
                  },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    {t.tips_title || "UUID Tips"}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.tips_desc ||
                      "Choose and use UUIDs effectively with these tips."}
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: t.tip1_title || "Use v7 for database keys",
                      desc:
                        t.tip1_desc ||
                        "Because v7 UUIDs are time-ordered, they keep database indexes compact and reduce page fragmentation compared to random v4 keys.",
                    },
                    {
                      title: t.tip2_title || "Use v4 for public tokens",
                      desc:
                        t.tip2_desc ||
                        "When you don't want a value to reveal when it was created, v4's full randomness makes it a better fit than v7.",
                    },
                    {
                      title: t.tip3_title || "Match your target format",
                      desc:
                        t.tip3_desc ||
                        "Some systems store UUIDs without hyphens or in uppercase. Use the format options so your IDs paste in cleanly.",
                    },
                    {
                      title: t.tip4_title || "Generate in bulk",
                      desc:
                        t.tip4_desc ||
                        "Need seed data or test fixtures? Generate up to 1000 UUIDs at once and download them as a text file.",
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-violet-600 dark:text-violet-400 mb-2">
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
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 mb-4">
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
