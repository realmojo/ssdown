"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  KeyRound,
  Copy,
  RefreshCw,
  Check,
  ShieldCheck,
  Sliders,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/~";
const AMBIGUOUS = new Set(["0", "O", "1", "l", "I"]);

const MIN_LENGTH = 4;
const MAX_LENGTH = 64;
const DEFAULT_LENGTH = 16;

interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

interface Strength {
  label: string;
  percent: number;
  barColor: string;
  textColor: string;
}

/** Uniform random integer in [0, maxExclusive) using rejection sampling to avoid modulo bias. */
function secureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) return 0;
  const range = 0x100000000; // 2^32
  const maxValid = range - (range % maxExclusive);
  const buffer = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= maxValid);
  return value % maxExclusive;
}

function pickRandomChar(set: string): string {
  return set[secureRandomInt(set.length)];
}

function shuffle(chars: string[]): string[] {
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars;
}

function buildCharacterSets(options: GeneratorOptions): string[] {
  const sources: string[] = [];
  if (options.uppercase) sources.push(UPPERCASE);
  if (options.lowercase) sources.push(LOWERCASE);
  if (options.numbers) sources.push(NUMBERS);
  if (options.symbols) sources.push(SYMBOLS);

  const sets = sources
    .map((set) =>
      options.excludeAmbiguous
        ? [...set].filter((c) => !AMBIGUOUS.has(c)).join("")
        : set,
    )
    .filter((set) => set.length > 0);

  return sets;
}

function generatePassword(options: GeneratorOptions, sets: string[]): string {
  if (sets.length === 0) return "";
  const combined = sets.join("");
  const chars: string[] = [];

  // Guarantee at least one character from each enabled set.
  for (const set of sets) chars.push(pickRandomChar(set));
  while (chars.length < options.length) chars.push(pickRandomChar(combined));

  return shuffle(chars.slice(0, options.length)).join("");
}

function computeStrength(options: GeneratorOptions, poolSize: number): Strength {
  const entropy = poolSize > 1 ? options.length * Math.log2(poolSize) : 0;
  const percent = Math.min(100, Math.round((entropy / 100) * 100));

  if (entropy < 40) {
    return {
      label: "Weak",
      percent,
      barColor: "bg-red-500",
      textColor: "text-red-600 dark:text-red-400",
    };
  }
  if (entropy < 60) {
    return {
      label: "Fair",
      percent,
      barColor: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
    };
  }
  if (entropy < 80) {
    return {
      label: "Strong",
      percent,
      barColor: "bg-lime-500",
      textColor: "text-lime-600 dark:text-lime-400",
    };
  }
  return {
    label: "Very Strong",
    percent,
    barColor: "bg-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
  };
}

const CHARSET_OPTIONS: { key: keyof GeneratorOptions; label: string }[] = [
  { key: "uppercase", label: "Uppercase (A-Z)" },
  { key: "lowercase", label: "Lowercase (a-z)" },
  { key: "numbers", label: "Numbers (0-9)" },
  { key: "symbols", label: "Symbols (!@#$)" },
  { key: "excludeAmbiguous", label: "Exclude ambiguous (0 O 1 l I)" },
];

