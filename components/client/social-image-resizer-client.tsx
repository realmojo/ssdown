"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  Image as ImageIcon,
  Crop,
  X,
  Youtube,
  Twitter,
  Layout,
  Smartphone,
  Square,
  Monitor,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import JSZip from "jszip";

interface ResizedImage {
  id: string;
  name: string;
  width: number;
  height: number;
  blob: Blob;
  url: string;
  platform: "Instagram" | "YouTube" | "TikTok" | "Twitter";
  aspectRatio: string;
}

const TARGET_SIZES = [
  {
    id: "ig_story",
    name: "Instagram Story / TikTok",
    width: 1080,
    height: 1920,
    platform: "Instagram",
    aspectRatio: "9:16",
    icon: Smartphone,
  },
  {
    id: "ig_feed",
    name: "Instagram Feed",
    width: 1080,
    height: 1080,
    platform: "Instagram",
    aspectRatio: "1:1",
    icon: Square,
  },
  {
    id: "yt_thumb",
    name: "YouTube Thumbnail",
    width: 1280,
    height: 720,
    platform: "YouTube",
    aspectRatio: "16:9",
    icon: Youtube,
  },
  {
    id: "twitter_post",
    name: "Twitter Post",
    width: 1200,
    height: 675,
    platform: "Twitter",
    aspectRatio: "16:9",
    icon: Twitter,
  },
] as const;

