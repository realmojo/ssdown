"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileVideo,
  Image as ImageIcon,
  Loader2,
  Settings2,
  CheckCircle2,
  Film,
  X,
  BookOpen,
  Lightbulb,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import JSZip from "jszip";
import Adsense from "@/components/Adsense";

interface ExtractedFrame {
  id: number;
  time: number;
  url: string;
  blob: Blob;
}

export function VideoFrameExtractorClient({ dict }: { dict?: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [interval, setInterval] = useState<string>("1"); // seconds
  const [quality, setQuality] = useState<number>(0.9);
  const [format, setFormat] = useState<string>("image/jpeg");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isCancelledRef = useRef(false);

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setFrames([]);
    setError(null);
    setProgress(0);

    // Create temp video URL to get duration
    const url = URL.createObjectURL(selectedFile);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.onloadedmetadata = () => {
      setVideoDuration(video.duration);
      URL.revokeObjectURL(url);
    };
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
    if (droppedFile?.type.startsWith("video/")) {
      processFile(droppedFile);
    }
  }, []);

  const extractFrames = async () => {
    if (!file) return;

    setIsProcessing(true);
    setFrames([]);
    setProgress(0);
    setError(null);
    isCancelledRef.current = false;

    const videoUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    videoRef.current = video;

    const intervalSec = parseFloat(interval);
    const extracted: ExtractedFrame[] = [];

    try {
      // Explicitly trigger loading (required for off-DOM video elements)
      video.load();

      // Wait for video to load with timeout and error handling
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Video load timeout. Please try a different file."));
        }, 15000);

        if (video.readyState >= 2) {
          clearTimeout(timeout);
          resolve();
          return;
        }

        video.onloadeddata = () => {
          clearTimeout(timeout);
          resolve();
        };

        video.onerror = () => {
          clearTimeout(timeout);
          reject(
            new Error(
              "Video loading failed. The format may not be supported by your browser.",
            ),
          );
        };
      });

      const duration = video.duration;
      if (!isFinite(duration) || duration <= 0) {
        throw new Error("Invalid video duration");
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      let currentTime = 0;
      let frameCount = 0;
      const totalFrames = Math.floor(duration / intervalSec);

      while (currentTime <= duration) {
        if (isCancelledRef.current) break;

        // Seek video with robust waiting
        video.currentTime = currentTime;

        await new Promise<void>((resolve) => {
          let resolved = false;

          const onSeeked = () => {
            if (resolved) return;
            resolved = true;
            video.removeEventListener("seeked", onSeeked);
            resolve();
          };

          video.addEventListener("seeked", onSeeked);

          // Fallback timeout in case seeked event doesn't fire
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              video.removeEventListener("seeked", onSeeked);
              resolve();
            }
          }, 1000);
        });

        // Draw frame
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, format, quality),
          );

          if (blob) {
            const url = URL.createObjectURL(blob);
            extracted.push({
              id: frameCount,
              time: currentTime,
              url,
              blob,
            });
            // Update UI progressively every 5 frames
            if (extracted.length % 5 === 0) setFrames([...extracted]);
          }
        }

        currentTime += intervalSec;
        frameCount++;
        setProgress(
          Math.min(Math.round((frameCount / (totalFrames + 1)) * 100), 100),
        );

        // Small delay to prevent UI freezing
        await new Promise((r) => setTimeout(r, 10));
      }
      // Final update
      setFrames([...extracted]);
    } catch (err) {
      console.error("Frame extraction error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process video frames.",
      );
    } finally {
      URL.revokeObjectURL(videoUrl);
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const downloadAll = async () => {
    if (frames.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder("frames");

    frames.forEach((frame) => {
      const ext = format === "image/png" ? "png" : "jpg";
      const filename = `frame_${frame.time.toFixed(2)}s.${ext}`;
      if (folder) folder.file(filename, frame.blob);
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `frames_${file?.name || "video"}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadSingle = (frame: ExtractedFrame) => {
    const link = document.createElement("a");
    link.href = frame.url;
    const ext = format === "image/png" ? "png" : "jpg";
    link.download = `frame_${frame.time.toFixed(2)}s.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    isCancelledRef.current = true;
    frames.forEach((f) => URL.revokeObjectURL(f.url));
    setFrames([]);
    setFile(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 mb-6">
          <ImageIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.video_frame_extractor?.title || "Video Frame Extractor"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.video_frame_extractor?.subtitle ||
            "Extract high-quality images from your videos frame by frame. 100% client-side API."}
        </p>

        <Adsense slotId="7759160077" />

        {/* Upload Section */}
        {!file && (
          <div className="w-full max-w-2xl">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-muted-foreground/30 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
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
                {dict?.video_frame_extractor?.drop_zone ||
                  "Drag & drop a video file here, or click to browse"}
              </p>
              <p className="text-sm text-muted-foreground">
                {dict?.video_frame_extractor?.supported ||
                  "Supported: MP4, WebM, MOV, AVI"}
              </p>
            </div>

            {/* Test Button */}
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const response = await fetch("/test-1.mp4");
                    const blob = await response.blob();
                    const testFile = new File([blob], "test-1.mp4", {
                      type: "video/mp4",
                    });
                    processFile(testFile);
                  } catch {
                    setError("Failed to load test video");
                  }
                }}
                className="text-xs text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Try with sample video
              </Button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-2xl mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <X className="w-4 h-4" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Configuration & Process Section */}
        {file && frames.length === 0 && !isProcessing && (
          <Card className="w-full border-indigo-100 dark:border-indigo-900/50 animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <FileVideo className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{file.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(videoDuration)} •{" "}
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleReset}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Settings Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Extract every (seconds)</Label>
                    <Select value={interval} onValueChange={setInterval}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">0.5 seconds</SelectItem>
                        <SelectItem value="1">1 second</SelectItem>
                        <SelectItem value="2">2 seconds</SelectItem>
                        <SelectItem value="5">5 seconds</SelectItem>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">60 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Output Format</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image/jpeg">
                          JPEG (Smaller size)
                        </SelectItem>
                        <SelectItem value="image/png">
                          PNG (Lossless)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quality: {Math.round(quality * 100)}%</Label>
                    <Slider
                      value={[quality]}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      onValueChange={(val) => setQuality(val[0])}
                      disabled={format === "image/png"}
                    />
                    <p className="text-xs text-muted-foreground">
                      Only applies to JPEG format
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <Button
                  onClick={extractFrames}
                  disabled={isProcessing}
                  className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Film className="w-5 h-5 mr-2" />
                  Start Extraction
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing State */}
        {isProcessing && (
          <Card className="w-full border-indigo-100 dark:border-indigo-900/50">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-600" />
              <h3 className="text-xl font-semibold">Extracting Frames...</h3>
              <div className="w-full max-w-md mx-auto">
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {progress}% completed
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {frames.length > 0 && !isProcessing && (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex flex-wrap items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-semibold">
                  {frames.length} frames extracted
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset}>
                  Extract New
                </Button>
                <Button
                  onClick={downloadAll}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All (ZIP)
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {frames.map((frame) => (
                <div
                  key={frame.id}
                  className="group relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border"
                >
                  <img
                    src={frame.url}
                    alt={`Frame at ${frame.time}s`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <span className="text-white text-xs font-medium">
                      {frame.time.toFixed(1)}s
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs w-full"
                      onClick={() => downloadSingle(frame)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guide Section */}
      <div className="w-full max-w-6xl mx-auto mt-20 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
              <BookOpen className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.video_frame_extractor?.guide_title ||
                "How to Extract Frames"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.video_frame_extractor?.guide_desc ||
                "Extracting high-quality images from video is easy."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: "Upload Video",
                desc: "Select any video file (MP4, MOV, WebM). No size limits as everything runs locally.",
                icon: Upload,
              },
              {
                step: 2,
                title: "Configure",
                desc: "Choose the time interval (e.g., every 1 second) and output quality settings.",
                icon: Settings2,
              },
              {
                step: 3,
                title: "Extract & Download",
                desc: "Process the video to get all frames. Download individual images or a ZIP archive.",
                icon: Download,
              },
            ].map((step, idx) => (
              <Card
                key={idx}
                className="border-indigo-100 dark:border-indigo-900/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500 text-white font-bold">
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

        {/* Tips & Best Practices */}
        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.video_frame_extractor?.tips_title ||
                "Frame Extraction Tips"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.video_frame_extractor?.tips_desc ||
                "Get the best results for your frame captures."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title:
                  dict?.video_frame_extractor?.tip1_title || "Format Selection",
                desc:
                  dict?.video_frame_extractor?.tip1_desc ||
                  "Use JPEG for smaller file sizes if extracting many frames. Use PNG for maximum quality.",
                icon: ImageIcon,
              },
              {
                title:
                  dict?.video_frame_extractor?.tip2_title ||
                  "Interval Strategy",
                desc:
                  dict?.video_frame_extractor?.tip2_desc ||
                  "For action scenes, use a smaller interval (0.1s - 0.5s). For presentations, 1s-5s is usually sufficient.",
                icon: Settings2,
              },
              {
                title:
                  dict?.video_frame_extractor?.tip3_title || "Memory Usage",
                desc:
                  dict?.video_frame_extractor?.tip3_desc ||
                  "Extracting frames from long 4K videos uses a lot of memory. Try processing shorter clips.",
                icon: Info,
              },
              {
                title:
                  dict?.video_frame_extractor?.tip4_title || "Batch Download",
                desc:
                  dict?.video_frame_extractor?.tip4_desc ||
                  "Save time by downloading all extracted frames at once as a ZIP archive.",
                icon: Download,
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-indigo-500" />
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
              {dict?.qna_video_frame_extractor?.title || "Common Questions"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.qna_video_frame_extractor?.desc ||
                "Frequently asked questions about frame extraction."}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {[1, 2, 3].map((i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">
                  {dict?.qna_video_frame_extractor?.[`faq_${i}_q`] ||
                    `Question ${i}`}
                </AccordionTrigger>
                <AccordionContent className="whitespace-pre-line text-muted-foreground">
                  {dict?.qna_video_frame_extractor?.[`faq_${i}_a`] ||
                    `Answer ${i}`}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}
