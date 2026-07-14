"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Fingerprint,
  Copy,
  RefreshCw,
  CopyCheck,
  Lightbulb,
  ArrowRight,
  Settings2,
  ListOrdered,
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

type UuidVersion = "v4" | "v7";

interface UuidOptions {
  uppercase: boolean;
  removeHyphens: boolean;
}

function bytesToUuid(bytes: Uint8Array): string {
  const hex: string[] = [];
  for (let i = 0; i < 16; i++) {
    hex.push(bytes[i].toString(16).padStart(2, "0"));
  }
  return (
    hex.slice(0, 4).join("") +
    "-" +
    hex.slice(4, 6).join("") +
    "-" +
    hex.slice(6, 8).join("") +
    "-" +
    hex.slice(8, 10).join("") +
    "-" +
    hex.slice(10, 16).join("")
  );
}

function generateV4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // Version 4
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Variant 10xx
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytesToUuid(bytes);
}

function generateV7(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // First 48 bits: current Unix time in milliseconds, big-endian.
  const timestamp = Date.now();
  bytes[0] = Math.floor(timestamp / 0x10000000000) & 0xff;
  bytes[1] = Math.floor(timestamp / 0x100000000) & 0xff;
  bytes[2] = Math.floor(timestamp / 0x1000000) & 0xff;
  bytes[3] = Math.floor(timestamp / 0x10000) & 0xff;
  bytes[4] = Math.floor(timestamp / 0x100) & 0xff;
  bytes[5] = timestamp & 0xff;

  // Version 7 in the high nibble of byte 6.
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // Variant 10xx in the two high bits of byte 8.
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return bytesToUuid(bytes);
}

function formatUuid(uuid: string, options: UuidOptions): string {
  let result = uuid;
  if (options.removeHyphens) {
    result = result.replace(/-/g, "");
  }
  if (options.uppercase) {
    result = result.toUpperCase();
  }
  return result;
}

function generateBatch(
  version: UuidVersion,
  count: number,
  options: UuidOptions,
): string[] {
  const safeCount = Math.min(100, Math.max(1, Math.floor(count)));
  const list: string[] = [];
  for (let i = 0; i < safeCount; i++) {
    const raw = version === "v4" ? generateV4() : generateV7();
    list.push(formatUuid(raw, options));
  }
  return list;
}

