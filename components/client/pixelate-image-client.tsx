"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
import Adsense from "@/components/Adsense";
  Upload,
  Download,
  FileImage,
  Sparkles,
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

export function PixelateImageClient({ dict }: { dict?: any }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [pixelSize, setPixelSize] = useState<number>(10);
  const [pixelatedUrl, setPixelatedUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

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
    setPixelatedUrl(null);
    setImageSize(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const loadSampleImage = useCallback(async () => {
    try {
      const response = await fetch("/test-image.jpg");
      const blob = await response.blob();
      const file = new File([blob], "test-image.jpg", { type: "image/jpeg" });
      loadImage(file);
    } catch (error) {
      console.error("Failed to load sample image:", error);
    }
  }, []);

  const onImageLoad = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
  }, []);

  const pixelateImage = useCallback(
    (size: number) => {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      if (!img || !canvas) return;

      const w = img.naturalWidth;
      const h = img.naturalHeight;

      // Create a small temp canvas
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = Math.ceil(w / size);
      tempCanvas.height = Math.ceil(h / size);
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      // Draw the image small
      tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

      // Set main canvas to original size
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Disable image smoothing for pixelated effect
      ctx.imageSmoothingEnabled = false;

      // Draw the small canvas large
      ctx.drawImage(tempCanvas, 0, 0, w, h);

      // Determine mime type from filename extension
      const ext = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
      let mimeType = "image/png";
      if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
      else if (ext === "webp") mimeType = "image/webp";
      else if (ext === "bmp") mimeType = "image/bmp";

      const dataUrl = canvas.toDataURL(mimeType, 0.95);
      setPixelatedUrl(dataUrl);
    },
    [fileName],
  );

  // Auto-pixelate when slider changes
  useEffect(() => {
    if (imageSrc && imageRef.current?.complete) {
      pixelateImage(pixelSize);
    }
  }, [pixelSize, imageSrc, pixelateImage]);

  const handleDownload = useCallback(() => {
    if (!pixelatedUrl) return;
    const link = document.createElement("a");
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const ext = fileName.substring(fileName.lastIndexOf("."));
    link.href = pixelatedUrl;
    link.download = `${nameWithoutExt}_pixelated${ext}`;
    link.click();
  }, [pixelatedUrl, fileName]);

  const handleReset = () => {
    setImageSrc(null);
    setFileName("");
    setPixelatedUrl(null);
    setPixelSize(10);
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
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 mb-6">
          <Sparkles className="w-10 h-10 text-violet-600 dark:text-violet-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.pixelate_image?.title || "Pixelate Image"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.pixelate_image?.subtitle || "Pixelate your photo for privacy or artistic effect. Adjust pixel size freely. 100% private — processed in your browser."}
        </p>

        {!imageSrc ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                : "border-muted-foreground/30 hover:border-violet-500/50 hover:bg-violet-50/50 dark:hover:bg-violet-900/10"
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
              {dict?.pixelate_image?.drop_zone || "Drag & drop your image here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {dict?.pixelate_image?.supported || "Supported: PNG, JPG, JPEG, WebP, GIF, BMP"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {dict?.pixelate_image?.max_file_size || "Max file size: 20MB"}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                loadSampleImage();
              }}
              className="mt-4 text-sm text-violet-600 dark:text-violet-400 hover:underline"
            >
              Or try with a sample image
            </button>
          </div>
        ) : (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Controls */}
            <Card className="border-violet-100 dark:border-violet-900/50">
              <CardContent className="p-6 space-y-4">
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

                {/* Pixel Size Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Pixel Size</label>
                    <span className="text-sm text-muted-foreground">{pixelSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={pixelSize}
                    onChange={(e) => setPixelSize(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5px (subtle)</span>
                    <span>50px (strong)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image Preview */}
            <div className="w-full flex items-center justify-center bg-muted/30 rounded-xl overflow-hidden p-8">
              <div className="relative inline-block">
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Image to pixelate"
                  onLoad={onImageLoad}
                  className="hidden"
                />
                {pixelatedUrl ? (
                  <img
                    src={pixelatedUrl}
                    alt="Pixelated result"
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
            {pixelatedUrl && (
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
              {dict?.pixelate_image?.guide_title || "How to Pixelate Images"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.pixelate_image?.guide_desc || "Pixelate any image in 3 simple steps."}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: dict?.pixelate_image?.step1_title || "Upload Image",
                desc: dict?.pixelate_image?.step1_desc || "Upload a PNG, JPG, WebP, GIF, or BMP image from your device.",
                icon: Upload,
              },
              {
                step: 2,
                title: dict?.pixelate_image?.step2_title || "Adjust Pixel Size",
                desc: dict?.pixelate_image?.step2_desc || "Use the slider to control the pixelation intensity. Higher values create stronger blur.",
                icon: Sparkles,
              },
              {
                step: 3,
                title: dict?.pixelate_image?.step3_title || "Download Result",
                desc: dict?.pixelate_image?.step3_desc || "Click 'Download' to save your pixelated image to your device.",
                icon: Download,
              },
            ].map((step) => (
              <Card key={step.step} className="border-violet-100 dark:border-violet-900/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-500 text-white font-bold">
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
              {dict?.pixelate_image?.tips_title || "Pixelation Tips"}
            </h2>
            <p className="text-muted-foreground">
              Get the best results when pixelating your images.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Privacy Protection",
                desc: "Use higher pixel values to hide sensitive information like faces, license plates, or personal details.",
                icon: Shield,
              },
              {
                title: "Artistic Effect",
                desc: "Lower values create a subtle retro look. Experiment with different pixel sizes for unique visual styles.",
                icon: Sparkles,
              },
              {
                title: "Face Blur",
                desc: "Useful for blurring faces in screenshots or photos before sharing on social media.",
                icon: Zap,
              },
              {
                title: "Quality Preserved",
                desc: "Original image dimensions are maintained. The pixelation is purely a visual effect.",
                icon: Layers,
              },
            ].map((tip, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-violet-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Adsense slotId="7759160077" />

        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.pixelate_image?.faq_title || "Image Pixelation FAQ"}
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Common questions about pixelating images online.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>{dict?.pixelate_image?.faq_1_q || "Is it free to use?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.pixelate_image?.faq_1_a || "Yes, this image pixelator is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of images you can pixelate."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>{dict?.pixelate_image?.faq_2_q || "Is it secure? Where are my images stored?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.pixelate_image?.faq_2_a || "Your images are completely secure because all processing happens entirely in your browser using Canvas API. Your images never leave your device and are never uploaded to any server. This ensures 100% privacy."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>{dict?.pixelate_image?.faq_3_q || "What is pixelation used for?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.pixelate_image?.faq_3_a || "Pixelation is commonly used for privacy protection (hiding faces, license plates, sensitive text), censoring content, creating artistic retro effects, and preparing images for social media where certain details need to be obscured."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>{dict?.pixelate_image?.faq_4_q || "Does pixelation reduce image quality?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.pixelate_image?.faq_4_a || "Pixelation changes the visual appearance of your image by reducing detail, but it maintains the original resolution. The effect is reversible only if you keep the original file — once pixelated and saved, the lost detail cannot be recovered."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>{dict?.pixelate_image?.faq_5_q || "What image formats are supported?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.pixelate_image?.faq_5_a || "You can pixelate PNG, JPG, JPEG, WebP, GIF, and BMP images. The pixelated image will be saved in the same format as the original. Maximum file size is 20MB."}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
