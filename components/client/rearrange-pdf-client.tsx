"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
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
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PageItem {
  originalIndex: number;
  label: string;
}

export function RearrangePdfClient() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pages, setPages] = useState<PageItem[]>([]);
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

      const pageItems: PageItem[] = [];
      for (let i = 0; i < count; i++) {
        pageItems.push({ originalIndex: i, label: `Page ${i + 1}` });
      }

      setPdfFile(file);
      setPdfName(file.name);
      setPages(pageItems);
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

  const movePage = (idx: number, direction: -1 | 1) => {
    setPages((prev) => {
      const target = idx + direction;
      if (target < 0 || target >= prev.length) return prev;
      const newArr = [...prev];
      [newArr[idx], newArr[target]] = [newArr[target], newArr[idx]];
      return newArr;
    });
    setResultUrl(null);
    setResultSize(null);
  };

  const moveToTop = (idx: number) => {
    if (idx === 0) return;
    setPages((prev) => {
      const newArr = [...prev];
      const [item] = newArr.splice(idx, 1);
      newArr.unshift(item);
      return newArr;
    });
    setResultUrl(null);
    setResultSize(null);
  };

  const moveToBottom = (idx: number) => {
    setPages((prev) => {
      if (idx === prev.length - 1) return prev;
      const newArr = [...prev];
      const [item] = newArr.splice(idx, 1);
      newArr.push(item);
      return newArr;
    });
    setResultUrl(null);
    setResultSize(null);
  };

  const reverseOrder = () => {
    setPages((prev) => [...prev].reverse());
    setResultUrl(null);
    setResultSize(null);
  };

  const applyRearrange = async () => {
    if (!pdfFile || pages.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    setResultSize(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      const newOrder = pages.map((p) => p.originalIndex);

      for (let i = 0; i < newOrder.length; i++) {
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [newOrder[i]]);
        newPdf.addPage(copiedPage);
        setProgress(Math.round(((i + 1) / newOrder.length) * 100));
      }

      const savedBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(savedBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setResultSize((blob.size / (1024 * 1024)).toFixed(2));
    } catch {
      setError("Failed to rearrange PDF pages. The file may be corrupted or unsupported.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const baseName = pdfName.replace(/\.pdf$/i, "") || "document";
    link.download = `${baseName}_rearranged.pdf`;
    link.click();
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setPdfFile(null);
    setPdfName("");
    setPages([]);
    setIsDragging(false);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    setResultSize(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasOrderChanged = pages.some((p, i) => p.originalIndex !== i);

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 mb-6">
          <ArrowUpDown className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Rearrange PDF Pages</h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          Change the order of pages in your PDF. Move pages up, down, or reverse the entire order. 100% private — processed in your browser.
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

        {pdfFile && pages.length > 0 && (
          <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{pdfName} &middot; {pages.length} page{pages.length !== 1 ? "s" : ""}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={reverseOrder}><ArrowUpDown className="w-4 h-4 mr-2" />Reverse</Button>
                <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2" />Clear</Button>
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {pages.map((page, idx) => (
                <div key={`${page.originalIndex}-${idx}`} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-muted">
                  <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold">{idx + 1}</div>
                  <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{page.label}</p>
                    <p className="text-xs text-muted-foreground">Originally page {page.originalIndex + 1}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveToTop(idx)} disabled={idx === 0} title="Move to top">
                      <ChevronUp className="w-4 h-4" /><ChevronUp className="w-4 h-4 -mt-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => movePage(idx, -1)} disabled={idx === 0} title="Move up">
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => movePage(idx, 1)} disabled={idx === pages.length - 1} title="Move down">
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveToBottom(idx)} disabled={idx === pages.length - 1} title="Move to bottom">
                      <ChevronDown className="w-4 h-4" /><ChevronDown className="w-4 h-4 -mt-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {!resultUrl && (
              <div className="flex justify-center pt-4">
                <Button size="lg" onClick={applyRearrange} disabled={isProcessing || !hasOrderChanged} className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]">
                  {isProcessing ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Rearranging... {progress}%</>) : (<><ArrowUpDown className="w-5 h-5 mr-2" />Apply New Order</>)}
                </Button>
              </div>
            )}

            {!hasOrderChanged && !resultUrl && (
              <p className="text-center text-sm text-muted-foreground">Move pages to change the order, then click apply.</p>
            )}

            {isProcessing && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}

            {resultUrl && (
              <div className="flex flex-col items-center gap-3 pt-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="text-sm text-muted-foreground">Rearranged successfully! {pages.length} pages &middot; {resultSize} MB</div>
                <Button size="lg" onClick={handleDownload} className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]">
                  <Download className="w-5 h-5 mr-2" />Download Rearranged PDF
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">How to Rearrange PDF Pages</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Reorder your PDF pages in 3 simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "Upload PDF", desc: "Drag and drop or click to select a PDF file from your device.", icon: Upload },
              { step: 2, title: "Rearrange Pages", desc: "Use the up/down buttons to move pages to your desired order, or reverse the entire document.", icon: ArrowUpDown },
              { step: 3, title: "Download", desc: "Click 'Apply New Order' and download your rearranged PDF file.", icon: Download },
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
            <h2 className="text-3xl font-bold tracking-tight mb-4">Page Rearranging Tips</h2>
            <p className="text-muted-foreground">Get the best results when reordering PDF pages.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "100% Private", desc: "All processing happens in your browser using pdf-lib. Your files never leave your device.", icon: Shield },
              { title: "Visual Page List", desc: "Each page shows its original and new position, making it easy to track your changes.", icon: Eye },
              { title: "Quick Reverse", desc: "Use the Reverse button to instantly flip the entire page order — great for fixing scanned documents.", icon: Zap },
              { title: "Original Preserved", desc: "Your original PDF file remains untouched. Only a new rearranged file is created for download.", icon: FileText },
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
            <h2 className="text-3xl font-bold tracking-tight mb-4">Rearrange PDF FAQ</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">Common questions about rearranging PDF pages.</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>Is it free to rearrange PDF pages?</AccordionTrigger>
                <AccordionContent>Yes, this PDF page rearranging tool is 100% free. There are no hidden fees, watermarks, or usage limits.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>Is my PDF secure when rearranging pages?</AccordionTrigger>
                <AccordionContent>Absolutely. All processing happens entirely in your browser using pdf-lib. Your PDF files never leave your device and are never uploaded to any server.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>Will the page content or quality change?</AccordionTrigger>
                <AccordionContent>No. Rearranging pages only changes the order — the content, formatting, and quality of each page remain exactly the same. Pages are copied as-is into the new document.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>Can I move a page to a specific position?</AccordionTrigger>
                <AccordionContent>Yes, you can move pages up or down one position at a time, or jump directly to the top or bottom of the document using the double-arrow buttons.</AccordionContent>
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
