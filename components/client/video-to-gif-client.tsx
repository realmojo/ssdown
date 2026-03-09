"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Film,
  Upload,
  Download,
  FileVideo,
  BookOpen,
  Lightbulb,
  X,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
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

// Types only - actual imports happen dynamically to avoid SSR issues
type FFmpeg = any;

export function VideoToGifClient({ dict }: { dict?: any }) {
  const [file, setFile] = useState<File | null>(null);
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
      // Use UMD build for broad compatibility without SharedArrayBuffer headers
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript",
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm",
        ),
      });
      ffmpegRef.current = ffmpeg;
      setLoaded(true);
    } catch (err: any) {
      console.error("FFmpeg load error:", err);
      setError(
        "Failed to load converter engine. Please refresh and try again.",
      );
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
      const ext = file.name.split(".").pop() || "mp4";
      const inputName = `input.${ext}`;

      // Write file to FFmpeg FS
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // Conversion command: simple high-quality scaling and framerate for GIF
      // fps=10: decent framerate for GIF
      // scale=480:-1: width 480px, retain aspect ratio (good balance of size/quality)
      await ffmpeg.exec([
        "-i",
        inputName,
        "-vf",
        "fps=10,scale=480:-1:flags=lanczos",
        "-c:v",
        "gif",
        "-f",
        "gif",
        "output.gif",
      ]);

      const data = await ffmpeg.readFile("output.gif");
      const blob = new Blob([data], { type: "image/gif" });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setFileName(`${baseName}.gif`);
    } catch (err: any) {
      console.error("Conversion error:", err);
      setError(err.message || "Conversion failed. Please try a shorter video.");
    } finally {
      setConverting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOutputUrl(null);
      setError(null);
    }
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
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile);
      setOutputUrl(null);
      setError(null);
    }
  }, []);

  const handleRemoveFile = () => {
    setFile(null);
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
    link.download = fileName || "animation.gif";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Cleanup URL object on unmount
  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-3xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 mb-6">
              <ImageIcon className="w-10 h-10 text-pink-600 dark:text-pink-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {dict?.video_to_gif?.title || "Video to GIF Converter"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {dict?.video_to_gif?.subtitle ||
                "Convert short video clips to animated GIFs directly in your browser. Fast, free, and private."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Drop Zone */}
            {!file && (
              <div className="w-full flex flex-col gap-4">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                    isDragging
                      ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                      : "border-muted-foreground/30 hover:border-pink-500/50 hover:bg-pink-50/50 dark:hover:bg-pink-900/10"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    {dict?.video_to_gif?.drop_zone ||
                      "Drag & drop a video file here, or click to browse"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    {dict?.video_to_gif?.supported ||
                      "Supported: MP4, WebM, MOV"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dict?.video_to_gif?.max_size ||
                      "Recommended: Short clips under 30 seconds"}
                  </p>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async (e) => {
                      e.stopPropagation();
                      setLoading(true);
                      try {
                        const response = await fetch("/test-1.mp4");
                        const blob = await response.blob();
                        const testFile = new File([blob], "test-1.mp4", {
                          type: "video/mp4",
                        });
                        setFile(testFile);
                        setOutputUrl(null);
                        setError(null);
                      } catch {
                        setError("Failed to load test video");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="text-xs text-muted-foreground hover:text-pink-600 dark:hover:text-pink-400"
                  >
                    Try with sample video
                  </Button>
                </div>
              </div>
            )}

            {/* File Info */}
            {file && !outputUrl && (
              <Card className="w-full mb-6 border-pink-100 dark:border-pink-900/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <FileVideo className="w-10 h-10 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg mb-1 truncate">
                          {file.name}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.type || "Unknown type"}</span>
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
                </CardContent>
              </Card>
            )}

            {/* Convert Button */}
            {file && !outputUrl && (
              <Button
                onClick={handleConvert}
                disabled={converting || loading}
                className="w-full h-14 text-lg bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {dict?.video_to_gif?.loading_ffmpeg ||
                      "Loading converter engine..."}
                  </>
                ) : converting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {dict?.video_to_gif?.converting || "Converting..."}{" "}
                    {progress}%
                  </>
                ) : (
                  <>
                    <Film className="mr-2 h-5 w-5" />
                    {dict?.video_to_gif?.convert_btn || "Convert to GIF"}
                  </>
                )}
              </Button>
            )}

            {/* Progress Bar */}
            {converting && (
              <div className="w-full mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-600 to-rose-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {progress}% complete
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="w-full mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </p>
              </div>
            )}

            {/* Download Section & Preview */}
            {outputUrl && (
              <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-green-100 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10 overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-6">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3 mx-auto">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-green-700 dark:text-green-400">
                          GIF Ready!
                        </h3>
                      </div>

                      {/* Preview Image */}
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm max-w-full">
                        <img
                          src={outputUrl}
                          alt="Generated GIF"
                          className="max-h-[300px] w-auto object-contain"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Button
                          onClick={handleDownload}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 text-lg"
                        >
                          <Download className="mr-2 h-5 w-5" />
                          {dict?.video_to_gif?.download_btn || "Download GIF"}
                        </Button>
                        <Button
                          onClick={handleRemoveFile}
                          variant="outline"
                          className="flex-1 h-12"
                        >
                          Convert Another
                        </Button>
                      </div>
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 mb-4">
                  <BookOpen className="w-8 h-8 text-pink-500" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {dict?.video_to_gif?.guide_title ||
                    "How to Convert Video to GIF"}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {dict?.video_to_gif?.guide_desc ||
                    "Follow these simple steps to turn your video into an animated GIF."}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: dict?.video_to_gif?.step1_title || "Select a Video",
                    desc:
                      dict?.video_to_gif?.step1_desc ||
                      "Upload a short video clip (MP4, MOV, etc). Shorter clips work best for GIFs.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: dict?.video_to_gif?.step2_title || "Convert",
                    desc:
                      dict?.video_to_gif?.step2_desc ||
                      "Click the convert button. We'll process the video directly in your browser using FFmpeg technology.",
                    icon: Film,
                  },
                  {
                    step: 3,
                    title: dict?.video_to_gif?.step3_title || "Download GIF",
                    desc:
                      dict?.video_to_gif?.step3_desc ||
                      "Preview your new GIF animation and download it to share instantly.",
                    icon: Download,
                  },
                ].map((step) => (
                  <Card
                    key={step.step}
                    className="border-pink-100 dark:border-pink-900/50"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-500 text-white font-bold">
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

            {/* Tips Section */}
            <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
                  <Lightbulb className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {dict?.video_to_gif?.tips_title || "Pro Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {dict?.video_to_gif?.tips_desc ||
                    "For the best looking GIFs, keep these tips in mind."}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: dict?.video_to_gif?.tip1_title || "Keep it Short",
                    desc:
                      dict?.video_to_gif?.tip1_desc ||
                      "GIFs are best for loops under 10 seconds. Long videos result in huge files.",
                    icon: FileVideo,
                  },
                  {
                    title: dict?.video_to_gif?.tip2_title || "100% Private",
                    desc:
                      dict?.video_to_gif?.tip2_desc ||
                      "Your video never leaves your device. All processing happens locally.",
                    icon: CheckCircle2,
                  },
                  {
                    title: dict?.video_to_gif?.tip3_title || "Frame Rate",
                    desc:
                      dict?.video_to_gif?.tip3_desc ||
                      "We optimize the frame rate (10-15fps) to balance smoothness and file size.",
                    icon: Film,
                  },
                  {
                    title: dict?.video_to_gif?.tip4_title || "Browser Support",
                    desc:
                      dict?.video_to_gif?.tip4_desc ||
                      "Works on modern browsers like Chrome, Edge, and Firefox.",
                    icon: CheckCircle2,
                  },
                ].map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <div className="flex-shrink-0">
                      <tip.icon className="w-6 h-6 text-pink-500" />
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

            {/* FAQ Section */}
            <section>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {dict?.qna_video_to_gif?.title || "Video to GIF FAQ"}
                </h2>
                <p className="text-muted-foreground">
                  {dict?.qna_video_to_gif?.desc ||
                    "Common questions about converting video to GIF."}
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {[1, 2, 3, 4, 5].map((i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left">
                      {dict?.qna_video_to_gif?.[`faq_${i}_q`] || "Question"}
                    </AccordionTrigger>
                    <AccordionContent className="whitespace-pre-line text-muted-foreground">
                      {dict?.qna_video_to_gif?.[`faq_${i}_a`] || "Answer"}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>
        </div>
        <aside className="hidden lg:block w-64 shrink-0">
          <ToolsSidebar category="video-audio" dict={dict} />
        </aside>
      </div>
    </div>
  );
}
