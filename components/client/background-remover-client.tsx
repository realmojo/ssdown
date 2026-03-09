"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Image as ImageIcon,
  Loader2,
  X,
  RotateCcw,
  Lightbulb,
  Info,
  Eraser,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Adsense from "@/components/Adsense";

export function BackgroundRemoverClient({ dict }: { dict?: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [comparePosition, setComparePosition] = useState(50);
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [showComparison, setShowComparison] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef(false);

  // File handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  }, []);

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    // Max 20MB
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("File size must be under 20MB.");
      return;
    }

    setFile(selectedFile);
    setResultUrl(null);
    setError(null);
    setProgress(0);
    setComparePosition(50);
    setShowComparison(true);

    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
  };

  // Remove background
  const removeBackground = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage("Loading AI model...");

    try {
      const { removeBackground: removeBg } =
        await import("@imgly/background-removal");

      setProgressMessage("Processing image...");

      const blob = await removeBg(file, {
        progress: (key: string, current: number, total: number) => {
          const pct = total > 0 ? Math.round((current / total) * 100) : 0;
          setProgress(pct);

          if (key.includes("fetch")) {
            setProgressMessage("Downloading AI model...");
          } else if (key.includes("compute")) {
            setProgressMessage("Removing background...");
          } else {
            setProgressMessage("Processing...");
          }
        },
      });

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      setProgressMessage("Done!");
    } catch (err) {
      console.error("Background removal failed:", err);
      setError("Failed to remove background. Please try a different image.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-start processing when file is uploaded
  useEffect(() => {
    if (file && !resultUrl && !isProcessing) {
      removeBackground();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Download with background color
  const handleDownload = () => {
    if (!resultUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (bgColor !== "transparent") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `no-bg_${file?.name?.replace(/\.[^.]+$/, "")}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.src = resultUrl;
  };

  // Comparison slider
  const handleSliderMouseDown = () => {
    isDraggingSlider.current = true;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSlider.current || !compareRef.current) return;
      const rect = compareRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setComparePosition((x / rect.width) * 100);
    };

    const handleMouseUp = () => {
      isDraggingSlider.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Reset
  const reset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setProgress(0);
    setProgressMessage("");
    setError(null);
    setBgColor("transparent");
    setShowComparison(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Checkerboard pattern for transparent bg
  const checkerboardStyle = {
    backgroundImage: `linear-gradient(45deg, #e0e0e0 25%, transparent 25%), 
      linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #e0e0e0 75%), 
      linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)`,
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-3xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 mb-6">
          <Eraser className="w-10 h-10 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.background_remover?.title || "Background Remover"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.background_remover?.subtitle ||
            "Remove image backgrounds instantly with AI. 100% free, no upload to server, works entirely in your browser."}
        </p>

        <Adsense slotId="7759160077" />

        {/* Upload Section */}
        {!file && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
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
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {dict?.background_remover?.drop_zone ||
                "Drag & drop your image here"}
            </p>
            <p className="text-sm text-muted-foreground">
              Supported: PNG, JPG, WebP (Max 20MB)
            </p>
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                const res = await fetch("/test-image.jpg");
                const blob = await res.blob();
                const file = new File([blob], "test-image.jpg", { type: "image/jpeg" });
                processFile(file);
              }}
              className="mt-4 text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              Or try with a sample image
            </button>
          </div>
        )}

        {/* Processing Section */}
        {file && !resultUrl && isProcessing && (
          <Card className="w-full border-purple-100 dark:border-purple-900/50 animate-in fade-in slide-in-from-bottom-4">
            <CardContent className="pt-8">
              <div className="flex flex-col items-center gap-6">
                {/* Original Image Preview */}
                {originalUrl && (
                  <div className="w-full max-w-md rounded-xl overflow-hidden border">
                    <img
                      src={originalUrl}
                      alt="Original"
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                )}

                {/* Progress */}
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {progressMessage}
                    </span>
                    <span className="font-mono">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    First time may take longer to download the AI model (~40MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Result Section */}
        {resultUrl && (
          <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-purple-100 dark:border-purple-900/50">
              <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Eraser className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-lg">
                      Background Removed!
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowComparison(!showComparison)}
                      className="gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      {showComparison ? "Result Only" : "Compare"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={reset}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Comparison or Result View */}
                {showComparison && originalUrl ? (
                  <div
                    ref={compareRef}
                    className="relative w-full rounded-xl overflow-hidden border cursor-col-resize select-none"
                    style={{ aspectRatio: "auto" }}
                    onMouseDown={handleSliderMouseDown}
                  >
                    {/* Original (full width) */}
                    <img
                      src={originalUrl}
                      alt="Original"
                      className="w-full h-auto block"
                      draggable={false}
                    />

                    {/* Result (clipped) */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{
                        clipPath: `inset(0 0 0 ${comparePosition}%)`,
                        ...checkerboardStyle,
                      }}
                    >
                      <img
                        src={resultUrl}
                        alt="Background Removed"
                        className="w-full h-auto block"
                        draggable={false}
                      />
                    </div>

                    {/* Slider Line */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                      style={{ left: `${comparePosition}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <div className="flex gap-0.5">
                          <div className="w-0.5 h-4 bg-gray-400 rounded" />
                          <div className="w-0.5 h-4 bg-gray-400 rounded" />
                        </div>
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 text-white text-xs rounded-md backdrop-blur-sm">
                      Original
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-md backdrop-blur-sm">
                      Removed
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full rounded-xl overflow-hidden border"
                    style={
                      bgColor === "transparent" ? checkerboardStyle : undefined
                    }
                  >
                    <img
                      src={resultUrl}
                      alt="Background Removed"
                      className="w-full h-auto block"
                      style={
                        bgColor !== "transparent"
                          ? { backgroundColor: bgColor }
                          : undefined
                      }
                    />
                  </div>
                )}

                {/* Background Color Options */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Background Color</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        label: "Transparent",
                        value: "transparent",
                        style: checkerboardStyle,
                      },
                      {
                        label: "White",
                        value: "#ffffff",
                        style: { backgroundColor: "#ffffff" },
                      },
                      {
                        label: "Black",
                        value: "#000000",
                        style: { backgroundColor: "#000000" },
                      },
                      {
                        label: "Red",
                        value: "#ef4444",
                        style: { backgroundColor: "#ef4444" },
                      },
                      {
                        label: "Blue",
                        value: "#3b82f6",
                        style: { backgroundColor: "#3b82f6" },
                      },
                      {
                        label: "Green",
                        value: "#22c55e",
                        style: { backgroundColor: "#22c55e" },
                      },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setBgColor(opt.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          bgColor === opt.value
                            ? "border-purple-500 scale-110 ring-2 ring-purple-300"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        style={opt.style}
                        title={opt.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Download & Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PNG
                  </Button>
                  <Button variant="outline" onClick={reset} className="flex-1">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Try Another Image
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="w-full mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Tips Section */}
        {!file && (
          <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-purple-100/50 dark:border-purple-900/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm mb-1">Best Results</h3>
                    <p className="text-xs text-muted-foreground">
                      Images with clear subject-background separation work best.
                      High contrast between subject and background gives cleaner
                      edges.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-100/50 dark:border-purple-900/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm mb-1">
                      100% Private & Free
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Your images are never uploaded to any server. The AI model
                      runs entirely in your browser using WebAssembly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* How It Works */}
        {!file && (
          <div className="w-full mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  title: "Upload Image",
                  desc: "Drag and drop or click to upload your image (PNG, JPG, WebP).",
                },
                {
                  step: "2",
                  title: "AI Processing",
                  desc: "Our AI model analyzes and removes the background in seconds.",
                },
                {
                  step: "3",
                  title: "Download Result",
                  desc: "Download the transparent PNG or choose a custom background color.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-900/50"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* FAQ Section */}
        {!file && (
          <div className="w-full mt-12">
            <h2 className="text-2xl font-bold text-center mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "Is my image uploaded to any server?",
                  a: "No. All processing happens 100% in your browser using WebAssembly. Your images never leave your device.",
                },
                {
                  q: "What image formats are supported?",
                  a: "We support PNG, JPG/JPEG, and WebP formats. The output is always PNG with transparency.",
                },
                {
                  q: "How long does it take?",
                  a: "The first time may take 10-30 seconds to download the AI model (~40MB). After that, most images process in 3-10 seconds.",
                },
                {
                  q: "Is there a file size limit?",
                  a: "Yes, the maximum file size is 20MB. For best results, use images under 4000x4000 pixels.",
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <h3 className="font-medium mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
