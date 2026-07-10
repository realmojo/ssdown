"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import {
  ScanLine,
  Upload,
  Camera,
  Image as ImageIcon,
  Copy,
  ExternalLink,
  RotateCcw,
  Lightbulb,
  Info,
  QrCode,
  Loader2,
  Sun,
  Crop,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

interface FaqItem {
  question: string;
  answer: string;
}

const FALLBACK_FAQ: FaqItem[] = [
  {
    question: "Does this work with any type of QR code?",
    answer:
      "Yes. It reads standard QR codes that encode text, URLs, contact details, Wi-Fi credentials, and more. As long as it is a valid QR code, the decoded content will be shown.",
  },
  {
    question: "Is my camera feed uploaded anywhere?",
    answer:
      "No. All decoding happens locally in your browser. Your camera feed and uploaded images are never sent to any server.",
  },
  {
    question: "Why did scanning fail?",
    answer:
      "Scanning can fail if the image is blurry, too dark, or cropped so the QR code is incomplete. It can also fail if the code is not a valid QR code. Try a clearer, well-lit, fully visible image.",
  },
  {
    question: "Does this work on mobile browsers?",
    answer:
      "Yes. Camera scanning works on most modern mobile browsers once you grant camera permission. On iOS and Android, the rear camera is used by default for easy scanning.",
  },
  {
    question: "What image formats are supported for upload?",
    answer:
      "Any format your browser can display as an image works, including JPG, PNG, WebP, GIF, and BMP. The image is decoded entirely on your device.",
  },
];

type Mode = "upload" | "camera";

const isLink = (text: string) =>
  text.startsWith("http://") || text.startsWith("https://");

