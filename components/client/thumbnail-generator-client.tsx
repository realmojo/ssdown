"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Image as ImageIcon,
  Type,
  Palette,
  Download,
  BookOpen,
  Lightbulb,
  Info,
  X as XIcon,
  Smile,
  Upload,
} from "lucide-react";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

interface Template {
  id: string;
  label: string;
  width: number;
  height: number;
}

interface Sticker {
  emoji: string;
  x: number;
  y: number;
  size: number;
}

const templates: Template[] = [
  { id: "youtube", label: "YouTube", width: 1280, height: 720 },
  { id: "instagram", label: "Instagram", width: 1080, height: 1080 },
  { id: "twitter", label: "Twitter", width: 1500, height: 500 },
];

const fonts = [
  "Arial",
  "Impact",
  "Verdana",
  "Georgia",
  "Times New Roman",
  "Courier New",
];

const emojiStickers = [
  "🔥",
  "💯",
  "🚀",
  "⭐",
  "❤️",
  "👍",
  "👑",
  "⚡",
  "💪",
  "🎉",
  "😍",
  "🤩",
  "💎",
  "🎯",
  "✨",
  "🌟",
  "🏆",
  "💰",
  "🎮",
  "📱",
];

export function ThumbnailGeneratorClient({ dict }: { dict?: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<string>("youtube");
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string>("");
  const [title, setTitle] = useState<string>("Your Awesome Title");
  const [subtitle, setSubtitle] = useState<string>("Click to get started");
  const [titleSize, setTitleSize] = useState<number>(64);
  const [titleColor, setTitleColor] = useState<string>("#FFFFFF");
  const [subtitleSize, setSubtitleSize] = useState<number>(36);
  const [subtitleColor, setSubtitleColor] = useState<string>("#CCCCCC");
  const [titleFont, setTitleFont] = useState<string>("Impact");
  const [subtitleFont, setSubtitleFont] = useState<string>("Arial");
  const [selectedStickers, setSelectedStickers] = useState<Sticker[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const template = templates.find((t) => t.id === selectedTemplate)!;

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = template.width;
    canvas.height = template.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundImage) {
      const scale = Math.max(
        canvas.width / backgroundImage.width,
        canvas.height / backgroundImage.height,
      );
      const x = (canvas.width - backgroundImage.width * scale) / 2;
      const y = (canvas.height - backgroundImage.height * scale) / 2;
      ctx.drawImage(
        backgroundImage,
        x,
        y,
        backgroundImage.width * scale,
        backgroundImage.height * scale,
      );
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#1e3a8a");
      gradient.addColorStop(1, "#7c3aed");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (title) {
      ctx.font = `bold ${titleSize}px ${titleFont}`;
      ctx.fillStyle = titleColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
      ctx.lineWidth = 4;
      ctx.strokeText(title, canvas.width / 2, canvas.height * 0.4);
      ctx.fillText(title, canvas.width / 2, canvas.height * 0.4);
    }

    if (subtitle) {
      ctx.font = `bold ${subtitleSize}px ${subtitleFont}`;
      ctx.fillStyle = subtitleColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
      ctx.lineWidth = 3;
      ctx.strokeText(subtitle, canvas.width / 2, canvas.height * 0.55);
      ctx.fillText(subtitle, canvas.width / 2, canvas.height * 0.55);
    }

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    selectedStickers.forEach((sticker) => {
      ctx.font = `${sticker.size}px Arial`;
      ctx.fillText(sticker.emoji, sticker.x, sticker.y);
    });
  }, [
    template,
    backgroundImage,
    title,
    subtitle,
    titleSize,
    titleColor,
    subtitleSize,
    subtitleColor,
    titleFont,
    subtitleFont,
    selectedStickers,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setBackgroundImage(img);
          setBackgroundUrl(event.target?.result as string);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setBackgroundImage(img);
          setBackgroundUrl(event.target?.result as string);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const addSticker = (emoji: string) => {
    setSelectedStickers([
      ...selectedStickers,
      {
        emoji,
        x: template.width / 2,
        y: template.height / 2,
        size: 80,
      },
    ]);
  };

  const removeSticker = (index: number) => {
    setSelectedStickers(selectedStickers.filter((_, i) => i !== index));
  };

  const handleExport = (format: "png" | "jpeg") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mimeType = format === "png" ? "image/png" : "image/jpeg";
    const quality = format === "jpeg" ? 0.95 : undefined;
    const dataUrl = canvas.toDataURL(mimeType, quality);
    const link = document.createElement("a");
    link.download = `thumbnail-${template.width}x${template.height}.${format === "jpeg" ? "jpg" : "png"}`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
      <div className="flex-1 min-w-0 flex flex-col items-center">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {dict?.thumbnail_generator?.title || "Thumbnail Generator"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto">
          {dict?.thumbnail_generator?.subtitle ||
            "Create eye-catching thumbnails for YouTube, Instagram, and more. No design skills needed."}
        </p>

        <Adsense slotId="7759160077" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-20">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                템플릿 크기
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {templates.map((t) => (
                  <Button
                    key={t.id}
                    variant={selectedTemplate === t.id ? "default" : "outline"}
                    onClick={() => setSelectedTemplate(t.id)}
                    className="w-full"
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {template.width} x {template.height}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                배경 이미지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                {backgroundUrl ? (
                  <div className="space-y-2">
                    <img
                      src={backgroundUrl}
                      alt="배경 미리보기"
                      className="max-h-32 mx-auto rounded"
                    />
                    <p className="text-sm text-muted-foreground">
                      클릭해서 변경
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      클릭하거나 이미지를 끌어다 놓으세요
                    </p>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const img = new Image();
                        img.onload = () => {
                          setBackgroundImage(img);
                          setBackgroundUrl("/test-image.jpg");
                        };
                        img.src = "/test-image.jpg";
                      }}
                      className="mt-2 text-sm text-primary hover:underline"
                    >
                      샘플 이미지로 먼저 써보기
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                제목 텍스트
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">텍스트</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="title-size">Size: {titleSize}px</Label>
                <input
                  id="title-size"
                  type="range"
                  min="24"
                  max="120"
                  value={titleSize}
                  onChange={(e) => setTitleSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title-color">색상</Label>
                  <div className="flex gap-2">
                    <input
                      id="title-color"
                      type="color"
                      value={titleColor}
                      onChange={(e) => setTitleColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={titleColor}
                      onChange={(e) => setTitleColor(e.target.value)}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="title-font">글꼴</Label>
                  <select
                    id="title-font"
                    value={titleFont}
                    onChange={(e) => setTitleFont(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                부제목 텍스트
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subtitle">텍스트</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="부제목을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="subtitle-size">Size: {subtitleSize}px</Label>
                <input
                  id="subtitle-size"
                  type="range"
                  min="24"
                  max="120"
                  value={subtitleSize}
                  onChange={(e) => setSubtitleSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subtitle-color">색상</Label>
                  <div className="flex gap-2">
                    <input
                      id="subtitle-color"
                      type="color"
                      value={subtitleColor}
                      onChange={(e) => setSubtitleColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={subtitleColor}
                      onChange={(e) => setSubtitleColor(e.target.value)}
                      placeholder="#CCCCCC"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subtitle-font">글꼴</Label>
                  <select
                    id="subtitle-font"
                    value={subtitleFont}
                    onChange={(e) => setSubtitleFont(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="w-5 h-5" />
                Stickers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {emojiStickers.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="outline"
                    onClick={() => addSticker(emoji)}
                    className="text-2xl h-12"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
              {selectedStickers.length > 0 && (
                <div className="space-y-2">
                  <Label>추가된 스티커</Label>
                  <div className="space-y-2">
                    {selectedStickers.map((sticker, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-muted p-2 rounded"
                      >
                        <span className="text-xl">{sticker.emoji}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSticker(index)}
                        >
                          <XIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => handleExport("png")}
                className="w-full"
                variant="default"
              >
                <Download className="mr-2 h-4 w-4" />
                PNG로 다운로드
              </Button>
              <Button
                onClick={() => handleExport("jpeg")}
                className="w-full"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                JPG로 다운로드
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto border border-gray-300 dark:border-gray-700 rounded shadow-lg"
                  style={{ maxHeight: "600px" }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto mt-20 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.thumbnail_generator?.guide_title ||
                "How to Create Thumbnails"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.thumbnail_generator?.guide_desc ||
                "Create professional thumbnails in just a few simple steps."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title:
                  dict?.thumbnail_generator?.step1_title || "Choose a Template",
                desc:
                  dict?.thumbnail_generator?.step1_desc ||
                  "Select a preset size: YouTube (1280x720), Instagram Post (1080x1080), or Twitter Header (1500x500).",
                icon: ImageIcon,
              },
              {
                step: 2,
                title:
                  dict?.thumbnail_generator?.step2_title ||
                  "Customize Your Design",
                desc:
                  dict?.thumbnail_generator?.step2_desc ||
                  "Upload a background image, add text overlays with custom fonts and colors, and place emoji stickers.",
                icon: Palette,
              },
              {
                step: 3,
                title:
                  dict?.thumbnail_generator?.step3_title || "Export & Download",
                desc:
                  dict?.thumbnail_generator?.step3_desc ||
                  "Preview your thumbnail and export it as a high-quality PNG or JPG image.",
                icon: Download,
              },
            ].map((step) => (
              <Card
                key={step.step}
                className="border-purple-100 dark:border-purple-900/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 text-white font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.thumbnail_generator?.tips_title || "Thumbnail Design Tips"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.thumbnail_generator?.tips_desc ||
                "Create thumbnails that get more clicks with these proven tips."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: dict?.thumbnail_generator?.tip1_title || "Use Bold Text",
                desc:
                  dict?.thumbnail_generator?.tip1_desc ||
                  "Large, readable text with contrasting colors catches attention in search results and feeds.",
                icon: Type,
              },
              {
                title:
                  dict?.thumbnail_generator?.tip2_title ||
                  "High-Quality Images",
                desc:
                  dict?.thumbnail_generator?.tip2_desc ||
                  "Use sharp, high-resolution background images. Blurry thumbnails reduce click-through rates.",
                icon: ImageIcon,
              },
              {
                title:
                  dict?.thumbnail_generator?.tip3_title || "Keep It Simple",
                desc:
                  dict?.thumbnail_generator?.tip3_desc ||
                  "Don't overcrowd your thumbnail. Focus on one main subject and a short, punchy title.",
                icon: Info,
              },
              {
                title:
                  dict?.thumbnail_generator?.tip4_title ||
                  "일관된 브랜드 색상",
                desc:
                  dict?.thumbnail_generator?.tip4_desc ||
                  "Use the same fonts, colors, and style across all your thumbnails for brand recognition.",
                icon: Palette,
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <Info className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.thumbnail_generator?.features_title ||
                "Generator Features"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.thumbnail_generator?.features_desc ||
                "All the tools you need to create stunning thumbnails."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title:
                  dict?.thumbnail_generator?.feature1_title ||
                  "Preset Templates",
                desc:
                  dict?.thumbnail_generator?.feature1_desc ||
                  "Ready-made sizes for YouTube, Instagram, and Twitter platforms.",
              },
              {
                title:
                  dict?.thumbnail_generator?.feature2_title || "Text Overlays",
                desc:
                  dict?.thumbnail_generator?.feature2_desc ||
                  "Add title and subtitle with customizable font, size, and color options.",
              },
              {
                title:
                  dict?.thumbnail_generator?.feature3_title || "Emoji Stickers",
                desc:
                  dict?.thumbnail_generator?.feature3_desc ||
                  "Add popular emoji stickers to make your thumbnails more engaging.",
              },
              {
                title:
                  dict?.thumbnail_generator?.feature4_title || "Instant Export",
                desc:
                  dict?.thumbnail_generator?.feature4_desc ||
                  "Download your thumbnail as PNG or JPG with a single click.",
              },
            ].map((feature, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.qna_thumbnail_generator?.title ||
                "Thumbnail Generator FAQ"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.qna_thumbnail_generator?.desc ||
                "Common questions about creating thumbnails online."}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {[1, 2, 3, 4, 5].map((i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">
                  {dict?.qna_thumbnail_generator?.[`faq_${i}_q`] || "Question"}
                </AccordionTrigger>
                <AccordionContent className="whitespace-pre-line text-muted-foreground">
                  {dict?.qna_thumbnail_generator?.[`faq_${i}_a`] || "Answer"}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
      </div>
      <aside className="hidden lg:block w-64 shrink-0">
        <ToolsSidebar category="image" dict={dict} />
      </aside>
      </div>
    </div>
  );
}
