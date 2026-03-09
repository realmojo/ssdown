"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileImage,
  Frame,
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

const BORDER_STYLES = [
  { label: "Solid", value: "solid" },
  { label: "Double", value: "double" },
  { label: "Rounded", value: "rounded" },
  { label: "Shadow", value: "shadow" },
];

export function AddBorderToImageClient({ dict }: { dict?: any }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  const [borderWidth, setBorderWidth] = useState(20);
  const [borderColor, setBorderColor] = useState("#ffffff");
  const [borderStyle, setBorderStyle] = useState("solid");
  const [cornerRadius, setCornerRadius] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

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

  // Re-render on any border setting change
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = originalImageRef.current;
    if (!canvas || !img || !imageSrc) return;

    const bw = borderWidth;
    const totalW = img.naturalWidth + bw * 2;
    const totalH = img.naturalHeight + bw * 2;

    canvas.width = totalW;
    canvas.height = totalH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, totalW, totalH);

    if (borderStyle === "shadow") {
      // White background + shadow effect
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, totalW, totalH);

      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = bw * 0.6;
      ctx.shadowOffsetX = bw * 0.15;
      ctx.shadowOffsetY = bw * 0.15;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(bw * 0.3, bw * 0.3, img.naturalWidth + bw * 0.4, img.naturalHeight + bw * 0.4);
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.drawImage(img, bw, bw);
    } else if (borderStyle === "double") {
      // Outer border
      ctx.fillStyle = borderColor;
      ctx.fillRect(0, 0, totalW, totalH);

      // Inner gap (slightly lighter/darker)
      const gap = Math.max(2, bw * 0.3);
      ctx.fillStyle = imageSrc.includes("image/png") ? "rgba(255,255,255,0)" : "#f5f5f5";
      ctx.fillRect(bw - gap, bw - gap, img.naturalWidth + gap * 2, img.naturalHeight + gap * 2);

      // Inner border
      const innerBw = Math.max(1, bw * 0.3);
      ctx.fillStyle = borderColor;
      ctx.fillRect(bw - innerBw, bw - innerBw, img.naturalWidth + innerBw * 2, img.naturalHeight + innerBw * 2);

      ctx.drawImage(img, bw, bw);
    } else if (borderStyle === "rounded") {
      // Fill background
      ctx.fillStyle = borderColor;
      const r = Math.min(cornerRadius, Math.min(totalW, totalH) / 2);

      // Draw rounded rect background
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(totalW - r, 0);
      ctx.quadraticCurveTo(totalW, 0, totalW, r);
      ctx.lineTo(totalW, totalH - r);
      ctx.quadraticCurveTo(totalW, totalH, totalW - r, totalH);
      ctx.lineTo(r, totalH);
      ctx.quadraticCurveTo(0, totalH, 0, totalH - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.fill();

      // Clip rounded rect for image
      const imgR = Math.max(0, r - bw);
      ctx.beginPath();
      ctx.moveTo(bw + imgR, bw);
      ctx.lineTo(bw + img.naturalWidth - imgR, bw);
      ctx.quadraticCurveTo(bw + img.naturalWidth, bw, bw + img.naturalWidth, bw + imgR);
      ctx.lineTo(bw + img.naturalWidth, bw + img.naturalHeight - imgR);
      ctx.quadraticCurveTo(bw + img.naturalWidth, bw + img.naturalHeight, bw + img.naturalWidth - imgR, bw + img.naturalHeight);
      ctx.lineTo(bw + imgR, bw + img.naturalHeight);
      ctx.quadraticCurveTo(bw, bw + img.naturalHeight, bw, bw + img.naturalHeight - imgR);
      ctx.lineTo(bw, bw + imgR);
      ctx.quadraticCurveTo(bw, bw, bw + imgR, bw);
      ctx.closePath();
      ctx.save();
      ctx.clip();
      ctx.drawImage(img, bw, bw);
      ctx.restore();
    } else {
      // Solid border
      ctx.fillStyle = borderColor;
      ctx.fillRect(0, 0, totalW, totalH);
      ctx.drawImage(img, bw, bw);
    }

    const ext = fileName.toLowerCase();
    let mimeType = "image/png";
    if (ext.endsWith(".jpg") || ext.endsWith(".jpeg")) mimeType = "image/jpeg";
    else if (ext.endsWith(".webp")) mimeType = "image/webp";

    setPreviewUrl(canvas.toDataURL(mimeType, 0.95));
  }, [imageSrc, borderWidth, borderColor, borderStyle, cornerRadius, fileName]);

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
    link.download = `${nameWithoutExt}_bordered${ext}`;
    link.click();
  };

  const handleReset = () => {
    setImageSrc(null);
    setFileName("");
    setPreviewUrl(null);
    setImageSize(null);
    setBorderWidth(20);
    setBorderColor("#ffffff");
    setBorderStyle("solid");
    setCornerRadius(0);
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
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 mb-6">
          <Frame className="w-10 h-10 text-rose-600 dark:text-rose-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.add_border_to_image?.title || "Add Border to Image"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.add_border_to_image?.subtitle || "Add a border or frame to your image. Choose width, color, and style. 100% private — processed in your browser."}
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
                ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                : "border-muted-foreground/30 hover:border-rose-500/50 hover:bg-rose-50/50 dark:hover:bg-rose-900/10"
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
              {dict?.add_border_to_image?.drop_zone || "Drag & drop your image here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {dict?.add_border_to_image?.supported || "Supported: PNG, JPG, JPEG, WebP, GIF, BMP"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {dict?.add_border_to_image?.max_file_size || "Max file size: 20MB"}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                loadSampleImage();
              }}
              className="mt-4 text-sm text-rose-600 dark:text-rose-400 hover:underline"
            >
              Or try with a sample image
            </button>
          </div>
        ) : (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Controls */}
            <Card className="border-rose-200 dark:border-rose-900/50">
              <CardContent className="p-6 space-y-5">
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleReset}>
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

                {/* Border Style */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Border Style</label>
                  <div className="flex flex-wrap gap-2">
                    {BORDER_STYLES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setBorderStyle(s.value)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          borderStyle === s.value
                            ? "bg-rose-500 text-white border-rose-500"
                            : "border-muted hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Width */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Border Width</label>
                    <span className="text-sm text-muted-foreground">{borderWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5px (thin)</span>
                    <span>100px (thick)</span>
                  </div>
                </div>

                {/* Border Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Border Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-12 h-10 rounded-lg border border-muted cursor-pointer"
                      />
                      <div className="flex gap-2">
                        {["#ffffff", "#000000", "#f5f5f4", "#1e293b", "#e11d48"].map((c) => (
                          <button
                            key={c}
                            onClick={() => setBorderColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform ${
                              borderColor === c ? "border-rose-500 scale-110" : "border-muted"
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Corner Radius (only for rounded style) */}
                  {borderStyle === "rounded" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Corner Radius</label>
                        <span className="text-sm text-muted-foreground">{cornerRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        step="1"
                        value={cornerRadius}
                        onChange={(e) => setCornerRadius(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-rose-600"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Image Preview */}
            <div className="w-full flex items-center justify-center bg-muted/30 rounded-xl overflow-hidden p-8">
              <div className="relative inline-block">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Image with border"
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
            {previewUrl && (
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
              {dict?.add_border_to_image?.guide_title || "How to Add Border to Images"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.add_border_to_image?.guide_desc || "Add a border or frame to any image in 3 simple steps."}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: dict?.add_border_to_image?.step1_title || "Upload Image",
                desc: dict?.add_border_to_image?.step1_desc || "Upload a PNG, JPG, WebP, GIF, or BMP image from your device.",
                icon: Upload,
              },
              {
                step: 2,
                title: dict?.add_border_to_image?.step2_title || "Customize Border",
                desc: dict?.add_border_to_image?.step2_desc || "Choose border style, width, color, and corner radius to create the perfect frame.",
                icon: Frame,
              },
              {
                step: 3,
                title: dict?.add_border_to_image?.step3_title || "Download Result",
                desc: dict?.add_border_to_image?.step3_desc || "Click 'Download' to save your bordered image to your device.",
                icon: Download,
              },
            ].map((step) => (
              <Card key={step.step} className="border-rose-200 dark:border-rose-900/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-500 text-white font-bold">
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
              {dict?.add_border_to_image?.tips_title || "Border Tips"}
            </h2>
            <p className="text-muted-foreground">
              Get the best results when adding borders to your images.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "White Border for Instagram",
                desc: "A white border gives your photos a clean, gallery-like look — perfect for Instagram feeds. Try 20-40px width.",
                icon: Shield,
              },
              {
                title: "Shadow for Depth",
                desc: "The shadow style adds a subtle drop shadow, making your image look like it's floating — great for presentations.",
                icon: Layers,
              },
              {
                title: "Rounded Corners",
                desc: "Use the rounded style with corner radius to give your images a modern, app-like appearance.",
                icon: Frame,
              },
              {
                title: "Original Preserved",
                desc: "Your original image stays untouched. The border is added to a copy, and you download only the result.",
                icon: Zap,
              },
            ].map((tip, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-rose-500" />
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
              {dict?.add_border_to_image?.faq_title || "Image Border FAQ"}
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Common questions about adding borders to images.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>{dict?.add_border_to_image?.faq_1_q || "Is it free to use?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.add_border_to_image?.faq_1_a || "Yes, this border tool is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of images you can edit."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>{dict?.add_border_to_image?.faq_2_q || "Is it secure? Where are my images stored?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.add_border_to_image?.faq_2_a || "Your images are completely secure because all processing happens entirely in your browser using Canvas API. Your images never leave your device and are never uploaded to any server."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>{dict?.add_border_to_image?.faq_3_q || "Does adding a border change the image resolution?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.add_border_to_image?.faq_3_a || "The output image will be slightly larger than the original because the border adds extra pixels around the edges. For example, a 20px border adds 40px to both width and height. The original image quality is fully preserved."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>{dict?.add_border_to_image?.faq_4_q || "What border styles are available?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.add_border_to_image?.faq_4_a || "We offer 4 border styles: Solid (clean flat border), Double (layered frame effect), Rounded (with adjustable corner radius), and Shadow (floating card effect with drop shadow)."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>{dict?.add_border_to_image?.faq_5_q || "What image formats are supported?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.add_border_to_image?.faq_5_a || "You can add borders to PNG, JPG, JPEG, WebP, GIF, and BMP images. The result will be saved in the same format as the original. Maximum file size is 20MB."}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