export function UuidGeneratorClient({ dict }: { dict?: any }) {
  const [version, setVersion] = useState<UuidVersion>("v4");
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [removeHyphens, setRemoveHyphens] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = useCallback(() => {
    const list = generateBatch(version, count, { uppercase, removeHyphens });
    setUuids(list);
    setCopiedIndex(null);
  }, [version, count, uppercase, removeHyphens]);

  // Generate an initial batch on the client only, avoiding hydration mismatch.
  useEffect(() => {
    setUuids(
      generateBatch("v4", 5, { uppercase: false, removeHyphens: false }),
    );
  }, []);

  const handleCopy = useCallback(async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      toast.success("Copied to clipboard");
      window.setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  const handleCopyAll = useCallback(async () => {
    if (uuids.length === 0) return;
    try {
      await navigator.clipboard.writeText(uuids.join("\n"));
      toast.success(`Copied ${uuids.length} UUIDs`);
    } catch {
      toast.error("Failed to copy");
    }
  }, [uuids]);

  const handleCountChange = useCallback((raw: string) => {
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      setCount(1);
      return;
    }
    setCount(Math.min(100, Math.max(1, parsed)));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-5xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 mb-6">
              <Fingerprint className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              UUID Generator
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              Generate UUID v4 and v7 identifiers in bulk, with copy and
              formatting options.
            </p>

            <Adsense slotId="7759160077" />

            {/* Controls */}
            <Card className="w-full border-emerald-100 dark:border-emerald-900/50 shadow-sm mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-emerald-500" />
                  Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Version toggle */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Version
                  </span>
                  <div className="inline-flex w-full sm:w-auto rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-gray-50 dark:bg-gray-900">
                    {(["v4", "v7"] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setVersion(v)}
                        className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                          version === v
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        UUID {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Count */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="uuid-count"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Count (1–100)
                  </label>
                  <input
                    id="uuid-count"
                    type="number"
                    min={1}
                    max={100}
                    value={count}
                    onChange={(e) => handleCountChange(e.target.value)}
                    className="w-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex flex-wrap gap-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={uppercase}
                      onChange={(e) => setUppercase(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/50 accent-emerald-600"
                    />
                    <span className="text-sm">Uppercase</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={removeHyphens}
                      onChange={(e) => setRemoveHyphens(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/50 accent-emerald-600"
                    />
                    <span className="text-sm">Remove hyphens</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Generate
                  </button>
                  <button
                    onClick={handleCopyAll}
                    disabled={uuids.length === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CopyCheck className="w-4 h-4" />
                    Copy all
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="w-full border-emerald-100 dark:border-emerald-900/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-emerald-500" />
                  Generated UUIDs
                  {uuids.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({uuids.length})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {uuids.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    Click Generate to create UUIDs.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {uuids.map((uuid, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                      >
                        <code className="font-mono text-sm break-all text-gray-800 dark:text-gray-200">
                          {uuid}
                        </code>
                        <button
                          onClick={() => handleCopy(uuid, index)}
                          aria-label="Copy UUID"
                          className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                        >
                          {copiedIndex === index ? (
                            <CopyCheck className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          )}
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
                  How to Use
                </h2>
                <p className="text-muted-foreground">
                  Create unique identifiers in seconds.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: "Choose a Version",
                    desc: "Pick UUID v4 for fully random identifiers or UUID v7 for time-ordered, sortable ones.",
                    icon: Fingerprint,
                  },
                  {
                    step: 2,
                    title: "Set Count & Format",
                    desc: "Enter how many UUIDs you need, then toggle uppercase or hyphen-free output.",
                    icon: Settings2,
                  },
                  {
                    step: 3,
                    title: "Generate & Copy",
                    desc: "Click Generate, then copy a single value or the whole list with one click.",
                    icon: ArrowRight,
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
                  <h2 className="text-3xl font-bold mb-4">UUID Tips</h2>
                  <p className="text-muted-foreground">
                    Choose the right identifier for the job.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Use v7 for Database Keys",
                      desc: "UUID v7 embeds a timestamp in its leading bits, so rows insert in roughly chronological order. This keeps B-tree indexes compact and speeds up inserts versus random v4.",
                    },
                    {
                      title: "Use v4 for Opaque Tokens",
                      desc: "When you don't want any information leaked from the identifier, v4's full randomness makes it ideal for session tokens, API keys, and public-facing references.",
                    },
                    {
                      title: "Formatting Is Cosmetic",
                      desc: "Uppercase and hyphen removal change appearance only. The same 128-bit value is preserved, so it stays compatible when normalized back to canonical form.",
                    },
                    {
                      title: "Collisions Are Negligible",
                      desc: "With 122 bits of randomness, the odds of generating a duplicate UUID are astronomically low, making both versions safe for distributed systems.",
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
                <h2 className="text-2xl font-bold tracking-tight mb-4">FAQ</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    q: "What is the difference between UUID v4 and UUID v7?",
                    a: "UUID v4 is fully random, offering strong uniqueness with no ordering. UUID v7 embeds a Unix millisecond timestamp in its leading bits, so identifiers are time-ordered while still random enough to avoid collisions. Use v4 for opaque keys and v7 when you want database-friendly, sortable primary keys.",
                  },
                  {
                    q: "Are these UUIDs safe to use as database primary keys?",
                    a: "Yes. Both versions are 128-bit identifiers with an extremely low collision probability. UUID v7 is especially recommended for primary keys because its time-ordered layout reduces index fragmentation and improves insert performance compared to random v4 values.",
                  },
                  {
                    q: "Is my data private when generating UUIDs here?",
                    a: "Absolutely. Every UUID is generated entirely in your browser using the built-in Web Crypto API. Nothing is sent to a server, logged, or stored. Close the tab and the generated values are gone.",
                  },
                  {
                    q: "How many UUIDs can I generate at once?",
                    a: "You can generate between 1 and 100 UUIDs per batch. Adjust the count field, choose your version and formatting options, then click Generate to produce the full list, which you can copy individually or all at once.",
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
        <aside className="hidden lg:block w-64 shrink-0">
          <ToolsSidebar category="utility" dict={dict} />
        </aside>
      </div>
    </div>
  );
}
