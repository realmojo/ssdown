"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Scissors,
  Upload,
  Download,
  FileText,
  RotateCcw,
  Lightbulb,
  Loader2,
  Shield,
  Zap,
  Layers,
  File,
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

interface SplitResult {
  name: string;
  url: string;
  sizeMB: string;
  pageCount: number;
}

type SplitMode = "every-page" | "custom-ranges";

function parseRanges(input: string, maxPage: number): number[][] | null {
  const ranges: number[][] = [];
  const parts = input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (
        isNaN(start) ||
        isNaN(end) ||
        start < 1 ||
        end > maxPage ||
        start > end
      ) {
        return null;
      }
      const pages: number[] = [];
      for (let i = start; i <= end; i++) {
        pages.push(i - 1); // Convert to 0-indexed
      }
      ranges.push(pages);
    } else {
      const page = parseInt(part, 10);
      if (isNaN(page) || page < 1 || page > maxPage) {
        return null;
      }
      ranges.push([page - 1]); // Convert to 0-indexed
    }
  }

  return ranges.length > 0 ? ranges : null;
}

export function SplitPdfClient({ dict }: { dict?: any }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState<SplitMode>("every-page");
  const [customRanges, setCustomRanges] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SplitResult[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPdf = async (file: File) => {
    setError(null);
    setResults([]);
    setCustomRanges("");
    setSplitMode("every-page");

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

  const splitPdf = async () => {
    if (!pdfFile) return;

    let pageGroups: number[][];

    if (splitMode === "every-page") {
      pageGroups = Array.from({ length: pageCount }, (_, i) => [i]);
    } else {
      const parsed = parseRanges(customRanges, pageCount);
      if (!parsed) {
        setError(
          `Invalid range format. Use format like "1-3, 4-6, 7-10". Pages must be between 1 and ${pageCount}.`,
        );
        return;
      }
      pageGroups = parsed;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResults([]);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });
      const baseName = pdfName.replace(/\.pdf$/i, "") || "document";
      const newResults: SplitResult[] = [];

      for (let i = 0; i < pageGroups.length; i++) {
        const group = pageGroups[i];
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(sourcePdf, group);
        for (const page of copiedPages) {
          newPdf.addPage(page);
        }

        const pdfBytes = await newPdf.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], {
          type: "application/pdf",
        });
        const url = URL.createObjectURL(blob);

        const startPage = group[0] + 1;
        const endPage = group[group.length - 1] + 1;
        const rangeName =
          startPage === endPage
            ? `page${startPage}`
            : `pages${startPage}-${endPage}`;

        newResults.push({
          name: `${baseName}_${rangeName}.pdf`,
          url,
          sizeMB: (blob.size / (1024 * 1024)).toFixed(2),
          pageCount: group.length,
        });

        setProgress(Math.round(((i + 1) / pageGroups.length) * 100));
      }

      setResults(newResults);
    } catch {
      setError(
        "Failed to split PDF. The file may be corrupted or unsupported.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = (result: SplitResult) => {
    const link = document.createElement("a");
    link.href = result.url;
    link.download = result.name;
    link.click();
  };

  const handleReset = () => {
    for (const result of results) {
      URL.revokeObjectURL(result.url);
    }
    setPdfFile(null);
    setPdfName("");
    setPageCount(0);
    setSplitMode("every-page");
    setCustomRanges("");
    setIsDragging(false);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setResults([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 mb-6">
              <Scissors className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {dict?.split_pdf?.title || "Split PDF"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {dict?.split_pdf?.subtitle ||
                "Split a PDF into multiple files. Extract every page separately or define custom page ranges. 100% private — processed in your browser."}
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
                  {dict?.split_pdf?.drop_zone || "여기에 PDF 파일을 끌어다 놓으세요"}
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF 파일만 올릴 수 있습니다. 파일당 최대 50MB입니다.
                </p>
              </div>
            )}

            {error && (
              <div className="w-full max-w-2xl mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {pdfFile && pageCount > 0 && results.length === 0 && (
              <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {pdfName} &middot; {pageCount} page
                    {pageCount !== 1 ? "s" : ""}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>

                {/* Split mode selector */}
                <div className="p-6 bg-muted/30 rounded-lg border border-muted space-y-4">
                  <h3 className="font-semibold">분할 방식</h3>
                  <div className="flex gap-3">
                    <Button
                      variant={
                        splitMode === "every-page" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setSplitMode("every-page");
                        setError(null);
                      }}
                      className={
                        splitMode === "every-page"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : ""
                      }
                    >
                      모든 페이지
                    </Button>
                    <Button
                      variant={
                        splitMode === "custom-ranges" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setSplitMode("custom-ranges");
                        setError(null);
                      }}
                      className={
                        splitMode === "custom-ranges"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : ""
                      }
                    >
                      범위 지정
                    </Button>
                  </div>

                  {splitMode === "every-page" && (
                    <p className="text-sm text-muted-foreground">
                      Each page will be extracted as a separate PDF file. This
                      will create {pageCount} file{pageCount !== 1 ? "s" : ""}.
                    </p>
                  )}

                  {splitMode === "custom-ranges" && (
                    <div className="space-y-2">
                      <label
                        htmlFor="custom-ranges"
                        className="text-sm font-medium block"
                      >
                        페이지 범위
                      </label>
                      <Input
                        id="custom-ranges"
                        type="text"
                        placeholder="e.g., 1-3, 4-6, 7-10"
                        value={customRanges}
                        onChange={(e) => {
                          setCustomRanges(e.target.value);
                          setError(null);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter page ranges separated by commas. Example:
                        &quot;1-3, 4-6, 7&quot; creates 3 files. Pages: 1 to{" "}
                        {pageCount}.
                      </p>
                    </div>
                  )}
                </div>

                {/* Split button */}
                <div className="flex justify-center pt-4">
                  <Button
                    size="lg"
                    onClick={splitPdf}
                    disabled={
                      isProcessing ||
                      (splitMode === "custom-ranges" &&
                        customRanges.trim().length === 0)
                    }
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Splitting... {progress}%
                      </>
                    ) : (
                      <>
                        <Scissors className="w-5 h-5 mr-2" />
                        {dict?.split_pdf?.title || "Split PDF"}
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

            {/* Results */}
            {results.length > 0 && (
              <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Split into {results.length} file
                    {results.length !== 1 ? "s" : ""}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-muted"
                    >
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold">
                        {idx + 1}
                      </div>
                      <File className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          title={result.name}
                        >
                          {result.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {result.pageCount} page
                          {result.pageCount !== 1 ? "s" : ""} &middot;{" "}
                          {result.sizeMB} MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadSingle(result)}
                        className="flex-shrink-0"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        다운로드
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {dict?.split_pdf?.guide_title || "How to Split a PDF"}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {dict?.split_pdf?.guide_desc ||
                    "Split your PDF into multiple files in 3 simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: dict?.split_pdf?.step1_title || "PDF 업로드",
                    desc:
                      dict?.split_pdf?.step1_desc ||
                      "PDF 파일을 끌어다 놓거나 클릭해서 선택하세요.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: dict?.split_pdf?.step2_title || "분할 방식 선택",
                    desc:
                      dict?.split_pdf?.step2_desc ||
                      "Split every page into separate files, or define custom page ranges.",
                    icon: Scissors,
                  },
                  {
                    step: 3,
                    title: dict?.split_pdf?.step3_title || "Download Files",
                    desc:
                      dict?.split_pdf?.step3_desc ||
                      "Click 'Split PDF' and download each resulting file individually.",
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
                  {dict?.split_pdf?.tips_title || "PDF Split Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {dict?.split_pdf?.tips_desc ||
                    "Get the best results when splitting PDF files."}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: dict?.split_pdf?.tip1_title || "100% Private",
                    desc:
                      dict?.split_pdf?.tip1_desc ||
                      "모든 처리는 pdf-lib를 이용해 브라우저 안에서 이뤄집니다. 파일이 기기를 벗어나지 않습니다.",
                    icon: Shield,
                  },
                  {
                    title: dict?.split_pdf?.tip2_title || "Flexible Splitting",
                    desc:
                      dict?.split_pdf?.tip2_desc ||
                      "Split every page individually, or define custom ranges like '1-3, 4-6, 7-10' for precise control.",
                    icon: Layers,
                  },
                  {
                    title: dict?.split_pdf?.tip3_title || "즉시 처리",
                    desc:
                      dict?.split_pdf?.tip3_desc ||
                      "Splitting is processed instantly without re-encoding. Quality remains unchanged.",
                    icon: Zap,
                  },
                  {
                    title: dict?.split_pdf?.tip4_title || "원본 보존",
                    desc:
                      dict?.split_pdf?.tip4_desc ||
                      "Your original PDF file remains untouched. Only new split files are created for download.",
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
                  {dict?.split_pdf?.faq_title || "Split PDF FAQ"}
                </h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                  {dict?.split_pdf?.faq_desc ||
                    "Common questions about splitting PDF files."}
                </p>
              </div>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>
                      {dict?.split_pdf?.faq_1_q || "Is it free to split a PDF?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.split_pdf?.faq_1_a ||
                        "Yes, this tool is 100% free to use. There are no hidden fees, watermarks, or usage limits."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>
                      {dict?.split_pdf?.faq_2_q || "Is my PDF secure?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.split_pdf?.faq_2_a ||
                        "Absolutely. All processing happens entirely in your browser using pdf-lib. Your PDF files never leave your device and are never uploaded to any server."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>
                      {dict?.split_pdf?.faq_3_q ||
                        "How do I define custom page ranges?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.split_pdf?.faq_3_a ||
                        "Enter ranges separated by commas. For example, &quot;1-3, 4-6, 7-10&quot; creates three files: one with pages 1-3, one with pages 4-6, and one with pages 7-10. You can also specify individual pages like &quot;1, 3, 5&quot;."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-4">
                    <AccordionTrigger>
                      {dict?.split_pdf?.faq_4_q ||
                        "What is the file size limit?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.split_pdf?.faq_4_a ||
                        "The maximum file size is 50MB. Larger files may cause performance issues depending on your browser and device capabilities."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-5">
                    <AccordionTrigger>
                      {dict?.split_pdf?.faq_5_q ||
                        "Can I download all split files at once?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.split_pdf?.faq_5_a ||
                        "Currently, each file must be downloaded individually using its download button. This gives you control over which files to save. For a large number of files, consider using custom ranges to reduce the total."}
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
