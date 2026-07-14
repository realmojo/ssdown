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
      () => toast.error("Failed to copy to clipboard"),
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
              {dict?.color_converter?.title || "Color Converter"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {dict?.color_converter?.subtitle ||
                "Convert colors between HEX, RGB, and HSL in real time, with a live preview and one-click copy."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Converter */}
            <div className="w-full grid gap-6 lg:grid-cols-2 mt-8">
              {/* Preview + Picker */}
              <Card className="border-orange-100 dark:border-orange-900/50 shadow-sm overflow-hidden">
                <div
                  className="w-full h-56 md:h-64 transition-colors duration-150"
                  style={{ backgroundColor: canonicalHex }}
                  aria-label="Color preview"
                />
                <CardContent className="pt-6">
                  <label className="flex items-center justify-between gap-4 cursor-pointer">
                    <span className="flex items-center gap-2 font-medium">
                      <Pipette className="w-5 h-5 text-orange-500" />
                      Color Picker
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
                    aria-label={`Copy ${row.label} value`}
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
                  How to Use
                </h2>
                <p className="text-muted-foreground">
                  Convert between color formats in three simple steps.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: "Pick or Enter",
                    desc: "Use the color picker, or type a value directly into the HEX, RGB, or HSL fields.",
                    icon: Pipette,
                  },
                  {
                    step: 2,
                    title: "See Every Format",
                    desc: "All representations update live alongside a large, accurate color preview.",
                    icon: Eye,
                  },
                  {
                    step: 3,
                    title: "Copy & Use",
                    desc: "Click the copy button next to any format to grab the CSS-ready string instantly.",
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
                  <h2 className="text-3xl font-bold mb-4">Color Tips</h2>
                  <p className="text-muted-foreground">
                    Get the most out of every color format.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Use HSL to Adjust",
                      desc: "HSL makes it easy to lighten, darken, or desaturate a color: just tweak the L or S value without touching the hue.",
                    },
                    {
                      title: "Shorthand HEX",
                      desc: "Codes like #f80 expand to #ff8800. Shorthand only works when each channel has a repeated digit.",
                    },
                    {
                      title: "Consistent Branding",
                      desc: "Store brand colors as HEX for design tools, but keep RGB handy for canvas, gradients, and opacity overlays.",
                    },
                    {
                      title: "Check Contrast",
                      desc: "Aim for enough lightness difference between text and background so your UI stays readable and accessible.",
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
                <h2 className="text-2xl font-bold tracking-tight mb-4">FAQ</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    q: "How do I convert a HEX color to RGB?",
                    a: "Paste or type your HEX value (for example #ff8800) into the HEX field. The converter instantly updates the RGB and HSL fields, showing the equivalent values and a live preview.",
                  },
                  {
                    q: "What is the difference between HEX, RGB, and HSL?",
                    a: "HEX is a hexadecimal notation for red, green, and blue channels used in CSS. RGB expresses the same channels as decimal numbers from 0 to 255. HSL describes a color by hue, saturation, and lightness, which is often more intuitive for adjusting colors.",
                  },
                  {
                    q: "Does this tool support 3-digit shorthand HEX codes?",
                    a: "Yes. Shorthand HEX values like #f80 are automatically expanded to their full six-digit form (#ff8800) before conversion, so both formats work seamlessly.",
                  },
                  {
                    q: "Is my color data sent to a server?",
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
