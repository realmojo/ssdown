"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  Loader2,
  X,
  FileImage,
  Lightbulb,
  CheckCircle2,
  Layers,
  Zap,
  Minimize2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import JSZip from "jszip";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: "idle" | "compressing" | "done" | "error";
  compressedBlob?: Blob;
  compressedUrl?: string;
  compressedName?: string;
  originalSize: number;
  compressedSize?: number;
}

export function ImageCompressorClient({ dict }: { dict?: any }) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const newImages = files
      .filter((file) => {
        if (!validTypes.includes(file.type)) return false;
        if (file.size > maxSize) return false;
        return true;
      })
      .map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        status: "idle" as const,
        originalSize: file.size,
      }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      if (img?.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const compressImage = async (
    img: ImageFile,
    targetQuality: number,
  ): Promise<ImageFile> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const image = new Image();

      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        if (ctx) {
          ctx.drawImage(image, 0, 0);
        }

        const mimeType = img.file.type;
        const qualityValue = targetQuality / 100;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const nameWithoutExt = img.file.name.substring(
                0,
                img.file.name.lastIndexOf("."),
              );
              const ext = mimeType.split("/")[1];
              resolve({
                ...img,
                status: "done",
                compressedBlob: blob,
                compressedUrl: url,
                compressedName: `${nameWithoutExt}_compressed.${ext}`,
                compressedSize: blob.size,
              });
            } else {
              resolve({ ...img, status: "error" });
            }
          },
          mimeType,
          qualityValue,
        );
      };

      image.onerror = () => resolve({ ...img, status: "error" });
      image.src = img.preview;
    });
  };

  const handleCompressAll = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);

    const promises = images.map((img) => {
      if (img.status === "done" || img.status === "error")
        return Promise.resolve(img);
      return compressImage({ ...img, status: "compressing" }, quality);
    });

    const results = await Promise.all(promises);
    setImages(results);
    setIsProcessing(false);
  };

  const handleDownloadAll = async () => {
    const compressed = images.filter(
      (i) => i.status === "done" && i.compressedBlob,
    );

    if (compressed.length === 0) return;

    if (compressed.length === 1) {
      const link = document.createElement("a");
      link.href = compressed[0].compressedUrl!;
      link.download = compressed[0].compressedName!;
      link.click();
    } else {
      const zip = new JSZip();
      compressed.forEach((img) => {
        zip.file(img.compressedName!, img.compressedBlob!);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "compressed_images.zip";
      link.click();
      URL.revokeObjectURL(url);
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
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const calculateSavings = (original: number, compressed?: number) => {
    if (!compressed) return null;
    const saved = ((original - compressed) / original) * 100;
    return saved.toFixed(1);
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex gap-2">
      <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex w-full flex-col">
        <div className="hidden">
          <Minimize2 className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
          {dict?.image_compressor?.title || "Image Compressor"}
        </h1>
        <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
          {dict?.image_compressor?.subtitle ||
            "Compress images to reduce file size without losing quality. Fast, free, and 100% private."}
        </p>

        <Adsense slotId="7759160077" />

        {images.length === 0 ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-muted-foreground/30 hover:border-green-500/50 hover:bg-green-50/50 dark:hover:bg-green-900/10"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {dict?.image_compressor?.drop_zone ||
                "Drag & drop your images here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {dict?.image_compressor?.supported ||
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
                processFiles([file]);
              }}
              className="mt-4 text-sm text-green-600 dark:text-green-400 hover:underline"
            >
              샘플 이미지로 먼저 써보기
            </button>
          </div>
        ) : (
          <div className="w-full space-y-2 animate-in fade-in slide-in-from-bottom-4">
            <Card className="border-green-100 dark:border-green-900/50">
              <CardContent className="flex flex-col gap-2 p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      더 추가
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <span className="text-muted-foreground hidden md:inline">
                      {images.length} images selected
                    </span>
                  </div>

                  <Button
                    onClick={handleCompressAll}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white min-w-[160px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {dict?.image_compressor?.compressing ||
                          "Compressing..."}
                      </>
                    ) : (
                      <>
                        <Minimize2 className="w-4 h-4 mr-2" />
                        {dict?.image_compressor?.compress_btn ||
                          "Compress Images"}
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {dict?.image_compressor?.quality_label || "Quality"}:{" "}
                      {quality}%
                    </label>
                    {quality < 70 && (
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        품질을 낮추면 화질 저하가 보일 수 있습니다
                      </span>
                    )}
                  </div>
                  <Slider
                    value={[quality]}
                    onValueChange={(val) => setQuality(val[0])}
                    min={1}
                    max={100}
                    step={1}
                    disabled={isProcessing}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>용량 작음</span>
                    <span>최고 화질</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    참고: PNG는 무손실 압축이라 줄일 수 있는 용량에 한계가 있습니다. 용량을 더 줄이려면 WebP나 JPEG로 변환해 보세요.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img) => (
                <Card
                  key={img.id}
                  className="relative group overflow-hidden border-muted/50"
                >
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    disabled={isProcessing}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="h-40 bg-muted/20 relative flex items-center justify-center p-4">
                    <img
                      src={img.preview}
                      alt={img.file.name}
                      className="max-h-full max-w-full object-contain shadow-sm rounded"
                    />
                    {img.status === "done" && (
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center shadow-lg">
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          Compressed
                        </div>
                      </div>
                    )}
                    {img.status === "error" && (
                      <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                          오류
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t">
                    <p
                      className="text-sm font-medium truncate"
                      title={img.file.name}
                    >
                      {img.file.name}
                    </p>
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="text-muted-foreground">
                        {dict?.image_compressor?.original_size || "Original"}:{" "}
                        {formatSize(img.originalSize)}
                      </span>
                    </div>
                    {img.status === "done" && img.compressedSize && (
                      <div className="mt-1 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {dict?.image_compressor?.compressed_size ||
                              "Compressed"}
                            : {formatSize(img.compressedSize)}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-green-600 dark:text-green-400">
                          {dict?.image_compressor?.saved || "Saved"}:{" "}
                          {calculateSavings(
                            img.originalSize,
                            img.compressedSize,
                          )}
                          %
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {images.some((i) => i.status === "done") && (
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  onClick={handleDownloadAll}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg animate-in fade-in slide-in-from-bottom-2"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {dict?.image_compressor?.download_btn || "Download All"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl mx-auto mt-3 px-4 space-y-3">
        <section>
          <div className="mb-2">
            <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
              {dict?.image_compressor?.guide_title || "How to Compress Images"}
            </h2>
            <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              {dict?.image_compressor?.guide_desc ||
                "Reduce image file sizes in 3 simple steps."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-2">
            {[
              {
                step: 1,
                title: dict?.image_compressor?.step1_title || "이미지 업로드s",
                desc:
                  dict?.image_compressor?.step1_desc ||
                  "Upload the PNG, JPG, or WebP images you want to compress.",
                icon: Upload,
              },
              {
                step: 2,
                title: dict?.image_compressor?.step2_title || "Adjust Quality",
                desc:
                  dict?.image_compressor?.step2_desc ||
                  "Use the quality slider to control compression level (1-100). Lower values mean smaller files.",
                icon: Layers,
              },
              {
                step: 3,
                title:
                  dict?.image_compressor?.step3_title || "압축 후 다운로드",
                desc:
                  dict?.image_compressor?.step3_desc ||
                  "Click 'Compress Images' and download your optimized files instantly.",
                icon: Zap,
              },
            ].map((step) => (
              <Card
                key={step.step}
                className="border-green-100 dark:border-green-900/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white font-bold">
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
              {dict?.image_compressor?.tips_title || "Compression Tips"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.image_compressor?.tips_desc ||
                "Get the best results from image compression."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            {[
              {
                title:
                  dict?.image_compressor?.tip1_title ||
                  "Balance Quality & Size",
                desc:
                  dict?.image_compressor?.tip1_desc ||
                  "Quality 80 is a sweet spot for most images - great quality with significant file size reduction.",
                icon: Layers,
              },
              {
                title:
                  dict?.image_compressor?.tip2_title || "PNG Compression Note",
                desc:
                  dict?.image_compressor?.tip2_desc ||
                  "PNG compression is lossless but limited. For better compression, consider converting PNG to WebP or JPEG.",
                icon: FileImage,
              },
              {
                title:
                  dict?.image_compressor?.tip3_title || "WebP Best Compression",
                desc:
                  dict?.image_compressor?.tip3_desc ||
                  "WebP format provides the best compression ratio while maintaining excellent visual quality.",
                icon: Minimize2,
              },
              {
                title: dict?.image_compressor?.tip4_title || "Batch Processing",
                desc:
                  dict?.image_compressor?.tip4_desc ||
                  "Compress multiple images at once to save time. Download all as a ZIP file.",
                icon: Zap,
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-green-500" />
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
              {dict?.qna_image_compressor?.title || "Image Compressor FAQ"}
            </h2>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              {dict?.qna_image_compressor?.desc ||
                "Common questions about compressing images."}
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[1, 2, 3, 4, 5].map((num) => (
                <AccordionItem key={num} value={`item-${num}`}>
                  <AccordionTrigger>
                    {dict?.qna_image_compressor?.[`faq_${num}_q`] ||
                      `Question ${num}`}
                  </AccordionTrigger>
                  <AccordionContent>
                    {dict?.qna_image_compressor?.[`faq_${num}_a`] ||
                      `Answer to question ${num}`}
                  </AccordionContent>
                </AccordionItem>
              ))}
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
