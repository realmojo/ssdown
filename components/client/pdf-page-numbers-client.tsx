"use client";

import { useState, useRef } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Hash,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type PositionOption = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

const POSITION_LABELS: Record<PositionOption, string> = {
  "top-left": "Top Left",
  "top-center": "Top Center",
  "top-right": "Top Right",
  "bottom-left": "Bottom Left",
  "bottom-center": "Bottom Center",
  "bottom-right": "Bottom Right",
};

export function PdfPageNumbersClient({ dict }: { dict?: any }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);

  const [position, setPosition] = useState<PositionOption>("bottom-center");
  const [fontSize, setFontSize] = useState(12);
  const [startNumber, setStartNumber] = useState(1);

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

  const getTextPosition = (pageWidth: number, pageHeight: number, textWidth: number, pos: PositionOption) => {
    const margin = 36;
    const positions: Record<PositionOption, { x: number; y: number }> = {
      "top-left": { x: margin, y: pageHeight - margin },
      "top-center": { x: (pageWidth - textWidth) / 2, y: pageHeight - margin },
      "top-right": { x: pageWidth - margin - textWidth, y: pageHeight - margin },
      "bottom-left": { x: margin, y: margin },
      "bottom-center": { x: (pageWidth - textWidth) / 2, y: margin },
      "bottom-right": { x: pageWidth - margin - textWidth, y: margin },
    };
    return positions[pos];
  };

  const applyPageNumbers = async () => {
    if (!pdfFile) return;

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
        const pageNum = `${startNumber + i}`;
        const textWidth = font.widthOfTextAtSize(pageNum, fontSize);
        const { x, y } = getTextPosition(width, height, textWidth, position);

        page.drawText(pageNum, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });

        setProgress(Math.round(((i + 1) / totalPages) * 100));
      }

      const savedBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(savedBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setResultSize((blob.size / (1024 * 1024)).toFixed(2));
    } catch {
      setError("Failed to add page numbers. The file may be corrupted or unsupported.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const baseName = pdfName.replace(/\.pdf$/i, "") || "document";
    link.download = `${baseName}_numbered.pdf`;
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
    setPosition("bottom-center");
    setFontSize(12);
    setStartNumber(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 mb-6">
          <Hash className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">{dict?.pdf_page_numbers?.title || "Add Page Numbers to PDF"}</h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.pdf_page_numbers?.subtitle || "Add page numbers to every page of your PDF. Choose position, font size, and starting number. 100% private — processed in your browser."}
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
            <p className="text-lg font-medium mb-2">{dict?.pdf_page_numbers?.drop_zone || "Drag & drop a PDF file here"}</p>
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

            {/* Position selection */}
            <div className="p-6 bg-muted/30 rounded-lg border border-muted space-y-4">
              <h3 className="font-semibold text-sm">Number Position</h3>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(POSITION_LABELS) as PositionOption[]).map((pos) => (
                  <Button
                    key={pos}
                    variant={position === pos ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setPosition(pos); setResultUrl(null); setResultSize(null); }}
                    className={position === pos ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                  >
                    {POSITION_LABELS[pos]}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Font Size (10-24)</label>
                  <Input type="number" min={10} max={24} value={fontSize} onChange={(e) => { setFontSize(Math.min(24, Math.max(10, Number(e.target.value)))); setResultUrl(null); setResultSize(null); }} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Start Number</label>
                  <Input type="number" min={1} value={startNumber} onChange={(e) => { setStartNumber(Math.max(1, Number(e.target.value))); setResultUrl(null); setResultSize(null); }} />
                </div>
              </div>
            </div>

            {/* Apply button */}
            {!resultUrl && (
              <div className="flex justify-center pt-4">
                <Button size="lg" onClick={applyPageNumbers} disabled={isProcessing} className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]">
                  {isProcessing ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Adding... {progress}%</>) : (<><Hash className="w-5 h-5 mr-2" />{dict?.pdf_page_numbers?.action_btn || "Add Page Numbers"}</>)}
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
                <div className="text-sm text-muted-foreground">Page numbers added successfully! {pageCount} pages &middot; {resultSize} MB</div>
                <Button size="lg" onClick={handleDownload} className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]">
                  <Download className="w-5 h-5 mr-2" />{dict?.pdf_page_numbers?.download_btn || "Download Numbered PDF"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">{dict?.pdf_page_numbers?.guide_title || "How to Add Page Numbers"}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{dict?.pdf_page_numbers?.guide_desc || "Number your PDF pages in 3 simple steps."}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: 1, title: dict?.pdf_page_numbers?.step1_title || "Upload PDF", desc: dict?.pdf_page_numbers?.step1_desc || "Drag and drop or click to select a PDF file from your device.", icon: Upload },
              { step: 2, title: dict?.pdf_page_numbers?.step2_title || "Configure", desc: dict?.pdf_page_numbers?.step2_desc || "Choose the position, font size, and starting number for your page numbers.", icon: Hash },
              { step: 3, title: dict?.pdf_page_numbers?.step3_title || "Download", desc: dict?.pdf_page_numbers?.step3_desc || "Click 'Add Page Numbers' and download your numbered PDF file.", icon: Download },
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
            <h2 className="text-3xl font-bold tracking-tight mb-4">{dict?.pdf_page_numbers?.tips_title || "Page Numbering Tips"}</h2>
            <p className="text-muted-foreground">{dict?.pdf_page_numbers?.tips_desc || "Get the best results when adding page numbers."}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: dict?.pdf_page_numbers?.tip1_title || "100% Private", desc: dict?.pdf_page_numbers?.tip1_desc || "All processing happens in your browser using pdf-lib. Your files never leave your device.", icon: Shield },
              { title: dict?.pdf_page_numbers?.tip2_title || "Flexible Positioning", desc: dict?.pdf_page_numbers?.tip2_desc || "Choose from 6 positions: top or bottom, aligned left, center, or right.", icon: Eye },
              { title: dict?.pdf_page_numbers?.tip3_title || "Custom Start Number", desc: dict?.pdf_page_numbers?.tip3_desc || "Start numbering from any number — useful for documents with front matter or appendices.", icon: Zap },
              { title: dict?.pdf_page_numbers?.tip4_title || "Original Preserved", desc: dict?.pdf_page_numbers?.tip4_desc || "Your original PDF file remains untouched. Only a new numbered file is created for download.", icon: FileText },
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
            <h2 className="text-3xl font-bold tracking-tight mb-4">{dict?.pdf_page_numbers?.faq_title || "Page Numbers FAQ"}</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">{dict?.pdf_page_numbers?.faq_desc || "Common questions about adding page numbers to PDFs."}</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>{dict?.pdf_page_numbers?.faq_1_q || "Is it free to add page numbers?"}</AccordionTrigger>
                <AccordionContent>{dict?.pdf_page_numbers?.faq_1_a || "Yes, this tool is 100% free. There are no hidden fees, watermarks, or usage limits."}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>{dict?.pdf_page_numbers?.faq_2_q || "What font is used for page numbers?"}</AccordionTrigger>
                <AccordionContent>{dict?.pdf_page_numbers?.faq_2_a || "Page numbers are rendered using Helvetica, a standard PDF font available in all PDF viewers. The font size is adjustable between 10 and 24 points."}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>{dict?.pdf_page_numbers?.faq_3_q || "Can I skip numbering on certain pages?"}</AccordionTrigger>
                <AccordionContent>{dict?.pdf_page_numbers?.faq_3_a || "Currently, page numbers are added to all pages. To skip certain pages, you could split the PDF first, add numbers to the desired pages, and then merge them back together."}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>{dict?.pdf_page_numbers?.faq_4_q || "Can I change the number color?"}</AccordionTrigger>
                <AccordionContent>{dict?.pdf_page_numbers?.faq_4_a || "Currently, page numbers are drawn in black. For custom colors, a more advanced PDF editor would be needed."}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>{dict?.pdf_page_numbers?.faq_5_q || "What is the file size limit?"}</AccordionTrigger>
                <AccordionContent>{dict?.pdf_page_numbers?.faq_5_a || "The maximum file size is 50MB. Since all processing happens in your browser, very large files may take longer depending on your device&apos;s capabilities."}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
