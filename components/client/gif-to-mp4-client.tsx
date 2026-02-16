"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  FileVideo,
  Upload,
  Download,
  BookOpen,
  Lightbulb,
  Info,
  X,
  Loader2,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";

// Types only - actual imports happen dynamically to avoid SSR issues
type FFmpeg = any;

const FPS_OPTIONS = [
  { label: "10 FPS", value: 10 },
  { label: "15 FPS", value: 15 },
  { label: "24 FPS", value: 24 },
  { label: "30 FPS", value: 30 },
  { label: "60 FPS", value: 60 },
];

const QUALITY_OPTIONS = [
  { label: "Low (Smaller file)", value: 28 },
  { label: "Medium (Balanced)", value: 23 },
  { label: "High (Best quality)", value: 18 },
];

export function GifToMp4Client({ dict }: { dict?: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fps, setFps] = useState(15);
  const [quality, setQuality] = useState(23);
  const [progress, setProgress] = useState(0);
  const [converting, setConverting] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFFmpeg = async () => {
    setLoading(true);
    setError(null);
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress }: { progress: number }) => {
        setProgress(Math.round(progress * 100));
      });
      // Use UMD build (single-threaded) - does NOT require SharedArrayBuffer/COOP/COEP headers
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffmpegRef.current = ffmpeg;
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setConverting(true);
    setProgress(0);
    setError(null);
    setOutputUrl(null);

    try {
      if (!loaded) await loadFFmpeg();
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error("Converter not loaded");

      const { fetchFile } = await import("@ffmpeg/util");
      await ffmpeg.writeFile("input.gif", await fetchFile(file));
      await ffmpeg.exec([
        "-i", "input.gif",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", quality.toString(),
        "-r", fps.toString(),
        "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "output.mp4",
      ]);
      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data], { type: "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setFileName(`${baseName}.mp4`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Conversion failed. Please try again.";
      setError(message);
    } finally {
      setConverting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/gif")) {
      setError("Please select a GIF file.");
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setOutputUrl(null);
    setError(null);
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, []);

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setOutputUrl(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = fileName || "converted.mp4";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-3xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 mb-6">
          <FileVideo className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.gif_to_mp4?.title || "GIF to MP4 Converter"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.gif_to_mp4?.subtitle || "Convert animated GIF files to MP4 video format directly in your browser. Smaller file size, better quality."}
        </p>

        {/* Drop Zone */}
        {!file && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                : "border-muted-foreground/30 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {dict?.gif_to_mp4?.drop_zone || "Drag & drop a GIF file here, or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              {dict?.gif_to_mp4?.supported || "Supported: GIF (animated)"}
            </p>
            <p className="text-xs text-muted-foreground">
              {dict?.gif_to_mp4?.max_file_size || "Recommended max file size: 100MB"}
            </p>
          </div>
        )}

        {/* File Info & Settings */}
        {file && !outputUrl && (
          <Card className="w-full mb-6 border-emerald-100 dark:border-emerald-900/50">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <ImageIcon className="w-10 h-10 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg mb-1 truncate">{file.name}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>-</span>
                      <span>GIF</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* GIF Preview */}
              {previewUrl && (
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt="GIF preview"
                    className="max-h-64 rounded-lg border"
                  />
                </div>
              )}

              {/* Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frame Rate (FPS)</Label>
                  <div className="flex flex-wrap gap-2">
                    {FPS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFps(opt.value)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          fps === opt.value
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "border-gray-200 dark:border-gray-700 hover:border-emerald-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Quality</Label>
                  <div className="flex flex-wrap gap-2">
                    {QUALITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setQuality(opt.value)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          quality === opt.value
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "border-gray-200 dark:border-gray-700 hover:border-emerald-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Convert Button */}
        {file && !outputUrl && (
          <Button
            onClick={handleConvert}
            disabled={converting || loading}
            className="w-full h-14 text-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {dict?.gif_to_mp4?.loading_engine || "Loading converter engine..."}
              </>
            ) : converting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Converting... {progress}%
              </>
            ) : (
              <>
                <FileVideo className="mr-2 h-5 w-5" />
                {dict?.gif_to_mp4?.action_btn || "Convert to MP4"}
              </>
            )}
          </Button>
        )}

        {/* Progress Bar */}
        {converting && (
          <div className="w-full mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-600 to-green-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              {progress}% {dict?.gif_to_mp4?.complete || "complete"}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="w-full mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Download Section */}
        {outputUrl && (
          <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-green-100 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-semibold text-lg">{dict?.gif_to_mp4?.success_msg || "Conversion Complete!"}</p>
                    <p className="text-sm text-muted-foreground">{fileName}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {dict?.gif_to_mp4?.download_btn || "Download MP4"}
                  </Button>
                  <Button
                    onClick={handleRemoveFile}
                    variant="outline"
                    className="flex-1"
                  >
                    {dict?.gif_to_mp4?.another_btn || "Convert Another"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Guide & FAQ Section */}
      <div className="w-full max-w-6xl mx-auto mt-20 px-4 space-y-16">
        {/* Step-by-Step Guide */}
        <section>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
              <BookOpen className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.gif_to_mp4?.guide_title || "How to Convert GIF to MP4"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.gif_to_mp4?.guide_desc || "Follow these simple steps to convert your animated GIF to a compact MP4 video."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: dict?.gif_to_mp4?.step1_title || "Select a GIF File",
                desc: dict?.gif_to_mp4?.step1_desc || "Drag and drop an animated GIF file or click to browse. Large GIFs work best with this tool since MP4 offers much better compression.",
                icon: Upload,
              },
              {
                step: 2,
                title: dict?.gif_to_mp4?.step2_title || "Adjust Settings",
                desc: dict?.gif_to_mp4?.step2_desc || "Choose your preferred frame rate and quality level. Higher FPS means smoother playback, while lower CRF means better quality.",
                icon: ImageIcon,
              },
              {
                step: 3,
                title: dict?.gif_to_mp4?.step3_title || "Download MP4",
                desc: dict?.gif_to_mp4?.step3_desc || "Click Convert and download the resulting MP4 file. Enjoy a much smaller file size with the same visual quality.",
                icon: Download,
              },
            ].map((step) => (
              <Card key={step.step} className="border-emerald-100 dark:border-emerald-900/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tips & Best Practices */}
        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.gif_to_mp4?.tips_title || "GIF to MP4 Conversion Tips"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.gif_to_mp4?.tips_desc || "Get the best results from your GIF to MP4 conversions."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: dict?.gif_to_mp4?.tip1_title || "Massive Size Reduction",
                desc: dict?.gif_to_mp4?.tip1_desc || "MP4 files can be 80-90% smaller than the original GIF while maintaining the same visual quality thanks to H.264 compression.",
                icon: FileVideo,
              },
              {
                title: dict?.gif_to_mp4?.tip2_title || "100% Private",
                desc: dict?.gif_to_mp4?.tip2_desc || "Your GIF never leaves your device. All processing happens locally in your browser using WebAssembly technology.",
                icon: CheckCircle2,
              },
              {
                title: dict?.gif_to_mp4?.tip3_title || "Match the Original FPS",
                desc: dict?.gif_to_mp4?.tip3_desc || "For the most accurate conversion, match the frame rate of the original GIF. Most GIFs use 10-15 FPS.",
                icon: ImageIcon,
              },
              {
                title: dict?.gif_to_mp4?.tip4_title || "Browser Compatibility",
                desc: dict?.gif_to_mp4?.tip4_desc || "MP4 videos are universally supported across all modern browsers, social media platforms, and mobile devices.",
                icon: Info,
              },
            ].map((tip, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.gif_to_mp4?.faq_title || "GIF to MP4 FAQ"}
            </h2>
            <p className="text-muted-foreground">
              Common questions about converting GIF to MP4 video.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                {dict?.gif_to_mp4?.faq_1_q || "Why convert GIF to MP4?"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.gif_to_mp4?.faq_1_a || "MP4 files are significantly smaller than GIFs while maintaining the same visual quality. An MP4 can be 80-90% smaller than its GIF equivalent, making it ideal for web use, social media, and faster page loading."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                {dict?.gif_to_mp4?.faq_2_q || "Is my GIF uploaded to a server?"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.gif_to_mp4?.faq_2_a || "No. The conversion happens entirely in your browser using WebAssembly technology. Your GIF file never leaves your device, making it 100% private and secure."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                {dict?.gif_to_mp4?.faq_3_q || "What quality settings should I choose?"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.gif_to_mp4?.faq_3_a || "For most use cases, Medium quality (CRF 23) offers the best balance between file size and visual quality. Use High quality (CRF 18) for professional content where quality is critical, and Low quality (CRF 28) for maximum file size reduction."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                {dict?.gif_to_mp4?.faq_4_q || "What FPS should I select?"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.gif_to_mp4?.faq_4_a || "Most GIFs play at around 10-15 FPS. Choosing a higher FPS like 24 or 30 can make the animation smoother but will increase file size. Match the original GIF frame rate for the most accurate conversion."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                {dict?.gif_to_mp4?.faq_5_q || "Is there a file size limit?"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.gif_to_mp4?.faq_5_a || "There is no hard limit, but we recommend GIF files under 100MB for the best experience. Very large GIFs may cause your browser to slow down or run out of memory."}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  );
}
