"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Palette,
  Pipette,
  Copy,
  Lightbulb,
  ArrowRight,
  Eye,
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

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Hsl {
  h: number;
  s: number;
  l: number;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(input: string): string | null {
  let hex = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return hex.toLowerCase();
  }
  return null;
}

function hexToRgb(input: string): Rgb | null {
  const hex = normalizeHex(input);
  if (!hex) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = ((gn - bn) / delta) % 6;
        break;
      case gn:
        h = (bn - rn) / delta + 2;
        break;
      default:
        h = (rn - gn) / delta + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;

  let rn = 0;
  let gn = 0;
  let bn = 0;

  if (h < 60) [rn, gn, bn] = [c, x, 0];
  else if (h < 120) [rn, gn, bn] = [x, c, 0];
  else if (h < 180) [rn, gn, bn] = [0, c, x];
  else if (h < 240) [rn, gn, bn] = [0, x, c];
  else if (h < 300) [rn, gn, bn] = [x, 0, c];
  else [rn, gn, bn] = [c, 0, x];

  return {
    r: Math.round((rn + m) * 255),
    g: Math.round((gn + m) * 255),
    b: Math.round((bn + m) * 255),
  };
}

export function ColorConverterClient({ dict }: { dict?: any }) {
  const [rgb, setRgb] = useState<Rgb>({ r: 255, g: 136, b: 0 });
  const [hexDraft, setHexDraft] = useState("#ff8800");

  const hsl = useMemo(() => rgbToHsl(rgb), [rgb]);
  const canonicalHex = useMemo(() => rgbToHex(rgb), [rgb]);
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const applyRgb = useCallback((next: Rgb) => {
    setRgb(next);
    setHexDraft(rgbToHex(next));
  }, []);

  const handleHexChange = useCallback((value: string) => {
    setHexDraft(value);
    const parsed = hexToRgb(value);
    if (parsed) setRgb(parsed);
  }, []);

  const handleRgbChannel = useCallback(
    (channel: keyof Rgb, value: string) => {
      const num = clamp(parseInt(value, 10), 0, 255);
      applyRgb({ ...rgb, [channel]: num });
    },
    [rgb, applyRgb],
  );

  const handleHslChannel = useCallback(
    (channel: keyof Hsl, value: string) => {
      const max = channel === "h" ? 360 : 100;
      const num = clamp(parseInt(value, 10), 0, max);
      applyRgb(hslToRgb({ ...hsl, [channel]: num }));
    },
    [hsl, applyRgb],
  );

  const handlePicker = useCallback(
    (value: string) => {
      const parsed = hexToRgb(value);
      if (parsed) {
        setRgb(parsed);
        setHexDraft(value.toLowerCase());
      }
    },
    [],
  );

  const handleCopy = useCallback((label: string, value: string) => {
    navigator.clipboard.writeText(value).then(
      () => toast.success(`${label} copied: ${value}`),
      () => toast.error("클립보드에 복사하지 못했습니다"),
    );
  }, []);

  const formatRows: { label: string; value: string }[] = [
    { label: "HEX", value: canonicalHex },
    { label: "RGB", value: rgbString },
    { label: "HSL", value: hslString },
  ];

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-5xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 mb-6">
              <Palette className="w-10 h-10 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {dict?.color_converter?.title || "색상 변환기"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {dict?.color_converter?.subtitle ||
                "HEX, RGB, HSL 색상을 실시간으로 변환하고 미리보기와 한 번의 클릭 복사를 제공합니다."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Converter */}
            <div className="w-full grid gap-6 lg:grid-cols-2 mt-8">
              {/* Preview + Picker */}
              <Card className="border-orange-100 dark:border-orange-900/50 shadow-sm overflow-hidden">
                <div
                  className="w-full h-56 md:h-64 transition-colors duration-150"
                  style={{ backgroundColor: canonicalHex }}
                  aria-label="색상 미리보기"
                />
                <CardContent className="pt-6">
                  <label className="flex items-center justify-between gap-4 cursor-pointer">
                    <span className="flex items-center gap-2 font-medium">
                      <Pipette className="w-5 h-5 text-orange-500" />
                      색상 선택기
                    </span>
                    <input
                      type="color"
                      value={canonicalHex}
                      onChange={(e) => handlePicker(e.target.value)}
                      className="w-16 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent cursor-pointer p-1"
                    />
                  </label>
                </CardContent>
              </Card>

              {/* Value editors */}
              <Card className="border-orange-100 dark:border-orange-900/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-orange-500" />
                    Formats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* HEX */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">
                      HEX
                    </label>
                    <input
                      type="text"
                      value={hexDraft}
                      onChange={(e) => handleHexChange(e.target.value)}
                      placeholder="#ff8800"
                      spellCheck={false}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
                    />
                  </div>

                  {/* RGB */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">
                      RGB
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["r", "g", "b"] as const).map((ch) => (
                        <div key={ch}>
                          <span className="block text-xs text-muted-foreground mb-1 uppercase">
                            {ch}
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={255}
                            value={rgb[ch]}
                            onChange={(e) => handleRgbChannel(ch, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* HSL */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">
                      HSL
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["h", "s", "l"] as const).map((ch) => (
                        <div key={ch}>
                          <span className="block text-xs text-muted-foreground mb-1 uppercase">
                            {ch === "h" ? "H°" : ch === "s" ? "S%" : "L%"}
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={ch === "h" ? 360 : 100}
                            value={hsl[ch]}
                            onChange={(e) => handleHslChannel(ch, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Canonical strings + copy */}
            <div className="w-full grid gap-3 sm:grid-cols-3 mt-6">
              {formatRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-2 p-3 rounded-xl border border-orange-100 dark:border-orange-900/40 bg-orange-50/60 dark:bg-orange-900/10"
                >
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-orange-600 dark:text-orange-400">
                      {row.label}
                    </span>
                    <span className="block font-mono text-sm truncate">
                      {row.value}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(row.label, row.value)}
                    aria-label={`${row.label} 값 복사`}
                    className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
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
                  세 단계면 색상 형식을 서로 변환할 수 있습니다.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: "고르거나 직접 입력",
                    desc: "색상 선택기를 쓰거나 HEX, RGB, HSL 칸에 값을 직접 입력하세요.",
                    icon: Pipette,
                  },
                  {
                    step: 2,
                    title: "모든 형식 한눈에 보기",
                    desc: "모든 표기가 실시간으로 갱신되며 큼직하고 정확한 색상 미리보기가 함께 표시됩니다.",
                    icon: Eye,
                  },
                  {
                    step: 3,
                    title: "Copy & Use",
                    desc: "각 형식 옆의 복사 버튼을 누르면 CSS에 바로 쓸 수 있는 문자열이 복사됩니다.",
                    icon: ArrowRight,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center mb-4">
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
                  <h2 className="text-3xl font-bold mb-4">색상 팁</h2>
                  <p className="text-muted-foreground">
                    각 색상 형식을 더 잘 활용하는 방법입니다.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "HSL로 색 조절하기",
                      desc: "HSL을 쓰면 색조는 그대로 두고 L이나 S 값만 조절해 색을 밝게, 어둡게, 또는 채도를 낮게 만들기 쉽습니다.",
                    },
                    {
                      title: "축약형 HEX",
                      desc: "#f80 같은 코드는 #ff8800으로 확장됩니다. 축약형은 각 채널의 숫자가 반복될 때만 쓸 수 있습니다.",
                    },
                    {
                      title: "일관된 브랜드 색상",
                      desc: "디자인 도구용으로는 브랜드 색상을 HEX로 보관하되, 캔버스·그라데이션·투명도 작업을 위해 RGB도 함께 알아 두세요.",
                    },
                    {
                      title: "명암 대비 확인",
                      desc: "글자와 배경의 밝기 차이를 충분히 두어야 화면이 읽기 쉽고 접근성이 좋아집니다.",
                    },
                  ].map((tip, idx) => (
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
                <h2 className="text-2xl font-bold tracking-tight mb-4">자주 묻는 질문</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    q: "HEX 색상을 RGB로 어떻게 변환하나요?",
                    a: "Paste or type your HEX value (for example #ff8800) into the HEX field. The converter instantly updates the RGB and HSL fields, showing the equivalent values and a live preview.",
                  },
                  {
                    q: "HEX, RGB, HSL은 무엇이 다른가요?",
                    a: "HEX is a hexadecimal notation for red, green, and blue channels used in CSS. RGB expresses the same channels as decimal numbers from 0 to 255. HSL describes a color by hue, saturation, and lightness, which is often more intuitive for adjusting colors.",
                  },
                  {
                    q: "3자리 축약형 HEX 코드도 지원하나요?",
                    a: "Yes. 축약형 HEX values like #f80 are automatically expanded to their full six-digit form (#ff8800) before conversion, so both formats work seamlessly.",
                  },
                  {
                    q: "제 색상 데이터가 서버로 전송되나요?",
                    a: "No. All conversions happen entirely in your browser using JavaScript. Nothing is uploaded or stored, so your work stays completely private.",
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
