"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  VolumeX,
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

export function MuteVideoClient({ dict }: { dict?: any }) {
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

  const handleMute = async () => {
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
      const outputName = `output.${ext}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(["-i", inputName, "-c:v", "copy", "-an", outputName]);
      const data = await ffmpeg.readFile(outputName);
      const mimeMap: Record<string, string> = {
        mp4: "video/mp4",
        webm: "video/webm",
        mkv: "video/x-matroska",
        avi: "video/x-msvideo",
      };
      const blob = new Blob([data], { type: mimeMap[ext] || "video/mp4" });
      setOutputUrl(URL.createObjectURL(blob));
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setFileName(`${baseName}_muted.${ext}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Processing failed. Please try again.";
      setError(message);
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
    link.download = fileName || "muted_video.mp4";
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
    <div className="w-full">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex w-full flex-col">
            <div className="hidden">
              <VolumeX className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
              {dict?.mute_video?.title || "Mute Video - Remove Audio"}
            </h1>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              {dict?.mute_video?.subtitle ||
                "Remove audio from any video file directly in your browser. 100% private, no upload to server."}
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
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                    : "border-muted-foreground/30 hover:border-violet-500/50 hover:bg-violet-50/50 dark:hover:bg-violet-900/10"
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
                  {dict?.mute_video?.drop_zone ||
                    "Drag & drop a video file here, or click to browse"}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  {dict?.mute_video?.supported ||
                    "Supported: MP4, WebM, MKV, AVI"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dict?.mute_video?.max_file_size ||
                    "Recommended max file size: 500MB"}
                </p>
              </div>
            )}

            {/* File Info */}
            {file && !outputUrl && (
              <Card className="w-full mb-2 border-violet-100 dark:border-violet-900/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <FileVideo className="w-10 h-10 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg mb-1 truncate">
                          {file.name}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.size)}</span>
                          <span>-</span>
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
                onClick={handleMute}
                disabled={converting || loading}
                className="w-full h-14 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {dict?.mute_video?.loading_engine ||
                      "Loading converter engine..."}
                  </>
                ) : converting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Removing audio... {progress}%
                  </>
                ) : (
                  <>
                    <VolumeX className="mr-2 h-5 w-5" />
                    {dict?.mute_video?.action_btn || "Remove Audio"}
                  </>
                )}
              </Button>
            )}

            {/* Progress Bar */}
            {converting && (
              <div className="w-full mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-violet-600 to-purple-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {progress}% {dict?.mute_video?.complete || "complete"}
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
                          {dict?.mute_video?.success_msg ||
                            "Audio Removed Successfully!"}
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
                        {dict?.mute_video?.download_btn ||
                          "Download Muted Video"}
                      </Button>
                      <Button
                        onClick={handleRemoveFile}
                        variant="outline"
                        className="flex-1"
                      >
                        {dict?.mute_video?.another_btn || "Mute Another Video"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Guide & FAQ Section */}
          <div className="w-full max-w-6xl mx-auto mt-3 px-4 space-y-3">
            {/* Step-by-Step Guide */}
            <section>
              <div className="mb-2">
                <div className="hidden">
                  <BookOpen className="w-8 h-8 text-violet-500" />
                </div>
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  {dict?.mute_video?.guide_title ||
                    "How to Remove Audio from Video"}
                </h2>
                <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
                  {dict?.mute_video?.guide_desc ||
                    "Follow these simple steps to mute any video file."}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-2">
                {[
                  {
                    step: 1,
                    title:
                      dict?.mute_video?.step1_title || "Select a Video File",
                    desc:
                      dict?.mute_video?.step1_desc ||
                      "Drag and drop a video file or click to browse. Supports MP4, WebM, MKV, and AVI formats.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: dict?.mute_video?.step2_title || "Remove Audio",
                    desc:
                      dict?.mute_video?.step2_desc ||
                      "Click the Remove Audio button. The process is fast since only the audio track is stripped without re-encoding the video.",
                    icon: VolumeX,
                  },
                  {
                    step: 3,
                    title:
                      dict?.mute_video?.step3_title || "Download Muted Video",
                    desc:
                      dict?.mute_video?.step3_desc ||
                      "Once processing is complete, click Download to save the silent video file to your device.",
                    icon: Download,
                  },
                ].map((step) => (
                  <Card
                    key={step.step}
                    className="border-violet-100 dark:border-violet-900/50"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-500 text-white font-bold">
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
              <div className="text-center mb-2">
                <div className="hidden">
                  <Lightbulb className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  {dict?.mute_video?.tips_title || "Video Muting Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {dict?.mute_video?.tips_desc ||
                    "Get the best results when removing audio from your videos."}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-2">
                {[
                  {
                    title: dict?.mute_video?.tip1_title || "No Quality Loss",
                    desc:
                      dict?.mute_video?.tip1_desc ||
                      "The video stream is copied directly without re-encoding, so video quality remains identical to the original.",
                    icon: CheckCircle2,
                  },
                  {
                    title: dict?.mute_video?.tip2_title || "100% Private",
                    desc:
                      dict?.mute_video?.tip2_desc ||
                      "Your video never leaves your device. All processing happens locally in your browser using WebAssembly.",
                    icon: Info,
                  },
                  {
                    title: dict?.mute_video?.tip3_title || "Fast Processing",
                    desc:
                      dict?.mute_video?.tip3_desc ||
                      "Since we skip re-encoding and just remove the audio track, the process is much faster than traditional converters.",
                    icon: VolumeX,
                  },
                  {
                    title: dict?.mute_video?.tip4_title || "Browser Support",
                    desc:
                      dict?.mute_video?.tip4_desc ||
                      "Works best in Chrome, Edge, and Firefox. Safari may have limited support for large files.",
                    icon: FileVideo,
                  },
                ].map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <div className="flex-shrink-0">
                      <tip.icon className="w-6 h-6 text-violet-500" />
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
              <div className="text-center mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  {dict?.mute_video?.faq_title || "Mute Video FAQ"}
                </h2>
                <p className="text-muted-foreground">
                  영상에서 소리를 제거하는 것에 대해 자주 묻는 질문입니다.
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    {dict?.mute_video?.faq_1_q ||
                      "제 영상이 서버에 업로드되나요?"}
                  </AccordionTrigger>
                  <AccordionContent className="whitespace-pre-line text-muted-foreground">
                    {dict?.mute_video?.faq_1_a ||
                      "No. All processing happens entirely in your browser using WebAssembly technology. Your video file never leaves your device, making it 100% private and secure."}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    {dict?.mute_video?.faq_2_q ||
                      "What video formats are supported?"}
                  </AccordionTrigger>
                  <AccordionContent className="whitespace-pre-line text-muted-foreground">
                    {dict?.mute_video?.faq_2_a ||
                      "We support the most common video formats: MP4, WebM, MKV, and AVI. The output file maintains the same format and video quality as the original."}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    {dict?.mute_video?.faq_3_q ||
                      "Does muting affect video quality?"}
                  </AccordionTrigger>
                  <AccordionContent className="whitespace-pre-line text-muted-foreground">
                    {dict?.mute_video?.faq_3_a ||
                      "No. The video stream is copied directly without re-encoding, so the video quality remains identical to the original. Only the audio track is removed."}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    {dict?.mute_video?.faq_4_q || "파일 용량 제한이 있나요?"}
                  </AccordionTrigger>
                  <AccordionContent className="whitespace-pre-line text-muted-foreground">
                    {dict?.mute_video?.faq_4_a ||
                      "There is no hard limit, but we recommend files under 500MB for the best experience. Larger files may cause your browser to slow down or run out of memory, especially on mobile devices."}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">
                    {dict?.mute_video?.faq_5_q ||
                      "How long does the process take?"}
                  </AccordionTrigger>
                  <AccordionContent className="whitespace-pre-line text-muted-foreground">
                    {dict?.mute_video?.faq_5_a ||
                      "Since we copy the video stream without re-encoding, the process is very fast — typically just a few seconds regardless of video length. The main time is spent reading and writing the file."}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
          </div>
        </div>
        <aside className="hidden shrink-0 xl:block xl:w-[200px]">
          <ToolsSidebar category="video-audio" dict={dict} />
        </aside>
      </div>
    </div>
  );
}
