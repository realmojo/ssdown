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
      toast.success("클립보드에 복사했습니다");
      window.setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      toast.error("복사하지 못했습니다");
    }
  }, []);

  const handleCopyAll = useCallback(async () => {
    if (uuids.length === 0) return;
    try {
      await navigator.clipboard.writeText(uuids.join("\n"));
      toast.success(`Copied ${uuids.length} UUIDs`);
    } catch {
      toast.error("복사하지 못했습니다");
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
    <div className="w-full">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex w-full flex-col">
            <div className="hidden">
              <Fingerprint className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
              UUID 생성기
            </h1>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              UUID v4·v7 식별자를 한 번에 여러 개 만들고, 복사와 형식 옵션도 제공합니다.
            </p>

            <Adsense slotId="7759160077" />

            {/* Controls */}
            <Card className="w-full border-emerald-100 dark:border-emerald-900/50 shadow-sm mb-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-emerald-500" />
                  Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
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
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={uppercase}
                      onChange={(e) => setUppercase(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/50 accent-emerald-600"
                    />
                    <span className="text-sm">대문자</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={removeHyphens}
                      onChange={(e) => setRemoveHyphens(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/50 accent-emerald-600"
                    />
                    <span className="text-sm">하이픈 제거</span>
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
                    전체 복사
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
                  <div className="text-center py-3 text-muted-foreground text-sm">
                    생성 버튼을 누르면 UUID가 만들어집니다.
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
                          aria-label="UUID 복사"
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
          <div className="w-full max-w-5xl mx-auto mt-3 px-4 space-y-3">
            {/* How to Use */}
            <section>
              <div className="text-center mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  이용 방법
                </h2>
                <p className="text-muted-foreground">
                  몇 초 만에 고유 식별자를 만들어 보세요.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-2">
                {[
                  {
                    step: 1,
                    title: "버전 선택",
                    desc: "완전 무작위 식별자가 필요하면 UUID v4를, 시간순으로 정렬 가능한 식별자가 필요하면 UUID v7을 고르세요.",
                    icon: Fingerprint,
                  },
                  {
                    step: 2,
                    title: "개수와 형식 설정",
                    desc: "필요한 개수를 입력한 뒤 대문자 표기나 하이픈 제거 옵션을 켜고 끄세요.",
                    icon: Settings2,
                  },
                  {
                    step: 3,
                    title: "Generate & Copy",
                    desc: "생성을 누른 뒤 값 하나 또는 전체 목록을 한 번의 클릭으로 복사하세요.",
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
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-2 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">UUID 팁</h2>
                  <p className="text-muted-foreground">
                    용도에 맞는 식별자를 고르는 방법입니다.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "데이터베이스 키에는 v7",
                      desc: "UUID v7은 앞부분에 타임스탬프를 담아 대체로 시간순으로 삽입됩니다. 덕분에 B-트리 인덱스가 조밀하게 유지되고 무작위인 v4보다 삽입이 빠릅니다.",
                    },
                    {
                      title: "노출용 토큰에는 v4",
                      desc: "식별자에서 어떤 정보도 새어 나가지 않기를 원한다면, 완전히 무작위인 v4가 세션 토큰이나 API 키, 외부에 노출되는 참조 값에 적합합니다.",
                    },
                    {
                      title: "형식은 표시용일 뿐",
                      desc: "대문자 표기와 하이픈 제거는 겉모습만 바꿉니다. 동일한 128비트 값이 유지되므로 표준 형태로 되돌리면 그대로 호환됩니다.",
                    },
                    {
                      title: "중복 가능성은 무시할 수준",
                      desc: "122비트의 무작위성 덕분에 중복이 생길 확률이 천문학적으로 낮아, 두 버전 모두 분산 시스템에서 안전하게 쓸 수 있습니다.",
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
              <div className="text-center mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">자주 묻는 질문</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    q: "UUID v4와 v7은 무엇이 다른가요?",
                    a: "UUID v4는 완전히 무작위라 고유성은 뛰어나지만 순서가 없습니다. UUID v7은 앞부분에 유닉스 밀리초 타임스탬프를 담아 시간순으로 정렬되면서도 충돌을 피할 만큼 무작위성을 유지합니다. 외부에 노출되는 키에는 v4를, 데이터베이스에서 정렬 가능한 기본 키가 필요하면 v7을 사용하세요.",
                  },
                  {
                    q: "이 UUID를 데이터베이스 기본 키로 써도 되나요?",
                    a: "네. 두 버전 모두 128비트 식별자로 충돌 확률이 극히 낮습니다. 특히 UUID v7은 시간순 구조 덕분에 인덱스 단편화가 줄고 무작위인 v4보다 삽입 성능이 좋아 기본 키로 권장됩니다.",
                  },
                  {
                    q: "여기서 UUID를 만들 때 제 데이터는 안전한가요?",
                    a: "물론입니다. 모든 UUID는 브라우저에 내장된 Web Crypto API로 전적으로 브라우저 안에서 만들어집니다. 서버로 전송되거나 기록되거나 저장되지 않습니다. 탭을 닫으면 생성된 값은 사라집니다.",
                  },
                  {
                    q: "한 번에 몇 개까지 만들 수 있나요?",
                    a: "한 번에 1개부터 100개까지 만들 수 있습니다. 개수를 조정하고 버전과 형식 옵션을 고른 뒤 생성을 누르면 전체 목록이 만들어지며, 하나씩 또는 전체를 한 번에 복사할 수 있습니다.",
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
