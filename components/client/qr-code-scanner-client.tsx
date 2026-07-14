"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  ScanLine,
  Upload,
  Camera,
  Copy,
  ExternalLink,
  ArrowRight,
  Lightbulb,
  ImageIcon,
  X,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

interface DetectedBarcode {
  rawValue: string;
}

interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
}

type ScanMode = "upload" | "camera";

function createDetector(): BarcodeDetectorLike {
  const Ctor = (window as unknown as {
    BarcodeDetector: new (options?: { formats?: string[] }) => BarcodeDetectorLike;
  }).BarcodeDetector;
  return new Ctor({ formats: ["qr_code"] });
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const FAQ = [
  {
    q: "How do I scan a QR code from an image?",
    a: "Switch to the Upload Image tab, then select a photo or drag and drop an image containing a QR code. The tool decodes it instantly in your browser and shows the result.",
  },
  {
    q: "Can I scan a QR code with my camera?",
    a: "Yes. Open the Camera tab and click Start camera. Point your device's camera at the QR code and it will be decoded automatically. Your camera feed never leaves your device.",
  },
  {
    q: "Is my data private and secure?",
    a: "Absolutely. All scanning happens entirely in your browser using the native BarcodeDetector API. No image or camera data is ever uploaded to a server or stored anywhere.",
  },
  {
    q: "Which browsers are supported?",
    a: "The scanner relies on the built-in BarcodeDetector API, which is available in the latest Chrome and Edge on desktop and Android. If your browser does not support it, you'll see a notice and scanning will be disabled.",
  },
];

export function QrCodeScannerClient({ dict }: { dict?: any }) {
  const [supported, setSupported] = useState(true);
  const [mode, setMode] = useState<ScanMode>("upload");
  const [result, setResult] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "BarcodeDetector" in window);
  }, []);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, [stopCamera]);

  const handleResult = useCallback((value: string) => {
    setResult(value);
    toast.success("QR code decoded");
  }, []);

  const scanImageFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      const objectUrl = URL.createObjectURL(file);
      previewUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
      setResult(null);

      try {
        const bitmap = await createImageBitmap(file);
        const detector = createDetector();
        const codes = await detector.detect(bitmap);
        bitmap.close();
        if (codes.length > 0 && codes[0].rawValue) {
          handleResult(codes[0].rawValue);
        } else {
          toast.error("No QR code found");
        }
      } catch {
        toast.error("Failed to scan image");
      }
    },
    [handleResult]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void scanImageFile(file);
      e.target.value = "";
    },
    [scanImageFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void scanImageFile(file);
    },
    [scanImageFile]
  );

  const detectLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detectLoop);
      return;
    }
    const detector = createDetector();
    detector
      .detect(video)
      .then((codes) => {
        if (codes.length > 0 && codes[0].rawValue) {
          handleResult(codes[0].rawValue);
          stopCamera();
        } else {
          rafRef.current = requestAnimationFrame(detectLoop);
        }
      })
      .catch(() => {
        rafRef.current = requestAnimationFrame(detectLoop);
      });
  }, [handleResult, stopCamera]);

  const startCamera = useCallback(async () => {
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      rafRef.current = requestAnimationFrame(detectLoop);
    } catch {
      toast.error("Unable to access the camera");
      stopCamera();
    }
  }, [detectLoop, stopCamera]);

  const switchMode = useCallback(
    (next: ScanMode) => {
      if (next === "upload") stopCamera();
      setMode(next);
    },
    [stopCamera]
  );

  const handleCopy = useCallback(() => {
    if (!result) return;
    void navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard");
  }, [result]);

  const resultIsUrl = useMemo(() => (result ? isHttpUrl(result) : false), [result]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-5xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 mb-6">
              <ScanLine className="w-10 h-10 text-sky-600 dark:text-sky-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              QR Code Scanner
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              Scan and decode QR codes from an image or your camera, entirely in
              your browser.
            </p>

            <Adsense slotId="7759160077" />

            {!supported ? (
              <Card className="w-full border-amber-200 dark:border-amber-900/50 shadow-sm">
                <CardContent className="flex flex-col items-center text-center gap-4 py-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    Scanning isn&apos;t supported in this browser
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    This tool uses the built-in BarcodeDetector API, which your
                    browser doesn&apos;t support. For the best experience, please
                    use the latest Chrome or Edge on desktop, or Chrome on
                    Android.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="w-full border-sky-100 dark:border-sky-900/50 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => switchMode("upload")}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        mode === "upload"
                          ? "bg-sky-500 text-white border-sky-500"
                          : "border-gray-200 dark:border-gray-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-300 dark:hover:border-sky-700"
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </button>
                    <button
                      onClick={() => switchMode("camera")}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        mode === "camera"
                          ? "bg-sky-500 text-white border-sky-500"
                          : "border-gray-200 dark:border-gray-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-300 dark:hover:border-sky-700"
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                      Camera
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mode === "upload" ? (
                    <div className="space-y-4">
                      <label
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={`flex flex-col items-center justify-center gap-3 w-full min-h-[220px] p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                          isDragging
                            ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20"
                            : "border-gray-300 dark:border-gray-700 hover:border-sky-400 dark:hover:border-sky-700 hover:bg-sky-50/50 dark:hover:bg-sky-900/10"
                        }`}
                      >
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
                          <ImageIcon className="w-7 h-7" />
                        </div>
                        <p className="font-medium">
                          Drop an image here or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG, WebP, or any image containing a QR code
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileInput}
                          className="hidden"
                        />
                      </label>
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Uploaded preview"
                          className="max-h-48 rounded-xl border border-gray-200 dark:border-gray-700 mx-auto object-contain"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 border border-gray-200 dark:border-gray-700">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        {!cameraActive && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                            <Camera className="w-10 h-10" />
                            <span className="text-sm">Camera is off</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-center">
                        {cameraActive ? (
                          <Button variant="destructive" onClick={stopCamera}>
                            <X className="w-4 h-4" />
                            Stop camera
                          </Button>
                        ) : (
                          <Button
                            className="bg-sky-500 hover:bg-sky-600"
                            onClick={() => void startCamera()}
                          >
                            <Camera className="w-4 h-4" />
                            Start camera
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {result && (
                    <div className="rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-900/20 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-sky-700 dark:text-sky-300">
                        <ScanLine className="w-4 h-4" />
                        Decoded Result
                      </div>
                      {resultIsUrl ? (
                        <a
                          href={result}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block break-all text-sky-600 dark:text-sky-400 underline underline-offset-2"
                        >
                          {result}
                        </a>
                      ) : (
                        <p className="break-all text-gray-800 dark:text-gray-100">
                          {result}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </Button>
                        {resultIsUrl && (
                          <Button
                            size="sm"
                            className="bg-sky-500 hover:bg-sky-600"
                            asChild
                          >
                            <a
                              href={result}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Open
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Guide, Tips, FAQ */}
          <div className="w-full max-w-5xl mx-auto mt-16 px-4 space-y-16">
            {/* How to Use */}
            <section>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  How to Use
                </h2>
                <p className="text-muted-foreground">
                  Decode any QR code in seconds, right in your browser.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: "Choose a Source",
                    desc: "Upload an image containing a QR code, or switch to the Camera tab to scan live.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: "Scan Instantly",
                    desc: "The tool detects and decodes the QR code automatically, without any uploads.",
                    icon: ScanLine,
                  },
                  {
                    step: 3,
                    title: "Use the Result",
                    desc: "Copy the decoded text or open the link directly if the code contains a URL.",
                    icon: ArrowRight,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-sky-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Scanning Tips</h2>
                  <p className="text-muted-foreground">
                    Get a clean read every time.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Use a Clear Image",
                      desc: "Sharp, well-lit images with the full QR code visible decode far more reliably than blurry crops.",
                    },
                    {
                      title: "Steady the Camera",
                      desc: "Hold your device still and center the QR code in the frame. Give the camera a moment to focus.",
                    },
                    {
                      title: "Mind the Lighting",
                      desc: "Avoid glare and harsh reflections on printed or on-screen QR codes for the fastest detection.",
                    },
                    {
                      title: "Stay Private",
                      desc: "Everything runs locally in your browser. No image or camera stream is ever uploaded to a server.",
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-sky-600 dark:text-sky-400 mb-2">
                        {tip.title}
                      </h3>
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
                <h2 className="text-2xl font-bold tracking-tight mb-4">FAQ</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {FAQ.map((item, idx) => (
                  <AccordionItem key={idx} value={`item-${idx + 1}`}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
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