export function SocialImageResizerClient({ dict }: { dict?: any }) {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [resizedImages, setResizedImages] = useState<ResizedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    setOriginalFile(file);
    const objectUrl = URL.createObjectURL(file);
    setOriginalPreview(objectUrl);
    setResizedImages([]);
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = objectUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const promises = TARGET_SIZES.map(async (size) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        canvas.width = size.width;
        canvas.height = size.height;

        // Calculate crop (cover)
        const scale = Math.max(
          canvas.width / img.width,
          canvas.height / img.height,
        );
        const x = (canvas.width / scale - img.width) / 2;
        const y = (canvas.height / scale - img.height) / 2;

        ctx.drawImage(
          img,
          x,
          y,
          img.width,
          img.height,
          0,
          0,
          canvas.width,
          canvas.height,
        );

        return new Promise<ResizedImage | null>((resolve) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({
                  id: size.id,
                  name: size.name,
                  width: size.width,
                  height: size.height,
                  blob,
                  url: URL.createObjectURL(blob),
                  platform: size.platform,
                  aspectRatio: size.aspectRatio,
                });
              } else {
                resolve(null);
              }
            },
            "image/jpeg",
            0.9,
          );
        });
      });

      const results = await Promise.all(promises);
      setResizedImages(results.filter((r): r is ResizedImage => r !== null));
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    resizedImages.forEach((img) => URL.revokeObjectURL(img.url));
    setOriginalFile(null);
    setOriginalPreview(null);
    setResizedImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadImage = (img: ResizedImage) => {
    const link = document.createElement("a");
    link.href = img.url;
    link.download = `${img.id}_resized.jpg`;
    link.click();
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    resizedImages.forEach((img) => {
      zip.file(`${img.id}_resized.jpg`, img.blob);
    });
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = "social_resized_images.zip";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Drag & Drop
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
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFile(droppedFile);
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-6xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-orange-100 dark:from-pink-900/30 dark:to-orange-900/30 mb-6">
          <Crop className="w-10 h-10 text-pink-600 dark:text-pink-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.social_image_resizer?.title || "Social Image Resizer"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.social_image_resizer?.subtitle ||
            "Resize and crop images for Instagram, YouTube, and TikTok. Perfect dimensions, instantly."}
        </p>

        {!originalFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                : "border-muted-foreground/30 hover:border-pink-500/50 hover:bg-pink-50/50 dark:hover:bg-pink-900/10"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="hidden"
            />
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {dict?.social_image_resizer?.drop_zone ||
                "Drag & drop your image here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {dict?.social_image_resizer?.supported ||
                "Supported: PNG, JPG, JPEG, WEBP"}
            </p>
          </div>
        ) : (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 space-y-8">
            {/* Header / Actions */}
            <div className="flex justify-between items-center mb-6">
              <Button variant="outline" onClick={reset}>
                <X className="w-4 h-4 mr-2" />
                Start Over
              </Button>
              {resizedImages.length > 0 && (
                <Button
                  onClick={downloadAll}
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All (ZIP)
                </Button>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Original Preview */}
              <Card className="col-span-full md:col-span-2 lg:col-span-1 border-pink-100 dark:border-pink-900/50 bg-pink-50/30">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Original
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-6">
                  {originalPreview && (
                    <img
                      src={originalPreview}
                      alt="Original"
                      className="max-h-[300px] max-w-full object-contain rounded shadow-sm"
                    />
                  )}
                </CardContent>
              </Card>

              {/* Resized Previews */}
              {resizedImages.map((img) => {
                const targetSize = TARGET_SIZES.find((s) => s.id === img.id);
                const Icon = targetSize?.icon || ImageIcon;

                return (
                  <Card
                    key={img.id}
                    className="group hover:shadow-lg transition-shadow duration-300"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm line-clamp-1">
                              {img.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {img.width} x {img.height}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {img.aspectRatio}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="aspect-[4/5] w-full bg-muted/20 rounded-md overflow-hidden relative flex items-center justify-center">
                        <img
                          src={img.url}
                          alt={img.name}
                          className="max-w-full max-h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                      </div>
                      <Button
                        onClick={() => downloadImage(img)}
                        variant="secondary"
                        className="w-full group-hover:bg-pink-600 group-hover:text-white transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {dict?.social_image_resizer?.download_btn || "Download"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Guide & Tips & FAQ */}
      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        {/* Guide */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.social_image_resizer?.guide_title ||
                "How to Resize Images"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.social_image_resizer?.guide_desc ||
                "Get your images social-ready in 3 steps."}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title:
                  dict?.social_image_resizer?.step1_title || "Upload Image",
                desc:
                  dict?.social_image_resizer?.step1_desc ||
                  "Upload the photo you want to resize.",
                icon: Upload,
              },
              {
                step: 2,
                title: dict?.social_image_resizer?.step2_title || "Auto-Resize",
                desc:
                  dict?.social_image_resizer?.step2_desc ||
                  "We automatically generate previews for Instagram, YouTube, and more.",
                icon: Layout,
              },
              {
                step: 3,
                title: dict?.social_image_resizer?.step3_title || "Download",
                desc:
                  dict?.social_image_resizer?.step3_desc ||
                  "Choose the size you need and download it instantly.",
                icon: Download,
              },
            ].map((step) => (
              <Card
                key={step.step}
                className="border-pink-100 dark:border-pink-900/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-500 text-white font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.desc}</p>
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
              {dict?.social_image_resizer?.tips_title || "Resizing Tips"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.social_image_resizer?.tips_desc ||
                "Best practices for social media images."}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title:
                  dict?.social_image_resizer?.tip1_title || "Center Subject",
                desc:
                  dict?.social_image_resizer?.tip1_desc ||
                  "Keep your main subject in the center to ensure it looks good cropped.",
                icon: Crop,
              },
              {
                title:
                  dict?.social_image_resizer?.tip2_title || "High Resolution",
                desc:
                  dict?.social_image_resizer?.tip2_desc ||
                  "Start with a high-quality image to prevent pixelation on larger screens.",
                icon: Monitor,
              },
              {
                title:
                  dict?.social_image_resizer?.tip3_title || "Aspect Ratios",
                desc:
                  dict?.social_image_resizer?.tip3_desc ||
                  "9:16 for Stories/TikTok, 1:1 for Feed, 16:9 for YouTube.",
                icon: Layout,
              },
              {
                title:
                  dict?.social_image_resizer?.tip4_title || "No Watermarks",
                desc:
                  dict?.social_image_resizer?.tip4_desc ||
                  "Clean images perform better. Use our Watermark Remover if needed.",
                icon: CheckCircle2,
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.qna_social_image_resizer?.title || "Social Resizer FAQ"}
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              {dict?.qna_social_image_resizer?.desc ||
                "Common questions about resizing images."}
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[1, 2, 3].map((num) => (
                <AccordionItem key={num} value={`item-${num}`}>
                  <AccordionTrigger>
                    {dict?.qna_social_image_resizer?.[`faq_${num}_q`] ||
                      `Question ${num}`}
                  </AccordionTrigger>
                  <AccordionContent>
                    {dict?.qna_social_image_resizer?.[`faq_${num}_a`] ||
                      `Answer ${num}`}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
