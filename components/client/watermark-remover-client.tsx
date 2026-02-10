"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Eraser,
  Upload,
  Download,
  ImageIcon,
  BookOpen,
  Lightbulb,
  Info,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ---------------------------------------------------------------------------
// Watermark Engine (ported from Node pngjs to browser Canvas)
// ---------------------------------------------------------------------------

const ALPHA_THRESHOLD = 2e-3;
const MAX_ALPHA = 0.99;
const LOGO_VALUE = 255;

function calculateAlphaMap(imageData: ImageData): Float32Array {
  const { width, height, data } = imageData;
  const alphaMap = new Float32Array(width * height);
  for (let i = 0; i < alphaMap.length; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    alphaMap[i] = Math.max(r, g, b) / 255;
  }
  return alphaMap;
}

function detectWatermarkConfig(w: number, h: number) {
  if (w > 1024 && h > 1024) {
    return { logoSize: 96, marginRight: 64, marginBottom: 64 };
  }
  return { logoSize: 48, marginRight: 32, marginBottom: 32 };
}

function calculatePosition(
  imgW: number,
  imgH: number,
  cfg: { logoSize: number; marginRight: number; marginBottom: number },
) {
  return {
    x: imgW - cfg.marginRight - cfg.logoSize,
    y: imgH - cfg.marginBottom - cfg.logoSize,
    width: cfg.logoSize,
    height: cfg.logoSize,
  };
}

function removeWatermark(
  imageData: ImageData,
  alphaMap: Float32Array,
  pos: { x: number; y: number; width: number; height: number },
) {
  const { x, y, width, height } = pos;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const imgIdx = ((y + row) * imageData.width + (x + col)) * 4;
      const alphaIdx = row * width + col;
      let alpha = alphaMap[alphaIdx];
      if (alpha < ALPHA_THRESHOLD) continue;
      alpha = Math.min(alpha, MAX_ALPHA);
      const oneMinusAlpha = 1 - alpha;
      for (let c = 0; c < 3; c++) {
        const watermarked = imageData.data[imgIdx + c];
        const original = (watermarked - alpha * LOGO_VALUE) / oneMinusAlpha;
        imageData.data[imgIdx + c] = Math.max(0, Math.min(255, Math.round(original)));
      }
    }
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function getImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}

// Cache alpha maps
const alphaMapCache: Record<number, Float32Array> = {};

async function getAlphaMap(size: number): Promise<Float32Array> {
  if (alphaMapCache[size]) return alphaMapCache[size];
  const bgImg = await loadImage(`/assets/bg_${size}.png`);
  const bgData = getImageData(bgImg);
  const alphaMap = calculateAlphaMap(bgData);
  alphaMapCache[size] = alphaMap;
  return alphaMap;
}

async function processImage(file: File): Promise<{ url: string; fileName: string }> {
  const url = URL.createObjectURL(file);
  const img = await loadImage(url);
  URL.revokeObjectURL(url);

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const config = detectWatermarkConfig(img.width, img.height);
  const position = calculatePosition(img.width, img.height, config);
  const alphaMap = await getAlphaMap(config.logoSize);

  removeWatermark(imageData, alphaMap, position);
  ctx.putImageData(imageData, 0, 0);

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/png"),
  );
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  return {
    url: URL.createObjectURL(blob),
    fileName: `${baseName}_clean.png`,
  };
}

// ---------------------------------------------------------------------------
// Batch processing
// ---------------------------------------------------------------------------

