"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Pipette,
  Copy,
  Check,
  Palette,
  Sliders,
  Lightbulb,
  Info,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

const FALLBACK_FAQ = [
  {
    question: "What's the difference between HEX, RGB, and HSL?",
    answer:
      "They are three ways to describe the same color. HEX (e.g. #3B82F6) is a compact hexadecimal notation popular in CSS and design tools. RGB (e.g. rgb(59, 130, 246)) describes a color by its red, green, and blue channel intensities, which is convenient for canvas and JavaScript color math. HSL (e.g. hsl(217, 91%, 60%)) describes a color by hue, saturation, and lightness, which makes it easy to adjust brightness or create variants.",
  },
  {
    question: "Is this color converter free and private?",
    answer:
      "Yes. The tool is completely free to use and all conversion happens locally in your browser. No color values are ever uploaded to a server, so your work stays private.",
  },
  {
    question: "Does it support alpha or transparency?",
    answer:
      "Not in this version. The converter works with opaque colors only (HEX, RGB, and HSL without an alpha channel). Support for RGBA/HSLA transparency may be added later.",
  },
  {
    question: "What is the eyedropper tool and which browsers support it?",
    answer:
      "The eyedropper (Pick from Screen) lets you sample any color from your screen using the native browser EyeDropper API. It is available in Chromium-based browsers such as Chrome and Edge. If your browser does not support it, the button is hidden automatically.",
  },
  {
    question: "Is there a limit on how many colors I can convert?",
    answer:
      "No. You can convert as many colors as you like, as often as you like. There are no limits, accounts, or sign-ups required.",
  },
];

