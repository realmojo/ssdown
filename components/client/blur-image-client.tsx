"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileImage,
  Droplets,
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

export function BlurImageClient({ dict }: { dict?: any }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blurAmount, setBlurAmount] = useState<number>(5);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement>(null);

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
    };
    reader.readAsDataURL(file);
  };

  // Canvas blur effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = originalImageRef.current;
    if (!canvas || !img || !imageSrc) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Apply blur filter
    ctx.filter = `blur(${blurAmount}px)`;
    ctx.drawImage(img, 0, 0);
    ctx.filter = "none";

    // Determine MIME type from original file
    const mimeType = fileName.endsWith(".png")
      ? "image/png"
      : fileName.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";

    setPreviewUrl(canvas.toDataURL(mimeType, 0.95));
  }, [imageSrc, blurAmount, fileName]);

  const handleImageLoad = () => {
    if (originalImageRef.current) {
      setImageSize({
        width: originalImageRef.current.naturalWidth,
        height: originalImageRef.current.naturalHeight,
      });
    }
  };

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
    link.download = `${nameWithoutExt}_blurred${ext}`;
    link.click();
  };

  const handleReset = () => {
    setImageSrc(null);
    setFileName("");
    setPreviewUrl(null);
    setBlurAmount(5);
    setImageSize(null);
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

  const setPresetBlur = (value: number) => {
    setBlurAmount(value);
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex w-full flex-col">
        <div className="hidden">
          <Droplets className="w-10 h-10 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
          {dict?.blur_image?.title || "Blur Image"}
        </h1>
        <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
          {dict?.blur_image?.subtitle ||
            "Apply gaussian blur to your images instantly. Adjust blur intensity with a slider. 100% private — processed in your browser."}
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
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                : "border-muted-foreground/30 hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
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
              {dict?.blur_image?.drop_zone || "Drag & drop your image here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {dict?.blur_image?.supported ||
                "Supported: PNG, JPG, JPEG, WebP, GIF, BMP"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {dict?.blur_image?.max_file_size || "Max file size: 20MB"}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                loadSampleImage();
              }}
              className="mt-4 text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              샘플 이미지로 먼저 써보기
            </button>
          </div>
        ) : (
          <div className="w-full space-y-2 animate-in fade-in slide-in-from-bottom-4">
            {/* Controls */}
            <Card className="border-purple-200 dark:border-purple-900/50">
              <CardHeader>
                <CardTitle className="text-lg">흐림 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* File info and reset */}
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

                {/* Blur intensity slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      흐림 강도
                    </label>
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      {blurAmount}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={blurAmount}
                    onChange={(e) => setBlurAmount(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-600"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>0px (없음)</span>
                    <span>20px (최대)</span>
                  </div>
                </div>

                {/* Preset buttons */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">빠른 설정</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "None", value: 0 },
                      { label: "Light", value: 3 },
                      { label: "Medium", value: 5 },
                      { label: "Heavy", value: 10 },
                      { label: "Max", value: 20 },
                    ].map((preset) => (
                      <Button
                        key={preset.value}
                        size="sm"
                        variant="outline"
                        onClick={() => setPresetBlur(preset.value)}
                        className={
                          blurAmount === preset.value
                            ? "bg-purple-500 text-white border-purple-500 hover:bg-purple-600 hover:text-white"
                            : ""
                        }
                      >
                        {preset.label}
                      </Button>
                    ))}
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
                    alt="흐림 처리 결과"
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
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg min-w-[180px]"
                >
                  <Download className="w-5 h-5 mr-2" />
                  다운로드
                </Button>
              </div>
            )}

            {/* Hidden image and canvas */}
            <img
              ref={originalImageRef}
              src={imageSrc}
              alt="원본"
              className="hidden"
              onLoad={handleImageLoad}
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>

      {/* How-to & Tips & FAQ */}
      <div className="w-full max-w-6xl mx-auto mt-3 px-4 space-y-3">
        <section>
          <div className="mb-2">
            <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
              {dict?.blur_image?.guide_title || "How to Blur Images"}
            </h2>
            <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              {dict?.blur_image?.guide_desc ||
                "Apply gaussian blur to any image in 3 simple steps."}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-2">
            {[
              {
                step: 1,
                title: dict?.blur_image?.step1_title || "이미지 업로드",
                desc:
                  dict?.blur_image?.step1_desc ||
                  "Upload a PNG, JPG, WebP, GIF, or BMP image from your device.",
                icon: Upload,
              },
              {
                step: 2,
                title: dict?.blur_image?.step2_title || "Adjust Blur",
                desc:
                  dict?.blur_image?.step2_desc ||
                  "Use the slider to control blur intensity from 0px to 20px, or select a quick preset.",
                icon: Droplets,
              },
              {
                step: 3,
                title: dict?.blur_image?.step3_title || "결과 다운로드",
                desc:
                  dict?.blur_image?.step3_desc ||
                  "Click 'Download' to save your blurred image to your device.",
                icon: Download,
              },
            ].map((step) => (
              <Card
                key={step.step}
                className="border-purple-200 dark:border-purple-900/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white font-bold">
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

        <section className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-2">
            <div className="hidden">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
              {dict?.blur_image?.tips_title || "Blur Image Tips"}
            </h2>
            <p className="text-muted-foreground">
              이미지를 흐리게 할 때 가장 좋은 결과를 얻는 방법입니다.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {[
              {
                title: "개인정보 보호",
                desc: "공유하기 전에 화면 캡처의 얼굴, 차량 번호판, 개인정보 같은 민감한 부분을 흐리게 처리하세요.",
                icon: Shield,
              },
              {
                title: "배경 흐리게",
                desc: "블러로 아웃포커싱 효과를 주면 피사체가 배경에서 도드라져 보입니다.",
                icon: Droplets,
              },
              {
                title: "세밀한 조절",
                desc: "0.5px 단위로 조절하면 세밀하게 제어할 수 있습니다. 은은한 효과에는 약한 블러(1~3px)가 잘 어울립니다.",
                icon: Zap,
              },
              {
                title: "원본 보존",
                desc: "원본 이미지는 그대로 남습니다. 처리본을 따로 내려받아 둘 다 보관하세요.",
                icon: Layers,
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-purple-800/30"
              >
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
              {dict?.blur_image?.faq_title || "Blur Image FAQ"}
            </h2>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              이미지 흐리게 하기에 대해 자주 묻는 질문입니다.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>
                  {dict?.blur_image?.faq_1_q || "Is it free to use?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.blur_image?.faq_1_a ||
                    "Yes, this blur image tool is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of images you can blur."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>
                  {dict?.blur_image?.faq_2_q ||
                    "Is it secure? Where are my images stored?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.blur_image?.faq_2_a ||
                    "Your images are completely secure because all processing happens entirely in your browser using Canvas API. Your images never leave your device and are never uploaded to any server."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>
                  {dict?.blur_image?.faq_3_q || "What is gaussian blur?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.blur_image?.faq_3_a ||
                    "Gaussian blur is a widely-used image blur effect that applies a mathematical blur algorithm. It creates a smooth, natural-looking blur by averaging pixel colors based on a gaussian distribution, producing professional results."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>
                  {dict?.blur_image?.faq_4_q || "Does it reduce image quality?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.blur_image?.faq_4_a ||
                    "The blur effect itself does not reduce image quality beyond the intended blur. The original resolution and file quality are maintained. Only the sharpness is reduced by the blur filter."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>
                  {dict?.blur_image?.faq_5_q ||
                    "어떤 이미지 형식을 지원하나요?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.blur_image?.faq_5_a ||
                    "You can blur PNG, JPG, JPEG, WebP, GIF, and BMP images. The blurred image will be saved in the same format as the original. Maximum file size is 20MB."}
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
