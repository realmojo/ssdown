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
    q: "이미지에서 QR 코드를 어떻게 인식하나요?",
    a: "Switch to the 이미지 업로드 tab, then select a photo or drag and drop an image containing a QR code. The tool decodes it instantly in your browser and shows the result.",
  },
  {
    q: "카메라로 QR 코드를 인식할 수 있나요?",
    a: "Yes. Open the Camera tab and click Start camera. Point your device's camera at the QR code and it will be decoded automatically. Your camera feed never leaves your device.",
  },
  {
    q: "제 데이터는 안전한가요?",
    a: "Absolutely. All scanning happens entirely in your browser using the native BarcodeDetector API. No image or camera data is ever uploaded to a server or stored anywhere.",
  },
  {
    q: "어떤 브라우저를 지원하나요?",
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
    toast.success("QR 코드를 인식했습니다");
  }, []);

  const scanImageFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("이미지 파일을 선택해 주세요");
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
          toast.error("QR 코드를 찾지 못했습니다");
        }
      } catch {
        toast.error("이미지를 인식하지 못했습니다");
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
      toast.error("카메라에 접근할 수 없습니다");
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
    toast.success("클립보드에 복사했습니다");
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
              QR 코드 스캐너
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              이미지나 카메라로 QR 코드를 읽고 해석합니다. 모든 처리는 브라우저 안에서 이뤄집니다.
            </p>

            <Adsense slotId="7759160077" />

            {!supported ? (
              <Card className="w-full border-amber-200 dark:border-amber-900/50 shadow-sm">
                <CardContent className="flex flex-col items-center text-center gap-4 py-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    이 브라우저에서는 인식 기능을 지원하지 않습니다
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    이 도구는 브라우저에 내장된 BarcodeDetector API를 사용하는데, 현재 브라우저는 이를 지원하지 않습니다. 데스크톱에서는 최신 Chrome이나 Edge를, 안드로이드에서는 Chrome을 사용해 주세요.
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
                      이미지 업로드
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
                          여기에 이미지를 끌어다 놓거나 클릭해서 선택하세요
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG, WebP 등 QR 코드가 담긴 이미지면 됩니다
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
                          alt="업로드한 이미지 미리보기"
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
                            <span className="text-sm">카메라가 꺼져 있습니다</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-center">
                        {cameraActive ? (
                          <Button variant="destructive" onClick={stopCamera}>
                            <X className="w-4 h-4" />
                            카메라 끄기
                          </Button>
                        ) : (
                          <Button
                            className="bg-sky-500 hover:bg-sky-600"
                            onClick={() => void startCamera()}
                          >
                            <Camera className="w-4 h-4" />
                            카메라 켜기
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {result && (
                    <div className="rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-900/20 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-sky-700 dark:text-sky-300">
                        <ScanLine className="w-4 h-4" />
                        인식 결과
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
                  이용 방법
                </h2>
                <p className="text-muted-foreground">
                  브라우저에서 몇 초 만에 QR 코드를 읽어냅니다.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: "입력 방식 선택",
                    desc: "QR 코드가 담긴 이미지를 올리거나 카메라 탭으로 전환해 실시간으로 인식하세요.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: "즉시 인식",
                    desc: "업로드 없이 QR 코드를 자동으로 찾아 해석해 줍니다.",
                    icon: ScanLine,
                  },
                  {
                    step: 3,
                    title: "결과 활용",
                    desc: "인식된 텍스트를 복사하거나, 주소가 담겨 있다면 링크를 바로 열 수 있습니다.",
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
                  <h2 className="text-3xl font-bold mb-4">인식 팁</h2>
                  <p className="text-muted-foreground">
                    매번 정확하게 인식하는 방법입니다.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "선명한 이미지 사용",
                      desc: "QR 코드 전체가 선명하고 밝게 나온 이미지가 흐릿하게 잘린 것보다 훨씬 잘 인식됩니다.",
                    },
                    {
                      title: "카메라를 고정하세요",
                      desc: "기기를 고정하고 QR 코드를 화면 가운데에 두세요. 카메라가 초점을 잡을 시간을 주세요.",
                    },
                    {
                      title: "조명에 유의하세요",
                      desc: "인쇄물이나 화면의 QR 코드에 빛 반사가 생기지 않게 하면 가장 빠르게 인식됩니다.",
                    },
                    {
                      title: "비공개 유지",
                      desc: "모든 처리가 브라우저 안에서 이뤄집니다. 이미지나 카메라 영상이 서버로 업로드되지 않습니다.",
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
                <h2 className="text-2xl font-bold tracking-tight mb-4">자주 묻는 질문</h2>
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