const PRESETS = [
  { name: "Red", hex: "#EF4444" },
  { name: "Orange", hex: "#F97316" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Lime", hex: "#84CC16" },
  { name: "Green", hex: "#22C55E" },
  { name: "Teal", hex: "#14B8A6" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Indigo", hex: "#6366F1" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Pink", hex: "#EC4899" },
];

const INITIAL_RGB: Rgb = { r: 59, g: 130, b: 246 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string): Rgb | null {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) =>
    clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const hn = ((h % 360) + 360) % 360;
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (hn < 60) [r, g, b] = [c, x, 0];
  else if (hn < 120) [r, g, b] = [x, c, 0];
  else if (hn < 180) [r, g, b] = [0, c, x];
  else if (hn < 240) [r, g, b] = [0, x, c];
  else if (hn < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function ColorConverterClient({ dict }: { dict?: any }) {
  const t = dict?.color_converter || {};

  const [rgb, setRgb] = useState<Rgb>(INITIAL_RGB);
  const [hexStr, setHexStr] = useState<string>(
    rgbToHex(INITIAL_RGB.r, INITIAL_RGB.g, INITIAL_RGB.b),
  );
  const [hsl, setHsl] = useState<Hsl>(
    rgbToHsl(INITIAL_RGB.r, INITIAL_RGB.g, INITIAL_RGB.b),
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [eyeDropperSupported, setEyeDropperSupported] = useState(false);

  // Feature-detect the EyeDropper API only after hydration so SSR and the
  // first client render agree (button is absent on both) before revealing it.
  useEffect(() => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEyeDropperSupported(true);
    }
  }, []);

  // Canonical hex derived from rgb — always valid for swatch and color picker.
  const currentHex = rgbToHex(rgb.r, rgb.g, rgb.b);

  // Set color from a fully-known RGB value and sync every field.
  const applyRgb = useCallback((next: Rgb) => {
    setRgb(next);
    setHexStr(rgbToHex(next.r, next.g, next.b));
    setHsl(rgbToHsl(next.r, next.g, next.b));
  }, []);

  const applyHex = useCallback(
    (hex: string) => {
      const parsed = hexToRgb(hex);
      if (parsed) applyRgb(parsed);
    },
    [applyRgb],
  );

  // Hex text input: keep raw input so partial typing (e.g. "#3B") isn't reset.
  const handleHexChange = (value: string) => {
    setHexStr(value);
    const parsed = hexToRgb(value);
    if (parsed) {
      setRgb(parsed);
      setHsl(rgbToHsl(parsed.r, parsed.g, parsed.b));
    }
  };

  const handleRgbChange = (channel: keyof Rgb, value: string) => {
    const n = value === "" ? 0 : parseInt(value, 10);
    if (Number.isNaN(n)) return;
    applyRgb({ ...rgb, [channel]: clamp(n, 0, 255) });
  };

  // HSL keeps its own state so editing lightness/saturation doesn't drift via rounding.
  const handleHslChange = (channel: keyof Hsl, value: string, max: number) => {
    const n = value === "" ? 0 : parseInt(value, 10);
    if (Number.isNaN(n)) return;
    const nextHsl = { ...hsl, [channel]: clamp(n, 0, max) };
    setHsl(nextHsl);
    const nextRgb = hslToRgb(nextHsl.h, nextHsl.s, nextHsl.l);
    setRgb(nextRgb);
    setHexStr(rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b));
  };

  const copyValue = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      toast.success(
        (t.copied || "Copied") + `: ${value}`,
      );
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (err) {
      console.error("Failed to copy", err);
      toast.error(t.copy_failed || "Failed to copy");
    }
  };

  const handleEyeDropper = async () => {
    try {
      // Feature-detected above; cast because EyeDropper is not yet in TS DOM lib.
      const EyeDropperCtor = (window as any).EyeDropper;
      const eyeDropper = new EyeDropperCtor();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) applyHex(result.sRGBHex);
    } catch {
      // User canceled the picker (promise rejects) — ignore silently.
    }
  };

  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const rgbFields: { key: keyof Rgb; label: string }[] = [
    { key: "r", label: "R" },
    { key: "g", label: "G" },
    { key: "b", label: "B" },
  ];

  const hslFields: { key: keyof Hsl; label: string; max: number }[] = [
    { key: "h", label: "H", max: 360 },
    { key: "s", label: "S", max: 100 },
    { key: "l", label: "L", max: 100 },
  ];

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-colors";

  const copyBtnClass =
    "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 hover:border-fuchsia-300 dark:hover:border-fuchsia-700 transition-colors";

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 mb-6">
              <Pipette className="w-10 h-10 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t.title || "Color Converter"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {t.subtitle ||
                "Convert colors between HEX, RGB, and HSL instantly. Everything runs locally in your browser — free, fast, and private."}
            </p>

            <Adsense slotId="7759160077" />

            <Card className="w-full border-fuchsia-100 dark:border-fuchsia-900/50 shadow-sm">
              <CardContent className="pt-6 space-y-8">
                {/* Preview + picker */}
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <label
                    className="relative w-40 h-40 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner cursor-pointer overflow-hidden shrink-0"
                    style={{ backgroundColor: currentHex }}
                    aria-label={t.pick_visually || "Pick a color visually"}
                  >
                    <input
                      type="color"
                      value={currentHex}
                      onChange={(e) => applyHex(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </label>

                  <div className="flex-1 w-full space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-mono font-bold tracking-tight">
                        {currentHex}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t.preview_hint ||
                        "Click the swatch to open your system color picker, or edit any field below to convert live."}
                    </p>
                    {eyeDropperSupported && (
                      <button
                        onClick={handleEyeDropper}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:opacity-90 transition-opacity shadow-sm"
                      >
                        <Pipette className="w-4 h-4" />
                        {t.pick_screen || "Pick from Screen"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Presets */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    {t.presets_label || "Presets"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        onClick={() => applyHex(preset.hex)}
                        title={`${preset.name} (${preset.hex})`}
                        aria-label={preset.name}
                        className={cn(
                          "w-9 h-9 rounded-full border-2 transition-transform hover:scale-110",
                          currentHex.toLowerCase() === preset.hex.toLowerCase()
                            ? "border-fuchsia-500 ring-2 ring-fuchsia-500/30"
                            : "border-white dark:border-gray-800 shadow-sm",
                        )}
                        style={{ backgroundColor: preset.hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Format groups */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* HEX */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">HEX</span>
                      <button
                        onClick={() => copyValue("hex", currentHex)}
                        className={copyBtnClass}
                      >
                        {copiedKey === "hex" ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {t.copy || "Copy"}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={hexStr}
                      onChange={(e) => handleHexChange(e.target.value)}
                      placeholder="#3B82F6"
                      spellCheck={false}
                      className={cn(inputClass, "font-mono uppercase")}
                    />
                  </div>

                  {/* RGB */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">RGB</span>
                      <button
                        onClick={() => copyValue("rgb", rgbString)}
                        className={copyBtnClass}
                      >
                        {copiedKey === "rgb" ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {t.copy || "Copy"}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {rgbFields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-xs text-muted-foreground mb-1 text-center">
                            {field.label}
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={255}
                            value={rgb[field.key]}
                            onChange={(e) =>
                              handleRgbChange(field.key, e.target.value)
                            }
                            className={cn(inputClass, "text-center")}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* HSL */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">HSL</span>
                      <button
                        onClick={() => copyValue("hsl", hslString)}
                        className={copyBtnClass}
                      >
                        {copiedKey === "hsl" ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {t.copy || "Copy"}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {hslFields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-xs text-muted-foreground mb-1 text-center">
                            {field.label}
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={field.max}
                            value={hsl[field.key]}
                            onChange={(e) =>
                              handleHslChange(
                                field.key,
                                e.target.value,
                                field.max,
                              )
                            }
                            className={cn(inputClass, "text-center")}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
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
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t.guide_desc ||
                    "Convert a color between three formats in seconds."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: t.step1_title || "Enter a Color",
                    desc:
                      t.step1_desc ||
                      "Type a value in any format, click the swatch to pick visually, or sample a color from your screen.",
                    icon: Palette,
                  },
                  {
                    step: 2,
                    title: t.step2_title || "See It Converted",
                    desc:
                      t.step2_desc ||
                      "The color is instantly translated to the other two formats and shown in a live preview.",
                    icon: ArrowRight,
                  },
                  {
                    step: 3,
                    title: t.step3_title || "Copy the Value",
                    desc:
                      t.step3_desc ||
                      "Click the copy button next to the format you need and paste it straight into your project.",
                    icon: Copy,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/20 dark:to-pink-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    {t.tips_title || "Color Tips"}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.tips_desc ||
                      "Pick the right format for the job and use color with intention."}
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: t.tip1_title || "Use HEX for Design & CSS",
                      desc:
                        t.tip1_desc ||
                        "HEX is the most common format in CSS, design tools, and style guides. It's compact and easy to share.",
                    },
                    {
                      title: t.tip2_title || "Use RGB for Color Math",
                      desc:
                        t.tip2_desc ||
                        "RGB channels map directly to how screens render color, making it ideal for canvas work and JavaScript color calculations.",
                    },
                    {
                      title: t.tip3_title || "Use HSL to Adjust Colors",
                      desc:
                        t.tip3_desc ||
                        "HSL lets you tweak hue, saturation, and lightness independently — perfect for programmatically generating color variants.",
                    },
                    {
                      title: t.tip4_title || "Mind Contrast for Text",
                      desc:
                        t.tip4_desc ||
                        "For accessible text-on-background, ensure enough contrast. Nudge HSL lightness up or down until foreground and background are clearly distinct.",
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-fuchsia-600 dark:text-fuchsia-400 mb-2">
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

            {/* Feature note */}
            <section className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <Sliders className="w-4 h-4 text-fuchsia-500" />
              <span>
                {t.feature_note ||
                  "Bidirectional live conversion — edit HEX, RGB, or HSL and the others update instantly."}
              </span>
              <Info className="w-4 h-4 text-fuchsia-500" />
            </section>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  {t.faq_title || "FAQ"}
                </h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {(dict?.page_color_converter?.faq || FALLBACK_FAQ).map(
                  (
                    faq: { question: string; answer: string },
                    idx: number,
                  ) => (
                    <AccordionItem key={idx} value={`item-${idx + 1}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ),
                )}
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
