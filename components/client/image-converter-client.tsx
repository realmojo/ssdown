"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  Image as ImageIcon,
  Loader2,
  X,
  FileImage,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  Layers,
  Zap,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import JSZip from "jszip";
import Adsense from "@/components/Adsense";

type ValidFormat = "png" | "jpeg" | "webp" | "avif" | "gif";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: "idle" | "converting" | "done" | "error";
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedName?: string;
}

export function ImageConverterClient({ dict }: { dict?: any }) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<ValidFormat>("webp");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [supportsAvif, setSupportsAvif] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check AVIF support on mount
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    canvas.toBlob(
      (blob) => {
        setSupportsAvif(blob !== null);
      },
      "image/avif",
      0.5
    );
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/svg+xml",
      "image/gif",
      "image/heic",
      "image/heif",
    ];
    const newImages = files
      .filter(
        (file) =>
          file.type.startsWith("image/") ||
          validTypes.includes(file.type) ||
          file.name.toLowerCase().endsWith(".heic") ||
          file.name.toLowerCase().endsWith(".heif")
      )
      .map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        status: "idle" as const,
      }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      if (img?.convertedUrl) URL.revokeObjectURL(img.convertedUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  // Helper: Convert SVG to PNG
  const convertSvgToPng = async (imageSrc: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const image = new Image();

      image.onload = () => {
        canvas.width = image.width || 800;
        canvas.height = image.height || 600;
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0);
        }

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/png",
          1.0
        );
      };

      image.onerror = () => resolve(null);
      image.src = imageSrc;
    });
  };

  // Helper: Convert GIF to JPEG (extracts first frame)
  const convertGifToJpeg = async (imageSrc: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const image = new Image();

      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0);
        }

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          0.9
        );
      };

      image.onerror = () => resolve(null);
      image.src = imageSrc;
    });
  };

  // Helper: Convert to GIF using gifshot
  const convertToGif = async (imageSrc: string): Promise<Blob | null> => {
    try {
      const gifshot = (await import("gifshot")).default;

      return new Promise((resolve) => {
        // Load image to get dimensions
        const img = new Image();
        img.onload = () => {
          gifshot.createGIF(
            {
              images: [imageSrc],
              interval: 1,
              gifWidth: img.width,
              gifHeight: img.height,
              numWorkers: 2,
            },
            (obj: any) => {
              if (!obj.error && obj.image) {
                // Convert data URL to Blob
                fetch(obj.image)
                  .then((res) => res.blob())
                  .then((blob) => resolve(blob))
                  .catch(() => resolve(null));
              } else {
                resolve(null);
              }
            }
          );
        };
        img.onerror = () => resolve(null);
        img.src = imageSrc;
      });
    } catch (error) {
      console.error("Error converting to GIF:", error);
      return null;
    }
  };

  // Helper: Convert HEIC to standard format
  const convertHeicToStandard = async (
    file: File,
    format: ValidFormat
  ): Promise<Blob | null> => {
    try {
      const heic2any = (await import("heic2any")).default;

      const convertedBlob = (await heic2any({
        blob: file,
        toType: `image/${format === "jpeg" ? "jpeg" : "png"}`,
        quality: 0.9,
      })) as Blob;

      return convertedBlob;
    } catch (error) {
      console.error("Error converting HEIC:", error);
      return null;
    }
  };

  const convertImage = async (
    img: ImageFile,
    format: ValidFormat,
  ): Promise<ImageFile> => {
    try {
      const fileType = img.file.type;
      const fileName = img.file.name.toLowerCase();
      const nameWithoutExt = img.file.name.substring(
        0,
        img.file.name.lastIndexOf("."),
      );

      let resultBlob: Blob | null = null;

      // Handle HEIC/HEIF input
      if (
        fileType === "image/heic" ||
        fileType === "image/heif" ||
        fileName.endsWith(".heic") ||
        fileName.endsWith(".heif")
      ) {
        resultBlob = await convertHeicToStandard(img.file, format);
      }
      // Handle SVG to PNG
      else if (fileType === "image/svg+xml" && format === "png") {
        resultBlob = await convertSvgToPng(img.preview);
      }
      // Handle GIF to JPEG (first frame extraction)
      else if (fileType === "image/gif" && format === "jpeg") {
        resultBlob = await convertGifToJpeg(img.preview);
      }
      // Handle any format to GIF
      else if (format === "gif") {
        resultBlob = await convertToGif(img.preview);
      }
      // Standard canvas-based conversion (PNG, JPEG, WEBP, AVIF)
      else {
        resultBlob = await new Promise<Blob | null>((resolve) => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const image = new Image();

          image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;
            if (ctx) {
              // Fill white background for JPEG (no transparency)
              if (format === "jpeg") {
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              }
              ctx.drawImage(image, 0, 0);
            }

            canvas.toBlob(
              (blob) => {
                resolve(blob);
              },
              `image/${format}`,
              0.9,
            );
          };

          image.onerror = () => resolve(null);
          image.src = img.preview;
        });
      }

      if (resultBlob) {
        const url = URL.createObjectURL(resultBlob);
        return {
          ...img,
          status: "done",
          convertedBlob: resultBlob,
          convertedUrl: url,
          convertedName: `${nameWithoutExt}.${format}`,
        };
      } else {
        return { ...img, status: "error" };
      }
    } catch (error) {
      console.error("Conversion error:", error);
      return { ...img, status: "error" };
    }
  };

  const handleConvertAll = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);

    // Process sequentially to be nice to the browser, or parallel-batched?
    // Parallel is fine for a few images
    const promises = images.map((img) => {
      if (img.status === "done" || img.status === "error")
        return Promise.resolve(img);
      return convertImage({ ...img, status: "converting" }, targetFormat);
    });

    const results = await Promise.all(promises);
    setImages(results);
    setIsProcessing(false);
  };

  const handleDownloadAll = async () => {
    const converted = images.filter(
      (i) => i.status === "done" && i.convertedBlob,
    );

    if (converted.length === 0) return;

    if (converted.length === 1) {
      const link = document.createElement("a");
      link.href = converted[0].convertedUrl!;
      link.download = converted[0].convertedName!;
      link.click();
    } else {
      const zip = new JSZip();
      converted.forEach((img) => {
        zip.file(img.convertedName!, img.convertedBlob!);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "converted_images.zip";
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

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 mb-6">
          <RefreshCw className="w-10 h-10 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.image_converter?.title || "Image Converter"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.image_converter?.subtitle ||
            "Convert images to WebP, PNG, JPG, AVIF, and GIF. Support for SVG, HEIC. Fast, free, and secure."}
        </p>

        <Adsense slotId="7759160077" />

        {/* Start Screen / Drop Zone */}
        {images.length === 0 ? (
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
              accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif, image/heic, image/heif, .heic, .heif"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {dict?.image_converter?.drop_zone ||
                "Drag & drop your images here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {dict?.image_converter?.supported ||
                "Supported: PNG, JPG, JPEG, WEBP, SVG, GIF, HEIC"}
            </p>
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                const res = await fetch("/test-image.jpg");
                const blob = await res.blob();
                const file = new File([blob], "test-image.jpg", { type: "image/jpeg" });
                processFiles([file]);
              }}
              className="mt-4 text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              Or try with a sample image
            </button>
          </div>
        ) : (
          <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Controls */}
            <Card className="border-purple-100 dark:border-purple-900/50">
              <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add More
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif, image/heic, image/heif, .heic, .heif"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="text-muted-foreground hidden md:inline">
                    {images.length} images selected
                  </span>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <span className="whitespace-nowrap font-medium">
                    Convert to:
                  </span>
                  <Select
                    value={targetFormat}
                    onValueChange={(val) => setTargetFormat(val as ValidFormat)}
                    disabled={isProcessing}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webp">WebP</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpeg">JPG</SelectItem>
                      <SelectItem value="avif">AVIF</SelectItem>
                      <SelectItem value="gif">GIF</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleConvertAll}
                    disabled={isProcessing}
                    className="bg-purple-600 hover:bg-purple-700 text-white min-w-[140px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {dict?.image_converter?.converting || "Converting..."}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {dict?.image_converter?.convert_btn || "Convert Images"}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AVIF Warning */}
            {targetFormat === "avif" && !supportsAvif && (
              <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20">
                <CardContent className="flex items-start gap-3 p-4">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                      AVIF not supported
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-200">
                      Your browser doesn't support AVIF format. Please use a
                      modern browser like Chrome 85+, Firefox 93+, or Safari
                      16+, or choose a different format.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Image List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img) => (
                <Card
                  key={img.id}
                  className="relative group overflow-hidden border-muted/50"
                >
                  {/* Remove Button */}
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
                          Converted
                        </div>
                      </div>
                    )}
                    {img.status === "error" && (
                      <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                          Error
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
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-muted-foreground">
                        {(img.file.size / 1024).toFixed(0)} KB
                      </span>
                      {img.status === "done" && img.convertedBlob && (
                        <span className="text-xs font-medium text-green-600">
                          → {(img.convertedBlob.size / 1024).toFixed(0)} KB
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Download Button */}
            {images.some((i) => i.status === "done") && (
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  onClick={handleDownloadAll}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg animate-in fade-in slide-in-from-bottom-2"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {dict?.image_converter?.download_btn || "Download All"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guide Section */}
      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.image_converter?.guide_title || "How to Convert Images"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.image_converter?.guide_desc ||
                "Transform your images in 3 simple steps."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: dict?.image_converter?.step1_title || "Upload Images",
                desc:
                  dict?.image_converter?.step1_desc ||
                  "Upload PNG, JPG, WebP, SVG, GIF, or HEIC images you want to convert.",
                icon: Upload,
              },
              {
                step: 2,
                title: dict?.image_converter?.step2_title || "Select Format",
                desc:
                  dict?.image_converter?.step2_desc ||
                  "Choose your desired output format (WebP, PNG, JPG, AVIF, or GIF).",
                icon: Layers,
              },
              {
                step: 3,
                title:
                  dict?.image_converter?.step3_title || "Convert & Download",
                desc:
                  dict?.image_converter?.step3_desc ||
                  "Click 'Convert Images' and download your new files instantly.",
                icon: Zap,
              },
            ].map((step) => (
              <Card
                key={step.step}
                className="border-purple-100 dark:border-purple-900/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 text-white font-bold">
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

        {/* Tips Section */}
        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.image_converter?.tips_title || "Conversion Tips"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.image_converter?.tips_desc ||
                "Optimize your images for the web."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: dict?.image_converter?.tip1_title || "Web Speed",
                desc:
                  dict?.image_converter?.tip1_desc ||
                  "Use WebP for the best balance of quality and file size for websites.",
                icon: Layers,
              },
              {
                title: dict?.image_converter?.tip2_title || "Transparency",
                desc:
                  dict?.image_converter?.tip2_desc ||
                  "Need transparent backgrounds? Use PNG or WebP.",
                icon: ImageIcon,
              },
              {
                title: dict?.image_converter?.tip3_title || "Compatibility",
                desc:
                  dict?.image_converter?.tip3_desc ||
                  "JPG is the most widely supported format, perfect for photography.",
                icon: FileImage,
              },
              {
                title: dict?.image_converter?.tip4_title || "Batch Processing",
                desc:
                  dict?.image_converter?.tip4_desc ||
                  "You can convert multiple images at once to save time.",
                icon: Zap,
              },
              {
                title: "AVIF Compression",
                desc: "AVIF offers up to 50% smaller files than JPEG at similar quality. Ideal for bandwidth-sensitive sites, but check browser support first.",
                icon: Zap,
              },
              {
                title: "SVG to Raster",
                desc: "Convert vector SVG files to PNG to use them in contexts that don't support SVG, like email or certain social platforms.",
                icon: FileImage,
              },
              {
                title: "iPhone HEIC Photos",
                desc: "iPhones save photos in HEIC format by default. Convert them to JPG or PNG for universal sharing and compatibility.",
                icon: ImageIcon,
              },
              {
                title: "GIF for Compatibility",
                desc: "Convert static images to GIF when a platform specifically requires it, or extract the first frame from a GIF animation as a JPG.",
                icon: Layers,
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.qna_image_converter?.title || "Image Converter FAQ"}
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              {dict?.qna_image_converter?.desc ||
                "Common questions about image conversion."}
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: dict?.qna_image_converter?.faq_1_q || "Is it free?",
                  a: dict?.qna_image_converter?.faq_1_a || "Yes, our image converter is 100% free to use with no limits on conversions.",
                },
                {
                  q: dict?.qna_image_converter?.faq_2_q || "Is it secure?",
                  a: dict?.qna_image_converter?.faq_2_a || "Absolutely. All conversions happen in your browser. Your images are never uploaded to any server.",
                },
                {
                  q: dict?.qna_image_converter?.faq_3_q || "What is WebP?",
                  a: dict?.qna_image_converter?.faq_3_a || "WebP is a modern image format developed by Google that provides superior lossless and lossy compression for images on the web, resulting in smaller file sizes with comparable quality.",
                },
                {
                  q: "What is AVIF and which browsers support it?",
                  a: "AVIF (AV1 Image File Format) is a next-generation image format based on the AV1 video codec. It offers up to 50% better compression than JPEG and 20% better than WebP at similar quality. Supported in Chrome 85+, Firefox 93+, and Safari 16+. If your browser doesn't support AVIF, a warning will be shown.",
                },
                {
                  q: "How does SVG to PNG conversion work?",
                  a: "When you convert SVG to PNG, the converter renders the vector SVG image at its native resolution onto a canvas element, then exports it as a high-quality PNG file. This preserves all visual details while converting from a scalable vector format to a raster bitmap.",
                },
                {
                  q: "Can I convert GIF to JPG?",
                  a: "Yes. The converter extracts the first frame from your GIF animation and saves it as a static JPG image. This is useful when you need a still preview of an animated GIF for thumbnails, social media, or email.",
                },
                {
                  q: "How do I create a GIF from JPG or PNG?",
                  a: "Upload your JPG or PNG image and select GIF as the output format. The converter creates a single-frame GIF from your static image using the gifshot library. This is helpful when you need GIF format for specific platforms or applications.",
                },
                {
                  q: "How do I convert HEIC photos from my iPhone?",
                  a: "iPhones and iPads save photos in HEIC (High Efficiency Image Coding) format by default. Simply upload your .heic or .heif files and choose JPG, PNG, or WebP as the output. The conversion uses the heic2any library and runs entirely in your browser, keeping your photos private.",
                },
              ].map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
