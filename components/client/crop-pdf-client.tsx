"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
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
  Crop,
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

export function CropPdfClient({ dict }: { dict?: any }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);

  const [marginTop, setMarginTop] = useState(0);
  const [marginBottom, setMarginBottom] = useState(0);
  const [marginLeft, setMarginLeft] = useState(0);
  const [marginRight, setMarginRight] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPdf = async (file: File) => {
    setError(null);
    setResultUrl(null);
    setResultSize(null);

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

  const applyCrop = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    setResultSize(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });
      const totalPages = pdf.getPageCount();

      for (let i = 0; i < totalPages; i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();

        const cropX = marginLeft;
        const cropY = marginBottom;
        const cropWidth = width - marginLeft - marginRight;
        const cropHeight = height - marginTop - marginBottom;

        if (cropWidth <= 0 || cropHeight <= 0) {
          setError(
            `Margins are too large for page ${i + 1}. The crop area must be greater than zero.`,
          );
          setIsProcessing(false);
          return;
        }

        page.setCropBox(cropX, cropY, cropWidth, cropHeight);
        setProgress(Math.round(((i + 1) / totalPages) * 100));
      }

      const croppedBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(croppedBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setResultSize((blob.size / (1024 * 1024)).toFixed(2));
    } catch {
      setError("PDF를 자르지 못했습니다. 파일이 손상되었거나 지원되지 않는 형식일 수 있습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const baseName = pdfName.replace(/\.pdf$/i, "") || "document";
    link.download = `${baseName}_cropped.pdf`;
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
    setMarginTop(0);
    setMarginBottom(0);
    setMarginLeft(0);
    setMarginRight(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasMargins =
    marginTop > 0 || marginBottom > 0 || marginLeft > 0 || marginRight > 0;

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 mb-6">
              <Crop className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {dict?.crop_pdf?.title || "Crop PDF"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {dict?.crop_pdf?.subtitle ||
                "Adjust margins and crop all pages of your PDF. Set custom top, bottom, left, and right margins in points. 100% private — processed in your browser."}
            </p>

            <Adsense slotId="7759160077" />

            {!pdfFile && (
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
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {dict?.crop_pdf?.drop_zone || "여기에 PDF 파일을 끌어다 놓으세요"}
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

            {pdfFile && (
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

                {/* Margin inputs */}
                <div className="p-6 bg-muted/30 rounded-lg border border-muted space-y-4">
                  <h3 className="font-semibold text-sm mb-3">
                    자를 여백 (포인트 단위, 1인치 = 72포인트)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Top
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={marginTop}
                        onChange={(e) => {
                          setMarginTop(Math.max(0, Number(e.target.value)));
                          setResultUrl(null);
                          setResultSize(null);
                        }}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Bottom
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={marginBottom}
                        onChange={(e) => {
                          setMarginBottom(Math.max(0, Number(e.target.value)));
                          setResultUrl(null);
                          setResultSize(null);
                        }}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Left
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={marginLeft}
                        onChange={(e) => {
                          setMarginLeft(Math.max(0, Number(e.target.value)));
                          setResultUrl(null);
                          setResultSize(null);
                        }}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Right
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={marginRight}
                        onChange={(e) => {
                          setMarginRight(Math.max(0, Number(e.target.value)));
                          setResultUrl(null);
                          setResultSize(null);
                        }}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    팁: A4 용지는 595 x 842 포인트, Letter는 612 x 792 포인트입니다.
                  </p>
                </div>

                {/* Apply button */}
                {!resultUrl && (
                  <div className="flex justify-center pt-4">
                    <Button
                      size="lg"
                      onClick={applyCrop}
                      disabled={isProcessing || !hasMargins}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Cropping... {progress}%
                        </>
                      ) : (
                        <>
                          <Crop className="w-5 h-5 mr-2" />
                          {dict?.crop_pdf?.title || "Crop PDF"}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {!hasMargins && !resultUrl && (
                  <p className="text-center text-sm text-muted-foreground">
                    PDF를 자르려면 여백 값을 하나 이상 입력하세요.
                  </p>
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
                      Cropped successfully! {pageCount} pages &middot;{" "}
                      {resultSize} MB
                    </div>
                    <Button
                      size="lg"
                      onClick={handleDownload}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {dict?.crop_pdf?.download_btn || "Download Cropped PDF"}
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
                  {dict?.crop_pdf?.guide_title || "How to Crop a PDF"}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {dict?.crop_pdf?.guide_desc ||
                    "Crop your PDF pages in 3 simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: dict?.crop_pdf?.step1_title || "PDF 업로드",
                    desc:
                      dict?.crop_pdf?.step1_desc ||
                      "PDF 파일을 끌어다 놓거나 클릭해서 선택하세요.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: dict?.crop_pdf?.step2_title || "Set Margins",
                    desc:
                      dict?.crop_pdf?.step2_desc ||
                      "Enter crop margin values for top, bottom, left, and right in points.",
                    icon: Crop,
                  },
                  {
                    step: 3,
                    title: dict?.crop_pdf?.step3_title || "Download",
                    desc:
                      dict?.crop_pdf?.step3_desc ||
                      "Click 'Crop PDF' and download your cropped PDF file.",
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
                  {dict?.crop_pdf?.tips_title || "PDF Cropping Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {dict?.crop_pdf?.tips_desc ||
                    "Get the best results when cropping PDF pages."}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: dict?.crop_pdf?.tip1_title || "100% Private",
                    desc:
                      dict?.crop_pdf?.tip1_desc ||
                      "모든 처리는 pdf-lib를 이용해 브라우저 안에서 이뤄집니다. 파일이 기기를 벗어나지 않습니다.",
                    icon: Shield,
                  },
                  {
                    title: dict?.crop_pdf?.tip2_title || "Uniform Crop",
                    desc:
                      dict?.crop_pdf?.tip2_desc ||
                      "The same margins are applied to all pages, ensuring consistent cropping across the document.",
                    icon: Eye,
                  },
                  {
                    title: dict?.crop_pdf?.tip3_title || "Points Unit",
                    desc:
                      dict?.crop_pdf?.tip3_desc ||
                      "Margins are in PDF points (1 inch = 72 points). Use this for precise control over your crop area.",
                    icon: Zap,
                  },
                  {
                    title: dict?.crop_pdf?.tip4_title || "원본 보존",
                    desc:
                      dict?.crop_pdf?.tip4_desc ||
                      "Your original PDF file remains untouched. Only a new cropped file is created for download.",
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
                  {dict?.crop_pdf?.faq_title || "Crop PDF FAQ"}
                </h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                  {dict?.crop_pdf?.faq_desc ||
                    "Common questions about cropping PDF pages."}
                </p>
              </div>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>
                      {dict?.crop_pdf?.faq_1_q || "Is it free to crop PDFs?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.crop_pdf?.faq_1_a ||
                        "Yes, this PDF cropping tool is 100% free. There are no hidden fees, watermarks, or usage limits."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>
                      {dict?.crop_pdf?.faq_2_q ||
                        "What unit are the margin values in?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.crop_pdf?.faq_2_a ||
                        "Margin values are in PDF points. One inch equals 72 points, and one centimeter equals approximately 28.35 points. A standard A4 page is 595 x 842 points."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>
                      {dict?.crop_pdf?.faq_3_q ||
                        "Does cropping remove content outside the crop area?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.crop_pdf?.faq_3_a ||
                        "Cropping sets a crop box that hides content outside the defined area. The original content is still in the PDF but won&apos;t be visible in most PDF viewers or when printed."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-4">
                    <AccordionTrigger>
                      {dict?.crop_pdf?.faq_4_q ||
                        "Can I crop each page differently?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.crop_pdf?.faq_4_a ||
                        "Currently, the same crop margins are applied to all pages uniformly. For per-page cropping, you may need a more advanced PDF editor."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-5">
                    <AccordionTrigger>
                      {dict?.crop_pdf?.faq_5_q ||
                        "What is the file size limit?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.crop_pdf?.faq_5_a ||
                        "The maximum file size is 50MB. Since all processing happens in your browser, very large files may take longer depending on your device&apos;s capabilities."}
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
