"use client";

import { useState, useRef } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

type ColorOption = "black" | "red" | "blue" | "green" | "gray";

const COLOR_MAP: Record<
  ColorOption,
  { r: number; g: number; b: number; label: string; cssClass: string }
> = {
  black: { r: 0, g: 0, b: 0, label: "Black", cssClass: "bg-black" },
  red: { r: 1, g: 0, b: 0, label: "Red", cssClass: "bg-red-600" },
  blue: { r: 0, g: 0, b: 1, label: "Blue", cssClass: "bg-blue-600" },
  green: { r: 0, g: 0.5, b: 0, label: "Green", cssClass: "bg-green-600" },
  gray: { r: 0.5, g: 0.5, b: 0.5, label: "Gray", cssClass: "bg-gray-400" },
};

export function AddTextToPdfClient({ dict }: { dict?: any }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);

  const [text, setText] = useState("");
  const [selectedPage, setSelectedPage] = useState(1);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(700);
  const [fontSize, setFontSize] = useState(14);
  const [textColor, setTextColor] = useState<ColorOption>("black");

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
      setSelectedPage(1);
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

  const applyText = async () => {
    if (!pdfFile || !text.trim()) return;

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
      const font = await pdf.embedFont(StandardFonts.Helvetica);

      setProgress(30);

      const pageIndex = selectedPage - 1;
      if (pageIndex < 0 || pageIndex >= pdf.getPageCount()) {
        setError(
          `Page ${selectedPage} does not exist. The PDF has ${pdf.getPageCount()} pages.`,
        );
        setIsProcessing(false);
        return;
      }

      const page = pdf.getPage(pageIndex);
      const color = COLOR_MAP[textColor];

      const lines = text.split("\n");
      const lineHeight = fontSize * 1.2;

      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i], {
          x: posX,
          y: posY - i * lineHeight,
          size: fontSize,
          font,
          color: rgb(color.r, color.g, color.b),
        });
      }

      setProgress(70);

      const savedBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(savedBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setResultUrl(url);
      setResultSize((blob.size / (1024 * 1024)).toFixed(2));
    } catch {
      setError(
        "Failed to add text to PDF. The file may be corrupted or unsupported.",
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
    link.download = `${baseName}_text_added.pdf`;
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
    setText("");
    setSelectedPage(1);
    setPosX(50);
    setPosY(700);
    setFontSize(14);
    setTextColor("black");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 mb-6">
              <Type className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {dict?.add_text_to_pdf?.title || "텍스트 추가 to PDF"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {dict?.add_text_to_pdf?.subtitle ||
                "Add custom text to any page of your PDF. Choose the page, position, font size, and color. 100% private — processed in your browser."}
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
                  {dict?.add_text_to_pdf?.drop_zone ||
                    "여기에 PDF 파일을 끌어다 놓으세요"}
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

                {/* Text settings */}
                <div className="p-6 bg-muted/30 rounded-lg border border-muted space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      넣을 텍스트
                    </label>
                    <Textarea
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value);
                        setResultUrl(null);
                        setResultSize(null);
                      }}
                      placeholder="PDF에 넣을 텍스트를 입력하세요…"
                      rows={3}
                      maxLength={2000}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Page (1-{pageCount})
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={pageCount}
                        value={selectedPage}
                        onChange={(e) => {
                          setSelectedPage(
                            Math.min(
                              pageCount,
                              Math.max(1, Number(e.target.value)),
                            ),
                          );
                          setResultUrl(null);
                          setResultSize(null);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        X Position (pts)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={posX}
                        onChange={(e) => {
                          setPosX(Math.max(0, Number(e.target.value)));
                          setResultUrl(null);
                          setResultSize(null);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Y Position (pts)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={posY}
                        onChange={(e) => {
                          setPosY(Math.max(0, Number(e.target.value)));
                          setResultUrl(null);
                          setResultSize(null);
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        글자 크기 (8~72)
                      </label>
                      <Input
                        type="number"
                        min={8}
                        max={72}
                        value={fontSize}
                        onChange={(e) => {
                          setFontSize(
                            Math.min(72, Math.max(8, Number(e.target.value))),
                          );
                          setResultUrl(null);
                          setResultSize(null);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        색상
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        {(Object.keys(COLOR_MAP) as ColorOption[]).map((c) => (
                          <button
                            key={c}
                            onClick={() => {
                              setTextColor(c);
                              setResultUrl(null);
                              setResultSize(null);
                            }}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${COLOR_MAP[c].cssClass} ${textColor === c ? "border-red-600 ring-2 ring-red-300 scale-110" : "border-transparent hover:scale-105"}`}
                            title={COLOR_MAP[c].label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    팁: PDF 좌표는 왼쪽 아래에서 시작합니다. Y=0이 페이지의 맨 아래이며, A4는 595x842 포인트입니다.
                  </p>
                </div>

                {/* Apply button */}
                {!resultUrl && (
                  <div className="flex justify-center pt-4">
                    <Button
                      size="lg"
                      onClick={applyText}
                      disabled={isProcessing || !text.trim()}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Adding... {progress}%
                        </>
                      ) : (
                        <>
                          <Type className="w-5 h-5 mr-2" />
                          {dict?.add_text_to_pdf?.title || "텍스트 추가 to PDF"}
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
                      Text added successfully! &middot; {resultSize} MB
                    </div>
                    <Button
                      size="lg"
                      onClick={handleDownload}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {dict?.add_text_to_pdf?.action_btn || "Download PDF"}
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
                  {dict?.add_text_to_pdf?.guide_title ||
                    "How to 텍스트 추가 to a PDF"}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {dict?.add_text_to_pdf?.guide_desc ||
                    "Add text to your PDF in 3 simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: dict?.add_text_to_pdf?.step1_title || "PDF 업로드",
                    desc:
                      dict?.add_text_to_pdf?.step1_desc ||
                      "PDF 파일을 끌어다 놓거나 클릭해서 선택하세요.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: dict?.add_text_to_pdf?.step2_title || "Enter Text",
                    desc:
                      dict?.add_text_to_pdf?.step2_desc ||
                      "Type your text, choose the page, position, font size, and color.",
                    icon: Type,
                  },
                  {
                    step: 3,
                    title: dict?.add_text_to_pdf?.step3_title || "Download",
                    desc:
                      dict?.add_text_to_pdf?.step3_desc ||
                      "Click '텍스트 추가 to PDF' and download your modified PDF file.",
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
                  {dict?.add_text_to_pdf?.tips_title || "Text Adding Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {dict?.add_text_to_pdf?.tips_desc ||
                    "Get the best results when adding text to PDFs."}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: dict?.add_text_to_pdf?.tip1_title || "100% Private",
                    desc:
                      dict?.add_text_to_pdf?.tip1_desc ||
                      "모든 처리는 pdf-lib를 이용해 브라우저 안에서 이뤄집니다. 파일이 기기를 벗어나지 않습니다.",
                    icon: Shield,
                  },
                  {
                    title:
                      dict?.add_text_to_pdf?.tip2_title ||
                      "Precise Positioning",
                    desc:
                      dict?.add_text_to_pdf?.tip2_desc ||
                      "Use X and Y coordinates in PDF points for exact text placement. The origin is at the bottom-left corner.",
                    icon: Eye,
                  },
                  {
                    title:
                      dict?.add_text_to_pdf?.tip3_title || "Multiple Colors",
                    desc:
                      dict?.add_text_to_pdf?.tip3_desc ||
                      "Choose from black, red, blue, green, or gray to match your document style.",
                    icon: Zap,
                  },
                  {
                    title:
                      dict?.add_text_to_pdf?.tip4_title || "원본 보존",
                    desc:
                      dict?.add_text_to_pdf?.tip4_desc ||
                      "Your original PDF file remains untouched. Only a new modified file is created for download.",
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
                  {dict?.add_text_to_pdf?.faq_title || "텍스트 추가 to PDF FAQ"}
                </h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                  {dict?.add_text_to_pdf?.faq_desc ||
                    "Common questions about adding text to PDFs."}
                </p>
              </div>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>
                      {dict?.add_text_to_pdf?.faq_1_q ||
                        "Is it free to add text to PDFs?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.add_text_to_pdf?.faq_1_a ||
                        "Yes, this tool is 100% free. There are no hidden fees, watermarks, or usage limits."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>
                      {dict?.add_text_to_pdf?.faq_2_q ||
                        "What font is used for the text?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.add_text_to_pdf?.faq_2_a ||
                        "Text is rendered using Helvetica, a standard PDF font that displays consistently across all PDF viewers. The font size is adjustable between 8 and 72 points."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>
                      {dict?.add_text_to_pdf?.faq_3_q ||
                        "Can I add text to multiple pages at once?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.add_text_to_pdf?.faq_3_a ||
                        "Currently, text is added to one page at a time. You can process the PDF multiple times to add text to different pages, or use the watermark tool for text on all pages."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-4">
                    <AccordionTrigger>
                      {dict?.add_text_to_pdf?.faq_4_q ||
                        "How do I know the right X and Y coordinates?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.add_text_to_pdf?.faq_4_a ||
                        "PDF coordinates start from the bottom-left corner. For an A4 page (595x842 points), x=50 y=700 places text near the top-left. Try different values and preview the result to fine-tune placement."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-5">
                    <AccordionTrigger>
                      {dict?.add_text_to_pdf?.faq_5_q ||
                        "What is the file size limit?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.add_text_to_pdf?.faq_5_a ||
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