interface ProcessedImage {
  originalName: string;
  url: string;
  fileName: string;
  previewOriginal: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WatermarkRemoverClient({ dict }: { dict?: any }) {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      setFiles(selected);
      setResults([]);
      setError(null);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (dropped.length > 0) {
      setFiles(dropped);
      setResults([]);
      setError(null);
    }
  }, []);

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(0);
    setError(null);
    setResults([]);

    try {
      const processed: ProcessedImage[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await processImage(file);
        processed.push({
          originalName: file.name,
          url: result.url,
          fileName: result.fileName,
          previewOriginal: URL.createObjectURL(file),
        });
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setResults(processed);
    } catch (err: any) {
      setError(err.message || "Failed to process images. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    results.forEach((r) => handleDownload(r.url, r.fileName));
  };

  const handleReset = () => {
    setFiles([]);
    setResults([]);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-3xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 mb-6">
          <Eraser className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.watermark_remover?.title || "Watermark Remover"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.watermark_remover?.subtitle ||
            "Remove watermarks from images instantly. 100% browser-based, no upload to server. Supports batch processing."}
        </p>

        {/* Drop Zone */}
        {files.length === 0 && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                : "border-muted-foreground/30 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {dict?.watermark_remover?.drop_zone ||
                "Drag & drop images here, or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              {dict?.watermark_remover?.supported || "Supported: PNG, JPG, WebP"}
            </p>
            <p className="text-xs text-muted-foreground">
              {dict?.watermark_remover?.batch || "Multiple files supported for batch processing"}
            </p>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && results.length === 0 && (
          <Card className="w-full mb-6 border-emerald-100 dark:border-emerald-900/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">
                  {files.length} {files.length === 1 ? "file" : "files"} selected
                </span>
                <Button variant="ghost" size="icon" onClick={handleReset}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-sm p-2 rounded bg-muted/50"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="truncate flex-1">{file.name}</span>
                    <span className="text-muted-foreground flex-shrink-0">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Process Button */}
        {files.length > 0 && results.length === 0 && (
          <Button
            onClick={handleProcess}
            disabled={processing}
            className="w-full h-14 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg transition-all duration-300"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {dict?.watermark_remover?.processing || "Processing..."}{" "}
                {progress}%
              </>
            ) : (
              <>
                <Eraser className="mr-2 h-5 w-5" />
                {dict?.watermark_remover?.remove_btn || "Remove Watermark"}
                {files.length > 1 && ` (${files.length} files)`}
              </>
            )}
          </Button>
        )}

        {/* Progress Bar */}
        {processing && (
          <div className="w-full mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-600 to-teal-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              {progress}% complete
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="w-full mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-green-100 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-semibold text-lg">
                      {results.length === 1
                        ? "Watermark Removed!"
                        : `${results.length} Images Processed!`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  {results.length > 1 && (
                    <Button
                      onClick={handleDownloadAll}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download All ({results.length})
                    </Button>
                  )}
                  <Button onClick={handleReset} variant="outline" className="flex-1">
                    Process More Images
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Result previews */}
            <div className="grid gap-6">
              {results.map((result, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base truncate">
                      {result.originalName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 text-center">
                          Before
                        </p>
                        <div className="aspect-video bg-muted/50 rounded-lg overflow-hidden">
                          <img
                            src={result.previewOriginal}
                            alt="Original"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 text-center">
                          After
                        </p>
                        <div className="aspect-video bg-muted/50 rounded-lg overflow-hidden">
                          <img
                            src={result.url}
                            alt="Cleaned"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(result.url, result.fileName)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download {result.fileName}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guide & FAQ */}
      <div className="w-full max-w-6xl mx-auto mt-20 px-4 space-y-16">
        {/* Step-by-Step Guide */}
        <section>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
              <BookOpen className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.watermark_remover?.guide_title || "How to Remove Watermarks"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.watermark_remover?.guide_desc ||
                "Remove watermarks from your images in just a few clicks."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title:
                  dict?.watermark_remover?.step1_title || "Upload Your Images",
                desc:
                  dict?.watermark_remover?.step1_desc ||
                  "Drag and drop one or multiple images, or click to browse your files.",
                icon: Upload,
              },
              {
                step: 2,
                title:
                  dict?.watermark_remover?.step2_title || "Remove Watermark",
                desc:
                  dict?.watermark_remover?.step2_desc ||
                  "Click the Remove button. The watermark is detected and removed automatically.",
                icon: Eraser,
              },
              {
                step: 3,
                title:
                  dict?.watermark_remover?.step3_title ||
                  "Download Clean Images",
                desc:
                  dict?.watermark_remover?.step3_desc ||
                  "Preview before/after and download your cleaned images as PNG.",
                icon: Download,
              },
            ].map((step) => (
              <Card
                key={step.step}
                className="border-emerald-100 dark:border-emerald-900/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white font-bold">
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

        {/* Tips */}
        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.watermark_remover?.tips_title || "Watermark Removal Tips"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.watermark_remover?.tips_desc ||
                "Get the best results when removing watermarks from your images."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title:
                  dict?.watermark_remover?.tip1_title || "Batch Processing",
                desc:
                  dict?.watermark_remover?.tip1_desc ||
                  "Select multiple images at once for efficient batch watermark removal.",
                icon: ImageIcon,
              },
              {
                title: dict?.watermark_remover?.tip2_title || "100% Private",
                desc:
                  dict?.watermark_remover?.tip2_desc ||
                  "All processing happens in your browser. No images are uploaded to any server.",
                icon: CheckCircle2,
              },
              {
                title:
                  dict?.watermark_remover?.tip3_title || "PNG Output Quality",
                desc:
                  dict?.watermark_remover?.tip3_desc ||
                  "Results are saved as lossless PNG for the best output quality.",
                icon: ImageIcon,
              },
              {
                title:
                  dict?.watermark_remover?.tip4_title || "High-Resolution Support",
                desc:
                  dict?.watermark_remover?.tip4_desc ||
                  "Works with images of any resolution. The tool auto-detects watermark size and position.",
                icon: Info,
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <Info className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.watermark_remover?.features_title || "Remover Features"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.watermark_remover?.features_desc ||
                "Everything you need to remove watermarks from images."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title:
                  dict?.watermark_remover?.feature1_title || "Browser-Based",
                desc:
                  dict?.watermark_remover?.feature1_desc ||
                  "No software needed. Remove watermarks directly in your browser.",
              },
              {
                title:
                  dict?.watermark_remover?.feature2_title || "Batch Support",
                desc:
                  dict?.watermark_remover?.feature2_desc ||
                  "Process multiple images at once for maximum efficiency.",
              },
              {
                title:
                  dict?.watermark_remover?.feature3_title ||
                  "Before/After Preview",
                desc:
                  dict?.watermark_remover?.feature3_desc ||
                  "Compare original and cleaned images side by side.",
              },
              {
                title:
                  dict?.watermark_remover?.feature4_title || "Zero Upload",
                desc:
                  dict?.watermark_remover?.feature4_desc ||
                  "Images are processed locally. Nothing is sent to any server.",
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

        {/* FAQ */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.qna_watermark_remover?.title || "Watermark Remover FAQ"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.qna_watermark_remover?.desc ||
                "Common questions about removing watermarks from images."}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {[1, 2, 3, 4, 5].map((i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">
                  {dict?.qna_watermark_remover?.[`faq_${i}_q`] || "Question"}
                </AccordionTrigger>
                <AccordionContent className="whitespace-pre-line text-muted-foreground">
                  {dict?.qna_watermark_remover?.[`faq_${i}_a`] || "Answer"}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}
