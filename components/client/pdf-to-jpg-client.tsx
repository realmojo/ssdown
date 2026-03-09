"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
import Adsense from "@/components/Adsense";
  Image,
  Upload,
  Download,
  Loader2,
  RotateCcw,
  FileText,
  Lightbulb,
  Shield,
  Zap,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import JSZip from "jszip";

interface ConvertedPage {
  pageNumber: number;
  blob: Blob;
  url: string;
}

async function loadPdfJs() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.mjs";
  return pdfjsLib;
}

export function PdfToJpgClient({ dict }: { dict?: any }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(2);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPdf = async (file: File) => {
    setError(null);
    setConvertedPages([]);

    if (file.type !== "application/pdf") {
      setError(`"${file.name}" is not a PDF file. Only PDF files are accepted.`);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError(`"${file.name}" exceeds the 50MB file size limit.`);
      return;
    }

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      setPdfFile(file);
      setPdfName(file.name);
      setPageCount(pdf.numPages);
    } catch {
      setError(`"${file.name}" could not be read. It may be corrupted or password-protected.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) loadPdf(e.target.files[0]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) loadPdf(e.dataTransfer.files[0]);
  };

  const convertToJpg = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    convertedPages.forEach((p) => URL.revokeObjectURL(p.url));
    setConvertedPages([]);

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const results: ConvertedPage[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        await page.render({ canvas, canvasContext: ctx, viewport }).promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => { if (b) resolve(b); else reject(new Error("Canvas to blob failed")); },
            "image/jpeg",
            0.92
          );
        });

        const url = URL.createObjectURL(blob);
        results.push({ pageNumber: i, blob, url });
        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      setConvertedPages(results);
    } catch {
      setError("Failed to convert PDF to JPG. The file may be corrupted or unsupported.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPage = (page: ConvertedPage) => {
    const link = document.createElement("a");
    link.href = page.url;
    const baseName = pdfName.replace(/\.pdf$/i, "") || "document";
    link.download = `${baseName}_page${page.pageNumber}.jpg`;
    link.click();
  };

  const downloadAll = async () => {
    if (convertedPages.length === 0) return;

    if (convertedPages.length === 1) {
      downloadPage(convertedPages[0]);
      return;
    }

    const zip = new JSZip();
    const baseName = pdfName.replace(/\.pdf$/i, "") || "document";
    convertedPages.forEach((p) => {
      zip.file(`${baseName}_page${p.pageNumber}.jpg`, p.blob);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${baseName}_all_pages.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    convertedPages.forEach((p) => URL.revokeObjectURL(p.url));
    setPdfFile(null);
    setPdfName("");
    setPageCount(0);
    setScale(2);
    setIsDragging(false);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setConvertedPages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 mb-6">
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">{dict?.pdf_to_jpg?.title || "PDF to JPG"}</h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">{dict?.pdf_to_jpg?.subtitle || "Convert each page of your PDF into high-quality JPG images. Choose scale for resolution. 100% private — processed in your browser."}</p>

        {!pdfFile && (
          <div
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragging ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-muted-foreground/30 hover:border-red-500/50 hover:bg-red-50/50 dark:hover:bg-red-900/10"}`}
          >
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">{dict?.pdf_to_jpg?.drop_zone || "Drag & drop a PDF file here"}</p>
            <p className="text-sm text-muted-foreground">Only PDF files accepted. Max 50MB per file.</p>
          </div>
        )}

        {error && (<div className="w-full max-w-2xl mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">{error}</div>)}

        {pdfFile && convertedPages.length === 0 && (
          <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{pdfName} &middot; {pageCount} page{pageCount !== 1 ? "s" : ""}</div>
              <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2" />Clear</Button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-muted">
              <span className="text-sm font-medium">Scale:</span>
              {[1, 2, 3].map((s) => (
                <Button key={s} variant={scale === s ? "default" : "outline"} size="sm" onClick={() => setScale(s)} className={scale === s ? "bg-red-600 hover:bg-red-700 text-white" : ""}>
                  {s}x
                </Button>
              ))}
              <span className="text-xs text-muted-foreground ml-2">Higher scale = better quality, larger files</span>
            </div>

            <div className="flex justify-center pt-4">
              <Button size="lg" onClick={convertToJpg} disabled={isProcessing} className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Converting... {progress}%
                  </>
                ) : (
                  <>
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image className="w-5 h-5 mr-2" />
                    {dict?.pdf_to_jpg?.action_btn || "Convert to JPG"}
                  </>
                )}
              </Button>
            </div>

            {isProcessing && (<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div className="bg-red-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} /></div>)}
          </div>
        )}

        {convertedPages.length > 0 && (
          <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{convertedPages.length} JPG image{convertedPages.length !== 1 ? "s" : ""} generated</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2" />{dict?.pdf_to_jpg?.another_btn || "Start Over"}</Button>
                <Button size="sm" onClick={downloadAll} className="bg-red-600 hover:bg-red-700 text-white"><Download className="w-4 h-4 mr-2" />{dict?.pdf_to_jpg?.download_btn || "Download All"}</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {convertedPages.map((p) => (
                <div key={p.pageNumber} className="group relative rounded-lg border border-muted overflow-hidden bg-muted/20">
                  <img src={p.url} alt={`Page ${p.pageNumber}`} className="w-full h-auto" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => downloadPage(p)}>
                      <Download className="w-4 h-4 mr-1" />Page {p.pageNumber}
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Page {p.pageNumber}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">{dict?.pdf_to_jpg?.guide_title || "How to Convert PDF to JPG"}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{dict?.pdf_to_jpg?.guide_desc || "Extract high-quality JPG images from your PDF in 3 simple steps."}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: 1, title: dict?.pdf_to_jpg?.step1_title || "Upload PDF", desc: dict?.pdf_to_jpg?.step1_desc || "Drag and drop or click to select a PDF file from your device.", icon: Upload },
              { step: 2, title: dict?.pdf_to_jpg?.step2_title || "Choose Scale", desc: dict?.pdf_to_jpg?.step2_desc || "Select 1x, 2x, or 3x scale for the output resolution. Higher scale means better quality.", icon: Layers },
              { step: 3, title: dict?.pdf_to_jpg?.step3_title || "Convert & Download", desc: dict?.pdf_to_jpg?.step3_desc || "Click 'Convert to JPG' and download individual pages or all at once as a ZIP.", icon: Download },
            ].map((s) => (
              <Card key={s.step} className="border-red-200 dark:border-red-900/50">
                <CardHeader><div className="flex items-center gap-3 mb-2"><div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white font-bold">{s.step}</div><CardTitle className="text-xl">{s.title}</CardTitle></div></CardHeader>
                <CardContent><p className="text-muted-foreground leading-relaxed">{s.desc}</p></CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4"><Lightbulb className="w-8 h-8 text-yellow-500" /></div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">{dict?.pdf_to_jpg?.tips_title || "PDF to JPG Tips"}</h2>
            <p className="text-muted-foreground">{dict?.pdf_to_jpg?.tips_desc || "Get the best results when converting PDF to JPG."}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: dict?.pdf_to_jpg?.tip1_title || "100% Private", desc: dict?.pdf_to_jpg?.tip1_desc || "All processing happens in your browser using pdf.js. Your files never leave your device.", icon: Shield },
              { title: dict?.pdf_to_jpg?.tip2_title || "Scale for Quality", desc: dict?.pdf_to_jpg?.tip2_desc || "Use 2x scale for a good balance of quality and file size. Use 3x for print-quality output.", icon: Layers },
              { title: dict?.pdf_to_jpg?.tip3_title || "JPEG Compression", desc: dict?.pdf_to_jpg?.tip3_desc || "Images are saved at 92% JPEG quality for excellent visual fidelity with reasonable file sizes.", icon: Zap },
              { title: dict?.pdf_to_jpg?.tip4_title || "Batch Download", desc: dict?.pdf_to_jpg?.tip4_desc || "Download all pages at once as a ZIP file, or download individual pages one at a time.", icon: FileText },
            ].map((tip, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-red-800/30">
                <div className="flex-shrink-0"><tip.icon className="w-6 h-6 text-red-600 dark:text-red-400" /></div>
                <div><h3 className="font-semibold mb-2">{tip.title}</h3><p className="text-sm text-muted-foreground">{tip.desc}</p></div>
              </div>
            ))}
          </div>
        </section>

        <Adsense slotId="7759160077" />

        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">{dict?.pdf_to_jpg?.faq_title || "PDF to JPG FAQ"}</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">{dict?.pdf_to_jpg?.faq_desc || "Common questions about converting PDF to JPG."}</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1"><AccordionTrigger>{dict?.pdf_to_jpg?.faq_1_q || "Is it free to convert PDF to JPG?"}</AccordionTrigger><AccordionContent>{dict?.pdf_to_jpg?.faq_1_a || "Yes, this tool is 100% free. There are no hidden fees, watermarks, or limitations on the number of pages you can convert."}</AccordionContent></AccordionItem>
              <AccordionItem value="faq-2"><AccordionTrigger>{dict?.pdf_to_jpg?.faq_2_q || "Is my PDF secure?"}</AccordionTrigger><AccordionContent>{dict?.pdf_to_jpg?.faq_2_a || "Absolutely. All processing happens entirely in your browser using pdf.js. Your PDF never leaves your device and is never uploaded to any server."}</AccordionContent></AccordionItem>
              <AccordionItem value="faq-3"><AccordionTrigger>{dict?.pdf_to_jpg?.faq_3_q || "What does the scale option do?"}</AccordionTrigger><AccordionContent>{dict?.pdf_to_jpg?.faq_3_a || "The scale multiplier controls the output resolution. 1x produces standard resolution, 2x produces double resolution (good for most uses), and 3x produces triple resolution (ideal for printing)."}</AccordionContent></AccordionItem>
              <AccordionItem value="faq-4"><AccordionTrigger>{dict?.pdf_to_jpg?.faq_4_q || "What is the maximum file size?"}</AccordionTrigger><AccordionContent>{dict?.pdf_to_jpg?.faq_4_a || "The maximum PDF file size is 50MB. Very large PDFs with many pages at high scale may require more browser memory."}</AccordionContent></AccordionItem>
              <AccordionItem value="faq-5"><AccordionTrigger>{dict?.pdf_to_jpg?.faq_5_q || "Can I download all pages at once?"}</AccordionTrigger><AccordionContent>{dict?.pdf_to_jpg?.faq_5_a || "Yes, use the &quot;Download All&quot; button to get all converted JPG images in a single ZIP file. You can also download individual pages separately."}</AccordionContent></AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
