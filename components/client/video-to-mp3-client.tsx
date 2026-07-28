"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Music,
  Upload,
  Download,
  FileVideo,
  BookOpen,
  Lightbulb,
  Info,
  X,
  Loader2,
  CheckCircle2,
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

export function VideoToMp3Client({ dict }: { dict?: any }) {
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
      // Use UMD build (single-threaded) - does NOT require SharedArrayBuffer/COOP/COEP headers
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
      if (!ffmpeg) throw new Error("변환기가 아직 준비되지 않았습니다");

      const { fetchFile } = await import("@ffmpeg/util");
      const ext = file.name.split(".").pop() || "mp4";
      const inputName = `input.${ext}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec([
        "-i",
        inputName,
        "-vn",
        "-acodec",
        "libmp3lame",
        "-q:a",
        "2",
        "output.mp3",
      ]);
      const data = await ffmpeg.readFile("output.mp3");
      const blob = new Blob([data], { type: "audio/mpeg" });
      setOutputUrl(URL.createObjectURL(blob));
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setFileName(`${baseName}.mp3`);
    } catch (err: any) {
      setError(err.message || "변환하지 못했습니다. 다시 시도해 주세요.");
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
    link.download = fileName || "audio.mp3";
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

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-3xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 mb-6">
              <Music className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {dict?.video_to_mp3?.title || "Video to MP3 Converter"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {dict?.video_to_mp3?.subtitle ||
                "Convert any video file to MP3 audio directly in your browser. 100% private, no upload to server."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Drop Zone */}
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
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {dict?.video_to_mp3?.drop_zone ||
                    "Drag & drop a video file here, or click to browse"}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  {dict?.video_to_mp3?.supported ||
                    "Supported: MP4, WebM, MKV, AVI, MOV"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dict?.video_to_mp3?.max_size ||
                    "Recommended max file size: 500MB"}
                </p>
              </div>
            )}

            {/* File Info */}
            {file && !outputUrl && (
              <Card className="w-full mb-6 border-purple-100 dark:border-purple-900/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <FileVideo className="w-10 h-10 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
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
                className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {dict?.video_to_mp3?.loading_ffmpeg ||
                      "Loading converter engine..."}
                  </>
                ) : converting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {dict?.video_to_mp3?.converting || "Converting..."}{" "}
                    {progress}%
                  </>
                ) : (
                  <>
                    <Music className="mr-2 h-5 w-5" />
                    {dict?.video_to_mp3?.convert_btn || "Convert to MP3"}
                  </>
                )}
              </Button>
            )}

            {/* Progress Bar */}
            {converting && (
              <div className="w-full mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full transition-all duration-300 ease-out"
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

            {/* Download Section */}
            {outputUrl && (
              <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-green-100 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-semibold text-lg">
                          변환이 완료됐습니다!
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {fileName}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleDownload}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {dict?.video_to_mp3?.download_btn || "Download MP3"}
                      </Button>
                      <Button
                        onClick={handleRemoveFile}
                        variant="outline"
                        className="flex-1"
                      >
                        다른 파일 변환
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                  <BookOpen className="w-8 h-8 text-purple-500" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {dict?.video_to_mp3?.guide_title ||
                    "How to Convert Video to MP3"}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {dict?.video_to_mp3?.guide_desc ||
                    "Follow these simple steps to extract audio from any video file."}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title:
                      dict?.video_to_mp3?.step1_title || "Select a Video File",
                    desc:
                      dict?.video_to_mp3?.step1_desc ||
                      "Drag and drop a video file or click to browse. Supports MP4, WebM, MKV, AVI, and MOV formats.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: dict?.video_to_mp3?.step2_title || "Convert to MP3",
                    desc:
                      dict?.video_to_mp3?.step2_desc ||
                      "Click the Convert button. The conversion happens entirely in your browser using FFmpeg technology.",
                    icon: Music,
                  },
                  {
                    step: 3,
                    title:
                      dict?.video_to_mp3?.step3_title || "Download Your MP3",
                    desc:
                      dict?.video_to_mp3?.step3_desc ||
                      "Once conversion is complete, click Download to save the MP3 file to your device.",
                    icon: Download,
                  },
                ].map((step) => (
                  <Card
                    key={step.step}
                    className="border-purple-100 dark:border-purple-900/50"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 text-white font-bold">
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

            {/* 활용 팁 */}
            <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
                  <Lightbulb className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {dict?.video_to_mp3?.tips_title ||
                    "Video to MP3 Conversion Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {dict?.video_to_mp3?.tips_desc ||
                    "Get the best results from your video to audio conversions."}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title:
                      dict?.video_to_mp3?.tip1_title || "File Size Matters",
                    desc:
                      dict?.video_to_mp3?.tip1_desc ||
                      "Larger files take longer to convert. For best performance, use files under 500MB.",
                    icon: FileVideo,
                  },
                  {
                    title: dict?.video_to_mp3?.tip2_title || "100% Private",
                    desc:
                      dict?.video_to_mp3?.tip2_desc ||
                      "Your video never leaves your device. All processing happens locally in your browser.",
                    icon: CheckCircle2,
                  },
                  {
                    title: dict?.video_to_mp3?.tip3_title || "Audio Quality",
                    desc:
                      dict?.video_to_mp3?.tip3_desc ||
                      "The output MP3 is encoded at high quality (VBR ~190kbps) for the best balance of size and quality.",
                    icon: Music,
                  },
                  {
                    title: dict?.video_to_mp3?.tip4_title || "Browser Support",
                    desc:
                      dict?.video_to_mp3?.tip4_desc ||
                      "Works best in Chrome, Edge, and Firefox. Safari may have limited support for large files.",
                    icon: Info,
                  },
                ].map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <div className="flex-shrink-0">
                      <tip.icon className="w-6 h-6 text-purple-500" />
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

            {/* Features & Capabilities */}
            <section>
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <Info className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {dict?.video_to_mp3?.features_title || "Converter Features"}
                </h2>
                <p className="text-muted-foreground">
                  {dict?.video_to_mp3?.features_desc ||
                    "Everything you need for video to audio conversion."}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title:
                      dict?.video_to_mp3?.feature1_title || "Browser-Based",
                    desc:
                      dict?.video_to_mp3?.feature1_desc ||
                      "No software installation needed. Convert directly in your web browser.",
                  },
                  {
                    title:
                      dict?.video_to_mp3?.feature2_title || "Multiple Formats",
                    desc:
                      dict?.video_to_mp3?.feature2_desc ||
                      "Supports MP4, WebM, MKV, AVI, and MOV video input formats.",
                  },
                  {
                    title:
                      dict?.video_to_mp3?.feature3_title ||
                      "High Quality Output",
                    desc:
                      dict?.video_to_mp3?.feature3_desc ||
                      "MP3 output with high-quality VBR encoding for excellent audio fidelity.",
                  },
                  {
                    title: dict?.video_to_mp3?.feature4_title || "Zero Upload",
                    desc:
                      dict?.video_to_mp3?.feature4_desc ||
                      "Files are processed locally. Nothing is uploaded to any server.",
                  },
                ].map((feature, idx) => (
                  <Card key={idx} className="text-center">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* FAQ Section */}
            <section>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {dict?.qna_video_to_mp3?.title || "Video to MP3 FAQ"}
                </h2>
                <p className="text-muted-foreground">
                  {dict?.qna_video_to_mp3?.desc ||
                    "Common questions about converting video to MP3 audio."}
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {[1, 2, 3, 4, 5].map((i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left">
                      {dict?.qna_video_to_mp3?.[`faq_${i}_q`] || "Question"}
                    </AccordionTrigger>
                    <AccordionContent className="whitespace-pre-line text-muted-foreground">
                      {dict?.qna_video_to_mp3?.[`faq_${i}_a`] || "Answer"}
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
