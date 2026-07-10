"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  ShieldCheck,
  SlidersHorizontal,
  MousePointerClick,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
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

const CHAR_POOLS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

const AMBIGUOUS_CHARS = "il1Lo0O";

const FALLBACK_FAQ = [
  {
    question: "Is this password generator secure and private?",
    answer:
      "Yes. Every password is generated locally in your browser using the cryptographically secure crypto.getRandomValues API. Nothing is ever sent to a server, logged, or stored — close the tab and the password is gone.",
  },
  {
    question: "What makes a strong password?",
    answer:
      "A strong password is long (16+ characters), unpredictable, and mixes uppercase letters, lowercase letters, numbers, and symbols. Randomly generated passwords are far stronger than anything a person invents because they contain no guessable patterns or personal information.",
  },
  {
    question: "How long should a password be?",
    answer:
      "Aim for at least 12 characters, and 16 or more for important accounts. Length is the single biggest factor in resisting brute-force attacks — each extra character multiplies the number of possible combinations dramatically.",
  },
  {
    question: 'What does "exclude ambiguous characters" do?',
    answer:
      "When enabled, it removes characters that are easy to confuse when read or typed manually — such as the letter l, capital I, the number 1, capital O, and the number 0. This makes passwords easier to transcribe correctly without meaningfully reducing their strength.",
  },
  {
    question: "Can I trust a browser-based password generator?",
    answer:
      "Yes, when it runs entirely client-side like this one. Because generation happens in your own browser with the Web Crypto API and no network requests are made, there is no server that could ever see your password. You can even disconnect from the internet and it will still work.",
  },
];

interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

function buildPool(options: GeneratorOptions): string {
  let pool = "";
  if (options.uppercase) pool += CHAR_POOLS.uppercase;
  if (options.lowercase) pool += CHAR_POOLS.lowercase;
  if (options.numbers) pool += CHAR_POOLS.numbers;
  if (options.symbols) pool += CHAR_POOLS.symbols;

  if (options.excludeAmbiguous) {
    const ambiguous = new Set(AMBIGUOUS_CHARS);
    pool = Array.from(pool)
      .filter((char) => !ambiguous.has(char))
      .join("");
  }
  return pool;
}

function generatePassword(options: GeneratorOptions): string {
  const pool = buildPool(options);
  if (!pool.length) return "";

  const randomValues = new Uint32Array(options.length);
  crypto.getRandomValues(randomValues);

  let result = "";
  for (let i = 0; i < options.length; i++) {
    result += pool[randomValues[i] % pool.length];
  }
  return result;
}

function activePoolCount(options: GeneratorOptions): number {
  return [
    options.uppercase,
    options.lowercase,
    options.numbers,
    options.symbols,
  ].filter(Boolean).length;
}

interface Strength {
  label: string;
  percent: number;
  barClass: string;
  textClass: string;
}

function computeStrength(length: number, pools: number): Strength {
  if (length < 8 || pools <= 1) {
    return {
      label: "Weak",
      percent: 25,
      barClass: "bg-red-500",
      textClass: "text-red-600 dark:text-red-400",
    };
  }
  if (length < 12 || pools === 2) {
    return {
      label: "Fair",
      percent: 50,
      barClass: "bg-orange-500",
      textClass: "text-orange-600 dark:text-orange-400",
    };
  }
  if (length < 16 || pools === 3) {
    return {
      label: "Good",
      percent: 75,
      barClass: "bg-yellow-500",
      textClass: "text-yellow-600 dark:text-yellow-400",
    };
  }
  return {
    label: "Strong",
    percent: 100,
    barClass: "bg-green-500",
    textClass: "text-green-600 dark:text-green-400",
  };
}

interface CharTypeOption {
  key: "uppercase" | "lowercase" | "numbers" | "symbols";
  label: string;
}

const CHAR_TYPE_OPTIONS: CharTypeOption[] = [
  { key: "uppercase", label: "Uppercase (A-Z)" },
  { key: "lowercase", label: "Lowercase (a-z)" },
  { key: "numbers", label: "Numbers (0-9)" },
  { key: "symbols", label: "Symbols (!@#$...)" },
];

