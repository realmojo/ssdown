"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileImage,
  Type,
  RotateCcw,
  Lightbulb,
  Layers,
  Zap,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

const FONT_FAMILIES = [
  "Arial",
  "Georgia",
  "Courier New",
  "Times New Roman",
  "Verdana",
  "Impact",
  "Comic Sans MS",
];

const POSITION_PRESETS = [
  { label: "Top", x: 50, y: 12 },
  { label: "Center", x: 50, y: 50 },
  { label: "Bottom", x: 50, y: 88 },
];

export function AddTextToImageClient({ dict }: { dict?: any }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Text options
  const [text, setText] = useState("Your Text Here");
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textX, setTextX] = useState(50);
  const [textY, setTextY] = useState(50);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [strokeEnabled, setStrokeEnabled] = useState(true);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadImage(e.target.files[0]);
    }
  };

  const loadImage = (file: File) => {
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
      "image/bmp",
    ];
    if (!validTypes.includes(file.type)) return;
    if (file.size > 20 * 1024 * 1024) return;

    setFileName(file.name);
    setPreviewUrl(null);
    setImageSize(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageSrc(dataUrl);

      const img = new Image();
      img.onload = () => {
        originalImageRef.current = img;
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Re-render on any text/style change
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = originalImageRef.current;
    if (!canvas || !img || !imageSrc) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    // Scale fontSize relative to image size (base: 800px width)
    const scaledFontSize = Math.round(fontSize * (img.naturalWidth / 800));

    const style = `${isItalic ? "italic " : ""}${isBold ? "bold " : ""}${scaledFontSize}px ${fontFamily}`;
    ctx.font = style;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const x = (textX / 100) * canvas.width;
    const y = (textY / 100) * canvas.height;

    if (strokeEnabled) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth * (img.naturalWidth / 800);
      ctx.lineJoin = "round";
      ctx.strokeText(text, x, y);
    }

    ctx.fillStyle = textColor;
    ctx.fillText(text, x, y);

    const ext = fileName.toLowerCase();
    let mimeType = "image/png";
    if (ext.endsWith(".jpg") || ext.endsWith(".jpeg")) mimeType = "image/jpeg";
    else if (ext.endsWith(".webp")) mimeType = "image/webp";

    setPreviewUrl(canvas.toDataURL(mimeType, 0.95));
  }, [
    imageSrc,
    text,
    fontSize,
    fontFamily,
    textColor,
    textX,
    textY,
    isBold,
    isItalic,
    strokeEnabled,
    strokeColor,
    strokeWidth,
    fileName,
  ]);

  const loadSampleImage = async () => {
    try {
      const response = await fetch("/test-image.jpg");
      const blob = await response.blob();
      const file = new File([blob], "test-image.jpg", { type: "image/jpeg" });
      loadImage(file);
    } catch (error) {
      console.error("Failed to load sample image:", error);
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const ext = fileName.substring(fileName.lastIndexOf("."));
    link.href = previewUrl;
    link.download = `${nameWithoutExt}_text${ext}`;
    link.click();
  };

  const handleReset = () => {
    setImageSrc(null);
    setFileName("");
    setPreviewUrl(null);
    setImageSize(null);
    setText("Your Text Here");
    setFontSize(48);
    setFontFamily("Arial");
    setTextColor("#ffffff");
    setTextX(50);
    setTextY(50);
    setIsBold(false);
    setIsItalic(false);
    setStrokeEnabled(true);
    setStrokeColor("#000000");
    setStrokeWidth(2);
    originalImageRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadImage(file);
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex w-full flex-col">
        <div className="hidden">
          <Type className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
          {dict?.add_text_to_image?.title || "텍스트 추가 to Image"}
        </h1>
        <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
          {dict?.add_text_to_image?.subtitle ||
            "Add custom text overlay to your image. Choose font, size, color, and position. 100% private — processed in your browser."}
        </p>

        <Adsense slotId="7759160077" />

        {!imageSrc ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                : "border-muted-foreground/30 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-900/10"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {dict?.add_text_to_image?.drop_zone ||
                "Drag & drop your image here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {dict?.add_text_to_image?.supported ||
                "Supported: PNG, JPG, JPEG, WebP, GIF, BMP"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {dict?.add_text_to_image?.max_file_size || "Max file size: 20MB"}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                loadSampleImage();
              }}
              className="mt-4 text-sm text-amber-600 dark:text-amber-400 hover:underline"
            >
              샘플 이미지로 먼저 써보기
            </button>
          </div>
        ) : (
          <div className="w-full space-y-2 animate-in fade-in slide-in-from-bottom-4">
            {/* Controls */}
            <Card className="border-amber-200 dark:border-amber-900/50">
              <CardContent className="p-6 space-y-5">
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      새 이미지
                    </Button>
                    <span
                      className="text-sm text-muted-foreground truncate max-w-[200px]"
                      title={fileName}
                    >
                      {fileName}
                    </span>
                  </div>
                  {imageSize && (
                    <div className="text-sm text-muted-foreground">
                      {imageSize.width} x {imageSize.height} px
                    </div>
                  )}
                </div>

                {/* Text Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">텍스트</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-muted bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="텍스트를 입력하세요…"
                  />
                </div>

                {/* Font Family & Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">글꼴</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-muted bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {FONT_FAMILIES.map((f) => (
                        <option key={f} value={f} style={{ fontFamily: f }}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">글자 크기</label>
                      <span className="text-sm text-muted-foreground">
                        {fontSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      step="1"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                  </div>
                </div>

                {/* Colors & Style */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">글자 색상</label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-10 rounded-lg border border-muted cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">테두리 색상</label>
                    <input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className="w-full h-10 rounded-lg border border-muted cursor-pointer"
                      disabled={!strokeEnabled}
                    />
                  </div>
                  <div className="flex items-end gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isBold}
                        onChange={(e) => setIsBold(e.target.checked)}
                        className="accent-amber-600"
                      />
                      <span className="text-sm font-bold">굵게</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isItalic}
                        onChange={(e) => setIsItalic(e.target.checked)}
                        className="accent-amber-600"
                      />
                      <span className="text-sm italic">기울임</span>
                    </label>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={strokeEnabled}
                        onChange={(e) => setStrokeEnabled(e.target.checked)}
                        className="accent-amber-600"
                      />
                      <span className="text-sm">외곽선</span>
                    </label>
                  </div>
                </div>

                {/* Stroke Width */}
                {strokeEnabled && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        외곽선 두께
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {strokeWidth}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                  </div>
                )}

                {/* Position */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">위치</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {POSITION_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => {
                          setTextX(p.x);
                          setTextY(p.y);
                        }}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          textX === p.x && textY === p.y
                            ? "bg-amber-500 text-white border-amber-500"
                            : "border-muted hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>가로 위치</span>
                        <span>{textX}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={textX}
                        onChange={(e) => setTextX(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>세로 위치</span>
                        <span>{textY}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={textY}
                        onChange={(e) => setTextY(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image Preview */}
            <div className="w-full flex items-center justify-center bg-muted/30 rounded-xl overflow-hidden p-8">
              <div className="relative inline-block">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="글자가 올라간 이미지"
                    className="max-w-full max-h-[60vh] block rounded-lg shadow-md"
                    draggable={false}
                  />
                ) : (
                  <img
                    src={imageSrc}
                    alt="원본"
                    className="max-w-full max-h-[60vh] block rounded-lg shadow-md"
                    draggable={false}
                  />
                )}
              </div>
            </div>

            {/* Download button */}
            {previewUrl && (
              <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2">
                <Button
                  size="lg"
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg min-w-[180px]"
                >
                  <Download className="w-5 h-5 mr-2" />
                  다운로드
                </Button>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>

      {/* How-to & Tips & FAQ */}
      <div className="w-full max-w-6xl mx-auto mt-3 px-4 space-y-3">
        <section>
          <div className="mb-2">
            <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
              {dict?.add_text_to_image?.guide_title ||
                "How to 텍스트 추가 to Images"}
            </h2>
            <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              {dict?.add_text_to_image?.guide_desc ||
                "Add text overlays to your images in 3 simple steps."}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-2">
            {[
              {
                step: 1,
                title: dict?.add_text_to_image?.step1_title || "이미지 업로드",
                desc:
                  dict?.add_text_to_image?.step1_desc ||
                  "Upload a PNG, JPG, WebP, GIF, or BMP image from your device.",
                icon: Upload,
              },
              {
                step: 2,
                title: dict?.add_text_to_image?.step2_title || "Customize Text",
                desc:
                  dict?.add_text_to_image?.step2_desc ||
                  "Type your text and adjust font, size, color, position, and outline settings.",
                icon: Type,
              },
              {
                step: 3,
                title:
                  dict?.add_text_to_image?.step3_title || "결과 다운로드",
                desc:
                  dict?.add_text_to_image?.step3_desc ||
                  "Click 'Download' to save your image with the text overlay.",
                icon: Download,
              },
            ].map((step) => (
              <Card
                key={step.step}
                className="border-amber-200 dark:border-amber-900/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white font-bold">
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
          <div className="text-center mb-2">
            <div className="hidden">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
              {dict?.add_text_to_image?.tips_title || "Text Overlay Tips"}
            </h2>
            <p className="text-muted-foreground">
              이미지에 글자를 넣을 때 가장 좋은 결과를 얻는 방법입니다.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {[
              {
                title: "가독성을 위한 테두리 활용",
                desc: "글자 외곽선을 켜면 어떤 배경에서도 잘 읽힙니다. 흰 글자에 검은 외곽선은 밝은 이미지와 어두운 이미지 모두에 잘 맞습니다.",
                icon: Shield,
              },
              {
                title: "밈에는 Impact 글꼴",
                desc: "전형적인 밈 스타일을 원한다면 Impact 글꼴에 굵게, 흰색, 검은 외곽선을 적용해 이미지 위나 아래에 배치하세요.",
                icon: Type,
              },
              {
                title: "크기 고려하기",
                desc: "글자 크기가 이미지 크기에 맞춰 자동 조정되므로 해상도와 상관없이 균형 있게 보입니다.",
                icon: Zap,
              },
              {
                title: "원본 보존",
                desc: "원본 이미지는 그대로 남습니다. 글자는 사본에 얹히며 결과물만 내려받게 됩니다.",
                icon: Layers,
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-amber-500" />
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
          <div className="mb-2">
            <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
              {dict?.add_text_to_image?.faq_title || "Text on Image FAQ"}
            </h2>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              이미지에 글자 넣기에 대해 자주 묻는 질문입니다.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>
                  {dict?.add_text_to_image?.faq_1_q || "Is it free to use?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.add_text_to_image?.faq_1_a ||
                    "Yes, this tool is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of images you can edit."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>
                  {dict?.add_text_to_image?.faq_2_q ||
                    "Is it secure? Where are my images stored?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.add_text_to_image?.faq_2_a ||
                    "Your images are completely secure because all processing happens entirely in your browser using Canvas API. Your images never leave your device and are never uploaded to any server."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>
                  {dict?.add_text_to_image?.faq_3_q ||
                    "Can I use custom fonts?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.add_text_to_image?.faq_3_a ||
                    "Currently we offer 7 web-safe fonts including Arial, Georgia, Impact, and more. These fonts are available on all devices and browsers without any download required."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>
                  {dict?.add_text_to_image?.faq_4_q ||
                    "How do I make text readable on dark images?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.add_text_to_image?.faq_4_a ||
                    "Enable the 'Outline' option and use a contrasting outline color. For example, use white text with a black outline — this combination is readable on virtually any background."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>
                  {dict?.add_text_to_image?.faq_5_q ||
                    "어떤 이미지 형식을 지원하나요?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.add_text_to_image?.faq_5_a ||
                    "You can add text to PNG, JPG, JPEG, WebP, GIF, and BMP images. The result will be saved in the same format as the original. Maximum file size is 20MB."}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
        </div>
        <aside className="hidden shrink-0 xl:block xl:w-[200px]">
          <ToolsSidebar category="image" dict={dict} />
        </aside>
      </div>
    </div>
  );
}
