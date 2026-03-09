"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileImage,
  Contrast,
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

export function BlackAndWhiteClient({ dict }: { dict?: any }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadImage(e.target.files[0]);
    }
  };

  const loadImage = (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/bmp"];
    if (!validTypes.includes(file.type)) return;
    if (file.size > 20 * 1024 * 1024) return;

    setFileName(file.name);
    setConvertedUrl(null);
    setImageSize(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageSrc(dataUrl);
      convertToGrayscale(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const convertToGrayscale = (src: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      ctx.putImageData(imageData, 0, 0);

      const ext = src.includes("image/png") ? "image/png" :
                  src.includes("image/webp") ? "image/webp" :
                  src.includes("image/bmp") ? "image/bmp" : "image/jpeg";

      const dataUrl = canvas.toDataURL(ext, 0.95);
      setConvertedUrl(dataUrl);
    };
    img.src = src;
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
    if (!convertedUrl) return;
    const link = document.createElement("a");
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const ext = fileName.substring(fileName.lastIndexOf("."));
    link.href = convertedUrl;
    link.download = `${nameWithoutExt}_bw${ext}`;
    link.click();
  };

  const handleReset = () => {
    setImageSrc(null);
    setFileName("");
    setConvertedUrl(null);
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

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30 mb-6">
          <Contrast className="w-10 h-10 text-gray-600 dark:text-gray-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.black_and_white?.title || "Black & White"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.black_and_white?.subtitle || "Convert your photo to black & white instantly. Uses luminance-preserving grayscale conversion. 100% private — processed in your browser."}
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
                ? "border-gray-500 bg-gray-50 dark:bg-gray-900/20"
                : "border-muted-foreground/30 hover:border-gray-500/50 hover:bg-gray-50/50 dark:hover:bg-gray-900/10"
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
              {dict?.black_and_white?.drop_zone || "Drag & drop your image here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {dict?.black_and_white?.supported || "Supported: PNG, JPG, JPEG, WebP, GIF, BMP"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {dict?.black_and_white?.max_file_size || "Max file size: 20MB"}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                loadSampleImage();
              }}
              className="mt-4 text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              Or try with a sample image
            </button>
          </div>
        ) : (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Controls */}
            <Card className="border-gray-200 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      New Image
                    </Button>
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]" title={fileName}>
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
                {convertedUrl ? (
                  <img
                    src={convertedUrl}
                    alt="Black and white result"
                    className="max-w-full max-h-[60vh] block rounded-lg shadow-md"
                    draggable={false}
                  />
                ) : (
                  <img
                    src={imageSrc}
                    alt="Original"
                    className="max-w-full max-h-[60vh] block rounded-lg shadow-md"
                    draggable={false}
                  />
                )}
              </div>
            </div>

            {/* Download button */}
            {convertedUrl && (
              <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2">
                <Button
                  size="lg"
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg min-w-[180px]"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </Button>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>

      {/* How-to & Tips & FAQ */}
      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.black_and_white?.guide_title || "How to Convert to Black & White"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.black_and_white?.guide_desc || "Convert any image to black & white in 3 simple steps."}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: dict?.black_and_white?.step1_title || "Upload Image",
                desc: dict?.black_and_white?.step1_desc || "Upload a PNG, JPG, WebP, GIF, or BMP image from your device.",
                icon: Upload,
              },
              {
                step: 2,
                title: dict?.black_and_white?.step2_title || "Auto Convert",
                desc: dict?.black_and_white?.step2_desc || "Your image is instantly converted to black & white using luminance-based grayscale.",
                icon: Contrast,
              },
              {
                step: 3,
                title: dict?.black_and_white?.step3_title || "Download Result",
                desc: dict?.black_and_white?.step3_desc || "Click 'Download' to save your black & white image to your device.",
                icon: Download,
              },
            ].map((step) => (
              <Card key={step.step} className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 text-white font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
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
              {dict?.black_and_white?.tips_title || "Black & White Tips"}
            </h2>
            <p className="text-muted-foreground">
              Get the best results when converting images to black & white.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Luminance Preservation",
                desc: "We use the ITU-R BT.601 formula (0.299R + 0.587G + 0.114B) to produce natural-looking grayscale that matches human perception.",
                icon: Shield,
              },
              {
                title: "High-Contrast Subjects",
                desc: "Images with strong contrast between light and dark areas tend to look most dramatic in black & white.",
                icon: Contrast,
              },
              {
                title: "Portrait Photography",
                desc: "Black & white conversion can add a timeless, classic feel to portrait photos and emphasize textures and expressions.",
                icon: Zap,
              },
              {
                title: "Original Preserved",
                desc: "Your original image stays untouched. Download the converted version separately and keep both.",
                icon: Layers,
              },
            ].map((tip, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-gray-600" />
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
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.black_and_white?.faq_title || "Black & White FAQ"}
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Common questions about converting images to black & white.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>{dict?.black_and_white?.faq_1_q || "Is it free to use?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.black_and_white?.faq_1_a || "Yes, this black & white converter is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of images you can convert."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>{dict?.black_and_white?.faq_2_q || "Is it secure? Where are my images stored?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.black_and_white?.faq_2_a || "Your images are completely secure because all processing happens entirely in your browser using Canvas API. Your images never leave your device and are never uploaded to any server."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>{dict?.black_and_white?.faq_3_q || "How does the grayscale conversion work?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.black_and_white?.faq_3_a || "We use the ITU-R BT.601 luminance formula: Gray = 0.299 x Red + 0.587 x Green + 0.114 x Blue. This weighted average produces natural-looking grayscale that matches how human eyes perceive brightness."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>{dict?.black_and_white?.faq_4_q || "Does it reduce image quality?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.black_and_white?.faq_4_a || "No. The conversion maintains the original resolution and file quality. Only the color information is removed — the image dimensions, sharpness, and detail are fully preserved."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>{dict?.black_and_white?.faq_5_q || "What image formats are supported?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.black_and_white?.faq_5_a || "You can convert PNG, JPG, JPEG, WebP, GIF, and BMP images to black & white. The converted image will be saved in the same format as the original. Maximum file size is 20MB."}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
