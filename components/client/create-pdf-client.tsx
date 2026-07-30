"use client";

import { useState, useRef } from "react";
import { PDFDocument, PageSizes, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { Button } from "@/components/ui/button";
import {
  FilePlus,
  Download,
  Loader2,
  RotateCcw,
  Lightbulb,
  Shield,
  Zap,
  FileText,
  Plus,
  Trash2,
  Upload,
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

type PageSize = "A4" | "Letter" | "Legal";

interface PageEntry {
  id: string;
  text: string;
}

const PAGE_SIZE_MAP: Record<PageSize, readonly [number, number]> = {
  A4: PageSizes.A4,
  Letter: PageSizes.Letter,
  Legal: PageSizes.Legal,
};

const PAGE_SIZE_LABELS: Record<PageSize, string> = {
  A4: "A4 (210 x 297 mm)",
  Letter: "Letter (8.5 x 11 in)",
  Legal: "Legal (8.5 x 14 in)",
};

export function CreatePdfClient({ dict }: { dict?: any }) {
  const [pages, setPages] = useState<PageEntry[]>([
    { id: crypto.randomUUID(), text: "" },
  ]);
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [fontSize, setFontSize] = useState(14);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);

  const resultRef = useRef<string | null>(null);

  const addPage = () => {
    setPages((prev) => [...prev, { id: crypto.randomUUID(), text: "" }]);
    setResultUrl(null);
  };

  const removePage = (id: string) => {
    if (pages.length <= 1) return;
    setPages((prev) => prev.filter((p) => p.id !== id));
    setResultUrl(null);
  };

  const updatePageText = (id: string, text: string) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, text } : p)));
    setResultUrl(null);
  };

  const wrapText = (
    text: string,
    maxWidth: number,
    size: number,
    font: { widthOfTextAtSize: (t: string, s: number) => number },
  ): string[] => {
    const lines: string[] = [];
    for (const paragraph of text.split("\n")) {
      if (paragraph.length === 0) {
        lines.push("");
        continue;
      }
      let remaining = paragraph;
      while (remaining.length > 0) {
        if (font.widthOfTextAtSize(remaining, size) <= maxWidth) {
          lines.push(remaining);
          break;
        }
        let lo = 1,
          hi = remaining.length - 1,
          fit = 1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          if (
            font.widthOfTextAtSize(remaining.slice(0, mid), size) <= maxWidth
          ) {
            fit = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
        const spaceIdx = remaining.lastIndexOf(" ", fit);
        const breakPoint = spaceIdx > 0 ? spaceIdx : fit;
        lines.push(remaining.slice(0, breakPoint));
        remaining = remaining.slice(breakPoint).trimStart();
      }
    }
    return lines;
  };

  const generatePdf = async () => {
    const hasContent = pages.some((p) => p.text.trim().length > 0);
    if (!hasContent) {
      setError("최소 한 페이지에는 텍스트를 입력해 주세요.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    if (resultRef.current) {
      URL.revokeObjectURL(resultRef.current);
      resultRef.current = null;
    }
    setResultUrl(null);
    setResultSize(null);

    try {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const fontUrl = "/fonts/NotoSansKR-Regular.ttf";
      const fontResponse = await fetch(fontUrl);
      if (!fontResponse.ok) throw new Error("글꼴을 불러오지 못했습니다");
      const fontBytes = await fontResponse.arrayBuffer();
      const font = await pdfDoc.embedFont(fontBytes);
      const [pageWidth, pageHeight] = PAGE_SIZE_MAP[pageSize];
      const margin = 50;
      const usableWidth = pageWidth - margin * 2;
      const lineHeight = fontSize * 1.4;
      const linesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);

      for (let i = 0; i < pages.length; i++) {
        const allLines = wrapText(pages[i].text, usableWidth, fontSize, font);
        let lineIdx = 0;
        while (
          lineIdx < allLines.length ||
          (lineIdx === 0 && allLines.length === 0)
        ) {
          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          const chunk = allLines.slice(lineIdx, lineIdx + linesPerPage);
          for (let j = 0; j < chunk.length; j++) {
            page.drawText(chunk[j], {
              x: margin,
              y: pageHeight - margin - j * lineHeight,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
            });
          }
          lineIdx += linesPerPage;
          if (allLines.length === 0) break;
        }
        setProgress(Math.round(((i + 1) / pages.length) * 100));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      resultRef.current = url;
      setResultUrl(url);
      setResultSize((blob.size / (1024 * 1024)).toFixed(2));
    } catch {
      setError(
        "Failed to generate PDF. Please check your input and try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "created_document.pdf";
    link.click();
  };

  const handleReset = () => {
    if (resultRef.current) {
      URL.revokeObjectURL(resultRef.current);
      resultRef.current = null;
    }
    setPages([{ id: crypto.randomUUID(), text: "" }]);
    setPageSize("A4");
    setFontSize(14);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    setResultSize(null);
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex w-full flex-col">
            <div className="hidden">
              <FilePlus className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
              {dict?.create_pdf?.title || "Create PDF"}
            </h1>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              {dict?.create_pdf?.subtitle ||
                "Create a new PDF document from text. Add multiple pages, choose page size and font size. 100% private — processed in your browser."}
            </p>

            <Adsense slotId="7759160077" />

            <div className="w-full max-w-2xl space-y-2">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    페이지 크기
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(e.target.value as PageSize);
                      setResultUrl(null);
                    }}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    {(Object.keys(PAGE_SIZE_LABELS) as PageSize[]).map(
                      (key) => (
                        <option key={key} value={key}>
                          {PAGE_SIZE_LABELS[key]}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div className="w-full sm:w-40">
                  <label className="block text-sm font-medium mb-2">
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min={12}
                    max={48}
                    step={1}
                    value={fontSize}
                    onChange={(e) => {
                      setFontSize(Number(e.target.value));
                      setResultUrl(null);
                    }}
                    className="w-full accent-red-600"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>12</span>
                    <span>48</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Pages ({pages.length})
                  </h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={addPage}>
                      <Plus className="w-4 h-4 mr-1" />
                      페이지 추가
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      {dict?.create_pdf?.another_btn || "Reset"}
                    </Button>
                  </div>
                </div>
                {pages.map((page, idx) => (
                  <div
                    key={page.id}
                    className="space-y-2 p-4 bg-muted/30 rounded-lg border border-muted"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-medium">
                          Page {idx + 1}
                        </span>
                      </div>
                      {pages.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                          onClick={() => removePage(page.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <textarea
                      value={page.text}
                      onChange={(e) => updatePageText(page.id, e.target.value)}
                      placeholder={`${idx + 1}쪽에 넣을 텍스트를 입력하세요…`}
                      rows={6}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 resize-y min-h-[120px]"
                    />
                  </div>
                ))}
              </div>

              {error && (
                <div className="w-full p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              {!resultUrl && (
                <div className="flex justify-center pt-4">
                  <Button
                    size="lg"
                    onClick={generatePdf}
                    disabled={isProcessing}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating... {progress}%
                      </>
                    ) : (
                      <>
                        <FilePlus className="w-5 h-5 mr-2" />
                        PDF 만들기
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
                    PDF generated successfully! {pages.length} page
                    {pages.length !== 1 ? "s" : ""} &middot; {resultSize} MB
                  </div>
                  <Button
                    size="lg"
                    onClick={handleDownload}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {dict?.create_pdf?.download_btn || "Download PDF"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="w-full max-w-6xl mx-auto mt-3 px-4 space-y-3">
            <section>
              <div className="mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  {dict?.create_pdf?.guide_title || "How to Create a PDF"}
                </h2>
                <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
                  {dict?.create_pdf?.guide_desc ||
                    "Create a professional PDF document from text in 3 simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-2">
                {[
                  {
                    step: 1,
                    title: dict?.create_pdf?.step1_title || "텍스트 입력",
                    desc:
                      dict?.create_pdf?.step1_desc ||
                      "Type or paste your text into the editor. Add multiple pages as needed using the 'Add Page' button.",
                    icon: FileText,
                  },
                  {
                    step: 2,
                    title:
                      dict?.create_pdf?.step2_title || "Customize Settings",
                    desc:
                      dict?.create_pdf?.step2_desc ||
                      "Choose your preferred page size (A4, Letter, Legal) and adjust the font size from 12px to 48px.",
                    icon: FilePlus,
                  },
                  {
                    step: 3,
                    title:
                      dict?.create_pdf?.step3_title || "Generate & Download",
                    desc:
                      dict?.create_pdf?.step3_desc ||
                      "Click 'Generate PDF' and download your professionally formatted document.",
                    icon: Download,
                  },
                ].map((s) => (
                  <Card
                    key={s.step}
                    className="border-red-200 dark:border-red-900/50"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white font-bold">
                          {s.step}
                        </div>
                        <CardTitle className="text-xl">{s.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {s.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-2">
                <div className="hidden">
                  <Lightbulb className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  {dict?.create_pdf?.tips_title || "PDF Creation Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {dict?.create_pdf?.tips_desc ||
                    "Get the best results when creating PDF documents."}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                {[
                  {
                    title: dict?.create_pdf?.tip1_title || "100% Private",
                    desc:
                      dict?.create_pdf?.tip1_desc ||
                      "All processing happens in your browser using pdf-lib. Your text never leaves your device.",
                    icon: Shield,
                  },
                  {
                    title: dict?.create_pdf?.tip2_title || "Multi-Page Support",
                    desc:
                      dict?.create_pdf?.tip2_desc ||
                      "Add as many pages as you need. Each page has its own text editor for easy content management.",
                    icon: FileText,
                  },
                  {
                    title:
                      dict?.create_pdf?.tip3_title || "Flexible Formatting",
                    desc:
                      dict?.create_pdf?.tip3_desc ||
                      "Choose from A4, Letter, or Legal page sizes. Adjust font size from 12px to 48px for optimal readability.",
                    icon: Zap,
                  },
                  {
                    title:
                      dict?.create_pdf?.tip4_title || "Automatic Text Wrapping",
                    desc:
                      dict?.create_pdf?.tip4_desc ||
                      "Long lines are automatically wrapped to fit the page. Line breaks in your text are preserved.",
                    icon: Upload,
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
              <div className="mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  {dict?.create_pdf?.faq_title || "Create PDF FAQ"}
                </h2>
                <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
                  {dict?.create_pdf?.faq_desc ||
                    "Common questions about creating PDF documents."}
                </p>
              </div>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>
                      {dict?.create_pdf?.faq_1_q ||
                        "Is it free to create PDFs?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.create_pdf?.faq_1_a ||
                        "Yes, this PDF creation tool is 100% free. There are no hidden fees, watermarks, or limitations on the number of pages you can create."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>
                      {dict?.create_pdf?.faq_2_q || "Is my text secure?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.create_pdf?.faq_2_a ||
                        "Absolutely. All processing happens entirely in your browser using pdf-lib. Your text never leaves your device and is never uploaded to any server."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>
                      {dict?.create_pdf?.faq_3_q || "What fonts are supported?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.create_pdf?.faq_3_a ||
                        "Currently, the tool uses Helvetica, a clean and widely compatible sans-serif font. This ensures your PDF looks great on any device or PDF reader."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-4">
                    <AccordionTrigger>
                      {dict?.create_pdf?.faq_4_q ||
                        "Can I create multi-page documents?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.create_pdf?.faq_4_a ||
                        "Yes, you can add as many pages as you need. Each page has its own text editor. Long text on a single page is automatically split across multiple PDF pages."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-5">
                    <AccordionTrigger>
                      {dict?.create_pdf?.faq_5_q ||
                        "What page sizes are available?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.create_pdf?.faq_5_a ||
                        "You can choose from three standard page sizes: A4 (210 x 297 mm, international standard), Letter (8.5 x 11 inches, US standard), and Legal (8.5 x 14 inches)."}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>
          </div>
        </div>
        <aside className="hidden shrink-0 xl:block xl:w-[200px]">
          <ToolsSidebar category="pdf" dict={dict} />
        </aside>
      </div>
    </div>
  );
}
