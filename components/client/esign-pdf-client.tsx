"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import {
  PenTool,
  Upload,
  Download,
  FileText,
  Lightbulb,
  Shield,
  Zap,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

type PositionPreset =
  | "bottom-right"
  | "bottom-center"
  | "bottom-left"
  | "top-right"
  | "top-center"
  | "top-left";

const POSITION_LABELS: Record<PositionPreset, string> = {
  "bottom-right": "Bottom Right",
  "bottom-center": "Bottom Center",
  "bottom-left": "Bottom Left",
  "top-right": "Top Right",
  "top-center": "Top Center",
  "top-left": "Top Left",
};

const PEN_COLORS = [
  { label: "Black", value: "#000000" },
  { label: "Blue", value: "#1D4ED8" },
  { label: "Red", value: "#DC2626" },
] as const;

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 200;
const SIGNATURE_PADDING = 20;

export function EsignPdfClient({ dict }: { dict?: any }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [penWidth, setPenWidth] = useState(3);
  const [penColor, setPenColor] = useState("#000000");

  // Placement options
  const [selectedPage, setSelectedPage] = useState(0);
  const [position, setPosition] = useState<PositionPreset>("bottom-right");
  const [signatureWidth, setSignatureWidth] = useState(200);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize canvas with white background
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  // Sync pen settings to canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [penColor, penWidth]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    initCanvas();
    setHasSignature(false);
    setResultUrl(null);
    setResultSize(null);
  };

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
      setSelectedPage(0);
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

  const calculateSignaturePosition = (
    pageWidth: number,
    pageHeight: number,
    signW: number,
    signH: number,
  ) => {
    let x = 0;
    let y = 0;

    // pdf-lib uses bottom-left origin, so y=0 is the bottom of the page
    switch (position) {
      case "bottom-right":
        x = pageWidth - signW - SIGNATURE_PADDING;
        y = SIGNATURE_PADDING;
        break;
      case "bottom-center":
        x = (pageWidth - signW) / 2;
        y = SIGNATURE_PADDING;
        break;
      case "bottom-left":
        x = SIGNATURE_PADDING;
        y = SIGNATURE_PADDING;
        break;
      case "top-right":
        x = pageWidth - signW - SIGNATURE_PADDING;
        y = pageHeight - signH - SIGNATURE_PADDING;
        break;
      case "top-center":
        x = (pageWidth - signW) / 2;
        y = pageHeight - signH - SIGNATURE_PADDING;
        break;
      case "top-left":
        x = SIGNATURE_PADDING;
        y = pageHeight - signH - SIGNATURE_PADDING;
        break;
    }

    return { x, y };
  };

  const applySignature = async () => {
    if (!pdfFile || !hasSignature) return;

    setIsProcessing(true);
    setError(null);
    setResultUrl(null);
    setResultSize(null);

    try {
      const canvas = canvasRef.current!;
      const signatureDataUrl = canvas.toDataURL("image/png");
      const signatureResponse = await fetch(signatureDataUrl);
      const signatureBytes = await signatureResponse.arrayBuffer();

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });
      const signatureImage = await pdfDoc.embedPng(signatureBytes);

      const page = pdfDoc.getPage(selectedPage);
      const { width: pageWidth, height: pageHeight } = page.getSize();

      const signW = signatureWidth;
      const signH = signW * (signatureImage.height / signatureImage.width);

      const { x, y } = calculateSignaturePosition(
        pageWidth,
        pageHeight,
        signW,
        signH,
      );

      page.drawImage(signatureImage, {
        x,
        y,
        width: signW,
        height: signH,
      });

      const signedBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(signedBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setResultSize((blob.size / (1024 * 1024)).toFixed(2));
    } catch {
      setError(
        "Failed to apply signature. The PDF may be corrupted or unsupported.",
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
    link.download = `${baseName}_signed.pdf`;
    link.click();
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setPdfFile(null);
    setPdfName("");
    setPageCount(0);
    setIsDragging(false);
    setIsProcessing(false);
    setError(null);
    setResultUrl(null);
    setResultSize(null);
    setSelectedPage(0);
    setPosition("bottom-right");
    setSignatureWidth(200);
    clearCanvas();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex w-full flex-col">
            <div className="hidden">
              <PenTool className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
              {dict?.esign_pdf?.title || "eSign PDF"}
            </h1>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              {dict?.esign_pdf?.subtitle ||
                "Add your electronic signature to any PDF document. Draw your signature, choose placement, and download. 100% private — processed in your browser."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Drop zone */}
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
                  {dict?.esign_pdf?.drop_zone || "여기에 PDF 파일을 끌어다 놓으세요"}
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

            {/* Signature workspace */}
            {pdfFile && (
              <div className="w-full max-w-2xl mt-2 space-y-2 animate-in fade-in slide-in-from-bottom-4">
                {/* File info header */}
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

                {/* Signature canvas section */}
                <div className="space-y-4 p-6 bg-muted/30 rounded-lg border border-muted">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-red-600 dark:text-red-400" />
                    서명 그리기
                  </h2>

                  {/* Canvas */}
                  <div className="flex justify-center">
                    <canvas
                      ref={canvasRef}
                      width={CANVAS_WIDTH}
                      height={CANVAS_HEIGHT}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full max-w-[400px] bg-white border border-gray-300 dark:border-gray-600 rounded-lg cursor-crosshair"
                      style={{ touchAction: "none" }}
                    />
                  </div>

                  {/* Canvas controls */}
                  <div className="flex flex-wrap items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCanvas}
                      disabled={!hasSignature}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear
                    </Button>

                    {/* Pen width */}
                    <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Thickness: {penWidth}
                      </span>
                      <Slider
                        value={[penWidth]}
                        onValueChange={(v) => setPenWidth(v[0])}
                        min={2}
                        max={5}
                        step={1}
                        className="w-24"
                      />
                    </div>

                    {/* Pen color */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Color:
                      </span>
                      <div className="flex gap-1.5">
                        {PEN_COLORS.map((c) => (
                          <button
                            key={c.value}
                            onClick={() => setPenColor(c.value)}
                            title={c.label}
                            className={`w-7 h-7 rounded-full border-2 transition-all ${
                              penColor === c.value
                                ? "border-red-600 dark:border-red-400 scale-110"
                                : "border-gray-300 dark:border-gray-600 hover:scale-105"
                            }`}
                            style={{ backgroundColor: c.value }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Placement options */}
                <div className="space-y-4 p-6 bg-muted/30 rounded-lg border border-muted">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                    서명 위치
                  </h2>

                  <div className="grid sm:grid-cols-3 gap-4">
                    {/* Page selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">페이지</label>
                      <Select
                        value={String(selectedPage)}
                        onValueChange={(v) => {
                          setSelectedPage(Number(v));
                          setResultUrl(null);
                          setResultSize(null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: pageCount }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>
                              Page {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Position preset */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">위치</label>
                      <Select
                        value={position}
                        onValueChange={(v) => {
                          setPosition(v as PositionPreset);
                          setResultUrl(null);
                          setResultSize(null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            Object.entries(POSITION_LABELS) as [
                              PositionPreset,
                              string,
                            ][]
                          ).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Signature size */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Width: {signatureWidth}px
                      </label>
                      <Slider
                        value={[signatureWidth]}
                        onValueChange={(v) => {
                          setSignatureWidth(v[0]);
                          setResultUrl(null);
                          setResultSize(null);
                        }}
                        min={100}
                        max={300}
                        step={10}
                        className="mt-3"
                      />
                    </div>
                  </div>
                </div>

                {/* Apply button */}
                {!resultUrl && (
                  <div className="flex justify-center pt-4">
                    <Button
                      size="lg"
                      onClick={applySignature}
                      disabled={isProcessing || !hasSignature}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {dict?.esign_pdf?.processing || "Applying..."}
                        </>
                      ) : (
                        <>
                          <PenTool className="w-5 h-5 mr-2" />
                          서명 적용
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {!hasSignature && (
                  <p className="text-center text-sm text-muted-foreground">
                    계속하려면 위에 서명을 그려 주세요.
                  </p>
                )}

                {/* Download result */}
                {resultUrl && (
                  <div className="flex flex-col items-center gap-3 pt-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="text-sm text-muted-foreground">
                      Signature applied successfully! {resultSize} MB
                    </div>
                    <Button
                      size="lg"
                      onClick={handleDownload}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {dict?.esign_pdf?.download_btn || "Download Signed PDF"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* How-to & Tips & FAQ */}
          <div className="w-full max-w-6xl mx-auto mt-3 px-4 space-y-3">
            <section>
              <div className="mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  {dict?.esign_pdf?.guide_title || "How to eSign a PDF"}
                </h2>
                <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
                  {dict?.esign_pdf?.guide_desc ||
                    "Add your electronic signature to any PDF in 3 simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-2">
                {[
                  {
                    step: 1,
                    title: dict?.esign_pdf?.step1_title || "PDF 업로드",
                    desc:
                      dict?.esign_pdf?.step1_desc ||
                      "PDF 파일을 끌어다 놓거나 클릭해서 선택하세요.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: dict?.esign_pdf?.step2_title || "Draw Signature",
                    desc:
                      dict?.esign_pdf?.step2_desc ||
                      "Use the canvas pad to draw your signature with mouse or touch. Choose pen color and thickness.",
                    icon: PenTool,
                  },
                  {
                    step: 3,
                    title: dict?.esign_pdf?.step3_title || "Apply & Download",
                    desc:
                      dict?.esign_pdf?.step3_desc ||
                      "Select page and position, then apply your signature and download the signed PDF.",
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
              <div className="text-center mb-2">
                <div className="hidden">
                  <Lightbulb className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  {dict?.esign_pdf?.tips_title || "eSign PDF Tips"}
                </h2>
                <p className="text-muted-foreground">
                  PDF 문서에 서명할 때 가장 좋은 결과를 얻는 방법입니다.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                {[
                  {
                    title: "100% Private",
                    desc: "모든 처리는 pdf-lib를 이용해 브라우저 안에서 이뤄집니다. 파일과 서명이 기기를 벗어나지 않습니다.",
                    icon: Shield,
                  },
                  {
                    title: "터치 지원",
                    desc: "휴대폰과 태블릿에서도 동작합니다. 터치 기기에서는 손가락이나 스타일러스로 자연스럽게 서명하세요.",
                    icon: PenTool,
                  },
                  {
                    title: "원하는 페이지",
                    desc: "PDF의 원하는 페이지에 서명을 넣으세요. 6가지 위치 설정으로 정확하게 배치할 수 있습니다.",
                    icon: FileText,
                  },
                  {
                    title: "원본 보존",
                    desc: "원본 PDF는 그대로 남습니다. 서명된 새 사본이 만들어져 내려받게 됩니다.",
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
                  {dict?.esign_pdf?.faq_title || "eSign PDF FAQ"}
                </h2>
                <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
                  PDF 전자 서명에 대해 자주 묻는 질문입니다.
                </p>
              </div>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>
                      {dict?.esign_pdf?.faq_1_q || "Is it free to use?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.esign_pdf?.faq_1_a ||
                        "Yes, this eSign PDF tool is 100% free. There are no hidden fees, watermarks, or usage limits. Sign as many documents as you need."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>
                      {dict?.esign_pdf?.faq_2_q ||
                        "Is my electronic signature legally valid?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.esign_pdf?.faq_2_a ||
                        "This tool creates a visual representation of your signature on the PDF. While electronic signatures are legally recognized in many jurisdictions (e.g., ESIGN Act, eIDAS), the legal validity depends on your specific use case and local regulations. For legally binding contracts, consider using a certified digital signature service."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>
                      {dict?.esign_pdf?.faq_3_q || "Is my document secure?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.esign_pdf?.faq_3_a ||
                        "Absolutely. All processing happens entirely in your browser using pdf-lib. Your PDF files and signature data never leave your device and are never uploaded to any server. Your documents remain completely private."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-4">
                    <AccordionTrigger>
                      {dict?.esign_pdf?.faq_4_q ||
                        "Can I add multiple signatures to one PDF?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.esign_pdf?.faq_4_a ||
                        "You can apply one signature at a time. To add multiple signatures, download the signed PDF after each application, then upload it again to add another signature on the same or a different page."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-5">
                    <AccordionTrigger>
                      {dict?.esign_pdf?.faq_5_q ||
                        "What is the file size limit?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.esign_pdf?.faq_5_a ||
                        "The maximum file size is 50MB. This covers most standard documents. The signed PDF will be approximately the same size as the original, with a small increase for the embedded signature image."}
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
