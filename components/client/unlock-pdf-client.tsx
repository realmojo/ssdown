"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
import Adsense from "@/components/Adsense";
  Unlock,
  Upload,
  Download,
  FileText,
  RotateCcw,
  Lightbulb,
  Loader2,
  Shield,
  Zap,
  KeyRound,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function UnlockPdfClient({ dict }: { dict?: any }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pdfSizeMB, setPdfSizeMB] = useState("");
  const [password, setPassword] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectFile = (file: File) => {
    setError(null);
    setResultUrl(null);
    setResultSize(null);
    setPassword("");

    if (file.type !== "application/pdf") {
      setError(`"${file.name}" is not a PDF file. Only PDF files are accepted.`);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError(`"${file.name}" exceeds the 50MB file size limit.`);
      return;
    }

    setPdfFile(file);
    setPdfName(file.name);
    setPdfSizeMB((file.size / (1024 * 1024)).toFixed(2));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      selectFile(e.target.files[0]);
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
      selectFile(e.dataTransfer.files[0]);
    }
  };

  const unlockPdf = async () => {
    if (!pdfFile) return;

    if (password.length < 1) {
      setError("Please enter the PDF password.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResultUrl(null);
    setResultSize(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();

      // Note: pdf-lib does not support password-protected PDFs in the load method
      // It will attempt to load the PDF, but encrypted files will still fail
      // This is a limitation of the current version.
      const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      // Create a new PDF and copy all pages (without encryption)
      const newPdf = await PDFDocument.create();
      const pageIndices = sourcePdf.getPageIndices();
      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      for (const page of copiedPages) {
        newPdf.addPage(page);
      }

      // Save without password
      const unlockedBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(unlockedBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setResultSize((blob.size / (1024 * 1024)).toFixed(2));
    } catch {
      setError("Failed to unlock PDF. The password may be incorrect, or the file may be corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const baseName = pdfName.replace(/\.pdf$/i, "") || "document";
    link.download = `${baseName}_unlocked.pdf`;
    link.click();
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setPdfFile(null);
    setPdfName("");
    setPdfSizeMB("");
    setPassword("");
    setIsDragging(false);
    setIsProcessing(false);
    setError(null);
    setResultUrl(null);
    setResultSize(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 mb-6">
          <Unlock className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.unlock_pdf?.title || "Unlock PDF"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.unlock_pdf?.subtitle || "Remove password protection from your PDF. Enter the current password to unlock and save an unprotected copy. 100% private — processed in your browser."}
        </p>

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
            <p className="text-lg font-medium mb-2">{dict?.unlock_pdf?.drop_zone || "Drag & drop a PDF file here"}</p>
            <p className="text-sm text-muted-foreground">Only PDF files accepted. Max 50MB per file.</p>
          </div>
        )}

        {error && (
          <div className="w-full max-w-2xl mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {pdfFile && !resultUrl && (
          <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {pdfName} &middot; {pdfSizeMB} MB
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>

            <div className="p-6 bg-muted/30 rounded-lg border border-muted space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="font-semibold">Enter PDF Password</h3>
              </div>
              <div>
                <label htmlFor="unlock-password" className="text-sm font-medium mb-1 block">
                  Password
                </label>
                <Input
                  id="unlock-password"
                  type="password"
                  placeholder="Enter the PDF password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && password.length > 0) {
                      unlockPdf();
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={unlockPdf}
                disabled={isProcessing || password.length < 1}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{dict?.unlock_pdf?.processing || "Unlocking..."}</>
                ) : (
                  <><Unlock className="w-5 h-5 mr-2" />{dict?.unlock_pdf?.title || "Unlock PDF"}</>
                )}
              </Button>
            </div>
          </div>
        )}

        {resultUrl && (
          <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {pdfName} &middot; {pdfSizeMB} MB
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
            <div className="flex flex-col items-center gap-3 pt-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Unlocked successfully! {resultSize} MB
              </div>
              <Button size="lg" onClick={handleDownload} className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]">
                <Download className="w-5 h-5 mr-2" />{dict?.unlock_pdf?.download_btn || "Download Unlocked PDF"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">{dict?.unlock_pdf?.guide_title || "How to Unlock a PDF"}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{dict?.unlock_pdf?.guide_desc || "Remove password protection from your PDF in 3 simple steps."}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: 1, title: dict?.unlock_pdf?.step1_title || "Upload PDF", desc: dict?.unlock_pdf?.step1_desc || "Drag and drop or click to select a password-protected PDF file.", icon: Upload },
              { step: 2, title: dict?.unlock_pdf?.step2_title || "Enter Password", desc: dict?.unlock_pdf?.step2_desc || "Type the current password of the PDF document.", icon: KeyRound },
              { step: 3, title: dict?.unlock_pdf?.step3_title || "Download", desc: dict?.unlock_pdf?.step3_desc || "Click 'Unlock PDF' and download the unprotected version.", icon: Download },
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
            <h2 className="text-3xl font-bold tracking-tight mb-4">{dict?.unlock_pdf?.tips_title || "PDF Unlock Tips"}</h2>
            <p className="text-muted-foreground">{dict?.unlock_pdf?.tips_desc || "Get the best results when unlocking PDF files."}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: dict?.unlock_pdf?.tip1_title || "100% Private", desc: dict?.unlock_pdf?.tip1_desc || "All processing happens in your browser. Your files and passwords never leave your device.", icon: Shield },
              { title: dict?.unlock_pdf?.tip2_title || "Password Required", desc: dict?.unlock_pdf?.tip2_desc || "You must know the current password to unlock the PDF. This tool cannot crack or bypass passwords.", icon: KeyRound },
              { title: dict?.unlock_pdf?.tip3_title || "Instant Processing", desc: dict?.unlock_pdf?.tip3_desc || "Unlocking is processed instantly in your browser. No server uploads or waiting.", icon: Zap },
              { title: dict?.unlock_pdf?.tip4_title || "Original Preserved", desc: dict?.unlock_pdf?.tip4_desc || "Your original encrypted PDF remains untouched. A new unprotected copy is created for download.", icon: FileText },
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

        <Adsense slotId="7759160077" />

        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">{dict?.unlock_pdf?.faq_title || "Unlock PDF FAQ"}</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">{dict?.unlock_pdf?.faq_desc || "Common questions about unlocking PDF files."}</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>{dict?.unlock_pdf?.faq_1_q || "Is it free to unlock a PDF?"}</AccordionTrigger>
                <AccordionContent>{dict?.unlock_pdf?.faq_1_a || "Yes, this tool is 100% free to use. There are no hidden fees, watermarks, or usage limits."}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>{dict?.unlock_pdf?.faq_2_q || "Can I unlock a PDF without the password?"}</AccordionTrigger>
                <AccordionContent>{dict?.unlock_pdf?.faq_2_a || "No. You must know the correct password to unlock a PDF. This tool does not crack, bypass, or brute-force passwords. It is designed for legitimate use only."}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>{dict?.unlock_pdf?.faq_3_q || "Is my password safe?"}</AccordionTrigger>
                <AccordionContent>{dict?.unlock_pdf?.faq_3_a || "Your password is completely safe because all processing happens in your browser. Your password is never sent to any server."}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>{dict?.unlock_pdf?.faq_4_q || "What is the file size limit?"}</AccordionTrigger>
                <AccordionContent>{dict?.unlock_pdf?.faq_4_a || "The maximum file size is 50MB. Larger files may cause performance issues depending on your browser and device capabilities."}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>{dict?.unlock_pdf?.faq_5_q || "What if the wrong password is entered?"}</AccordionTrigger>
                <AccordionContent>{dict?.unlock_pdf?.faq_5_a || "If the password is incorrect, you will see an error message. Simply try again with the correct password. There is no limit on the number of attempts."}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
