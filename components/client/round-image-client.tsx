"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileImage,
  Circle,
  RotateCcw,
  Lightbulb,
  Image as ImageIcon,
  Palette,
  Shield,
  CheckCircle2,
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

type OutputSize = "original" | "200" | "400" | "800";

export function RoundImageClient({ dict }: { dict?: any }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<OutputSize>("400");
  const [backgroundColor, setBackgroundColor] = useState<string>("transparent");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

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

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageSrc(dataUrl);
    };
    reader.readAsDataURL(file);
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

  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Determine output dimensions
      let finalSize: number;
      if (outputSize === "original") {
        finalSize = Math.min(img.naturalWidth, img.naturalHeight);
      } else {
        finalSize = parseInt(outputSize);
      }

      // Set canvas to output size
      canvas.width = finalSize;
      canvas.height = finalSize;

      // Fill background if not transparent
      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, finalSize, finalSize);
      }

      // Create circular clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(finalSize / 2, finalSize / 2, finalSize / 2, 0, Math.PI * 2);
      ctx.clip();

      // Calculate source crop (center-crop to square)
      const srcSize = Math.min(img.naturalWidth, img.naturalHeight);
      const srcX = (img.naturalWidth - srcSize) / 2;
      const srcY = (img.naturalHeight - srcSize) / 2;

      // Draw image
      ctx.drawImage(
        img,
        srcX,
        srcY,
        srcSize,
        srcSize,
        0,
        0,
        finalSize,
        finalSize,
      );
      ctx.restore();

      // Set preview
      setPreviewUrl(canvas.toDataURL("image/png"));
    };
    img.src = imageSrc;
  }, [imageSrc, outputSize, backgroundColor]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    const nameWithoutExt =
      fileName.substring(0, fileName.lastIndexOf(".")) || fileName;
    link.href = previewUrl;
    link.download = `${nameWithoutExt}_round.png`;
    link.click();
  };

  const handleReset = () => {
    setImageSrc(null);
    setFileName("");
    setPreviewUrl(null);
    setOutputSize("400");
    setBackgroundColor("transparent");
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
          <Circle className="w-10 h-10 text-teal-600 dark:text-cyan-400" />
        </div>
        <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
          {dict?.round_image?.title || "Round Image Maker"}
        </h1>
        <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
          {dict?.round_image?.subtitle ||
            "Crop any image into a perfect circle. Choose output size and background color. 100% private — processed in your browser."}
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
                ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                : "border-muted-foreground/30 hover:border-teal-500/50 hover:bg-teal-50/50 dark:hover:bg-teal-900/10"
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
              {dict?.round_image?.drop_zone || "Drag & drop your image here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {dict?.round_image?.supported ||
                "Supported: PNG, JPG, JPEG, WebP, GIF, BMP"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {dict?.round_image?.max_file_size || "Max file size: 20MB"}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                loadSampleImage();
              }}
              className="mt-4 text-sm text-teal-600 dark:text-cyan-400 hover:underline"
            >
              샘플 이미지로 먼저 써보기
            </button>
          </div>
        ) : (
          <div className="w-full space-y-2 animate-in fade-in slide-in-from-bottom-4">
            {/* Controls Card */}
            <Card className="border-teal-200 dark:border-teal-900/50">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
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
                </div>

                {/* Output Size */}
                <div className="space-y-3 mb-2">
                  <label className="text-sm font-medium">출력 크기</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["original", "200", "400", "800"] as OutputSize[]).map(
                      (size) => (
                        <button
                          key={size}
                          onClick={() => setOutputSize(size)}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                            outputSize === size
                              ? "bg-teal-500 text-white border-teal-500"
                              : "bg-background border-muted-foreground/30 hover:border-teal-500/50"
                          }`}
                        >
                          {size === "original" ? "Original" : `${size}×${size}`}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Background Color */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">배경</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setBackgroundColor("transparent")}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        backgroundColor === "transparent"
                          ? "bg-teal-500 text-white border-teal-500"
                          : "bg-background border-muted-foreground/30 hover:border-teal-500/50"
                      }`}
                    >
                      Transparent
                    </button>
                    <button
                      onClick={() => setBackgroundColor("#ffffff")}
                      className={`w-10 h-10 rounded-lg border-2 bg-white ${
                        backgroundColor === "#ffffff"
                          ? "border-teal-500"
                          : "border-muted-foreground/30 hover:border-teal-500/50"
                      }`}
                    />
                    <button
                      onClick={() => setBackgroundColor("#000000")}
                      className={`w-10 h-10 rounded-lg border-2 bg-black ${
                        backgroundColor === "#000000"
                          ? "border-teal-500"
                          : "border-muted-foreground/30 hover:border-teal-500/50"
                      }`}
                    />
                    <input
                      type="color"
                      value={
                        backgroundColor === "transparent"
                          ? "#ffffff"
                          : backgroundColor
                      }
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border-2 border-muted-foreground/30 cursor-pointer"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image Preview */}
            <div
              className="w-full flex items-center justify-center bg-muted/30 rounded-xl overflow-hidden p-8"
              style={
                backgroundColor === "transparent"
                  ? {
                      backgroundImage:
                        "repeating-conic-gradient(#d4d4d4 0% 25%, transparent 0% 50%)",
                      backgroundSize: "16px 16px",
                    }
                  : {}
              }
            >
              <div className="relative inline-block">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="원형 변환 결과"
                    className="max-w-full max-h-[60vh] block"
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
                  className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg min-w-[180px]"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {dict?.round_image?.download_btn || "Download PNG"}
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
              {dict?.round_image?.guide_title || "How to Make a Round Image"}
            </h2>
            <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              {dict?.round_image?.guide_desc ||
                "Create a circular image in 3 simple steps."}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-2">
            {[
              {
                step: 1,
                title: dict?.round_image?.step1_title || "이미지 업로드",
                desc:
                  dict?.round_image?.step1_desc ||
                  "Upload any PNG, JPG, WebP, GIF, or BMP image from your device.",
                icon: Upload,
              },
              {
                step: 2,
                title: dict?.round_image?.step2_title || "Customize",
                desc:
                  dict?.round_image?.step2_desc ||
                  "Choose your output size and background color. Preview updates instantly.",
                icon: Palette,
              },
              {
                step: 3,
                title: dict?.round_image?.step3_title || "결과 다운로드",
                desc:
                  dict?.round_image?.step3_desc ||
                  "Click 'Download PNG' to save your circular image with transparency.",
                icon: Download,
              },
            ].map((step) => (
              <Card
                key={step.step}
                className="border-teal-200 dark:border-teal-900/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 text-white font-bold">
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

        <section className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-2">
            <div className="hidden">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
              {dict?.round_image?.tips_title || "Round Image Tips"}
            </h2>
            <p className="text-muted-foreground">
              원형 프로필 사진을 만들 때 가장 좋은 결과를 얻는 방법입니다.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {[
              {
                title: "피사체를 가운데로",
                desc: "이미지의 가운데를 기준으로 잘립니다. 중요한 요소를 가운데에 두고 올리면 결과가 좋습니다.",
                icon: Circle,
              },
              {
                title: "정사각형 이미지 사용",
                desc: "정사각형 이미지가 가장 잘 맞습니다. 직사각형 이미지는 가운데를 기준으로 정사각형으로 잘린 뒤 둥글게 처리됩니다.",
                icon: ImageIcon,
              },
              {
                title: "투명 배경",
                desc: "투명 배경은 웹사이트나 디자인, 색 있는 배경 위에 얹기 좋습니다. 인쇄용으로는 흰색이나 검은색 배경이 적합합니다.",
                icon: CheckCircle2,
              },
              {
                title: "고해상도",
                desc: "선명한 결과를 얻으려면 고해상도 이미지를 쓰세요. 화질을 최대한 유지하려면 '원본' 크기를, 웹 최적화가 필요하면 원하는 크기를 고르세요.",
                icon: Shield,
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-teal-800/30"
              >
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-teal-600" />
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
              {dict?.round_image?.faq_title || "Round Image Maker FAQ"}
            </h2>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              원형 이미지 만들기에 대해 자주 묻는 질문입니다.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>
                  {dict?.round_image?.faq_1_q || "Is it free to use?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.round_image?.faq_1_a ||
                    "Yes, this round image maker is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of images you can process."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>
                  {dict?.round_image?.faq_2_q ||
                    "Is it secure? Where are my images stored?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.round_image?.faq_2_a ||
                    "Your images are completely secure because all processing happens entirely in your browser using Canvas API. Your images never leave your device and are never uploaded to any server."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>
                  {dict?.round_image?.faq_3_q ||
                    "How does the circular crop work?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.round_image?.faq_3_a ||
                    "The tool first center-crops your image to a square, then applies a circular mask using Canvas arc and clip. The result is a perfectly circular image with optional background color or transparency."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>
                  {dict?.round_image?.faq_4_q || "What size should I choose?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.round_image?.faq_4_a ||
                    "Choose 'Original' to preserve maximum quality. For profile pictures, 400x400 works well. For social media avatars, 200x200 is typical. For high-DPI displays or print, use 800x800 or Original."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>
                  {dict?.round_image?.faq_5_q ||
                    "어떤 이미지 형식을 지원하나요?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.round_image?.faq_5_a ||
                    "You can upload PNG, JPG, JPEG, WebP, GIF, and BMP images. The output is always PNG format to preserve transparency. Maximum file size is 20MB."}
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