export function PasswordGeneratorClient({ dict }: { dict?: any }) {
  const [options, setOptions] = useState<GeneratorOptions>({
    length: DEFAULT_LENGTH,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  const [count, setCount] = useState(1);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const sets = useMemo(() => buildCharacterSets(options), [options]);
  const poolSize = useMemo(() => sets.join("").length, [sets]);
  const hasCharset = sets.length > 0;
  const strength = useMemo(
    () => computeStrength(options, poolSize),
    [options, poolSize],
  );

  const regenerate = useCallback(() => {
    if (sets.length === 0) {
      setPasswords([]);
      return;
    }
    const next = Array.from({ length: count }, () =>
      generatePassword(options, sets),
    );
    setPasswords(next);
  }, [options, sets, count]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const setOption = useCallback(
    <K extends keyof GeneratorOptions>(key: K, value: GeneratorOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleCopy = useCallback(async (value: string, index: number) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      toast.success("Password copied to clipboard");
      window.setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      toast.error("Failed to copy password");
    }
  }, []);

  const handleCopyAll = useCallback(async () => {
    if (passwords.length === 0) return;
    try {
      await navigator.clipboard.writeText(passwords.join("\n"));
      toast.success(`Copied ${passwords.length} passwords`);
    } catch {
      toast.error("Failed to copy passwords");
    }
  }, [passwords]);

  const primary = passwords[0] ?? "";

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-5xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-gray-100 dark:from-slate-900/30 dark:to-gray-900/30 mb-6">
              <KeyRound className="w-10 h-10 text-slate-600 dark:text-slate-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Password Generator
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              Generate strong, random, secure passwords instantly. Everything
              happens in your browser — nothing is sent anywhere.
            </p>

            <Adsense slotId="7759160077" />

            {/* Generator */}
            <Card className="w-full border-slate-100 dark:border-slate-900/50 shadow-sm mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-slate-500" />
                  Your Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password display */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  <div className="flex-1 min-w-0 flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-4">
                    <span className="font-mono text-lg md:text-xl break-all select-all">
                      {hasCharset
                        ? primary || " "
                        : "Select at least one character set"}
                    </span>
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    <button
                      onClick={() => handleCopy(primary, 0)}
                      disabled={!hasCharset || !primary}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {copiedIndex === 0 ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      Copy
                    </button>
                    <button
                      onClick={regenerate}
                      disabled={!hasCharset}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate
                    </button>
                  </div>
                </div>

                {/* Strength meter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Strength
                    </span>
                    <span className={`text-sm font-semibold ${strength.textColor}`}>
                      {hasCharset ? strength.label : "—"}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${strength.barColor}`}
                      style={{ width: hasCharset ? `${strength.percent}%` : "0%" }}
                    />
                  </div>
                </div>

                {/* Length slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Length</Label>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                      {options.length}
                    </span>
                  </div>
                  <Slider
                    value={[options.length]}
                    min={MIN_LENGTH}
                    max={MAX_LENGTH}
                    step={1}
                    onValueChange={(value) => setOption("length", value[0])}
                  />
                </div>

                {/* Character set options */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {CHARSET_OPTIONS.map((opt) => (
                    <label
                      key={opt.key}
                      htmlFor={opt.key}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <Checkbox
                        id={opt.key}
                        checked={options[opt.key] as boolean}
                        onCheckedChange={(v) =>
                          setOption(opt.key, v === true)
                        }
                      />
                      <span className="text-sm select-none">{opt.label}</span>
                    </label>
                  ))}
                </div>

                {!hasCharset && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Please enable at least one character set to generate a
                    password.
                  </p>
                )}

                {/* Multiple passwords */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Label htmlFor="pw-count" className="text-sm font-medium">
                        Number of passwords
                      </Label>
                      <input
                        id="pw-count"
                        type="number"
                        min={1}
                        max={10}
                        value={count}
                        onChange={(e) => {
                          const parsed = Number(e.target.value);
                          if (Number.isNaN(parsed)) return;
                          setCount(Math.min(10, Math.max(1, Math.floor(parsed))));
                        }}
                        className="w-20 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 tabular-nums"
                      />
                    </div>
                    {passwords.length > 1 && (
                      <button
                        onClick={handleCopyAll}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copy all
                      </button>
                    )}
                  </div>

                  {passwords.length > 1 && (
                    <div className="space-y-2">
                      {passwords.map((pw, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2.5"
                        >
                          <span className="flex-1 min-w-0 font-mono text-sm break-all select-all">
                            {pw}
                          </span>
                          <button
                            onClick={() => handleCopy(pw, idx)}
                            className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                            aria-label="Copy password"
                          >
                            {copiedIndex === idx ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                  Create a strong password in seconds.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: "Choose Options",
                    desc: "Set the length and select which character sets to include — uppercase, lowercase, numbers, and symbols.",
                    icon: Sliders,
                  },
                  {
                    step: 2,
                    title: "Generate",
                    desc: "A cryptographically secure password is created instantly, right in your browser. Regenerate as many times as you like.",
                    icon: RefreshCw,
                  },
                  {
                    step: 3,
                    title: "Copy & Use",
                    desc: "Copy your new password with one click and paste it wherever you need a strong, unique credential.",
                    icon: ArrowRight,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900/30 text-slate-600 flex items-center justify-center mb-4">
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
                  <h2 className="text-3xl font-bold mb-4">Password Tips</h2>
                  <p className="text-muted-foreground">
                    Keep your accounts safe with strong credentials.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Go Long",
                      desc: "Length beats complexity. Use at least 16 characters — every extra character makes a password exponentially harder to crack.",
                    },
                    {
                      title: "Never Reuse",
                      desc: "Use a unique password for every account. If one service is breached, your other accounts stay safe.",
                    },
                    {
                      title: "Use a Manager",
                      desc: "You don't need to memorize strong passwords. Store them in a reputable password manager and only remember one master password.",
                    },
                    {
                      title: "Enable 2FA",
                      desc: "Add two-factor authentication wherever possible. Even a strong password is safer with a second layer of protection.",
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
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
                    q: "Are the generated passwords secure?",
                    a: "Yes. Passwords are generated using your browser's cryptographically secure random number generator (crypto.getRandomValues). They are never sent to any server, logged, or stored anywhere.",
                  },
                  {
                    q: "How long should my password be?",
                    a: "For most accounts, use at least 16 characters with a mix of uppercase, lowercase, numbers, and symbols. Longer passwords are exponentially harder to crack, so use the longest length a service allows.",
                  },
                  {
                    q: "What does 'exclude ambiguous characters' do?",
                    a: "It removes visually similar characters such as 0, O, 1, l, and I from the pool. This makes passwords easier to read and type manually without reducing security in a meaningful way.",
                  },
                  {
                    q: "Is my password sent to a server?",
                    a: "No. Everything happens entirely in your browser. No password is transmitted, saved, or shared. Close the tab and the generated passwords are gone forever.",
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
