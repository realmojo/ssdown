"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  Loader2,
  FileImage,
  Lightbulb,
  CheckCircle2,
  Layers,
  Zap,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import JSZip from "jszip";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

interface FaviconSize {
  size: number;
  canvas: HTMLCanvasElement;
  pngBlob?: Blob;
  pngUrl?: string;
}

const FAVICON_SIZES = [16, 32, 48, 64, 128, 256];

export function FaviconGeneratorClient({ dict }: { dict?: any }) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [favicons, setFavicons] = useState<FaviconSize[]>([]);
  const [status, setStatus] = useState<
    "idle" | "generating" | "done" | "error"
  >("idle");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return;
    }

    if (file.size > maxSize) {
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setStatus("idle");
    setFavicons([]);
  };

  const generateFavicons = async () => {
    if (!image || !imagePreview) return;

    setStatus("generating");

    try {
      const img = new Image();
      img.src = imagePreview;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const generatedFavicons: FaviconSize[] = [];

      for (const size of FAVICON_SIZES) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) continue;

        canvas.width = size;
        canvas.height = size;

        // Enable high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Calculate crop dimensions for center crop (make square)
        const sourceSize = Math.min(img.width, img.height);
        const sourceX = (img.width - sourceSize) / 2;
        const sourceY = (img.height - sourceSize) / 2;

        // Draw the center-cropped, scaled image
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          0,
          0,
          size,
          size,
        );

        // Convert to PNG blob
        const pngBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => resolve(blob), "image/png");
        });

        if (pngBlob) {
          generatedFavicons.push({
            size,
            canvas,
            pngBlob,
            pngUrl: URL.createObjectURL(pngBlob),
          });
        }
      }

      setFavicons(generatedFavicons);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const createIcoFile = async (): Promise<Blob> => {
    // ICO file format structure:
    // ICONDIR header (6 bytes)
    // ICONDIRENTRY for each image (16 bytes each)
    // PNG data for each image

    const imageCount = favicons.length;
    const headerSize = 6;
    const entrySize = 16;
    const dirSize = headerSize + entrySize * imageCount;

    // Calculate total file size
    let totalSize = dirSize;
    const imageSizes: number[] = [];

    for (const favicon of favicons) {
      if (favicon.pngBlob) {
        imageSizes.push(favicon.pngBlob.size);
        totalSize += favicon.pngBlob.size;
      }
    }

    // Create the ICO file buffer
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    let offset = 0;

    // Write ICONDIR header
    view.setUint16(offset, 0, true); // Reserved (must be 0)
    offset += 2;
    view.setUint16(offset, 1, true); // Type (1 = ICO)
    offset += 2;
    view.setUint16(offset, imageCount, true); // Image count
    offset += 2;

    // Write ICONDIRENTRY for each image
    let imageOffset = dirSize;
    for (let i = 0; i < imageCount; i++) {
      const favicon = favicons[i];
      const size = favicon.size > 255 ? 0 : favicon.size; // 0 means 256

      view.setUint8(offset, size); // Width (0 = 256)
      offset += 1;
      view.setUint8(offset, size); // Height (0 = 256)
      offset += 1;
      view.setUint8(offset, 0); // Color palette (0 = no palette)
      offset += 1;
      view.setUint8(offset, 0); // Reserved
      offset += 1;
      view.setUint16(offset, 1, true); // Color planes
      offset += 2;
      view.setUint16(offset, 32, true); // Bits per pixel
      offset += 2;
      view.setUint32(offset, imageSizes[i], true); // Image size in bytes
      offset += 4;
      view.setUint32(offset, imageOffset, true); // Image offset
      offset += 4;

      imageOffset += imageSizes[i];
    }

    // Write PNG data for each image
    for (const favicon of favicons) {
      if (favicon.pngBlob) {
        const arrayBuffer = await favicon.pngBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        new Uint8Array(buffer, offset, uint8Array.length).set(uint8Array);
        offset += uint8Array.length;
      }
    }

    return new Blob([buffer], { type: "image/x-icon" });
  };

  const handleDownloadICO = async () => {
    if (favicons.length === 0) return;

    const icoBlob = await createIcoFile();
    const url = URL.createObjectURL(icoBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "favicon.ico";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = (favicon: FaviconSize) => {
    if (!favicon.pngUrl) return;

    const link = document.createElement("a");
    link.href = favicon.pngUrl;
    link.download = `favicon-${favicon.size}x${favicon.size}.png`;
    link.click();
  };

  const handleDownloadAllPNG = async () => {
    if (favicons.length === 0) return;

    const zip = new JSZip();
    favicons.forEach((favicon) => {
      if (favicon.pngBlob) {
        zip.file(
          `favicon-${favicon.size}x${favicon.size}.png`,
          favicon.pngBlob,
        );
      }
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = "favicons.zip";
    link.click();
    URL.revokeObjectURL(url);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleReset = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    favicons.forEach((f) => {
      if (f.pngUrl) URL.revokeObjectURL(f.pngUrl);
    });
    setImage(null);
    setImagePreview("");
    setFavicons([]);
    setStatus("idle");
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col min-h-[50vh]">
      <div className="flex gap-8">
      <div className="flex-1 min-w-0 flex flex-col items-center">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 mb-6">
          <FileImage className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.favicon_generator?.title || "Favicon Generator"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.favicon_generator?.subtitle ||
            "Convert any image to favicon (ICO) with multiple sizes. 100% client-side processing."}
        </p>

        <Adsense slotId="7759160077" />

        {!image ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-muted-foreground/30 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {dict?.favicon_generator?.drop_zone ||
                "Drag & drop your image here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {dict?.favicon_generator?.supported ||
                "Supported: PNG, JPG, JPEG, WEBP"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              최대 파일 크기: 10MB
            </p>
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                const res = await fetch("/test-image.jpg");
                const blob = await res.blob();
                const file = new File([blob], "test-image.jpg", {
                  type: "image/jpeg",
                });
                processFile(file);
              }}
              className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              샘플 이미지로 먼저 써보기
            </button>
          </div>
        ) : (
          <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <Card className="border-indigo-100 dark:border-indigo-900/50">
              <CardContent className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800">
                    <img
                      src={imagePreview}
                      alt="미리보기"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-1">{image.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(image.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={status === "generating"}
                  >
                    이미지 변경
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={generateFavicons}
                    disabled={status === "generating"}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1"
                  >
                    {status === "generating" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {dict?.favicon_generator?.generating || "Generating..."}
                      </>
                    ) : (
                      <>
                        <FileImage className="w-4 h-4 mr-2" />
                        {dict?.favicon_generator?.generate_btn ||
                          "Generate Favicon"}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {status === "done" && favicons.length > 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <Card className="border-indigo-100 dark:border-indigo-900/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      {dict?.favicon_generator?.preview_title || "Preview"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {favicons.map((favicon) => (
                        <div
                          key={favicon.size}
                          className="flex flex-col items-center gap-3 p-4 rounded-lg border border-muted/50 bg-muted/20"
                        >
                          <div className="flex items-center justify-center w-full aspect-square bg-white dark:bg-gray-800 rounded border border-indigo-200 dark:border-indigo-800">
                            {favicon.pngUrl && (
                              <img
                                src={favicon.pngUrl}
                                alt={`${favicon.size}x${favicon.size}`}
                                className="max-w-full max-h-full object-contain"
                              />
                            )}
                          </div>
                          <div className="text-center space-y-2">
                            <p className="text-sm font-medium">
                              {favicon.size}x{favicon.size}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPNG(favicon)}
                              className="w-full"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              {dict?.favicon_generator?.download_png_btn ||
                                "Download PNG"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        size="lg"
                        onClick={handleDownloadICO}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        {dict?.favicon_generator?.download_ico_btn ||
                          "Download ICO (All Sizes)"}
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={handleDownloadAllPNG}
                        className="flex-1"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        {dict?.favicon_generator?.download_all_png_btn ||
                          "Download All PNGs (ZIP)"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.favicon_generator?.guide_title ||
                "How to Generate Favicons"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.favicon_generator?.guide_desc ||
                "Create favicons for your website in 3 simple steps."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: dict?.favicon_generator?.step1_title || "이미지 업로드",
                desc:
                  dict?.favicon_generator?.step1_desc ||
                  "Upload any image file (PNG, JPG, or WebP). We'll automatically convert it to a favicon.",
                icon: Upload,
              },
              {
                step: 2,
                title: dict?.favicon_generator?.step2_title || "Auto-Generate",
                desc:
                  dict?.favicon_generator?.step2_desc ||
                  "We automatically generate 6 standard favicon sizes from 16x16 to 256x256 pixels.",
                icon: Layers,
              },
              {
                step: 3,
                title: dict?.favicon_generator?.step3_title || "Download",
                desc:
                  dict?.favicon_generator?.step3_desc ||
                  "Download the ICO file with all sizes, or download individual PNG files.",
                icon: Zap,
              },
            ].map((step) => (
              <Card
                key={step.step}
                className="border-indigo-100 dark:border-indigo-900/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500 text-white font-bold">
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
              {dict?.favicon_generator?.tips_title || "Favicon Design Tips"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.favicon_generator?.tips_desc ||
                "Create effective favicons for your website."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title:
                  dict?.favicon_generator?.tip1_title ||
                  "Simple Designs Work Best",
                desc:
                  dict?.favicon_generator?.tip1_desc ||
                  "Favicons are tiny. Use simple, recognizable shapes and avoid complex details that won't be visible at 16x16 pixels.",
                icon: ImageIcon,
              },
              {
                title:
                  dict?.favicon_generator?.tip2_title || "High Contrast Colors",
                desc:
                  dict?.favicon_generator?.tip2_desc ||
                  "Use colors with strong contrast so your favicon stands out in browser tabs and bookmarks.",
                icon: Layers,
              },
              {
                title: dict?.favicon_generator?.tip3_title || "Square Images",
                desc:
                  dict?.favicon_generator?.tip3_desc ||
                  "Start with a square image for best results. Non-square images will be center-cropped automatically.",
                icon: FileImage,
              },
              {
                title:
                  dict?.favicon_generator?.tip4_title || "Test at Small Sizes",
                desc:
                  dict?.favicon_generator?.tip4_desc ||
                  "Always preview your favicon at 16x16 and 32x32 to ensure it's still recognizable when scaled down.",
                icon: Zap,
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-indigo-500" />
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
              {dict?.qna_favicon_generator?.title || "Favicon Generator FAQ"}
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              {dict?.qna_favicon_generator?.desc ||
                "Common questions about generating favicons."}
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[1, 2, 3, 4, 5].map((num) => (
                <AccordionItem key={num} value={`item-${num}`}>
                  <AccordionTrigger>
                    {dict?.qna_favicon_generator?.[`faq_${num}_q`] ||
                      `Question ${num}`}
                  </AccordionTrigger>
                  <AccordionContent>
                    {dict?.qna_favicon_generator?.[`faq_${num}_a`] ||
                      `Answer to question ${num}`}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
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
