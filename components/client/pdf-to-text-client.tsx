"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
import Adsense from "@/components/Adsense";
  FileText,
  Upload,
  Download,
  RotateCcw,
  Lightbulb,
  Loader2,
  Shield,
  Zap,
  Copy,
  Type,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

async function loadPdfJs() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.mjs";
  return pdfjsLib;
}

export function PdfToTextClient({ dict }: { dict?: any }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractText = async (file: File) => {
    setError(null);
    setExtractedText("");
    setProgress(0);
    setCopied(false);

    if (file.type !== "application/pdf") {
      setError(`"${file.name}" is not a PDF file. Only PDF files are accepted.`);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError(`"${file.name}" exceeds the 50MB file size limit.`);
      return;
    }

    setPdfFile(file);
    setPdfName(file.name);
    setIsProcessing(true);

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      setPageCount(numPages);

      const textParts: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => {
            if ("str" in item) return item.str;
            return "";
          })
          .join(" ");
        textParts.push(`--- Page ${i} ---\n${pageText}`);
        setProgress(Math.round((i / numPages) * 100));
      }

      const fullText = textParts.join("\n\n");
      setExtractedText(fullText);
    } catch {
      setError(`"${file.name}" could not be processed. It may be corrupted, password-protected, or contain no extractable text.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      extractText(e.target.files[0]);
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
      extractText(e.dataTransfer.files[0]);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy text to clipboard.");
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const baseName = pdfName.replace(/\.pdf$/i, "") || "document";
    link.download = `${baseName}_text.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setPdfFile(null);
    setPdfName("");
    setPageCount(0);
    setExtractedText("");
    setIsDragging(false);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 mb-6">
          <Type className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.pdf_to_text?.title || "PDF to Text"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.pdf_to_text?.subtitle || "Extract text from PDF files. Copy to clipboard or download as a .txt file. 100% private — processed in your browser."}
        </p>

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
            <p className="text-lg font-medium mb-2">{dict?.pdf_to_text?.drop_zone || "Drag & drop a PDF file here"}</p>
            <p className="text-sm text-muted-foreground">Only PDF files accepted. Max 50MB per file.</p>
          </div>
        )}

        {error && (
          <div className="w-full max-w-2xl mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Processing state */}
        {isProcessing && (
          <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin text-red-600" />
              Extracting text... {progress}%
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Extracted text result */}
        {pdfFile && extractedText && !isProcessing && (
          <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {pdfName} &middot; {pageCount} page{pageCount !== 1 ? "s" : ""} &middot; {extractedText.length.toLocaleString()} characters
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>

            <Textarea
              value={extractedText}
              readOnly
              className="min-h-[300px] font-mono text-sm"
            />

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={handleCopy}
                variant="outline"
                className="min-w-[180px]"
              >
                <Copy className="w-5 h-5 mr-2" />
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
              <Button
                size="lg"
                onClick={handleDownloadTxt}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[180px]"
              >
                <Download className="w-5 h-5 mr-2" />
                Download as .txt
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">{dict?.pdf_to_text?.guide_title || "How to Extract Text from PDF"}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{dict?.pdf_to_text?.guide_desc || "Extract text from your PDF in 3 simple steps."}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: 1, title: dict?.pdf_to_text?.step1_title || "Upload PDF", desc: dict?.pdf_to_text?.step1_desc || "Drag and drop or click to select a PDF file from your device.", icon: Upload },
              { step: 2, title: dict?.pdf_to_text?.step2_title || "Extract Text", desc: dict?.pdf_to_text?.step2_desc || "Text is automatically extracted from all pages of your PDF.", icon: Type },
              { step: 3, title: dict?.pdf_to_text?.step3_title || "Copy or Download", desc: dict?.pdf_to_text?.step3_desc || "Copy the text to your clipboard or download it as a .txt file.", icon: Download },
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
            <h2 className="text-3xl font-bold tracking-tight mb-4">{dict?.pdf_to_text?.tips_title || "PDF to Text Tips"}</h2>
            <p className="text-muted-foreground">{dict?.pdf_to_text?.tips_desc || "Get the best results when extracting text from PDFs."}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: dict?.pdf_to_text?.tip1_title || "100% Private", desc: dict?.pdf_to_text?.tip1_desc || "All processing happens in your browser using pdf.js. Your files never leave your device.", icon: Shield },
              { title: dict?.pdf_to_text?.tip2_title || "Text-Based PDFs Only", desc: dict?.pdf_to_text?.tip2_desc || "This tool extracts embedded text. Scanned documents (images) require OCR, which is not supported here.", icon: FileText },
              { title: dict?.pdf_to_text?.tip3_title || "Instant Extraction", desc: dict?.pdf_to_text?.tip3_desc || "Text is extracted instantly from each page. Large PDFs may take a few seconds.", icon: Zap },
              { title: dict?.pdf_to_text?.tip4_title || "Page Markers", desc: dict?.pdf_to_text?.tip4_desc || "Extracted text includes page markers so you can easily find content from specific pages.", icon: Type },
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

        <Adsense slotId="7759160077" />

        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">{dict?.pdf_to_text?.faq_title || "PDF to Text FAQ"}</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">{dict?.pdf_to_text?.faq_desc || "Common questions about extracting text from PDFs."}</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>{dict?.pdf_to_text?.faq_1_q || "Is it free to extract text from a PDF?"}</AccordionTrigger>
                <AccordionContent>{dict?.pdf_to_text?.faq_1_a || "Yes, this tool is 100% free to use. There are no hidden fees, watermarks, or usage limits."}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>{dict?.pdf_to_text?.faq_2_q || "Can I extract text from scanned PDFs?"}</AccordionTrigger>
                <AccordionContent>{dict?.pdf_to_text?.faq_2_a || "No, this tool extracts embedded text only. Scanned PDFs contain images of text and require OCR (Optical Character Recognition) software to convert them."}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>{dict?.pdf_to_text?.faq_3_q || "Is my PDF secure?"}</AccordionTrigger>
                <AccordionContent>{dict?.pdf_to_text?.faq_3_a || "Absolutely. All processing happens entirely in your browser using pdf.js. Your PDF files never leave your device and are never uploaded to any server."}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>{dict?.pdf_to_text?.faq_4_q || "What is the file size limit?"}</AccordionTrigger>
                <AccordionContent>{dict?.pdf_to_text?.faq_4_a || "The maximum file size is 50MB. Larger files may cause performance issues depending on your browser and device capabilities."}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>{dict?.pdf_to_text?.faq_5_q || "Why is the extracted text garbled or empty?"}</AccordionTrigger>
                <AccordionContent>{dict?.pdf_to_text?.faq_5_a || "If the text appears garbled, the PDF may use custom fonts or encoding. If the text is empty, the PDF likely contains scanned images rather than embedded text. Try a different PDF or use OCR software for scanned documents."}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
