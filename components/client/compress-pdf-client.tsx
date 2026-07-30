"use client";

import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileText,
  RotateCcw,
  Lightbulb,
  Loader2,
  Shield,
  Gauge,
  Zap,
  FileDown,
  Minimize2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

interface QualityPreset {
  id: "high" | "medium" | "low";
  label: string;
  dpi: number;
  jpegQuality: number;
  hint: string;
}

const QUALITY_PRESETS: QualityPreset[] = [
  {
    id: "high",
    label: "High",
    dpi: 150,
    jpegQuality: 0.8,
    hint: "Sharpest output, moderate size reduction",
  },
  {
    id: "medium",
    label: "Medium",
    dpi: 110,
    jpegQuality: 0.65,
    hint: "Balanced quality and size — best for most files",
  },
  {
    id: "low",
    label: "Low",
    dpi: 72,
    jpegQuality: 0.5,
    hint: "Smallest file, softer pages — great for web sharing",
  },
];

const PDF_POINTS_PER_INCH = 72;
const MAX_FILE_BYTES = 50 * 1024 * 1024;

async function loadPdfJs() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.mjs";
  return pdfjsLib;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

interface CompressResult {
  url: string;
  size: number;
  fileName: string;
}

export function CompressPdfClient({ dict }: { dict?: any }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);
  const [quality, setQuality] = useState<QualityPreset["id"]>("medium");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetOutput = () => {
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
  };

  const loadPdf = async (file: File) => {
    setError(null);
    resetOutput();

    if (file.type !== "application/pdf") {
      setError(`"${file.name}" is not a PDF file. Only PDF files are accepted.`);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(`"${file.name}" exceeds the 50MB file size limit.`);
      return;
    }

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;
      setPdfFile(file);
      setPdfName(file.name);
      setPageCount(pdf.numPages);
      setOriginalSize(file.size);
    } catch {
      setError(
        `"${file.name}" could not be read. It may be corrupted or password-protected.`,
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) loadPdf(e.target.files[0]);
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
    if (e.dataTransfer.files.length > 0) loadPdf(e.dataTransfer.files[0]);
  };

  const compressPdf = async () => {
    if (!pdfFile) return;

    const preset =
      QUALITY_PRESETS.find((p) => p.id === quality) ?? QUALITY_PRESETS[1];
    const renderScale = preset.dpi / PDF_POINTS_PER_INCH;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    resetOutput();

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;

      let doc: jsPDF | null = null;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        // Base viewport (scale 1) is expressed in PDF points (72 DPI),
        // which we reuse as the output page size to preserve dimensions.
        const baseViewport = page.getViewport({ scale: 1 });
        const pageWidthPt = baseViewport.width;
        const pageHeightPt = baseViewport.height;
        const orientation = pageWidthPt > pageHeightPt ? "landscape" : "portrait";

        const renderViewport = page.getViewport({ scale: renderScale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(renderViewport.width));
        canvas.height = Math.max(1, Math.floor(renderViewport.height));
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("캔버스를 사용할 수 없습니다");

        // JPEG has no alpha channel — paint a white background first.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvas,
          canvasContext: ctx,
          viewport: renderViewport,
        }).promise;

        const jpegDataUrl = canvas.toDataURL("image/jpeg", preset.jpegQuality);

        if (!doc) {
          doc = new jsPDF({
            unit: "pt",
            format: [pageWidthPt, pageHeightPt],
            orientation,
          });
        } else {
          doc.addPage([pageWidthPt, pageHeightPt], orientation);
        }

        doc.addImage(
          jpegDataUrl,
          "JPEG",
          0,
          0,
          pageWidthPt,
          pageHeightPt,
          undefined,
          "FAST",
        );

        // Free per-page canvas memory before the next iteration.
        canvas.width = 0;
        canvas.height = 0;

        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      if (!doc) throw new Error("표시할 페이지가 없습니다");

      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const baseName = pdfName.replace(/\.pdf$/i, "") || "document";

      setResult({
        url,
        size: blob.size,
        fileName: `${baseName}_compressed.pdf`,
      });
    } catch {
      setError(
        "Failed to compress this PDF. It may be corrupted, encrypted, or password-protected.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.url;
    link.download = result.fileName;
    link.click();
  };

  const handleReset = () => {
    resetOutput();
    setPdfFile(null);
    setPdfName("");
    setPageCount(0);
    setOriginalSize(0);
    setQuality("medium");
    setIsDragging(false);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const savedBytes = result ? originalSize - result.size : 0;
  const savedPercent =
    result && originalSize > 0
      ? Math.round((savedBytes / originalSize) * 100)
      : 0;
  const isSmaller = savedBytes > 0;

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex w-full flex-col">
            <div className="hidden">
              <Minimize2 className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
              {dict?.compress_pdf?.title || "PDF 압축"}
            </h1>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              {dict?.compress_pdf?.subtitle ||
                "품질 설정을 조절해 PDF 용량을 줄이세요. 내려받기 전에 얼마나 줄었는지 정확히 확인할 수 있습니다. 100% 비공개로 브라우저에서 처리됩니다."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Drop zone */}
            {!pdfFile && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300",
                  isDragging
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-muted-foreground/30 hover:border-red-500/50 hover:bg-red-50/50 dark:hover:bg-red-900/10",
                )}
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
                  {dict?.compress_pdf?.drop_zone ||
                    "여기에 PDF 파일을 끌어다 놓으세요"}
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF 파일만 올릴 수 있습니다. 파일당 최대 50MB입니다.
                </p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="w-full max-w-2xl mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Options + action */}
            {pdfFile && !result && (
              <div className="w-full max-w-2xl mt-2 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground truncate">
                    <span title={pdfName}>{pdfName}</span> &middot; {pageCount}{" "}
                    page{pageCount !== 1 ? "s" : ""} &middot;{" "}
                    {formatBytes(originalSize)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={isProcessing}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border border-muted space-y-3">
                  <span className="text-sm font-medium">압축 품질</span>
                  <div className="grid grid-cols-3 gap-2">
                    {QUALITY_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setQuality(preset.id)}
                        disabled={isProcessing}
                        className={cn(
                          "rounded-lg border p-3 text-center transition-all disabled:opacity-50",
                          quality === preset.id
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500"
                            : "border-muted hover:border-red-500/50",
                        )}
                      >
                        <div className="font-semibold text-sm">
                          {preset.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          ~{preset.dpi} DPI
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {QUALITY_PRESETS.find((p) => p.id === quality)?.hint}
                  </p>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    압축된 페이지는 이미지로 바뀌므로 글자를 선택하거나 검색할 수 없게 됩니다.
                  </span>
                </div>

                <div className="flex justify-center pt-2">
                  <Button
                    size="lg"
                    onClick={compressPdf}
                    disabled={isProcessing}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Compressing... {progress}%
                      </>
                    ) : (
                      <>
                        <Minimize2 className="w-5 h-5 mr-2" />
                        {dict?.compress_pdf?.action_btn || "PDF 압축"}
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

            {/* Result */}
            {result && (
              <div className="w-full max-w-2xl mt-2 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-muted bg-muted/30 p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      Original
                    </div>
                    <div className="font-semibold">
                      {formatBytes(originalSize)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-muted bg-muted/30 p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      Compressed
                    </div>
                    <div className="font-semibold">
                      {formatBytes(result.size)}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg border p-4 text-center",
                      isSmaller
                        ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                        : "border-muted bg-muted/30",
                    )}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      Saved
                    </div>
                    <div
                      className={cn(
                        "font-semibold",
                        isSmaller && "text-green-600 dark:text-green-400",
                      )}
                    >
                      {isSmaller ? `${savedPercent}%` : "0%"}
                    </div>
                  </div>
                </div>

                {!isSmaller && (
                  <p className="text-center text-sm text-muted-foreground">
                    이 PDF는 이미 충분히 최적화되어 있습니다. 용량을 더 줄이려면 '낮음' 설정을 쓰거나 원본을 그대로 두세요.
                  </p>
                )}

                <div className="flex flex-col items-center gap-3 pt-2">
                  <Button
                    size="lg"
                    onClick={handleDownload}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[220px]"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {dict?.compress_pdf?.download_btn ||
                      "압축된 PDF 다운로드"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {dict?.compress_pdf?.another_btn || "다른 파일 압축"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* How-to & Tips & FAQ */}
          <div className="w-full max-w-6xl mx-auto mt-3 px-4 space-y-3">
            <section>
              <div className="mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  {dict?.compress_pdf?.guide_title || "PDF 압축 방법"}
                </h2>
                <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
                  {dict?.compress_pdf?.guide_desc ||
                    "세 단계면 PDF 용량을 줄일 수 있습니다."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-2">
                {[
                  {
                    step: 1,
                    title: dict?.compress_pdf?.step1_title || "PDF 업로드",
                    desc:
                      dict?.compress_pdf?.step1_desc ||
                      "PDF 파일을 끌어다 놓거나 클릭해서 선택하세요.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title:
                      dict?.compress_pdf?.step2_title || "품질 선택",
                    desc:
                      dict?.compress_pdf?.step2_desc ||
                      "높음, 보통, 낮음 중에서 고르세요. 품질이 낮을수록 용량이 작아집니다.",
                    icon: Gauge,
                  },
                  {
                    step: 3,
                    title:
                      dict?.compress_pdf?.step3_title || "압축 후 다운로드",
                    desc:
                      dict?.compress_pdf?.step3_desc ||
                      "압축을 실행해 줄어든 용량을 확인하고 작아진 PDF를 내려받으세요.",
                    icon: FileDown,
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
                  {dict?.compress_pdf?.tips_title || "PDF 압축 팁"}
                </h2>
                <p className="text-muted-foreground">
                  {dict?.compress_pdf?.tips_desc ||
                    "화질과 용량의 균형을 맞추는 방법입니다."}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                {[
                  {
                    title: dict?.compress_pdf?.tip1_title || "100% 비공개",
                    desc:
                      dict?.compress_pdf?.tip1_desc ||
                      "모든 압축은 pdf.js와 jsPDF를 이용해 브라우저 안에서 이뤄집니다. 파일이 기기를 벗어나지 않습니다.",
                    icon: Shield,
                  },
                  {
                    title:
                      dict?.compress_pdf?.tip2_title || "글자가 이미지로 바뀝니다",
                    desc:
                      dict?.compress_pdf?.tip2_desc ||
                      "모든 페이지가 이미지로 다시 만들어지므로 글자를 선택하거나 검색하거나 복사할 수 없게 됩니다. 글자 선택이 필요하면 원본을 보관하세요.",
                    icon: AlertTriangle,
                  },
                  {
                    title:
                      dict?.compress_pdf?.tip3_title || "알맞은 설정 고르기",
                    desc:
                      dict?.compress_pdf?.tip3_desc ||
                      "대부분의 문서에는 보통이 적당합니다. 인쇄용 선명도가 필요하면 높음을, 웹 공유용으로 가장 작은 파일이 필요하면 낮음을 쓰세요.",
                    icon: Gauge,
                  },
                  {
                    title:
                      dict?.compress_pdf?.tip4_title || "스캔한 PDF에 특히 효과적",
                    desc:
                      dict?.compress_pdf?.tip4_desc ||
                      "이미지가 많거나 스캔한 PDF일수록 많이 줄어듭니다. 이미 최적화된 파일은 크게 줄지 않을 수 있습니다.",
                    icon: Zap,
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
                  {dict?.compress_pdf?.faq_title || "PDF 압축 FAQ"}
                </h2>
                <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
                  {dict?.compress_pdf?.faq_desc ||
                    "PDF 압축에 대해 자주 묻는 질문입니다."}
                </p>
              </div>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>
                      {dict?.compress_pdf?.faq_1_q ||
                        "PDF 압축은 어떤 방식으로 이뤄지나요?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.compress_pdf?.faq_1_a ||
                        "각 페이지를 브라우저에서 이미지로 렌더링한 뒤 선택한 품질로 JPEG로 다시 인코딩하고, 원래 페이지 크기를 유지한 새 PDF로 다시 만듭니다. 낮은 설정일수록 해상도가 낮고 압축이 강해져 파일이 작아집니다."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>
                      {dict?.compress_pdf?.faq_2_q ||
                        "글자를 계속 선택할 수 있나요?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.compress_pdf?.faq_2_a ||
                        "아니요. 모든 페이지가 이미지로 변환되므로 글자를 선택하거나 검색하거나 복사할 수 없습니다. 글자 선택이 필요하면 원본을 보관하시거나, 화질을 최대한 유지하려면 높음 설정을 사용하세요."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>
                      {dict?.compress_pdf?.faq_3_q ||
                        "어떤 품질 설정을 고르는 게 좋나요?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.compress_pdf?.faq_3_a ||
                        "인쇄용 선명도를 유지하면서 용량을 줄이려면 높음(약 150 DPI), 화면으로 보기에 균형이 좋은 보통(약 110 DPI), 웹 공유용으로 가장 작은 파일은 낮음(약 72 DPI)을 사용하세요."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-4">
                    <AccordionTrigger>
                      {dict?.compress_pdf?.faq_4_q ||
                        "제 파일이 서버에 업로드되나요?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.compress_pdf?.faq_4_a ||
                        "아니요. 모든 압축은 pdf.js와 jsPDF를 이용해 전적으로 브라우저 안에서 이뤄집니다. PDF가 기기를 벗어나지 않으며 어디에도 업로드되지 않습니다."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-5">
                    <AccordionTrigger>
                      {dict?.compress_pdf?.faq_5_q ||
                        "비밀번호가 걸린 PDF도 압축할 수 있나요?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.compress_pdf?.faq_5_a ||
                        "암호화되었거나 비밀번호가 걸린 PDF는 대개 브라우저에서 읽을 수 없어 오류가 표시됩니다. PDF 뷰어에서 먼저 비밀번호를 해제한 뒤 압축해 주세요."}
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
