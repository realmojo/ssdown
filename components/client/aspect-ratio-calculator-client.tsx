"use client";

import { useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calculator,
  ArrowRight,
  Lightbulb,
  Maximize2,
  Monitor,
  Smartphone,
  ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Adsense from "@/components/Adsense";

// GCD function to simplify ratios
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

interface CommonRatio {
  name: string;
  ratio: string;
  width: number;
  height: number;
  description: string;
  icon: any;
}

export function AspectRatioCalculatorClient({ dict }: { dict?: any }) {
  const [width, setWidth] = useState<string>("1920");
  const [height, setHeight] = useState<string>("1080");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commonRatios: CommonRatio[] = [
    {
      name: "16:9 HD",
      ratio: "16:9",
      width: 1920,
      height: 1080,
      description: "YouTube, TV",
      icon: Monitor,
    },
    {
      name: "9:16 Vertical",
      ratio: "9:16",
      width: 1080,
      height: 1920,
      description: "TikTok, Stories",
      icon: Smartphone,
    },
    {
      name: "1:1 Square",
      ratio: "1:1",
      width: 1080,
      height: 1080,
      description: "Instagram Feed",
      icon: Maximize2,
    },
    {
      name: "4:3 Classic",
      ratio: "4:3",
      width: 1024,
      height: 768,
      description: "Old TV",
      icon: Monitor,
    },
    {
      name: "21:9 Ultrawide",
      ratio: "21:9",
      width: 2560,
      height: 1080,
      description: "Cinema",
      icon: Monitor,
    },
    {
      name: "4:5 Portrait",
      ratio: "4:5",
      width: 1080,
      height: 1350,
      description: "Instagram Portrait",
      icon: Smartphone,
    },
  ];

  const calculateRatio = useCallback((w: number, h: number) => {
    if (w <= 0 || h <= 0) return "Invalid";
    const divisor = gcd(w, h);
    const ratioW = w / divisor;
    const ratioH = h / divisor;
    return `${ratioW}:${ratioH}`;
  }, []);

  const handleWidthChange = (value: string) => {
    setWidth(value);
    const w = parseInt(value);
    const h = parseInt(height);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      setAspectRatio(calculateRatio(w, h));
    }
  };

  const handleHeightChange = (value: string) => {
    setHeight(value);
    const w = parseInt(width);
    const h = parseInt(value);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      setAspectRatio(calculateRatio(w, h));
    }
  };

  const applyPreset = (preset: CommonRatio) => {
    setWidth(preset.width.toString());
    setHeight(preset.height.toString());
    setAspectRatio(preset.ratio);
    setUploadedImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setWidth(img.width.toString());
        setHeight(img.height.toString());
        setAspectRatio(calculateRatio(img.width, img.height));
        setUploadedImage(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-5xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 mb-6">
          <Calculator className="w-10 h-10 text-violet-600 dark:text-violet-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.aspect_ratio_calculator?.title || "Aspect Ratio Calculator"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.aspect_ratio_calculator?.subtitle ||
            "Calculate aspect ratios and resolutions for video editing. Perfect for content creators."}
        </p>

        <Adsense slotId="7759160077" />

        <div className="w-full grid md:grid-cols-2 gap-8 items-start">
          {/* Calculator Side */}
          <Card className="border-violet-100 dark:border-violet-900/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-violet-500" />
                Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-3">
                <Label>Upload Image (Optional)</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-violet-200 dark:border-violet-800 rounded-xl p-6 text-center cursor-pointer hover:border-violet-400 dark:hover:border-violet-600 transition-colors bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-900/10 dark:to-purple-900/10"
                >
                  {uploadedImage ? (
                    <div className="space-y-3">
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="max-h-32 mx-auto rounded-lg object-contain"
                      />
                      <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">
                        Image dimensions detected!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="w-12 h-12 mx-auto text-violet-300 dark:text-violet-700" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload an image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        We'll auto-detect dimensions
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">
                    {dict?.aspect_ratio_calculator?.width_label || "Width (px)"}
                  </Label>
                  <Input
                    id="width"
                    type="number"
                    placeholder="1920"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">
                    {dict?.aspect_ratio_calculator?.height_label ||
                      "Height (px)"}
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="1080"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {dict?.aspect_ratio_calculator?.ratio_label || "Aspect Ratio"}
                </p>
                <p className="text-4xl font-bold text-violet-600 dark:text-violet-400">
                  {aspectRatio}
                </p>
                {width && height && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {width} × {height} pixels
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Presets Side */}
          <Card className="border-violet-100 dark:border-violet-900/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Maximize2 className="w-5 h-5 text-violet-500" />
                {dict?.aspect_ratio_calculator?.common_ratios ||
                  "Common Ratios"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {commonRatios.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPreset(preset)}
                    className="flex flex-col items-start p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all group text-left"
                  >
                    <div className="flex items-center gap-2 mb-2 w-full">
                      <preset.icon className="w-4 h-4 text-violet-500" />
                      <span className="font-semibold text-sm">
                        {preset.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {preset.description}
                    </p>
                    <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                      {preset.width} × {preset.height}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Guide, Tips, FAQ */}
      <div className="w-full max-w-5xl mx-auto mt-16 px-4 space-y-16">
        {/* How to Use */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              {dict?.aspect_ratio_calculator?.guide_title || "How to Use"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.aspect_ratio_calculator?.guide_desc ||
                "Get your aspect ratio calculations in seconds."}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title:
                  dict?.aspect_ratio_calculator?.step1_title ||
                  "Enter Dimensions",
                desc:
                  dict?.aspect_ratio_calculator?.step1_desc ||
                  "Input your video or image width and height in pixels.",
                icon: Calculator,
              },
              {
                step: 2,
                title:
                  dict?.aspect_ratio_calculator?.step2_title || "View Ratio",
                desc:
                  dict?.aspect_ratio_calculator?.step2_desc ||
                  "See the simplified aspect ratio automatically calculated.",
                icon: ArrowRight,
              },
              {
                step: 3,
                title:
                  dict?.aspect_ratio_calculator?.step3_title || "Quick Presets",
                desc:
                  dict?.aspect_ratio_calculator?.step3_desc ||
                  "Use common presets like 16:9, 4:3, or 1:1 for instant calculations.",
                icon: Maximize2,
              },
            ].map((step) => (
              <div
                key={step.step}
                className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center mb-4">
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
              <h2 className="text-3xl font-bold mb-4">
                {dict?.aspect_ratio_calculator?.tips_title ||
                  "Aspect Ratio Tips"}
              </h2>
              <p className="text-muted-foreground">
                {dict?.aspect_ratio_calculator?.tips_desc ||
                  "Get the most out of your video dimensions."}
              </p>
            </div>

            <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
              {[
                {
                  title:
                    dict?.aspect_ratio_calculator?.tip1_title ||
                    "YouTube Standard",
                  desc: dict?.aspect_ratio_calculator?.tip1_desc,
                },
                {
                  title:
                    dict?.aspect_ratio_calculator?.tip2_title ||
                    "Instagram Feed",
                  desc: dict?.aspect_ratio_calculator?.tip2_desc,
                },
                {
                  title:
                    dict?.aspect_ratio_calculator?.tip3_title ||
                    "TikTok & Stories",
                  desc: dict?.aspect_ratio_calculator?.tip3_desc,
                },
                {
                  title:
                    dict?.aspect_ratio_calculator?.tip4_title ||
                    "Maintain Quality",
                  desc: dict?.aspect_ratio_calculator?.tip4_desc,
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

        {/* FAQ */}
        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              {dict?.qna_aspect_ratio_calculator?.title || "FAQ"}
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {[1, 2, 3].map((num) => (
              <AccordionItem key={num} value={`item-${num}`}>
                <AccordionTrigger>
                  {dict?.qna_aspect_ratio_calculator?.[`faq_${num}_q`] ||
                    `Question ${num}`}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.qna_aspect_ratio_calculator?.[`faq_${num}_a`] ||
                    `Answer ${num}`}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}
