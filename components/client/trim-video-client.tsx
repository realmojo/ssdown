"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
import Adsense from "@/components/Adsense";
  Scissors,
  Upload,
  Download,
  FileVideo,
  BookOpen,
  Lightbulb,
  Info,
  X,
  Loader2,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Types only - actual imports happen dynamically to avoid SSR issues
type FFmpeg = any;

export function TrimVideoClient({ dict }: { dict?: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [draggingHandle, setDraggingHandle] = useState<"start" | "end" | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Load FFmpeg
  const loadFFmpeg = async () => {
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();

      ffmpeg.on("progress", ({ progress }: { progress: number }) => {
        setProgress(Math.round(progress * 100));
      });

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      ffmpegRef.current = ffmpeg;
      setFfmpegLoaded(true);
    } catch (err) {
      console.error("Failed to load FFmpeg", err);
      setError("Failed to load video processing engine. Please try a different browser.");
    }
  };

  // Initialize FFmpeg on mount
  useEffect(() => {
    loadFFmpeg();
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("video/")) {
      setError("Please upload a valid video file.");
      return;
    }
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setVideoUrl(url);
    setDownloadUrl(null);
    setError(null);
    setProgress(0);
    setIsPlaying(false);
  };

  // Video loaded metadata handler
  const onLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setRange([0, dur]);
      setCurrentTime(0);
    }
  };

  // Playback control
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      if (currentTime >= range[1]) {
        videoRef.current.currentTime = range[0];
      }
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Update current time during playback
  const onTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      if (time >= range[1]) {
        videoRef.current.pause();
        setIsPlaying(false);
        videoRef.current.currentTime = range[0];
      }
    }
  };

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Drag and drop handlers
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
    if (droppedFile?.type.startsWith("video/")) {
      processFile(droppedFile);
    }
  }, []);

  // Slider mouse interaction
  const getTimeFromMouseEvent = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const slider = sliderRef.current;
      if (!slider || duration <= 0) return 0;
      const rect = slider.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      return Math.round((x / rect.width) * duration * 100) / 100;
    },
    [duration],
  );

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    if (duration <= 0) return;
    const time = getTimeFromMouseEvent(e);
    const startDist = Math.abs(time - range[0]);
    const endDist = Math.abs(time - range[1]);

    if (startDist <= endDist) {
      setDraggingHandle("start");
    } else {
      setDraggingHandle("end");
    }
  };

  useEffect(() => {
    if (!draggingHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      const time = getTimeFromMouseEvent(e);
      if (draggingHandle === "start") {
        const newStart = Math.max(0, Math.min(time, range[1] - 0.5));
        setRange([newStart, range[1]]);
        if (videoRef.current) {
          videoRef.current.currentTime = newStart;
          setCurrentTime(newStart);
        }
      } else if (draggingHandle === "end") {
        const newEnd = Math.min(duration, Math.max(time, range[0] + 0.5));
        setRange([range[0], newEnd]);
      }
    };

    const handleMouseUp = () => {
      setDraggingHandle(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingHandle, range, duration, getTimeFromMouseEvent]);

  // Trim Logic
  const handleTrim = async () => {
    if (!file || !ffmpegRef.current) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      const { fetchFile } = await import("@ffmpeg/util");

      const ext = file.name.split(".").pop() || "mp4";
      const inputName = `input.${ext}`;
      const outputName = `output.${ext}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      await ffmpeg.exec([
        "-i", inputName,
        "-ss", range[0].toString(),
        "-to", range[1].toString(),
        "-c", "copy",
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      const mimeMap: Record<string, string> = {
        mp4: "video/mp4",
        webm: "video/webm",
        mkv: "video/x-matroska",
      };
      const blob = new Blob([data], { type: mimeMap[ext] || "video/mp4" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      console.error(err);
      setError("Failed to trim video. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setVideoUrl(null);
    setDownloadUrl(null);
    setRange([0, 0]);
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startPercent = duration > 0 ? (range[0] / duration) * 100 : 0;
  const endPercent = duration > 0 ? (range[1] / duration) * 100 : 100;
  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-3xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 mb-6">
          <Scissors className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.trim_video?.title || "Trim Video Online"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.trim_video?.subtitle || "Cut and trim video files by selecting start and end points. Fast, free, and private — all processing in your browser."}
        </p>

        {/* Upload Section */}
        {!file && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                : "border-muted-foreground/30 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-900/10"
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
              {dict?.trim_video?.drop_zone || "Drag & drop a video file here, or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              {dict?.trim_video?.supported || "Supported: MP4, WebM, MKV"}
            </p>
            <p className="text-xs text-muted-foreground">
              {dict?.trim_video?.max_file_size || "Recommended max file size: 500MB"}
            </p>
          </div>
        )}

        {/* Editor Section */}
        {file && !downloadUrl && (
          <Card className="w-full border-amber-100 dark:border-amber-900/50 animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <FileVideo className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg line-clamp-1">{file.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(duration)} - {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={reset}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Video Preview */}
              {videoUrl && (
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    onLoadedMetadata={onLoadedMetadata}
                    onTimeUpdate={onTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full max-h-80 object-contain"
                  />
                </div>
              )}

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-12 w-12 rounded-full"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </Button>
                <div className="text-2xl font-mono tabular-nums">
                  {formatTime(currentTime)}
                </div>
              </div>

              {/* Timeline Slider */}
              <div className="space-y-2">
                <div
                  ref={sliderRef}
                  className="relative w-full h-12 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer select-none border border-gray-200 dark:border-gray-700"
                  onMouseDown={handleSliderMouseDown}
                >
                  {/* Selected range */}
                  <div
                    className="absolute top-0 h-full bg-amber-200/50 dark:bg-amber-900/30"
                    style={{
                      left: `${startPercent}%`,
                      width: `${endPercent - startPercent}%`,
                    }}
                  />

                  {/* Start handle */}
                  <div
                    className="absolute top-0 h-full w-1 bg-amber-600 cursor-col-resize"
                    style={{ left: `${startPercent}%` }}
                  >
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-5 h-8 bg-amber-600 rounded-md flex items-center justify-center">
                      <div className="w-0.5 h-3 bg-white rounded-full" />
                    </div>
                  </div>

                  {/* End handle */}
                  <div
                    className="absolute top-0 h-full w-1 bg-amber-600 cursor-col-resize"
                    style={{ left: `${endPercent}%` }}
                  >
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-5 h-8 bg-amber-600 rounded-md flex items-center justify-center">
                      <div className="w-0.5 h-3 bg-white rounded-full" />
                    </div>
                  </div>

                  {/* Current time indicator */}
                  {currentTime > 0 && (
                    <div
                      className="absolute top-0 h-full w-0.5 bg-red-500"
                      style={{ left: `${currentPercent}%` }}
                    >
                      <div className="absolute -left-1 top-0 w-2.5 h-2.5 bg-red-500 rounded-full" />
                    </div>
                  )}
                </div>

                {/* Time labels */}
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>{formatTime(0)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Selection Range Info */}
              <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-100 dark:border-amber-900/50">
                <div className="flex-1 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Start</p>
                  <p className="text-sm font-mono font-semibold text-amber-600 dark:text-amber-400">
                    {formatTime(range[0])}
                  </p>
                </div>
                <div className="w-px h-8 bg-amber-200 dark:bg-amber-800" />
                <div className="flex-1 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Duration</p>
                  <p className="text-sm font-mono font-semibold">
                    {formatTime(range[1] - range[0])}
                  </p>
                </div>
                <div className="w-px h-8 bg-amber-200 dark:bg-amber-800" />
                <div className="flex-1 text-center">
                  <p className="text-xs text-muted-foreground mb-1">End</p>
                  <p className="text-sm font-mono font-semibold text-amber-600 dark:text-amber-400">
                    {formatTime(range[1])}
                  </p>
                </div>
              </div>

              {/* Exact Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time (sec)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max={range[1]}
                    value={Math.round(range[0] * 100) / 100}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      const newStart = Math.min(val, range[1] - 0.5);
                      setRange([newStart, range[1]]);
                      if (videoRef.current) {
                        videoRef.current.currentTime = newStart;
                        setCurrentTime(newStart);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time (sec)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={range[0]}
                    max={duration}
                    value={Math.round(range[1] * 100) / 100}
                    onChange={(e) => {
                      const val = Math.min(duration, parseFloat(e.target.value) || duration);
                      setRange([range[0], Math.max(val, range[0] + 0.5)]);
                    }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleTrim}
                disabled={isProcessing || !ffmpegLoaded}
                className="w-full h-12 text-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Trimming... {progress}%
                  </>
                ) : (
                  <>
                    <Scissors className="mr-2 h-5 w-5" />
                    {dict?.trim_video?.action_btn || "Trim Video"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Download Section */}
        {downloadUrl && (
          <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-green-100 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4 mb-6">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Download className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-300">
                      Ready to Download!
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Trimmed Duration: {formatTime(range[1] - range[0])}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={downloadUrl}
                    download={`trimmed_${file?.name}`}
                    className="flex-1"
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <Download className="mr-2 h-4 w-4" />
                      {dict?.trim_video?.download_btn || "Download Trimmed Video"}
                    </Button>
                  </a>
                  <Button variant="outline" onClick={reset} className="flex-1">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {dict?.trim_video?.another_btn || "Trim Another"}
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
      </div>

      {/* Guide & FAQ Section */}
      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        {/* Step-by-Step Guide */}
        <section>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
              <BookOpen className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.trim_video?.guide_title || "How to Trim a Video"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.trim_video?.guide_desc || "Cut your video in 3 simple steps."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: dict?.trim_video?.step1_title || "Upload Video",
                desc: dict?.trim_video?.step1_desc || "Drag and drop a video file or click to browse. Supports MP4, WebM, and MKV formats up to 500MB.",
                icon: Upload,
              },
              {
                step: 2,
                title: dict?.trim_video?.step2_title || "Select Range",
                desc: dict?.trim_video?.step2_desc || "Use the timeline slider or enter exact times to select the portion of the video you want to keep.",
                icon: Scissors,
              },
              {
                step: 3,
                title: dict?.trim_video?.step3_title || "Trim & Download",
                desc: dict?.trim_video?.step3_desc || "Click Trim Video and download the result. The process is fast since we copy the stream without re-encoding.",
                icon: Download,
              },
            ].map((step) => (
              <Card key={step.step} className="border-amber-100 dark:border-amber-900/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white font-bold">
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
              {dict?.trim_video?.tips_title || "Video Trimming Tips"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.trim_video?.tips_desc || "Get the best results when cutting your videos."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: dict?.trim_video?.tip1_title || "No Quality Loss",
                desc: dict?.trim_video?.tip1_desc || "We use stream copying which copies video and audio without re-encoding. Your trimmed video has identical quality to the original.",
                icon: CheckCircle2,
              },
              {
                title: dict?.trim_video?.tip2_title || "100% Private",
                desc: dict?.trim_video?.tip2_desc || "Your video never leaves your device. All processing happens locally in your browser using WebAssembly technology.",
                icon: Info,
              },
              {
                title: dict?.trim_video?.tip3_title || "Preview Before Trimming",
                desc: dict?.trim_video?.tip3_desc || "Use the play button to preview your selected range before trimming. This ensures you capture exactly the right moment.",
                icon: Play,
              },
              {
                title: dict?.trim_video?.tip4_title || "Precise Time Input",
                desc: dict?.trim_video?.tip4_desc || "For frame-accurate trimming, use the manual time input fields instead of the slider. Enter values in seconds with decimal precision.",
                icon: Scissors,
              },
            ].map((tip, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-amber-500" />
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
        <Adsense slotId="7759160077" />

        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.trim_video?.faq_title || "Trim Video FAQ"}
            </h2>
            <p className="text-muted-foreground">
              Common questions about trimming videos online.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                {dict?.trim_video?.faq_1_q || "Is my video uploaded to a server?"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.trim_video?.faq_1_a || "No. All processing happens entirely in your browser using WebAssembly technology. Your video file never leaves your device, making it 100% private and secure."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                {dict?.trim_video?.faq_2_q || "What video formats are supported?"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.trim_video?.faq_2_a || "We support the most common video formats: MP4, WebM, and MKV. The output file maintains the same format and quality as the original since we use stream copying."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                {dict?.trim_video?.faq_3_q || "Does trimming affect video quality?"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.trim_video?.faq_3_a || "No. We use stream copying (-c copy) which copies the video and audio streams directly without re-encoding. This means zero quality loss and very fast processing."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                {dict?.trim_video?.faq_4_q || "Is there a file size limit?"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.trim_video?.faq_4_a || "There is no hard limit, but we recommend files under 500MB for the best experience. Larger files may cause your browser to slow down or run out of memory, especially on mobile devices."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                {dict?.trim_video?.faq_5_q || "Why might the trim be slightly inaccurate?"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.trim_video?.faq_5_a || "Since we use stream copying for instant processing and zero quality loss, the actual cut points may snap to the nearest keyframe. For most videos, this is within 1-2 seconds of the selected point. Re-encoding would give exact cuts but takes much longer."}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  );
}
