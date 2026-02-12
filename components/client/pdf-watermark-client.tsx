"use client";

import { useState, useRef } from "react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Upload,
  Download,
  FileText,
  RotateCcw,
  Lightbulb,
  Loader2,
  Shield,
  Zap,
  Eye,
  Type,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function PdfWatermarkClient() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);

  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(-45);

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

      setPdfFile(file);
      setPdfName(file.name);
      setPageCount(count);
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

  const applyWatermark = async () => {
    if (!pdfFile || !watermarkText.trim()) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    setResultSize(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const totalPages = pdf.getPageCount();

      for (let i = 0; i < totalPages; i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const centerX = (width - textWidth) / 2;
        const centerY = height / 2;

        page.drawText(watermarkText, {
          x: centerX,
          y: centerY,
          size: fontSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity,
          rotate: degrees(rotation),
        });

        setProgress(Math.round(((i + 1) / totalPages) * 100));
      }

      const savedBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(savedBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setResultSize((blob.size / (1024 * 1024)).toFixed(2));
    } catch {
      setError("Failed to add watermark. The file may be corrupted or unsupported.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const baseName = pdfName.replace(/\.pdf$/i, "") || "document";
    link.download = `${baseName}_watermarked.pdf`;
    link.click();
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setPdfFile(null);
    setPdfName("");
    setPageCount(0);
    setIsDragging(false);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    setResultSize(null);
    setWatermarkText("CONFIDENTIAL");
    setFontSize(48);
    setOpacity(0.3);
    setRotation(-45);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 mb-6">
          <Type className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Add Watermark to PDF</h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          Add a text watermark to every page of your PDF. Customize text, size, opacity, and rotation angle. 100% private — processed in your browser.
        </p>

        {!pdfFile && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragging ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-muted-foreground/30 hover:border-red-500/50 hover:bg-red-50/50 dark:hover:bg-red-900/10"}`}
          >
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drag & drop a PDF file here</p>
            <p className="text-sm text-muted-foreground">Only PDF files accepted. Max 50MB per file.</p>
          </div>
        )}

        {error && (
          <div className="w-full max-w-2xl mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">{error}</div>
        )}

        {pdfFile && (
          <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{pdfName} &middot; {pageCount} page{pageCount !== 1 ? "s" : ""}</div>
              <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2" />Clear</Button>
            </div>

            {/* Watermark settings */}
            <div className="p-6 bg-muted/30 rounded-lg border border-muted space-y-5">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Watermark Text</label>
                <Input value={watermarkText} onChange={(e) => { setWatermarkText(e.target.value); setResultUrl(null); setResultSize(null); }} placeholder="Enter watermark text" maxLength={100} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Font Size (12-120)</label>
                  <Input type="number" min={12} max={120} value={fontSize} onChange={(e) => { setFontSize(Math.min(120, Math.max(12, Number(e.target.value)))); setResultUrl(null); setResultSize(null); }} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Rotation ({rotation}&deg;)</label>
                  <Input type="number" min={-180} max={180} value={rotation} onChange={(e) => { setRotation(Math.min(180, Math.max(-180, Number(e.target.value)))); setResultUrl(null); setResultSize(null); }} />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Opacity: {opacity.toFixed(2)}</label>
                <Slider min={0.05} max={1} step={0.05} value={[opacity]} onValueChange={(val) => { setOpacity(val[0]); setResultUrl(null); setResultSize(null); }} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Light (0.05)</span>
                  <span>Opaque (1.0)</span>
                </div>
              </div>
            </div>

            {/* Apply button */}
            {!resultUrl && (
              <div className="flex justify-center pt-4">
                <Button size="lg" onClick={applyWatermark} disabled={isProcessing || !watermarkText.trim()} className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]">
                  {isProcessing ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Adding... {progress}%</>) : (<><Type className="w-5 h-5 mr-2" />Add Watermark</>)}
                </Button>
              </div>
            )}

            {isProcessing && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}

            {resultUrl && (
              <div className="flex flex-col items-center gap-3 pt-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="text-sm text-muted-foreground">Watermark added successfully! {pageCount} pages &middot; {resultSize} MB</div>
                <Button size="lg" onClick={handleDownload} className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]">
                  <Download className="w-5 h-5 mr-2" />Download Watermarked PDF
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">How to Add a Watermark</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Watermark your PDF in 3 simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Upload PDF", desc: "Drag and drop or click to select a PDF file from your device.", icon: Upload },
              { step: 2, title: "Customize", desc: "Enter your watermark text and adjust font size, opacity, and rotation angle.", icon: Type },
              { step: 3, title: "Download", desc: "Click 'Add Watermark' and download your watermarked PDF file.", icon: Download },
            ].map((step) => (
              <Card key={step.step} className="border-red-200 dark:border-red-900/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white font-bold">{step.step}</div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent><p className="text-muted-foreground leading-relaxed">{step.desc}</p></CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Watermark Tips</h2>
            <p className="text-muted-foreground">Get the best results when watermarking PDFs.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "100% Private", desc: "All processing happens in your browser using pdf-lib. Your files never leave your device.", icon: Shield },
              { title: "Adjustable Opacity", desc: "Use the slider to set watermark transparency. Low opacity keeps content readable while showing the watermark.", icon: Eye },
              { title: "Custom Rotation", desc: "Rotate the watermark to any angle. The default -45 degrees creates a classic diagonal watermark.", icon: Zap },
              { title: "Original Preserved", desc: "Your original PDF file remains untouched. Only a new watermarked file is created for download.", icon: FileText },
            ].map((tip, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-red-800/30">
                <div className="flex-shrink-0"><tip.icon className="w-6 h-6 text-red-600 dark:text-red-400" /></div>
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
            <h2 className="text-3xl font-bold tracking-tight mb-4">Watermark PDF FAQ</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">Common questions about adding watermarks to PDFs.</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>Is it free to add watermarks?</AccordionTrigger>
                <AccordionContent>Yes, this watermark tool is 100% free. There are no hidden fees, usage limits, or watermarks added by the tool itself.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>Can I add an image watermark?</AccordionTrigger>
                <AccordionContent>Currently, only text watermarks are supported. Image watermark support may be added in the future.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>Is the watermark applied to all pages?</AccordionTrigger>
                <AccordionContent>Yes, the watermark is applied to every page in the PDF with the same settings (text, size, opacity, and rotation).</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>Can the watermark be removed after adding?</AccordionTrigger>
                <AccordionContent>The watermark is permanently embedded in the new PDF file. However, your original file remains unchanged, so you always have the unwatermarked version.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>What is the file size limit?</AccordionTrigger>
                <AccordionContent>The maximum file size is 50MB. Since all processing happens in your browser, very large files may take longer depending on your device&apos;s capabilities.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
