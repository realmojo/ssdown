"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import {
  FileX,
  Upload,
  Download,
  FileText,
  RotateCcw,
  Lightbulb,
  Loader2,
  Shield,
  Zap,
  CheckSquare,
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

export function DeletePdfPagesClient({ dict }: { dict?: any }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
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
    setSelectedPages(new Set());

    if (file.type !== "application/pdf") {
      setError(
        `"${file.name}" is not a PDF file. Only PDF files are accepted.`,
      );
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError(`"${file.name}" exceeds the 50MB file size limit.`);
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });
      const count = pdf.getPageCount();

      setPdfFile(file);
      setPdfName(file.name);
      setPageCount(count);
    } catch {
      setError(
        `"${file.name}" could not be read. It may be corrupted or password-protected.`,
      );
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

  const togglePage = (pageIndex: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageIndex)) {
        next.delete(pageIndex);
      } else {
        next.add(pageIndex);
      }
      return next;
    });
    setResultUrl(null);
    setResultSize(null);
  };

  const selectAllPages = () => {
    const all = new Set<number>();
    for (let i = 0; i < pageCount; i++) {
      all.add(i);
    }
    setSelectedPages(all);
    setResultUrl(null);
    setResultSize(null);
  };

  const deselectAllPages = () => {
    setSelectedPages(new Set());
    setResultUrl(null);
    setResultSize(null);
  };

  const deletePages = async () => {
    if (!pdfFile || selectedPages.size === 0) return;
    if (selectedPages.size === pageCount) {
      setError("You cannot delete all pages. At least one page must remain.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    setResultSize(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });
      const newPdf = await PDFDocument.create();

      const pagesToKeep = sourcePdf
        .getPageIndices()
        .filter((idx) => !selectedPages.has(idx));

      const copiedPages = await newPdf.copyPages(sourcePdf, pagesToKeep);
      for (let i = 0; i < copiedPages.length; i++) {
        newPdf.addPage(copiedPages[i]);
        setProgress(Math.round(((i + 1) / copiedPages.length) * 100));
      }

      const resultBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(resultBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setResultSize((blob.size / (1024 * 1024)).toFixed(2));
    } catch {
      setError(
        "Failed to delete pages. The file may be corrupted or unsupported.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const baseName = pdfName.replace(/\.pdf$/i, "") || "document";
    link.download = `${baseName}_pages_deleted.pdf`;
    link.click();
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setPdfFile(null);
    setPdfName("");
    setPageCount(0);
    setSelectedPages(new Set());
    setIsDragging(false);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    setResultSize(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const remainingPages = pageCount - selectedPages.size;

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 mb-6">
              <FileX className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {dict?.delete_pdf_pages?.title || "Delete PDF Pages"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {dict?.delete_pdf_pages?.subtitle ||
                "Remove specific pages from your PDF. Select pages to delete, keep the rest. 100% private — processed in your browser."}
            </p>

            <Adsense slotId="7759160077" />

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
                  {dict?.delete_pdf_pages?.drop_zone ||
                    "Drag & drop a PDF file here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Only PDF files accepted. Max 50MB per file.
                </p>
              </div>
            )}

            {error && (
              <div className="w-full max-w-2xl mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {pdfFile && pageCount > 0 && (
              <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {pdfName} &middot; {pageCount} page
                    {pageCount !== 1 ? "s" : ""}
                    {selectedPages.size > 0 && (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {" "}
                        &middot; {selectedPages.size} selected for deletion
                      </span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-muted">
                  <span className="text-sm font-medium mr-2">
                    Quick Select:
                  </span>
                  <Button variant="outline" size="sm" onClick={selectAllPages}>
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAllPages}
                  >
                    Deselect All
                  </Button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {Array.from({ length: pageCount }, (_, i) => (
                    <div
                      key={i}
                      onClick={() => togglePage(i)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPages.has(i)
                          ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                          : "bg-muted/30 border-muted hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold">
                        {i + 1}
                      </div>
                      <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Page {i + 1}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            selectedPages.has(i)
                              ? "bg-red-600 border-red-600"
                              : "border-muted-foreground/40"
                          }`}
                        >
                          {selectedPages.has(i) && (
                            <CheckSquare className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPages.size > 0 && !resultUrl && (
                  <div className="flex justify-center pt-4">
                    <Button
                      size="lg"
                      onClick={deletePages}
                      disabled={isProcessing}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Deleting... {progress}%
                        </>
                      ) : (
                        <>
                          <FileX className="w-5 h-5 mr-2" />
                          Delete {selectedPages.size} Page
                          {selectedPages.size !== 1 ? "s" : ""} (
                          {remainingPages} remaining)
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
                      Deleted successfully! {remainingPages} page
                      {remainingPages !== 1 ? "s" : ""} remaining &middot;{" "}
                      {resultSize} MB
                    </div>
                    <Button
                      size="lg"
                      onClick={handleDownload}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {dict?.delete_pdf_pages?.action_btn || "Download PDF"}
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
                  {dict?.delete_pdf_pages?.guide_title ||
                    "How to Delete PDF Pages"}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {dict?.delete_pdf_pages?.guide_desc ||
                    "Remove unwanted pages from your PDF in 3 simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: dict?.delete_pdf_pages?.step1_title || "Upload PDF",
                    desc:
                      dict?.delete_pdf_pages?.step1_desc ||
                      "Drag and drop or click to select a PDF file from your device.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title:
                      dict?.delete_pdf_pages?.step2_title || "Select Pages",
                    desc:
                      dict?.delete_pdf_pages?.step2_desc ||
                      "Choose the pages you want to delete by clicking on them.",
                    icon: CheckSquare,
                  },
                  {
                    step: 3,
                    title:
                      dict?.delete_pdf_pages?.step3_title ||
                      "Delete & Download",
                    desc:
                      dict?.delete_pdf_pages?.step3_desc ||
                      "Click 'Delete' and download your PDF without the removed pages.",
                    icon: Download,
                  },
                ].map((step) => (
                  <Card
                    key={step.step}
                    className="border-red-200 dark:border-red-900/50"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white font-bold">
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

            <section className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
                  <Lightbulb className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {dict?.delete_pdf_pages?.tips_title || "Page Deletion Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {dict?.delete_pdf_pages?.tips_desc ||
                    "Get the best results when deleting PDF pages."}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: dict?.delete_pdf_pages?.tip1_title || "100% Private",
                    desc:
                      dict?.delete_pdf_pages?.tip1_desc ||
                      "All processing happens in your browser using pdf-lib. Your files never leave your device.",
                    icon: Shield,
                  },
                  {
                    title:
                      dict?.delete_pdf_pages?.tip2_title ||
                      "Selective Deletion",
                    desc:
                      dict?.delete_pdf_pages?.tip2_desc ||
                      "Choose exactly which pages to remove. Use Select All / Deselect All for quick operations.",
                    icon: CheckSquare,
                  },
                  {
                    title:
                      dict?.delete_pdf_pages?.tip3_title ||
                      "Instant Processing",
                    desc:
                      dict?.delete_pdf_pages?.tip3_desc ||
                      "Pages are removed instantly without re-encoding. Your PDF quality remains unchanged.",
                    icon: Zap,
                  },
                  {
                    title:
                      dict?.delete_pdf_pages?.tip4_title ||
                      "Original Preserved",
                    desc:
                      dict?.delete_pdf_pages?.tip4_desc ||
                      "Your original PDF file remains untouched. Only a new file with remaining pages is created.",
                    icon: FileText,
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
                  {dict?.delete_pdf_pages?.faq_title || "Delete PDF Pages FAQ"}
                </h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                  {dict?.delete_pdf_pages?.faq_desc ||
                    "Common questions about deleting PDF pages."}
                </p>
              </div>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>
                      {dict?.delete_pdf_pages?.faq_1_q ||
                        "Is it free to delete PDF pages?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.delete_pdf_pages?.faq_1_a ||
                        "Yes, this tool is 100% free to use. There are no hidden fees, watermarks, or usage limits."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>
                      {dict?.delete_pdf_pages?.faq_2_q || "Is my PDF secure?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.delete_pdf_pages?.faq_2_a ||
                        "Absolutely. All processing happens entirely in your browser using pdf-lib. Your PDF files never leave your device and are never uploaded to any server."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>
                      {dict?.delete_pdf_pages?.faq_3_q ||
                        "Can I delete all pages?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.delete_pdf_pages?.faq_3_a ||
                        "No, you must keep at least one page. A PDF file requires at least one page to be valid. If you need to remove all pages, consider deleting the file instead."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-4">
                    <AccordionTrigger>
                      {dict?.delete_pdf_pages?.faq_4_q ||
                        "What is the file size limit?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.delete_pdf_pages?.faq_4_a ||
                        "The maximum file size is 50MB. Larger files may cause performance issues depending on your browser and device capabilities."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-5">
                    <AccordionTrigger>
                      {dict?.delete_pdf_pages?.faq_5_q ||
                        "Will the remaining pages keep their formatting?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.delete_pdf_pages?.faq_5_a ||
                        "Yes, all remaining pages retain their original formatting, fonts, images, and layout. Only the selected pages are removed — nothing else is modified."}
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
