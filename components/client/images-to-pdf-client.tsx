"use client";

import { useState, useRef } from "react";
import { PDFDocument, PageSizes } from "pdf-lib";
import { Button } from "@/components/ui/button";
import {
  ImagePlus,
  Upload,
  Download,
  ChevronUp,
  ChevronDown,
  Trash2,
  Loader2,
  RotateCcw,
  Lightbulb,
  Shield,
  Zap,
  FileText,
  Layers,
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

type PageSizeOption = "fit" | "A4";

interface ImageItem {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
}

export function ImagesToPdfClient({ dict }: { dict?: any }) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSizeOption, setPageSizeOption] = useState<PageSizeOption>("fit");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImageDimensions = (
    file: File,
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Failed to load image"));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const addImages = async (files: FileList | File[]) => {
    setError(null);
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const newItems: ImageItem[] = [];

    for (const file of Array.from(files)) {
      if (!validTypes.includes(file.type)) {
        setError(
          `"${file.name}" is not a supported image. Use JPG, PNG, or WebP.`,
        );
        continue;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 20MB file size limit.`);
        continue;
      }
      try {
        const dims = await loadImageDimensions(file);
        newItems.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          file,
          preview: URL.createObjectURL(file),
          width: dims.width,
          height: dims.height,
        });
      } catch {
        setError(`"${file.name}" could not be loaded.`);
      }
    }

    if (newItems.length > 0) {
      setImages((prev) => [...prev, ...newItems]);
      setResultUrl(null);
      setResultSize(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) addImages(e.target.files);
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
    if (e.dataTransfer.files.length > 0) addImages(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
    setResultUrl(null);
    setResultSize(null);
  };

  const moveImage = (idx: number, direction: -1 | 1) => {
    setImages((prev) => {
      const target = idx + direction;
      if (target < 0 || target >= prev.length) return prev;
      const newArr = [...prev];
      [newArr[idx], newArr[target]] = [newArr[target], newArr[idx]];
      return newArr;
    });
    setResultUrl(null);
    setResultSize(null);
  };

  const convertToPdf = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    setResultSize(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const arrayBuffer = await img.file.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);

        let embeddedImage;
        if (img.file.type === "image/png") {
          embeddedImage = await pdfDoc.embedPng(uint8);
        } else if (img.file.type === "image/jpeg") {
          embeddedImage = await pdfDoc.embedJpg(uint8);
        } else {
          // WebP: convert to PNG via canvas
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const htmlImg = new Image();
          const pngBlob = await new Promise<Blob>((resolve, reject) => {
            htmlImg.onload = () => {
              canvas.width = htmlImg.width;
              canvas.height = htmlImg.height;
              ctx?.drawImage(htmlImg, 0, 0);
              canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Canvas conversion failed"));
              }, "image/png");
            };
            htmlImg.onerror = () => reject(new Error("Image load failed"));
            htmlImg.src = img.preview;
          });
          const pngBuffer = await pngBlob.arrayBuffer();
          embeddedImage = await pdfDoc.embedPng(new Uint8Array(pngBuffer));
        }

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        let pageWidth: number;
        let pageHeight: number;
        let drawWidth: number;
        let drawHeight: number;
        let drawX: number;
        let drawY: number;

        if (pageSizeOption === "fit") {
          pageWidth = imgWidth;
          pageHeight = imgHeight;
          drawWidth = imgWidth;
          drawHeight = imgHeight;
          drawX = 0;
          drawY = 0;
        } else {
          const [a4W, a4H] = PageSizes.A4;
          pageWidth = a4W;
          pageHeight = a4H;
          const margin = 40;
          const availW = a4W - margin * 2;
          const availH = a4H - margin * 2;
          const scale = Math.min(availW / imgWidth, availH / imgHeight, 1);
          drawWidth = imgWidth * scale;
          drawHeight = imgHeight * scale;
          drawX = (a4W - drawWidth) / 2;
          drawY = (a4H - drawHeight) / 2;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        page.drawImage(embeddedImage, {
          x: drawX,
          y: drawY,
          width: drawWidth,
          height: drawHeight,
        });

        setProgress(Math.round(((i + 1) / images.length) * 100));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize((blob.size / (1024 * 1024)).toFixed(2));
    } catch {
      setError(
        "Failed to create PDF from images. Some images may be corrupted or unsupported.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `images_${images.length}pages.pdf`;
    link.click();
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setIsDragging(false);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    setResultSize(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 mb-6">
              <ImagePlus className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {dict?.images_to_pdf?.title || "Images to PDF"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {dict?.images_to_pdf?.subtitle ||
                "Convert multiple images (JPG, PNG, WebP) into a single PDF document. Reorder pages and choose page size. 100% private — processed in your browser."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragging ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-muted-foreground/30 hover:border-red-500/50 hover:bg-red-50/50 dark:hover:bg-red-900/10"}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <ImagePlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {images.length === 0
                  ? "Drag & drop images here"
                  : "Add more images"}
              </p>
              <p className="text-sm text-muted-foreground">
                {dict?.images_to_pdf?.supported ||
                  "Supported: JPG, PNG, WebP. Max 20MB per file."}
              </p>
            </div>

            {error && (
              <div className="w-full max-w-2xl mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {images.length > 0 && (
              <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {images.length} image{images.length !== 1 ? "s" : ""}{" "}
                    selected
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={pageSizeOption}
                      onChange={(e) => {
                        setPageSizeOption(e.target.value as PageSizeOption);
                        setResultUrl(null);
                      }}
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    >
                      <option value="fit">Fit to image</option>
                      <option value="A4">A4 page</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {images.map((img, idx) => (
                    <div
                      key={img.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-muted"
                    >
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted">
                        <img
                          src={img.preview}
                          alt={img.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          title={img.file.name}
                        >
                          {img.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {img.width} x {img.height} &middot;{" "}
                          {(img.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveImage(idx, -1)}
                          disabled={idx === 0}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveImage(idx, 1)}
                          disabled={idx === images.length - 1}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                          onClick={() => removeImage(img.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {!resultUrl && (
                  <div className="flex justify-center pt-4">
                    <Button
                      size="lg"
                      onClick={convertToPdf}
                      disabled={isProcessing}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Converting... {progress}%
                        </>
                      ) : (
                        <>
                          <ImagePlus className="w-5 h-5 mr-2" />
                          {dict?.images_to_pdf?.action_btn || "Convert to PDF"}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {isProcessing && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {resultUrl && (
                  <div className="flex flex-col items-center gap-3 pt-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="text-sm text-muted-foreground">
                      PDF created successfully! {images.length} page
                      {images.length !== 1 ? "s" : ""} &middot; {resultSize} MB
                    </div>
                    <Button
                      size="lg"
                      onClick={handleDownload}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {dict?.images_to_pdf?.download_btn || "Download PDF"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {dict?.images_to_pdf?.guide_title ||
                    "How to Convert Images to PDF"}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {dict?.images_to_pdf?.guide_desc ||
                    "Turn your images into a PDF in 3 simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: dict?.images_to_pdf?.step1_title || "Upload Images",
                    desc:
                      dict?.images_to_pdf?.step1_desc ||
                      "Drag and drop or click to select JPG, PNG, or WebP images from your device.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title:
                      dict?.images_to_pdf?.step2_title || "Arrange & Configure",
                    desc:
                      dict?.images_to_pdf?.step2_desc ||
                      "Reorder images using up/down buttons. Choose 'Fit to image' or 'A4' page size.",
                    icon: Layers,
                  },
                  {
                    step: 3,
                    title:
                      dict?.images_to_pdf?.step3_title || "Convert & Download",
                    desc:
                      dict?.images_to_pdf?.step3_desc ||
                      "Click 'Convert to PDF' and download your image-based PDF document.",
                    icon: Download,
                  },
                ].map((s) => (
                  <Card
                    key={s.step}
                    className="border-red-200 dark:border-red-900/50"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white font-bold">
                          {s.step}
                        </div>
                        <CardTitle className="text-xl">{s.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {s.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
                  <Lightbulb className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {dict?.images_to_pdf?.tips_title || "Images to PDF Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {dict?.images_to_pdf?.tips_desc ||
                    "Get the best results when converting images to PDF."}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: dict?.images_to_pdf?.tip1_title || "100% Private",
                    desc:
                      dict?.images_to_pdf?.tip1_desc ||
                      "All processing happens in your browser using pdf-lib. Your images never leave your device.",
                    icon: Shield,
                  },
                  {
                    title:
                      dict?.images_to_pdf?.tip2_title || "Flexible Page Sizing",
                    desc:
                      dict?.images_to_pdf?.tip2_desc ||
                      "Choose 'Fit to image' to match each page to the image size, or 'A4' for standard document format.",
                    icon: Layers,
                  },
                  {
                    title: dict?.images_to_pdf?.tip3_title || "Easy Reordering",
                    desc:
                      dict?.images_to_pdf?.tip3_desc ||
                      "Arrange your images in any order before converting. The order in the list becomes the page order.",
                    icon: FileText,
                  },
                  {
                    title:
                      dict?.images_to_pdf?.tip4_title || "Multiple Formats",
                    desc:
                      dict?.images_to_pdf?.tip4_desc ||
                      "Supports JPG, PNG, and WebP images. WebP files are automatically converted for PDF compatibility.",
                    icon: Zap,
                  },
                ].map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-lg bg-white dark:bg-red-800/30"
                  >
                    <div className="flex-shrink-0">
                      <tip.icon className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tip.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {dict?.images_to_pdf?.faq_title || "Images to PDF FAQ"}
                </h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                  {dict?.images_to_pdf?.faq_desc ||
                    "Common questions about converting images to PDF."}
                </p>
              </div>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>
                      {dict?.images_to_pdf?.faq_1_q ||
                        "Is it free to convert images to PDF?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.images_to_pdf?.faq_1_a ||
                        "Yes, this tool is 100% free. There are no hidden fees, watermarks, or limitations on the number of images you can convert."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>
                      {dict?.images_to_pdf?.faq_2_q ||
                        "Are my images uploaded to a server?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.images_to_pdf?.faq_2_a ||
                        "No. All processing happens entirely in your browser. Your images never leave your device and are never uploaded to any server."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>
                      {dict?.images_to_pdf?.faq_3_q ||
                        "What image formats are supported?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.images_to_pdf?.faq_3_a ||
                        "JPG/JPEG, PNG, and WebP images are supported. WebP images are automatically converted to PNG format internally for PDF compatibility."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-4">
                    <AccordionTrigger>
                      {dict?.images_to_pdf?.faq_4_q ||
                        "Can I change the order of images?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.images_to_pdf?.faq_4_a ||
                        "Yes, use the up/down arrow buttons next to each image to rearrange them. The order in the list determines the page order in the PDF."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-5">
                    <AccordionTrigger>
                      {dict?.images_to_pdf?.faq_5_q ||
                        "What is the maximum file size?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.images_to_pdf?.faq_5_a ||
                        "Each image can be up to 20MB. There is no limit on the number of images. The total PDF size depends on your browser memory."}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>
          </div>
        </div>
        <aside className="hidden lg:block w-64 shrink-0">
          <ToolsSidebar category="pdf" dict={dict} />
        </aside>
      </div>
    </div>
  );
}
