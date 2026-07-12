"use client";

import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileText,
  RotateCcw,
  Lightbulb,
  Loader2,
  Shield,
  Gauge,
  Zap,
  FileDown,
  Minimize2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

interface QualityPreset {
  id: "high" | "medium" | "low";
  label: string;
  dpi: number;
  jpegQuality: number;
  hint: string;
}

const QUALITY_PRESETS: QualityPreset[] = [
  {
    id: "high",
    label: "High",
    dpi: 150,
    jpegQuality: 0.8,
    hint: "Sharpest output, moderate size reduction",
  },
  {
    id: "medium",
    label: "Medium",
    dpi: 110,
    jpegQuality: 0.65,
    hint: "Balanced quality and size — best for most files",
  },
  {
    id: "low",
    label: "Low",
    dpi: 72,
    jpegQuality: 0.5,
    hint: "Smallest file, softer pages — great for web sharing",
  },
];

const PDF_POINTS_PER_INCH = 72;
const MAX_FILE_BYTES = 50 * 1024 * 1024;

async function loadPdfJs() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.mjs";
  return pdfjsLib;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

interface CompressResult {
  url: string;
  size: number;
  fileName: string;
}

export function CompressPdfClient({ dict }: { dict?: any }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);
  const [quality, setQuality] = useState<QualityPreset["id"]>("medium");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetOutput = () => {
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
  };

  const loadPdf = async (file: File) => {
    setError(null);
    resetOutput();

    if (file.type !== "application/pdf") {
      setError(`"${file.name}" is not a PDF file. Only PDF files are accepted.`);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(`"${file.name}" exceeds the 50MB file size limit.`);
      return;
    }

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;
      setPdfFile(file);
      setPdfName(file.name);
      setPageCount(pdf.numPages);
      setOriginalSize(file.size);
    } catch {
      setError(
        `"${file.name}" could not be read. It may be corrupted or password-protected.`,
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) loadPdf(e.target.files[0]);
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
    if (e.dataTransfer.files.length > 0) loadPdf(e.dataTransfer.files[0]);
  };

  const compressPdf = async () => {
    if (!pdfFile) return;

    const preset =
      QUALITY_PRESETS.find((p) => p.id === quality) ?? QUALITY_PRESETS[1];
    const renderScale = preset.dpi / PDF_POINTS_PER_INCH;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    resetOutput();

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;

      let doc: jsPDF | null = null;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        // Base viewport (scale 1) is expressed in PDF points (72 DPI),
        // which we reuse as the output page size to preserve dimensions.
        const baseViewport = page.getViewport({ scale: 1 });
        const pageWidthPt = baseViewport.width;
        const pageHeightPt = baseViewport.height;
        const orientation = pageWidthPt > pageHeightPt ? "landscape" : "portrait";

        const renderViewport = page.getViewport({ scale: renderScale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(renderViewport.width));
        canvas.height = Math.max(1, Math.floor(renderViewport.height));
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context unavailable");

        // JPEG has no alpha channel — paint a white background first.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvas,
          canvasContext: ctx,
          viewport: renderViewport,
        }).promise;

        const jpegDataUrl = canvas.toDataURL("image/jpeg", preset.jpegQuality);

        if (!doc) {
          doc = new jsPDF({
            unit: "pt",
            format: [pageWidthPt, pageHeightPt],
            orientation,
          });
        } else {
          doc.addPage([pageWidthPt, pageHeightPt], orientation);
        }

        doc.addImage(
          jpegDataUrl,
          "JPEG",
          0,
          0,
          pageWidthPt,
          pageHeightPt,
          undefined,
          "FAST",
        );

        // Free per-page canvas memory before the next iteration.
        canvas.width = 0;
        canvas.height = 0;

        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      if (!doc) throw new Error("No pages rendered");

      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const baseName = pdfName.replace(/\.pdf$/i, "") || "document";

      setResult({
        url,
        size: blob.size,
        fileName: `${baseName}_compressed.pdf`,
      });
    } catch {
      setError(
        "Failed to compress this PDF. It may be corrupted, encrypted, or password-protected.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.url;
    link.download = result.fileName;
    link.click();
  };

  const handleReset = () => {
    resetOutput();
    setPdfFile(null);
    setPdfName("");
    setPageCount(0);
    setOriginalSize(0);
    setQuality("medium");
    setIsDragging(false);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const savedBytes = result ? originalSize - result.size : 0;
  const savedPercent =
    result && originalSize > 0
      ? Math.round((savedBytes / originalSize) * 100)
      : 0;
  const isSmaller = savedBytes > 0;

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 mb-6">
              <Minimize2 className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {dict?.compress_pdf?.title || "Compress PDF"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {dict?.compress_pdf?.subtitle ||
                "Reduce your PDF file size with adjustable quality presets. See exactly how much you save before downloading. 100% private — processed in your browser."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Drop zone */}
            {!pdfFile && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300",
                  isDragging
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-muted-foreground/30 hover:border-red-500/50 hover:bg-red-50/50 dark:hover:bg-red-900/10",
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {dict?.compress_pdf?.drop_zone ||
                    "Drag & drop a PDF file here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Only PDF files accepted. Max 50MB per file.
                </p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="w-full max-w-2xl mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Options + action */}
            {pdfFile && !result && (
              <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground truncate">
                    <span title={pdfName}>{pdfName}</span> &middot; {pageCount}{" "}
                    page{pageCount !== 1 ? "s" : ""} &middot;{" "}
                    {formatBytes(originalSize)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={isProcessing}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border border-muted space-y-3">
                  <span className="text-sm font-medium">Compression quality</span>
                  <div className="grid grid-cols-3 gap-2">
                    {QUALITY_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setQuality(preset.id)}
                        disabled={isProcessing}
                        className={cn(
                          "rounded-lg border p-3 text-center transition-all disabled:opacity-50",
                          quality === preset.id
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500"
                            : "border-muted hover:border-red-500/50",
                        )}
                      >
                        <div className="font-semibold text-sm">
                          {preset.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          ~{preset.dpi} DPI
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {QUALITY_PRESETS.find((p) => p.id === quality)?.hint}
                  </p>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Compressed pages become images, so text will no longer be
                    selectable or searchable.
                  </span>
                </div>

                <div className="flex justify-center pt-2">
                  <Button
                    size="lg"
                    onClick={compressPdf}
                    disabled={isProcessing}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Compressing... {progress}%
                      </>
                    ) : (
                      <>
                        <Minimize2 className="w-5 h-5 mr-2" />
                        {dict?.compress_pdf?.action_btn || "Compress PDF"}
                      </>
                    )}
                  </Button>
                </div>

                {isProcessing && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-muted bg-muted/30 p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      Original
                    </div>
                    <div className="font-semibold">
                      {formatBytes(originalSize)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-muted bg-muted/30 p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      Compressed
                    </div>
                    <div className="font-semibold">
                      {formatBytes(result.size)}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg border p-4 text-center",
                      isSmaller
                        ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                        : "border-muted bg-muted/30",
                    )}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      Saved
                    </div>
                    <div
                      className={cn(
                        "font-semibold",
                        isSmaller && "text-green-600 dark:text-green-400",
                      )}
                    >
                      {isSmaller ? `${savedPercent}%` : "0%"}
                    </div>
                  </div>
                </div>

                {!isSmaller && (
                  <p className="text-center text-sm text-muted-foreground">
                    This PDF is already well optimized. Try the Low preset for a
                    smaller file, or keep your original.
                  </p>
                )}

                <div className="flex flex-col items-center gap-3 pt-2">
                  <Button
                    size="lg"
                    onClick={handleDownload}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[220px]"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {dict?.compress_pdf?.download_btn ||
                      "Download Compressed PDF"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {dict?.compress_pdf?.another_btn || "Compress Another"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* How-to & Tips & FAQ */}
          <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {dict?.compress_pdf?.guide_title || "How to Compress a PDF"}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {dict?.compress_pdf?.guide_desc ||
                    "Reduce your PDF file size in 3 simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: dict?.compress_pdf?.step1_title || "Upload PDF",
                    desc:
                      dict?.compress_pdf?.step1_desc ||
                      "Drag and drop or click to select a PDF file from your device.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title:
                      dict?.compress_pdf?.step2_title || "Choose Quality",
                    desc:
                      dict?.compress_pdf?.step2_desc ||
                      "Pick High, Medium, or Low. Lower quality means a smaller file size.",
                    icon: Gauge,
                  },
                  {
                    step: 3,
                    title:
                      dict?.compress_pdf?.step3_title || "Compress & Download",
                    desc:
                      dict?.compress_pdf?.step3_desc ||
                      "Run the compression, review your savings, and download the smaller PDF.",
                    icon: FileDown,
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
                  {dict?.compress_pdf?.tips_title || "PDF Compression Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {dict?.compress_pdf?.tips_desc ||
                    "Get the best balance of quality and file size."}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: dict?.compress_pdf?.tip1_title || "100% Private",
                    desc:
                      dict?.compress_pdf?.tip1_desc ||
                      "All compression happens in your browser using pdf.js and jsPDF. Your files never leave your device.",
                    icon: Shield,
                  },
                  {
                    title:
                      dict?.compress_pdf?.tip2_title || "Text Becomes Images",
                    desc:
                      dict?.compress_pdf?.tip2_desc ||
                      "Every page is rebuilt as an image, so text can no longer be selected, searched, or copied. Keep the original if you need selectable text.",
                    icon: AlertTriangle,
                  },
                  {
                    title:
                      dict?.compress_pdf?.tip3_title || "Pick the Right Preset",
                    desc:
                      dict?.compress_pdf?.tip3_desc ||
                      "Medium suits most documents. Use High for print clarity and Low for the smallest web-friendly files.",
                    icon: Gauge,
                  },
                  {
                    title:
                      dict?.compress_pdf?.tip4_title || "Best on Scanned PDFs",
                    desc:
                      dict?.compress_pdf?.tip4_desc ||
                      "Image-heavy or scanned PDFs shrink the most. Files that are already optimized may not get much smaller.",
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
                  {dict?.compress_pdf?.faq_title || "Compress PDF FAQ"}
                </h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                  {dict?.compress_pdf?.faq_desc ||
                    "Common questions about compressing PDF files."}
                </p>
              </div>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>
                      {dict?.compress_pdf?.faq_1_q ||
                        "How does the PDF compression work?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.compress_pdf?.faq_1_a ||
                        "Each page is rendered to an image in your browser, re-encoded as a JPEG at the quality you choose, and rebuilt into a new PDF that keeps the original page dimensions. Lower presets use a lower resolution and stronger compression, so the file gets smaller."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>
                      {dict?.compress_pdf?.faq_2_q ||
                        "Will the text still be selectable?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.compress_pdf?.faq_2_a ||
                        "No. Because every page is converted to an image, the pages become pictures — text can no longer be selected, searched, or copied. If you need selectable text, keep the original or use the High preset for the best visual fidelity."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>
                      {dict?.compress_pdf?.faq_3_q ||
                        "Which quality preset should I choose?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.compress_pdf?.faq_3_a ||
                        "Use High (~150 DPI) for the smallest size while keeping print-friendly clarity, Medium (~110 DPI) for a good on-screen balance, and Low (~72 DPI) for the smallest files for quick web sharing."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-4">
                    <AccordionTrigger>
                      {dict?.compress_pdf?.faq_4_q ||
                        "Are my files uploaded to a server?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.compress_pdf?.faq_4_a ||
                        "No. All compression happens entirely in your browser using pdf.js and jsPDF. Your PDF never leaves your device and is never uploaded anywhere."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-5">
                    <AccordionTrigger>
                      {dict?.compress_pdf?.faq_5_q ||
                        "Can I compress password-protected PDFs?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.compress_pdf?.faq_5_a ||
                        "Encrypted or password-protected PDFs usually cannot be read in the browser and will show an error. Remove the password with your PDF reader first, then compress the unlocked file."}
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
