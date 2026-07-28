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
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  Shield,
  Layers,
  Zap,
  FilePlus2,
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

interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  pageCount: number;
  sizeMB: string;
}

export function MergePdfClient({ dict }: { dict?: any }) {
  const [pdfFiles, setPdfFiles] = useState<PdfFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [mergedSize, setMergedSize] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = async (files: FileList | File[]) => {
    setError(null);
    const newItems: PdfFileItem[] = [];

    for (const file of Array.from(files)) {
      if (file.type !== "application/pdf") {
        setError(
          `"${file.name}" is not a PDF file. Only PDF files are accepted.`,
        );
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 50MB file size limit.`);
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
        });
        const pageCount = pdf.getPageCount();

        newItems.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          file,
          name: file.name,
          pageCount,
          sizeMB: (file.size / (1024 * 1024)).toFixed(2),
        });
      } catch {
        setError(
          `"${file.name}" could not be read. It may be corrupted or password-protected.`,
        );
      }
    }

    if (newItems.length > 0) {
      setPdfFiles((prev) => [...prev, ...newItems]);
      setMergedPdfUrl(null);
      setMergedSize(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
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
      addFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((f) => f.id !== id));
    setMergedPdfUrl(null);
    setMergedSize(null);
    setError(null);
  };

  const moveFile = (idx: number, direction: -1 | 1) => {
    setPdfFiles((prev) => {
      const target = idx + direction;
      if (target < 0 || target >= prev.length) return prev;
      const newArr = [...prev];
      [newArr[idx], newArr[target]] = [newArr[target], newArr[idx]];
      return newArr;
    });
    setMergedPdfUrl(null);
    setMergedSize(null);
  };

  const mergePdfs = async () => {
    if (pdfFiles.length < 2) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setMergedPdfUrl(null);
    setMergedSize(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < pdfFiles.length; i++) {
        const arrayBuffer = await pdfFiles[i].file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
        });
        const pages = await mergedPdf.copyPages(
          sourcePdf,
          sourcePdf.getPageIndices(),
        );
        for (const page of pages) {
          mergedPdf.addPage(page);
        }
        setProgress(Math.round(((i + 1) / pdfFiles.length) * 100));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      setMergedPdfUrl(url);
      setMergedSize((blob.size / (1024 * 1024)).toFixed(2));
    } catch {
      setError(
        "Failed to merge PDFs. One or more files may be corrupted or unsupported.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedPdfUrl) return;
    const link = document.createElement("a");
    link.href = mergedPdfUrl;
    const baseName = pdfFiles[0]?.name.replace(/\.pdf$/i, "") || "document";
    link.download = `${baseName}_merged_${pdfFiles.length}files.pdf`;
    link.click();
  };

  const handleReset = () => {
    if (mergedPdfUrl) URL.revokeObjectURL(mergedPdfUrl);
    setPdfFiles([]);
    setIsDragging(false);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setMergedPdfUrl(null);
    setMergedSize(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const totalPages = pdfFiles.reduce((sum, f) => sum + f.pageCount, 0);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 mb-6">
              <FilePlus2 className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {dict?.merge_pdf?.title || "Merge PDF"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {dict?.merge_pdf?.subtitle ||
                "Combine multiple PDF files into one. Reorder pages, preview file details, and download the merged result. 100% private — processed in your browser."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Drop zone */}
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
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {pdfFiles.length === 0
                  ? "여기에 PDF 파일을 끌어다 놓으세요"
                  : "Add more PDF files"}
              </p>
              <p className="text-sm text-muted-foreground">
                PDF 파일만 올릴 수 있습니다. 파일당 최대 50MB입니다.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="w-full max-w-2xl mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* File list */}
            {pdfFiles.length > 0 && (
              <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {pdfFiles.length} file{pdfFiles.length !== 1 ? "s" : ""}{" "}
                    &middot; {totalPages} total page
                    {totalPages !== 1 ? "s" : ""}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    전체 지우기
                  </Button>
                </div>

                <div className="space-y-2">
                  {pdfFiles.map((pdf, idx) => (
                    <div
                      key={pdf.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-muted"
                    >
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold">
                        {idx + 1}
                      </div>
                      <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          title={pdf.name}
                        >
                          {pdf.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pdf.pageCount} page{pdf.pageCount !== 1 ? "s" : ""}{" "}
                          &middot; {pdf.sizeMB} MB
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveFile(idx, -1)}
                          disabled={idx === 0}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveFile(idx, 1)}
                          disabled={idx === pdfFiles.length - 1}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                          onClick={() => removeFile(pdf.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Merge button */}
                {pdfFiles.length >= 2 && !mergedPdfUrl && (
                  <div className="flex justify-center pt-4">
                    <Button
                      size="lg"
                      onClick={mergePdfs}
                      disabled={isProcessing}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Merging... {progress}%
                        </>
                      ) : (
                        <>
                          <FilePlus2 className="w-5 h-5 mr-2" />
                          Merge {pdfFiles.length} PDFs
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

                {pdfFiles.length === 1 && (
                  <p className="text-center text-sm text-muted-foreground">
                    합치려면 PDF를 하나 이상 더 추가하세요.
                  </p>
                )}

                {/* Download merged PDF */}
                {mergedPdfUrl && (
                  <div className="flex flex-col items-center gap-3 pt-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="text-sm text-muted-foreground">
                      Merged successfully! {totalPages} pages &middot;{" "}
                      {mergedSize} MB
                    </div>
                    <Button
                      size="lg"
                      onClick={handleDownload}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {dict?.merge_pdf?.download_btn || "Download Merged PDF"}
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
                  {dict?.merge_pdf?.guide_title || "How to Merge PDFs"}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {dict?.merge_pdf?.guide_desc ||
                    "Combine multiple PDF files into one in 3 simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: dict?.merge_pdf?.step1_title || "PDF 업로드s",
                    desc:
                      dict?.merge_pdf?.step1_desc ||
                      "Drag and drop or click to select multiple PDF files from your device.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: dict?.merge_pdf?.step2_title || "Reorder Files",
                    desc:
                      dict?.merge_pdf?.step2_desc ||
                      "Arrange your PDFs in the desired order using the up/down buttons.",
                    icon: Layers,
                  },
                  {
                    step: 3,
                    title: dict?.merge_pdf?.step3_title || "Merge & Download",
                    desc:
                      dict?.merge_pdf?.step3_desc ||
                      "Click 'Merge' and download your combined PDF file.",
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
                  {dict?.merge_pdf?.tips_title || "PDF Merge Tips"}
                </h2>
                <p className="text-muted-foreground">
                  PDF를 합칠 때 가장 좋은 결과를 얻는 방법입니다.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "100% Private",
                    desc: "모든 처리는 pdf-lib를 이용해 브라우저 안에서 이뤄집니다. 파일이 기기를 벗어나지 않습니다.",
                    icon: Shield,
                  },
                  {
                    title: "간편한 순서 변경",
                    desc: "합치기 전에 위아래 버튼으로 PDF 순서를 원하는 대로 배열하세요.",
                    icon: Layers,
                  },
                  {
                    title: "파일 개수 제한 없음",
                    desc: "필요한 만큼 PDF를 합칠 수 있습니다. 파일 하나당 최대 50MB입니다.",
                    icon: Zap,
                  },
                  {
                    title: "원본 보존",
                    desc: "원본 PDF 파일은 그대로 남습니다. 합쳐진 새 파일만 만들어집니다.",
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
                  {dict?.merge_pdf?.faq_title || "Merge PDF FAQ"}
                </h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                  PDF 합치기에 대해 자주 묻는 질문입니다.
                </p>
              </div>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>
                      {dict?.merge_pdf?.faq_1_q || "Is it free to use?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.merge_pdf?.faq_1_a ||
                        "Yes, this PDF merge tool is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of files you can merge."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>
                      {dict?.merge_pdf?.faq_2_q ||
                        "Is it secure? Where are my files stored?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.merge_pdf?.faq_2_a ||
                        "Your files are completely secure because all processing happens entirely in your browser using pdf-lib. Your PDFs never leave your device and are never uploaded to any server."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>
                      {dict?.merge_pdf?.faq_3_q ||
                        "What is the file size limit?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.merge_pdf?.faq_3_a ||
                        "Each individual PDF file can be up to 50MB. There is no limit on the number of files you can merge. The total merged file size depends on your browser&apos;s memory capacity."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-4">
                    <AccordionTrigger>
                      {dict?.merge_pdf?.faq_4_q ||
                        "Can I merge password-protected PDFs?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.merge_pdf?.faq_4_a ||
                        "We attempt to read password-protected PDFs, but some encrypted files may not be supported. If a file cannot be read, you&apos;ll see an error message. Try removing the password first using your PDF reader."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-5">
                    <AccordionTrigger>
                      {dict?.merge_pdf?.faq_5_q ||
                        "Can I change the order of pages?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.merge_pdf?.faq_5_a ||
                        "You can reorder entire PDF files using the up/down buttons before merging. The pages within each PDF will maintain their original order. For page-level reordering, use a dedicated PDF editor."}
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