export function PasswordGeneratorClient({ dict }: { dict?: any }) {
  const t = useMemo(() => dict?.password_generator || {}, [dict]);
  const faqItems: { question: string; answer: string }[] =
    dict?.page_password_generator?.faq || FALLBACK_FAQ;

  const [options, setOptions] = useState<GeneratorOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  const [password, setPassword] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const [bulkCount, setBulkCount] = useState(1);
  const [bulkList, setBulkList] = useState<string[]>([]);
  const [copiedBulkIndex, setCopiedBulkIndex] = useState<number | null>(null);

  const hasCharType = activePoolCount(options) > 0;

  const regenerate = useCallback(() => {
    setPassword(generatePassword(options));
    setIsCopied(false);
  }, [options]);

  // Auto-generate on mount and whenever a control changes.
  useEffect(() => {
    if (hasCharType) {
      setPassword(generatePassword(options));
      setIsCopied(false);
    } else {
      setPassword("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const strength = useMemo(
    () => computeStrength(options.length, activePoolCount(options)),
    [options],
  );

  const toggleType = useCallback((key: CharTypeOption["key"]) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const copyPassword = useCallback(async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setIsCopied(true);
      toast.success(t.copied_toast || "Copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy password", err);
      toast.error(t.copy_error || "Failed to copy");
    }
  }, [password, t]);

  const copyBulk = useCallback(
    async (value: string, index: number) => {
      try {
        await navigator.clipboard.writeText(value);
        setCopiedBulkIndex(index);
        toast.success(t.copied_toast || "Copied to clipboard!");
        setTimeout(() => setCopiedBulkIndex(null), 2000);
      } catch (err) {
        console.error("Failed to copy password", err);
        toast.error(t.copy_error || "Failed to copy");
      }
    },
    [t],
  );

  const generateBulk = useCallback(() => {
    if (!hasCharType) return;
    const count = Math.min(10, Math.max(1, bulkCount));
    const list = Array.from({ length: count }, () =>
      generatePassword(options),
    );
    setBulkList(list);
  }, [bulkCount, options, hasCharType]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-3xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 mb-6">
              <KeyRound className="w-10 h-10 text-rose-600 dark:text-rose-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t.title || "Password Generator"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {t.subtitle ||
                "Create strong, random, and secure passwords instantly. Generated locally in your browser — nothing is ever sent to a server."}
            </p>

            <Adsense slotId="7759160077" />

            <Card className="w-full border-rose-100 dark:border-rose-900/50 shadow-sm">
              <CardContent className="pt-6 space-y-8">
                {/* Password output */}
                <div>
                  <div className="flex items-stretch gap-2">
                    <input
                      type="text"
                      readOnly
                      value={password}
                      placeholder={
                        hasCharType
                          ? ""
                          : t.select_hint || "Select at least one character type"
                      }
                      aria-label={t.title || "Generated password"}
                      className="flex-1 min-w-0 px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-mono text-lg md:text-xl tracking-wide focus:outline-none focus:ring-2 focus:ring-rose-500/50 select-all"
                    />
                    <button
                      onClick={copyPassword}
                      disabled={!password}
                      aria-label={t.copy || "Copy password"}
                      className="shrink-0 inline-flex items-center justify-center w-14 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300 dark:hover:border-rose-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isCopied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={regenerate}
                      disabled={!hasCharType}
                      aria-label={t.regenerate || "Regenerate"}
                      className="shrink-0 inline-flex items-center justify-center w-14 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300 dark:hover:border-rose-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Strength meter */}
                  {hasCharType && password && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-muted-foreground">
                          {t.strength_label || "Strength"}
                        </span>
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            strength.textClass,
                          )}
                        >
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            strength.barClass,
                          )}
                          style={{ width: `${strength.percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Length control */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">
                      {t.length_label || "Length"}
                    </label>
                    <span className="inline-flex items-center justify-center min-w-10 px-2 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-semibold tabular-nums">
                      {options.length}
                    </span>
                  </div>
                  <Slider
                    value={[options.length]}
                    min={4}
                    max={64}
                    step={1}
                    onValueChange={(val) =>
                      setOptions((prev) => ({ ...prev, length: val[0] }))
                    }
                    aria-label={t.length_label || "Length"}
                  />
                </div>

                {/* Character type options */}
                <div>
                  <label className="text-sm font-medium block mb-3">
                    {t.charset_label || "Character types"}
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {CHAR_TYPE_OPTIONS.map((opt) => (
                      <label
                        key={opt.key}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-colors"
                      >
                        <Checkbox
                          checked={options[opt.key]}
                          onCheckedChange={() => toggleType(opt.key)}
                          className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                        />
                        <span className="text-sm">
                          {t[`type_${opt.key}`] || opt.label}
                        </span>
                      </label>
                    ))}
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-colors sm:col-span-2">
                      <Checkbox
                        checked={options.excludeAmbiguous}
                        onCheckedChange={(checked) =>
                          setOptions((prev) => ({
                            ...prev,
                            excludeAmbiguous: checked === true,
                          }))
                        }
                        className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                      />
                      <span className="text-sm">
                        {t.exclude_ambiguous ||
                          "Exclude ambiguous characters (il1Lo0O)"}
                      </span>
                    </label>
                  </div>
                  {!hasCharType && (
                    <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
                      {t.select_hint || "Select at least one character type"}
                    </p>
                  )}
                </div>

                {/* Generate multiple */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                  <label className="text-sm font-medium block mb-3">
                    {t.bulk_label || "Generate multiple"}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={bulkCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setBulkCount(
                          Number.isNaN(val)
                            ? 1
                            : Math.min(10, Math.max(1, val)),
                        );
                      }}
                      className="w-20 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                    <button
                      onClick={generateBulk}
                      disabled={!hasCharType}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-red-500 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {t.bulk_button || "Generate List"}
                    </button>
                  </div>

                  {bulkList.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {bulkList.map((pw, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                        >
                          <span className="flex-1 min-w-0 font-mono text-sm truncate">
                            {pw}
                          </span>
                          <button
                            onClick={() => copyBulk(pw, idx)}
                            aria-label={t.copy || "Copy password"}
                            className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                          >
                            {copiedBulkIndex === idx ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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
                    "Create a secure password in three simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: t.step1_title || "Choose your options",
                    desc:
                      t.step1_desc ||
                      "Set the length and pick which character types to include — uppercase, lowercase, numbers, and symbols.",
                    icon: SlidersHorizontal,
                  },
                  {
                    title: t.step2_title || "Generate instantly",
                    desc:
                      t.step2_desc ||
                      "A cryptographically secure random password is created immediately, right in your browser.",
                    icon: MousePointerClick,
                  },
                  {
                    title: t.step3_title || "Copy and use it",
                    desc:
                      t.step3_desc ||
                      "Copy the password with one click. Nothing is ever sent to a server or stored anywhere.",
                    icon: Copy,
                  },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    {t.tips_title || "Password Tips"}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.tips_desc || "Stay safe with these password best practices."}
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: t.tip1_title || "Use a unique password per site",
                      desc:
                        t.tip1_desc ||
                        "Never reuse passwords. If one account is breached, unique passwords keep the rest of your accounts safe.",
                    },
                    {
                      title: t.tip2_title || "Longer beats complex-but-short",
                      desc:
                        t.tip2_desc ||
                        "A long password is exponentially harder to crack. Favor length over hard-to-remember complexity in a short string.",
                    },
                    {
                      title: t.tip3_title || "Use a password manager",
                      desc:
                        t.tip3_desc ||
                        "A password manager securely stores every generated password so you only have to remember one master password.",
                    },
                    {
                      title: t.tip4_title || "Avoid personal info",
                      desc:
                        t.tip4_desc ||
                        "Don't build passwords from names, birthdays, or common words. Random characters have no guessable patterns.",
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-rose-600 dark:text-rose-400 mb-2">
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
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 mb-4">
                  <ShieldCheck className="w-6 h-6" />
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
