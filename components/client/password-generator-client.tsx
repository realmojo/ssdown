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
    label: "매우 강함",
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
  { key: "excludeAmbiguous", label: "헷갈리는 문자 제외 (0 O 1 l I)" },
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
      toast.success("비밀번호를 클립보드에 복사했습니다");
      window.setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      toast.error("비밀번호를 복사하지 못했습니다");
    }
  }, []);

  const handleCopyAll = useCallback(async () => {
    if (passwords.length === 0) return;
    try {
      await navigator.clipboard.writeText(passwords.join("\n"));
      toast.success(`Copied ${passwords.length} passwords`);
    } catch {
      toast.error("비밀번호를 복사하지 못했습니다");
    }
  }, [passwords]);

  const primary = passwords[0] ?? "";

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex w-full flex-col">
            <div className="hidden">
              <KeyRound className="w-10 h-10 text-slate-600 dark:text-slate-400" />
            </div>
            <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
              비밀번호 생성기
            </h1>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              강력하고 무작위한 안전한 비밀번호를 즉시 만들어 줍니다. 모든 과정이 브라우저에서 이뤄지며 어디로도 전송되지 않습니다.
            </p>

            <Adsense slotId="7759160077" />

            {/* Generator */}
            <Card className="w-full border-slate-100 dark:border-slate-900/50 shadow-sm mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-slate-500" />
                  생성된 비밀번호
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
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
                    <Label className="text-sm font-medium">길이</Label>
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
                    비밀번호를 만들려면 문자 종류를 하나 이상 선택해 주세요.
                  </p>
                )}

                {/* Multiple passwords */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Label htmlFor="pw-count" className="text-sm font-medium">
                        생성 개수
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
                        전체 복사
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
                            aria-label="비밀번호 복사"
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
          <div className="w-full max-w-5xl mx-auto mt-3 px-4 space-y-3">
            {/* How to Use */}
            <section>
              <div className="text-center mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  이용 방법
                </h2>
                <p className="text-muted-foreground">
                  몇 초 만에 강력한 비밀번호를 만들어 보세요.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-2">
                {[
                  {
                    step: 1,
                    title: "옵션 선택",
                    desc: "길이를 정하고 포함할 문자 종류(대문자, 소문자, 숫자, 기호)를 고르세요.",
                    icon: Sliders,
                  },
                  {
                    step: 2,
                    title: "Generate",
                    desc: "암호학적으로 안전한 비밀번호가 브라우저에서 즉시 만들어집니다. 원하는 만큼 다시 생성할 수 있습니다.",
                    icon: RefreshCw,
                  },
                  {
                    step: 3,
                    title: "Copy & Use",
                    desc: "한 번의 클릭으로 새 비밀번호를 복사해 강력한 인증 정보가 필요한 곳에 붙여넣으세요.",
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
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-2 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">비밀번호 팁</h2>
                  <p className="text-muted-foreground">
                    강력한 비밀번호로 계정을 안전하게 지키세요.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Go Long",
                      desc: "복잡도보다 길이가 중요합니다. 최소 16자 이상 쓰세요. 한 글자 늘어날 때마다 뚫기가 기하급수적으로 어려워집니다.",
                    },
                    {
                      title: "재사용 금지",
                      desc: "계정마다 서로 다른 비밀번호를 쓰세요. 한 서비스가 뚫려도 다른 계정은 안전합니다.",
                    },
                    {
                      title: "비밀번호 관리자 사용",
                      desc: "강력한 비밀번호를 외울 필요는 없습니다. 믿을 만한 비밀번호 관리자에 저장하고 마스터 비밀번호 하나만 기억하세요.",
                    },
                    {
                      title: "Enable 2FA",
                      desc: "가능한 곳에는 2단계 인증을 추가하세요. 강력한 비밀번호도 보호 장치가 하나 더 있으면 훨씬 안전합니다.",
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
              <div className="text-center mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">자주 묻는 질문</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    q: "생성된 비밀번호는 안전한가요?",
                    a: "네. 비밀번호는 브라우저의 암호학적으로 안전한 난수 생성기(crypto.getRandomValues)로 만들어집니다. 어떤 서버로도 전송되지 않고 기록되거나 저장되지도 않습니다.",
                  },
                  {
                    q: "비밀번호는 몇 자가 적당한가요?",
                    a: "대부분의 계정에는 대문자, 소문자, 숫자, 기호를 섞어 최소 16자 이상을 쓰세요. 길수록 뚫기가 기하급수적으로 어려워지므로 서비스가 허용하는 최대 길이를 사용하시길 권합니다.",
                  },
                  {
                    q: "'헷갈리는 문자 제외'는 어떤 기능인가요?",
                    a: "0, O, 1, l, I처럼 눈으로 구분하기 어려운 문자를 제외합니다. 보안을 의미 있게 낮추지 않으면서도 읽고 직접 입력하기 쉬워집니다.",
                  },
                  {
                    q: "제 비밀번호가 서버로 전송되나요?",
                    a: "아니요. 모든 과정이 전적으로 브라우저에서 이뤄집니다. 비밀번호는 전송되거나 저장되거나 공유되지 않습니다. 탭을 닫으면 생성된 비밀번호는 완전히 사라집니다.",
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
