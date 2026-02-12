"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileImage,
  Columns,
  Rows,
  RotateCcw,
  Lightbulb,
  Layers,
  Zap,
  Shield,
  Plus,
  X,
  GripVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type LayoutDirection = "horizontal" | "vertical";

interface LoadedImage {
  id: string;
  src: string;
  name: string;
  width: number;
  height: number;
  element: HTMLImageElement;
}

export function CombineImagesClient() {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [direction, setDirection] = useState<LayoutDirection>("horizontal");
  const [gap, setGap] = useState(0);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<{ width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addFiles = (files: FileList | File[]) => {
    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/bmp"];
    const fileArray = Array.from(files).filter(
      (f) => validTypes.includes(f.type) && f.size <= 20 * 1024 * 1024
    );

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const loaded: LoadedImage = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            src: dataUrl,
            name: file.name,
            width: img.naturalWidth,
            height: img.naturalHeight,
            element: img,
          };
          setImages((prev) => [...prev, loaded]);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    setImages((prev) => {
      const newArr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= newArr.length) return prev;
      [newArr[idx], newArr[target]] = [newArr[target], newArr[idx]];
      return newArr;
    });
  };

  // Render combined image
  useEffect(() => {
    if (images.length < 2) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (direction === "horizontal") {
      const maxH = Math.max(...images.map((i) => i.height));
      const totalW = images.reduce((sum, i) => {
        const scale = maxH / i.height;
        return sum + Math.round(i.width * scale);
      }, 0) + gap * (images.length - 1);

      canvas.width = totalW;
      canvas.height = maxH;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, totalW, maxH);

      let x = 0;
      for (const img of images) {
        const scale = maxH / img.height;
        const drawW = Math.round(img.width * scale);
        ctx.drawImage(img.element, x, 0, drawW, maxH);
        x += drawW + gap;
      }

      setPreviewUrl(canvas.toDataURL("image/png", 0.95));
      setResultSize({ width: totalW, height: maxH });
    } else {
      const maxW = Math.max(...images.map((i) => i.width));
      const totalH = images.reduce((sum, i) => {
        const scale = maxW / i.width;
        return sum + Math.round(i.height * scale);
      }, 0) + gap * (images.length - 1);

      canvas.width = maxW;
      canvas.height = totalH;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, maxW, totalH);

      let y = 0;
      for (const img of images) {
        const scale = maxW / img.width;
        const drawH = Math.round(img.height * scale);
        ctx.drawImage(img.element, 0, y, maxW, drawH);
        y += drawH + gap;
      }

      setPreviewUrl(canvas.toDataURL("image/png", 0.95));
      setResultSize({ width: maxW, height: totalH });
    }
  }, [images, direction, gap, bgColor]);

  const loadSampleImages = async () => {
    try {
      const response = await fetch("/test-image.jpg");
      const blob = await response.blob();
      const file1 = new File([blob], "sample-1.jpg", { type: "image/jpeg" });
      const file2 = new File([blob], "sample-2.jpg", { type: "image/jpeg" });
      addFiles([file1, file2]);
    } catch (error) {
      console.error("Failed to load sample images:", error);
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = "combined_image.png";
    link.click();
  };

  const handleReset = () => {
    setImages([]);
    setPreviewUrl(null);
    setResultSize(null);
    setDirection("horizontal");
    setGap(0);
    setBgColor("#ffffff");
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
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-lime-100 to-green-100 dark:from-lime-900/30 dark:to-green-900/30 mb-6">
          <Columns className="w-10 h-10 text-lime-600 dark:text-lime-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Combine Images
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          Combine multiple images side by side or stacked vertically. Adjust gap and background color. 100% private — processed in your browser.
        </p>

        {/* Upload Zone — always show when less than 10 images */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 mb-6 ${
            isDragging
              ? "border-lime-500 bg-lime-50 dark:bg-lime-900/20"
              : "border-muted-foreground/30 hover:border-lime-500/50 hover:bg-lime-50/50 dark:hover:bg-lime-900/10"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          {images.length === 0 ? (
            <>
              <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Drag & drop images here
              </p>
              <p className="text-sm text-muted-foreground">
                Upload 2 or more images to combine. Supported: PNG, JPG, WebP, GIF, BMP
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Max 20MB per file
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  loadSampleImages();
                }}
                className="mt-4 text-sm text-lime-600 dark:text-lime-400 hover:underline"
              >
                Or try with sample images
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-5 h-5 text-lime-600" />
              <span className="text-sm font-medium">Add more images</span>
            </div>
          )}
        </div>

        {/* Image List */}
        {images.length > 0 && (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Thumbnails */}
            <Card className="border-lime-200 dark:border-lime-900/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">{images.length} images</span>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {images.map((img, idx) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.src}
                        alt={img.name}
                        className="w-20 h-20 object-cover rounded-lg border border-muted"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        {idx > 0 && (
                          <button
                            onClick={() => moveImage(idx, -1)}
                            className="p-1 bg-white/80 rounded text-xs"
                            title="Move left"
                          >
                            <GripVertical className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => removeImage(img.id)}
                          className="p-1 bg-red-500 rounded text-white"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5 rounded-b-lg truncate px-1">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card className="border-lime-200 dark:border-lime-900/50">
              <CardContent className="p-6 space-y-4">
                {/* Direction */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Layout Direction</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDirection("horizontal")}
                      className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors ${
                        direction === "horizontal"
                          ? "bg-lime-500 text-white border-lime-500"
                          : "border-muted hover:border-lime-300 hover:bg-lime-50 dark:hover:bg-lime-900/20"
                      }`}
                    >
                      <Columns className="w-4 h-4" />
                      Side by Side
                    </button>
                    <button
                      onClick={() => setDirection("vertical")}
                      className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors ${
                        direction === "vertical"
                          ? "bg-lime-500 text-white border-lime-500"
                          : "border-muted hover:border-lime-300 hover:bg-lime-50 dark:hover:bg-lime-900/20"
                      }`}
                    >
                      <Rows className="w-4 h-4" />
                      Stacked
                    </button>
                  </div>
                </div>

                {/* Gap & Background */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Gap</label>
                      <span className="text-sm text-muted-foreground">{gap}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={gap}
                      onChange={(e) => setGap(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-lime-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-muted cursor-pointer"
                      />
                      {["#ffffff", "#000000", "#f5f5f4"].map((c) => (
                        <button
                          key={c}
                          onClick={() => setBgColor(c)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform ${
                            bgColor === c ? "border-lime-500 scale-110" : "border-muted"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {resultSize && (
                  <div className="text-sm text-muted-foreground">
                    Result: {resultSize.width} x {resultSize.height} px
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview */}
            {previewUrl && (
              <>
                <div className="w-full flex items-center justify-center bg-muted/30 rounded-xl overflow-hidden p-8">
                  <img
                    src={previewUrl}
                    alt="Combined result"
                    className="max-w-full max-h-[60vh] block rounded-lg shadow-md"
                    draggable={false}
                  />
                </div>

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
              </>
            )}

            {images.length === 1 && (
              <p className="text-center text-sm text-muted-foreground">
                Add at least one more image to combine.
              </p>
            )}

          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* How-to & Tips & FAQ */}
      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              How to Combine Images
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Combine multiple images in 3 simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: "Upload Images",
                desc: "Upload 2 or more images. Drag & drop or click to browse. You can add more images after uploading.",
                icon: Upload,
              },
              {
                step: 2,
                title: "Choose Layout",
                desc: "Pick horizontal (side by side) or vertical (stacked). Adjust gap and background color.",
                icon: Columns,
              },
              {
                step: 3,
                title: "Download Result",
                desc: "Click 'Download' to save the combined image as PNG.",
                icon: Download,
              },
            ].map((step) => (
              <Card key={step.step} className="border-lime-200 dark:border-lime-900/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-lime-500 text-white font-bold">
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
              Combine Tips
            </h2>
            <p className="text-muted-foreground">
              Get the best results when combining images.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Auto-Scale to Match",
                desc: "Images are automatically scaled so their heights match (horizontal) or widths match (vertical), creating a seamless result.",
                icon: Layers,
              },
              {
                title: "Reorder Images",
                desc: "Hover over a thumbnail and use the grip button to change the order. Images are combined left-to-right or top-to-bottom.",
                icon: GripVertical,
              },
              {
                title: "Add Gap for Spacing",
                desc: "Use the gap slider to add space between images. The background color fills the gap area.",
                icon: Zap,
              },
              {
                title: "Before & After Comparison",
                desc: "Perfect for creating side-by-side before/after comparisons, photo collages, or panoramic-style layouts.",
                icon: Shield,
              },
            ].map((tip, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-lime-500" />
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
              Image Combiner FAQ
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Common questions about combining images.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>Is it free to use?</AccordionTrigger>
                <AccordionContent>
                  Yes, this image combiner is 100% free. There are no hidden fees, watermarks, or limitations on the number of images you can combine.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>Is it secure? Where are my images stored?</AccordionTrigger>
                <AccordionContent>
                  Your images are completely secure. All processing happens in your browser using Canvas API. Images never leave your device and are never uploaded to any server.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>How many images can I combine?</AccordionTrigger>
                <AccordionContent>
                  You can combine 2 or more images. There is no hard limit, but very large numbers of images may slow down processing depending on your device. Each image must be under 20MB.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>What happens if images have different sizes?</AccordionTrigger>
                <AccordionContent>
                  Images are automatically scaled to match. In horizontal mode, all images are scaled to the same height. In vertical mode, all images are scaled to the same width. This ensures a clean, aligned result.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>What format is the output?</AccordionTrigger>
                <AccordionContent>
                  The combined image is always saved as PNG to ensure maximum quality and transparency support. You can convert it to other formats using our Image Converter tool.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
