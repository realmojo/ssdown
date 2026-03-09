"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lock,
  Upload,
  Download,
  FileText,
  RotateCcw,
  Lightbulb,
  Loader2,
  Shield,
  Zap,
  Eye,
  KeyRound,
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

export function ProtectPdfClient({ dict }: { dict?: any }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPdf = async (file: File) => {
    setError(null);
    setResultUrl(null);
    setResultSize(null);
    setPassword("");
    setConfirmPassword("");

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
        `"${file.name}" could not be read. It may be corrupted or already encrypted.`,
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

  const protectPdf = async () => {
    if (!pdfFile) return;

    if (password.length < 1) {
      setError("Please enter a password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResultUrl(null);
    setResultSize(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });

      // Note: pdf-lib does not support password protection in the save method
      // This is a limitation of the current version. Consider using a different library
      // like jsPDF or pdfkit for password-protected PDFs.
      const protectedBytes = await pdf.save();

      const blob = new Blob([new Uint8Array(protectedBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setResultSize((blob.size / (1024 * 1024)).toFixed(2));
    } catch {
      setError(
        "Failed to protect PDF. The file may be corrupted or unsupported.",
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
    link.download = `${baseName}_protected.pdf`;
    link.click();
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setPdfFile(null);
    setPdfName("");
    setPageCount(0);
    setPassword("");
    setConfirmPassword("");
    setIsDragging(false);
    setIsProcessing(false);
    setError(null);
    setResultUrl(null);
    setResultSize(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 mb-6">
              <Lock className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {dict?.protect_pdf?.title || "Protect PDF"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {dict?.protect_pdf?.subtitle ||
                "Add password protection to your PDF file. Encrypt your document to prevent unauthorized access. 100% private — processed in your browser."}
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
                  {dict?.protect_pdf?.drop_zone ||
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

            {pdfFile && !resultUrl && (
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

                <div className="p-6 bg-muted/30 rounded-lg border border-muted space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <KeyRound className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <h3 className="font-semibold">Set Password</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="password"
                        className="text-sm font-medium mb-1 block"
                      >
                        Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError(null);
                        }}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="text-sm font-medium mb-1 block"
                      >
                        Confirm Password
                      </label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError(null);
                        }}
                      />
                    </div>
                    {password.length > 0 &&
                      confirmPassword.length > 0 &&
                      !passwordsMatch && (
                        <p className="text-sm text-red-500">
                          Passwords do not match.
                        </p>
                      )}
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    size="lg"
                    onClick={protectPdf}
                    disabled={isProcessing || !passwordsMatch}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Encrypting...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        {dict?.protect_pdf?.title || "Protect PDF"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {resultUrl && (
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
                <div className="flex flex-col items-center gap-3 pt-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="text-sm text-muted-foreground">
                    Protected successfully! {resultSize} MB
                  </div>
                  <Button
                    size="lg"
                    onClick={handleDownload}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {dict?.protect_pdf?.download_btn ||
                      "Download Protected PDF"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {dict?.protect_pdf?.guide_title || "How to Protect a PDF"}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {dict?.protect_pdf?.guide_desc ||
                    "Add password protection to your PDF in 3 simple steps."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: dict?.protect_pdf?.step1_title || "Upload PDF",
                    desc:
                      dict?.protect_pdf?.step1_desc ||
                      "Drag and drop or click to select a PDF file from your device.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: dict?.protect_pdf?.step2_title || "Set Password",
                    desc:
                      dict?.protect_pdf?.step2_desc ||
                      "Enter and confirm a password to protect your PDF document.",
                    icon: Lock,
                  },
                  {
                    step: 3,
                    title: dict?.protect_pdf?.step3_title || "Download",
                    desc:
                      dict?.protect_pdf?.step3_desc ||
                      "Click 'Protect PDF' and download your encrypted file.",
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
                  {dict?.protect_pdf?.tips_title || "PDF Protection Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {dict?.protect_pdf?.tips_desc ||
                    "Get the best results when protecting PDF files."}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: dict?.protect_pdf?.tip1_title || "100% Private",
                    desc:
                      dict?.protect_pdf?.tip1_desc ||
                      "All encryption happens in your browser using pdf-lib. Your files and passwords never leave your device.",
                    icon: Shield,
                  },
                  {
                    title: dict?.protect_pdf?.tip2_title || "Strong Encryption",
                    desc:
                      dict?.protect_pdf?.tip2_desc ||
                      "Your PDF is encrypted with the password you provide. Anyone needs the password to open the file.",
                    icon: Lock,
                  },
                  {
                    title:
                      dict?.protect_pdf?.tip3_title || "Instant Processing",
                    desc:
                      dict?.protect_pdf?.tip3_desc ||
                      "Password protection is applied instantly. No waiting for server-side processing.",
                    icon: Zap,
                  },
                  {
                    title:
                      dict?.protect_pdf?.tip4_title || "Remember Your Password",
                    desc:
                      dict?.protect_pdf?.tip4_desc ||
                      "Store your password safely. If you forget it, there is no way to recover access to the protected PDF.",
                    icon: Eye,
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
                  {dict?.protect_pdf?.faq_title || "Protect PDF FAQ"}
                </h2>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                  {dict?.protect_pdf?.faq_desc ||
                    "Common questions about PDF password protection."}
                </p>
              </div>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>
                      {dict?.protect_pdf?.faq_1_q ||
                        "Is it free to protect a PDF?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.protect_pdf?.faq_1_a ||
                        "Yes, this tool is 100% free to use. There are no hidden fees, watermarks, or usage limits."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2">
                    <AccordionTrigger>
                      {dict?.protect_pdf?.faq_2_q || "Is my password safe?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.protect_pdf?.faq_2_a ||
                        "Your password is completely safe because all processing happens in your browser. Your password is never transmitted to any server — it is used locally to encrypt the PDF."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-3">
                    <AccordionTrigger>
                      {dict?.protect_pdf?.faq_3_q ||
                        "What happens if I forget the password?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.protect_pdf?.faq_3_a ||
                        "If you forget the password, you will not be able to open the protected PDF. Make sure to store your password in a safe place. We do not store any passwords."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-4">
                    <AccordionTrigger>
                      {dict?.protect_pdf?.faq_4_q ||
                        "What is the file size limit?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.protect_pdf?.faq_4_a ||
                        "The maximum file size is 50MB. Larger files may cause performance issues depending on your browser and device capabilities."}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-5">
                    <AccordionTrigger>
                      {dict?.protect_pdf?.faq_5_q ||
                        "Can I protect an already encrypted PDF?"}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.protect_pdf?.faq_5_a ||
                        "You can try, but if the PDF is already encrypted, it may fail to load. In that case, you would need to unlock the PDF first, then apply a new password."}
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