export function QrCodeScannerClient({ dict }: { dict?: any }) {
  const t = dict?.qr_code_scanner || {};
  const faqItems: FaqItem[] = dict?.page_qr_code_scanner?.faq || FALLBACK_FAQ;

  const [mode, setMode] = useState<Mode>("upload");
  const [result, setResult] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [noCodeFound, setNoCodeFound] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [recentScans, setRecentScans] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const previewUrlRef = useRef<string | null>(null);

  // Feature-detect camera support on mount (client-only).
  useEffect(() => {
    setCameraSupported(
      typeof navigator !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia,
    );
  }, []);

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  // Clean up camera stream and object URLs on unmount.
  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, [stopCamera]);

  const registerResult = useCallback((text: string) => {
    setResult(text);
    setNoCodeFound(false);
    setRecentScans((prev) => {
      const next = [text, ...prev.filter((item) => item !== text)];
      return next.slice(0, 5);
    });
  }, []);

  const setPreview = useCallback((url: string | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = url;
    setPreviewUrl(url);
  }, []);

  const decodeImageFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setNoCodeFound(false);
        setCameraError(null);
        toast.error(t.invalid_file || "Please select a valid image file.");
        return;
      }

      setIsDecoding(true);
      setResult(null);
      setNoCodeFound(false);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      try {
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Canvas context unavailable");
        }
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close?.();
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data) {
          registerResult(code.data);
        } else {
          setNoCodeFound(true);
        }
      } catch {
        setNoCodeFound(true);
      } finally {
        setIsDecoding(false);
      }
    },
    [registerResult, setPreview, t.invalid_file],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) decodeImageFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) decodeImageFile(file);
    },
    [decodeImageFile],
  );

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code?.data) {
      registerResult(code.data);
      stopCamera();
      return;
    }
    rafRef.current = requestAnimationFrame(scanFrame);
  }, [registerResult, stopCamera]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setResult(null);
    setNoCodeFound(false);
    setPreview(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setIsScanning(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch {
      setCameraError(
        t.camera_error ||
          "Unable to access the camera. Please grant camera permission and make sure a camera is available.",
      );
      setIsScanning(false);
    }
  }, [scanFrame, setPreview, t.camera_error]);

  const switchMode = useCallback(
    (next: Mode) => {
      if (next === mode) return;
      stopCamera();
      setCameraError(null);
      setMode(next);
    },
    [mode, stopCamera],
  );

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  const handleReset = useCallback(() => {
    stopCamera();
    setResult(null);
    setNoCodeFound(false);
    setCameraError(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [setPreview, stopCamera]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-3xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-6">
              <ScanLine className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t.title || "QR Code Scanner"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {t.subtitle ||
                "Scan and decode QR codes from an image or your camera, right in your browser. Free, fast, and private."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Mode toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 mb-6">
              <button
                type="button"
                onClick={() => switchMode("upload")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === "upload"
                    ? "bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                {t.mode_upload || "Upload Image"}
              </button>
              {cameraSupported && (
                <button
                  type="button"
                  onClick={() => switchMode("camera")}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === "camera"
                      ? "bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  {t.mode_camera || "Scan with Camera"}
                </button>
              )}
            </div>

            <Card className="w-full border-purple-100 dark:border-purple-900/50 shadow-sm">
              <CardContent className="pt-6 space-y-6">
                {/* Result view (shared) */}
                {result ? (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <QrCode className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h2 className="text-lg font-semibold">
                        {t.result_title || "QR Code Decoded"}
                      </h2>
                    </div>

                    <div className="rounded-xl border border-purple-100 dark:border-purple-900/50 bg-gray-50 dark:bg-gray-900/40 p-4">
                      <p className="font-mono text-sm break-all select-all whitespace-pre-wrap">
                        {result}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => handleCopy(result)}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-violet-500 hover:opacity-90 text-white"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {t.copy_btn || "Copy"}
                      </Button>
                      {isLink(result) && (
                        <a
                          href={result}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t.open_btn || "Open Link"}
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="outline"
                        onClick={handleReset}
                        className="flex-1"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {t.scan_another || "Scan Another"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Upload mode */}
                    {mode === "upload" && (
                      <div className="space-y-4">
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`w-full border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
                            isDragging
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                              : "border-muted-foreground/30 hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          {isDecoding ? (
                            <Loader2 className="w-14 h-14 mx-auto mb-4 text-purple-500 animate-spin" />
                          ) : (
                            <Upload className="w-14 h-14 mx-auto mb-4 text-muted-foreground" />
                          )}
                          <p className="text-lg font-medium mb-2">
                            {isDecoding
                              ? t.decoding || "Decoding..."
                              : t.drop_zone ||
                                "Drag & drop a QR code image here"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t.drop_hint || "or click to browse. JPG, PNG, WebP"}
                          </p>
                        </div>

                        {previewUrl && (
                          <div className="flex flex-col items-center gap-3">
                            <img
                              src={previewUrl}
                              alt={t.preview_alt || "Uploaded QR code preview"}
                              className="max-h-56 rounded-xl border border-gray-200 dark:border-gray-700 object-contain"
                            />
                            {noCodeFound && (
                              <div className="w-full p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-center">
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                  {t.no_code ||
                                    "No QR code found in this image. Try a clearer, well-lit, fully visible image."}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Camera mode */}
                    {mode === "camera" && (
                      <div className="space-y-4">
                        <div className="relative w-full aspect-square max-w-md mx-auto rounded-xl overflow-hidden bg-black">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                          {!isScanning && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-900/80 text-white text-center px-6">
                              <Camera className="w-10 h-10 text-purple-300" />
                              <p className="text-sm text-gray-200">
                                {t.camera_idle ||
                                  "Start your camera to scan a QR code live."}
                              </p>
                            </div>
                          )}
                          {isScanning && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                              <div className="w-2/3 aspect-square rounded-xl border-2 border-purple-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                            </div>
                          )}
                        </div>

                        {cameraError && (
                          <div className="w-full p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-center">
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {cameraError}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-center">
                          {isScanning ? (
                            <Button
                              variant="outline"
                              onClick={stopCamera}
                              className="min-w-40"
                            >
                              {t.stop_btn || "Stop"}
                            </Button>
                          ) : (
                            <Button
                              onClick={startCamera}
                              className="min-w-40 bg-gradient-to-r from-purple-500 to-violet-500 hover:opacity-90 text-white"
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              {t.start_btn || "Start Camera"}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Camera unsupported note */}
            {!cameraSupported && (
              <p className="mt-4 text-xs text-muted-foreground text-center max-w-md">
                {t.camera_unsupported ||
                  "Camera scanning is not supported in this browser, but you can still upload an image to scan a QR code."}
              </p>
            )}

            {/* Recent scans */}
            {recentScans.length > 0 && (
              <div className="w-full mt-8">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  {t.recent_title || "Recent Scans"}
                </h3>
                <div className="space-y-2">
                  {recentScans.map((scan, idx) => (
                    <div
                      key={`${scan}-${idx}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                    >
                      <p className="flex-1 font-mono text-xs break-all line-clamp-2">
                        {scan}
                      </p>
                      {isLink(scan) && (
                        <a
                          href={scan}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400"
                          aria-label={t.open_btn || "Open Link"}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopy(scan)}
                        className="shrink-0 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400"
                        aria-label={t.copy_btn || "Copy"}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Guide, Tips, FAQ */}
          <div className="w-full max-w-5xl mx-auto mt-4 px-4 space-y-16">
            {/* How it Works */}
            <section>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  {t.guide_title || "How it Works"}
                </h2>
                <p className="text-muted-foreground">
                  {t.guide_desc ||
                    "Decode any QR code in three simple steps, entirely on your device."}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: t.step1_title || "Upload or Start Camera",
                    desc:
                      t.step1_desc ||
                      "Upload an image of a QR code, or start your camera to scan one live.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: t.step2_title || "Instant Decoding",
                    desc:
                      t.step2_desc ||
                      "The QR code is decoded instantly, right in your browser.",
                    icon: ScanLine,
                  },
                  {
                    step: 3,
                    title: t.step3_title || "Copy or Open",
                    desc:
                      t.step3_desc ||
                      "Copy the decoded result, or open the link if the code contains a URL.",
                    icon: Copy,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    {t.tips_title || "Scanning Tips"}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.tips_desc || "Get a clean read every time."}
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: t.tip1_title || "Good Lighting",
                      desc:
                        t.tip1_desc ||
                        "Ensure good lighting and hold the camera steady for reliable live scanning.",
                      icon: Sun,
                    },
                    {
                      title: t.tip2_title || "Clear Images",
                      desc:
                        t.tip2_desc ||
                        "For uploaded images, make sure the QR code isn't blurry or cropped at the edges.",
                      icon: Crop,
                    },
                    {
                      title: t.tip3_title || "Need to Create One?",
                      desc:
                        t.tip3_desc ||
                        "This pairs perfectly with our QR Code Generator if you also need to create codes.",
                      icon: QrCode,
                    },
                    {
                      title: t.tip4_title || "Fully Private",
                      desc:
                        t.tip4_desc ||
                        "Your camera video never leaves your device. Decoding happens entirely locally.",
                      icon: ShieldCheck,
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <tip.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-semibold text-purple-600 dark:text-purple-400">
                          {tip.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {tip.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center justify-center gap-2">
                  <Info className="w-6 h-6 text-purple-500" />
                  {t.faq_title || "FAQ"}
                </h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx + 1}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>
        </div>
        <aside className="hidden lg:block w-64 shrink-0">
          <ToolsSidebar category="utility" dict={dict} />
        </aside>
      </div>
    </div>
  );
}
