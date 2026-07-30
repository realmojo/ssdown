"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileImage,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  Lightbulb,
  Layers,
  Zap,
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

type FlipMode = "none" | "horizontal" | "vertical";

export function FlipImageClient({ dict }: { dict?: any }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [flippedUrl, setFlippedUrl] = useState<string | null>(null);
  const [currentFlip, setCurrentFlip] = useState<FlipMode>("none");
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

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
    setFlippedUrl(null);
    setCurrentFlip("none");
    setImageSize(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
  }, []);

  const flipImage = useCallback(
    (mode: "horizontal" | "vertical") => {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      if (!img || !canvas) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Save context state
      ctx.save();

      if (mode === "horizontal") {
        // Flip horizontally (mirror left-right)
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
      } else {
        // Flip vertically (upside down)
        ctx.scale(1, -1);
        ctx.translate(0, -canvas.height);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Restore context state
      ctx.restore();

      const ext = fileName
        .substring(fileName.lastIndexOf(".") + 1)
        .toLowerCase();
      let mimeType = "image/png";
      if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
      else if (ext === "webp") mimeType = "image/webp";
      else if (ext === "bmp") mimeType = "image/bmp";

      const dataUrl = canvas.toDataURL(mimeType, 0.95);
      setFlippedUrl(dataUrl);
      setCurrentFlip(mode);
    },
    [fileName],
  );

  const handleDownload = useCallback(() => {
    if (!flippedUrl) return;
    const link = document.createElement("a");
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const ext = fileName.substring(fileName.lastIndexOf("."));
    link.href = flippedUrl;
    link.download = `${nameWithoutExt}_flipped${ext}`;
    link.click();
  }, [flippedUrl, fileName]);

  const handleReset = () => {
    setImageSrc(null);
    setFileName("");
    setFlippedUrl(null);
    setCurrentFlip("none");
    setImageSize(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadImage(file);
  }, []);

  return (
    <div className="flex w-full flex-col">
      <div className="flex gap-2">
      <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex w-full flex-col">
        <div className="hidden">
          <FlipHorizontal className="w-10 h-10 text-sky-600 dark:text-sky-400" />
        </div>
        <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
          {dict?.flip_image?.title || "Flip Image"}
        </h1>
        <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
          {dict?.flip_image?.subtitle ||
            "Flip or mirror your image horizontally or vertically. 100% free and private — all processing happens in your browser."}
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
                ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20"
                : "border-muted-foreground/30 hover:border-sky-500/50 hover:bg-sky-50/50 dark:hover:bg-sky-900/10"
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
              {dict?.flip_image?.drop_zone || "Drag & drop your image here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {dict?.flip_image?.supported ||
                "Supported: PNG, JPG, JPEG, WebP, GIF, BMP"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {dict?.flip_image?.max_file_size || "Max file size: 20MB"}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setImageSrc("/test-image.jpg");
                setFileName("test-image.jpg");
              }}
              className="mt-4 text-sm text-sky-600 dark:text-sky-400 hover:underline"
            >
              샘플 이미지로 먼저 써보기
            </button>
          </div>
        ) : (
          <div className="w-full space-y-2 animate-in fade-in slide-in-from-bottom-4">
            {/* Controls */}
            <Card className="border-sky-100 dark:border-sky-900/50">
              <CardContent className="p-6 space-y-4">
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
              </CardContent>
            </Card>

            {/* Image Preview */}
            <div className="w-full flex items-center justify-center bg-muted/30 rounded-xl overflow-hidden p-8">
              <div className="relative inline-block">
                <img
                  ref={imageRef}
                  src={flippedUrl || imageSrc}
                  alt="뒤집을 이미지"
                  onLoad={onImageLoad}
                  className="max-w-full max-h-[60vh] block rounded-lg shadow-md"
                  draggable={false}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => flipImage("horizontal")}
                className="bg-sky-600 hover:bg-sky-700 text-white shadow-lg min-w-[180px]"
              >
                <FlipHorizontal className="w-5 h-5 mr-2" />
                좌우 뒤집기
              </Button>
              <Button
                size="lg"
                onClick={() => flipImage("vertical")}
                className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg min-w-[180px]"
              >
                <FlipVertical className="w-5 h-5 mr-2" />
                상하 뒤집기
              </Button>
            </div>

            {/* Download button */}
            {flippedUrl && (
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

            {/* Status indicator */}
            {currentFlip !== "none" && (
              <div className="text-center text-sm text-muted-foreground animate-in fade-in">
                Flipped{" "}
                {currentFlip === "horizontal" ? "horizontally" : "vertically"}
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
              {dict?.flip_image?.guide_title || "How to Flip Images"}
            </h2>
            <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              {dict?.flip_image?.guide_desc ||
                "Flip any image in 3 simple steps."}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-2">
            {[
              {
                step: 1,
                title: dict?.flip_image?.step1_title || "이미지 업로드",
                desc:
                  dict?.flip_image?.step1_desc ||
                  "Upload a PNG, JPG, WebP, GIF, or BMP image from your device.",
                icon: Upload,
              },
              {
                step: 2,
                title: dict?.flip_image?.step2_title || "Choose Flip Direction",
                desc:
                  dict?.flip_image?.step2_desc ||
                  "Click 'Flip Horizontal' to mirror left-right or 'Flip Vertical' to flip upside down.",
                icon: FlipHorizontal,
              },
              {
                step: 3,
                title: dict?.flip_image?.step3_title || "결과 다운로드",
                desc:
                  dict?.flip_image?.step3_desc ||
                  "Click 'Download' to save your flipped image to your device.",
                icon: Download,
              },
            ].map((step) => (
              <Card
                key={step.step}
                className="border-sky-100 dark:border-sky-900/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-500 text-white font-bold">
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
              {dict?.flip_image?.tips_title || "Flipping Tips"}
            </h2>
            <p className="text-muted-foreground">
              이미지를 뒤집을 때 가장 좋은 결과를 얻는 방법입니다.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {[
              {
                title: "좌우 뒤집기와 상하 뒤집기",
                desc: "좌우 뒤집기는 거울에 비친 것처럼 좌우를 바꾸고, 상하 뒤집기는 위아래를 뒤집습니다.",
                icon: FlipHorizontal,
              },
              {
                title: "원본 화질",
                desc: "뒤집힌 이미지는 원본과 같은 해상도와 화질을 유지하며 추가 압축이 적용되지 않습니다.",
                icon: Zap,
              },
              {
                title: "100% Private",
                desc: "모든 뒤집기는 Canvas API를 이용해 브라우저 안에서 이뤄집니다. 이미지가 기기를 벗어나지 않습니다.",
                icon: Layers,
              },
              {
                title: "투명도 보존",
                desc: "투명 배경의 PNG 이미지는 뒤집은 뒤에도 투명도가 유지됩니다.",
                icon: FileImage,
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-sky-500" />
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
              {dict?.flip_image?.faq_title || "Image Flipping FAQ"}
            </h2>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              온라인 이미지 뒤집기에 대해 자주 묻는 질문입니다.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>
                  {dict?.flip_image?.faq_1_q || "Is it free to use?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.flip_image?.faq_1_a ||
                    "Yes, this image flipper is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of images you can flip."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>
                  {dict?.flip_image?.faq_2_q ||
                    "Is it secure? Where are my images stored?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.flip_image?.faq_2_a ||
                    "Your images are completely secure because all processing happens entirely in your browser. Your images never leave your device and are never uploaded to any server. This ensures 100% privacy."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>
                  {dict?.flip_image?.faq_3_q ||
                    "What's the difference between horizontal and vertical flip?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.flip_image?.faq_3_a ||
                    "Horizontal flip mirrors your image left-to-right, like looking in a mirror. Vertical flip turns your image upside down (top becomes bottom). Both maintain the original image quality."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>
                  {dict?.flip_image?.faq_4_q ||
                    "Does flipping reduce image quality?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.flip_image?.faq_4_a ||
                    "No. The canvas-based flip process preserves your original image quality and resolution. There is no re-compression or quality loss."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>
                  {dict?.flip_image?.faq_5_q ||
                    "어떤 이미지 형식을 지원하나요?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.flip_image?.faq_5_a ||
                    "You can flip PNG, JPG, JPEG, WebP, GIF, and BMP images. The flipped image will be saved in the same format as the original. PNG transparency is preserved."}
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
