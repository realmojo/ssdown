"use client";

import { useState, useRef } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { Button } from "@/components/ui/button";
import {
import Adsense from "@/components/Adsense";
  Upload,
  Download,
  FileText,
  RotateCcw,
  RotateCw,
  Lightbulb,
  Loader2,
  Shield,
  Zap,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PageRotation {
  pageIndex: number;
  rotation: number; // 0, 90, 180, 270
}

export function RotatePdfClient({ dict }: { dict?: any }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [pageRotations, setPageRotations] = useState<PageRotation[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPdf = async (file: File) => {
    setError(null);
    setResultUrl(null);
    setResultSize(null);

    if (file.type !== "application/pdf") {
      setError(`"${file.name}" is not a PDF file. Only PDF files are accepted.`);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError(`"${file.name}" exceeds the 50MB file size limit.`);
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();

      const rotations: PageRotation[] = [];
      for (let i = 0; i < count; i++) {
        const page = pdf.getPage(i);
        const currentRotation = page.getRotation().angle;
        rotations.push({ pageIndex: i, rotation: currentRotation });
      }

      setPdfFile(file);
      setPdfName(file.name);
      setPageCount(count);
      setPageRotations(rotations);
    } catch {
      setError(`"${file.name}" could not be read. It may be corrupted or password-protected.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      loadPdf(e.target.files[0]);
    }
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
      loadPdf(e.dataTransfer.files[0]);
    }
  };

  const rotatePage = (pageIndex: number, angleDelta: number) => {
    setPageRotations((prev) =>
      prev.map((p) =>
        p.pageIndex === pageIndex
          ? { ...p, rotation: (p.rotation + angleDelta + 360) % 360 }
          : p
      )
    );
    setResultUrl(null);
    setResultSize(null);
  };

  const rotateAllPages = (angleDelta: number) => {
    setPageRotations((prev) =>
      prev.map((p) => ({
        ...p,
        rotation: (p.rotation + angleDelta + 360) % 360,
      }))
    );
    setResultUrl(null);
    setResultSize(null);
  };

  const applyRotation = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    setResultSize(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      for (let i = 0; i < pageRotations.length; i++) {
        const page = pdf.getPage(i);
        page.setRotation(degrees(pageRotations[i].rotation));
        setProgress(Math.round(((i + 1) / pageRotations.length) * 100));
      }

      const rotatedBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(rotatedBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setResultSize((blob.size / (1024 * 1024)).toFixed(2));
    } catch {
      setError("Failed to rotate PDF. The file may be corrupted or unsupported.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const baseName = pdfName.replace(/\.pdf$/i, "") || "document";
    link.download = `${baseName}_rotated.pdf`;
    link.click();
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setPdfFile(null);
    setPdfName("");
    setPageCount(0);
    setPageRotations([]);
    setIsDragging(false);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    setResultSize(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getRotationLabel = (angle: number) => {
    switch (angle) {
      case 90: return "90°";
      case 180: return "180°";
      case 270: return "270°";
      default: return "0°";
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 mb-6">
          <RotateCw className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.rotate_pdf?.title || "Rotate PDF"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.rotate_pdf?.subtitle || "Rotate PDF pages by 90, 180, or 270 degrees. Rotate all pages at once or each page individually. 100% private — processed in your browser."}
        </p>

        {/* Drop zone */}
        {!pdfFile && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                : "border-muted-foreground/30 hover:border-red-500/50 hover:bg-red-50/50 dark:hover:bg-red-900/10"
            }`}
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
              {dict?.rotate_pdf?.drop_zone || "Drag & drop a PDF file here"}
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

        {/* Page list with rotation controls */}
        {pdfFile && pageRotations.length > 0 && (
          <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {pdfName} &middot; {pageCount} page{pageCount !== 1 ? "s" : ""}
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>

            {/* Global rotation controls */}
            <div className="flex items-center justify-center gap-3 p-4 bg-muted/30 rounded-lg border border-muted">
              <span className="text-sm font-medium mr-2">Rotate All Pages:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => rotateAllPages(90)}
              >
                <RotateCw className="w-4 h-4 mr-1" />
                90° CW
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => rotateAllPages(180)}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                180°
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => rotateAllPages(-90)}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                90° CCW
              </Button>
            </div>

            {/* Individual page rotation */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {pageRotations.map((pr) => (
                <div
                  key={pr.pageIndex}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-muted"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold">
                    {pr.pageIndex + 1}
                  </div>
                  <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      Page {pr.pageIndex + 1}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Rotation: {getRotationLabel(pr.rotation)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => rotatePage(pr.pageIndex, 90)}
                      title="Rotate 90° CW"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => rotatePage(pr.pageIndex, 180)}
                      title="Rotate 180°"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => rotatePage(pr.pageIndex, -90)}
                      title="Rotate 90° CCW"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Apply button */}
            {!resultUrl && (
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  onClick={applyRotation}
                  disabled={isProcessing}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Rotating... {progress}%
                    </>
                  ) : (
                    <>
                      <RotateCw className="w-5 h-5 mr-2" />
                      Apply Rotation
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Progress bar */}
            {isProcessing && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Download result */}
            {resultUrl && (
              <div className="flex flex-col items-center gap-3 pt-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="text-sm text-muted-foreground">
                  Rotated successfully! {pageCount} pages &middot; {resultSize} MB
                </div>
                <Button
                  size="lg"
                  onClick={handleDownload}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {dict?.rotate_pdf?.download_btn || "Download Rotated PDF"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* How-to & Tips & FAQ */}
      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.rotate_pdf?.guide_title || "How to Rotate PDF Pages"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.rotate_pdf?.guide_desc || "Rotate your PDF pages in 3 simple steps."}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: dict?.rotate_pdf?.step1_title || "Upload PDF",
                desc: dict?.rotate_pdf?.step1_desc || "Drag and drop or click to select a PDF file from your device.",
                icon: Upload,
              },
              {
                step: 2,
                title: dict?.rotate_pdf?.step2_title || "Choose Rotation",
                desc: dict?.rotate_pdf?.step2_desc || "Rotate all pages at once or each page individually by 90°, 180°, or 270°.",
                icon: RotateCw,
              },
              {
                step: 3,
                title: dict?.rotate_pdf?.step3_title || "Download",
                desc: dict?.rotate_pdf?.step3_desc || "Click 'Apply Rotation' and download your rotated PDF file.",
                icon: Download,
              },
            ].map((step) => (
              <Card key={step.step} className="border-red-200 dark:border-red-900/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white font-bold">
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

        <section className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.rotate_pdf?.tips_title || "PDF Rotation Tips"}
            </h2>
            <p className="text-muted-foreground">
              Get the best results when rotating PDF pages.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "100% Private",
                desc: "All processing happens in your browser using pdf-lib. Your files never leave your device.",
                icon: Shield,
              },
              {
                title: "Per-Page Control",
                desc: "Rotate individual pages or all pages at once. Perfect for scanned documents with mixed orientations.",
                icon: Eye,
              },
              {
                title: "Instant Processing",
                desc: "Rotation is applied instantly without re-encoding. Your PDF quality remains unchanged.",
                icon: Zap,
              },
              {
                title: "Original Preserved",
                desc: "Your original PDF file remains untouched. Only a new rotated file is created for download.",
                icon: FileText,
              },
            ].map((tip, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-red-800/30">
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-red-600 dark:text-red-400" />
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
              {dict?.rotate_pdf?.faq_title || "Rotate PDF FAQ"}
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Common questions about rotating PDF pages.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>{dict?.rotate_pdf?.faq_1_q || "Is it free to rotate PDF pages?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.rotate_pdf?.faq_1_a || "Yes, this PDF rotation tool is 100% free. There are no hidden fees, watermarks, or usage limits."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>{dict?.rotate_pdf?.faq_2_q || "Is my PDF secure when rotating pages?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.rotate_pdf?.faq_2_a || "Absolutely. All processing happens entirely in your browser using pdf-lib. Your PDF files never leave your device and are never uploaded to any server."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>{dict?.rotate_pdf?.faq_3_q || "Can I rotate individual pages instead of all pages?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.rotate_pdf?.faq_3_a || "Yes, you can choose to rotate all pages at once or rotate each page individually. Each page has its own rotation controls for full flexibility."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>{dict?.rotate_pdf?.faq_4_q || "What rotation angles are supported?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.rotate_pdf?.faq_4_a || "You can rotate pages by 90° clockwise, 180°, or 90° counter-clockwise (270°). These options cover all common rotation needs."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>{dict?.rotate_pdf?.faq_5_q || "What is the file size limit?"}</AccordionTrigger>
                <AccordionContent>
                  {dict?.rotate_pdf?.faq_5_a || "The maximum file size is 50MB. Larger files may cause performance issues depending on your browser and device capabilities."}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
