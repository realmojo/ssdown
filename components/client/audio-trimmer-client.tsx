"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  Music,
  Scissors,
  Loader2,
  X,
  Play,
  Pause,
  RotateCcw,
  Lightbulb,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

// Types only - actual imports happen dynamically
type FFmpeg = any;

export function AudioTrimmerClient({ dict }: { dict?: any }) {
  const [file, setFile] = useState<File | null>(null);
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
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [draggingHandle, setDraggingHandle] = useState<
    "start" | "end" | "seek" | null
  >(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

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
      setFfmpegLoaded(true);
    } catch (err) {
      console.error("Failed to load FFmpeg", err);
      setError(
        "Failed to load audio processing engine. Please try referencing a different browser.",
      );
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
    if (!selectedFile.type.startsWith("audio/")) {
      setError("올바른 오디오 파일을 올려 주세요.");
      return;
    }

    setFile(selectedFile);
    setDownloadUrl(null);
    setError(null);
    setProgress(0);
    setIsPlaying(false);
    setWaveformData([]);
  };

  // Set audio source and decode waveform when file changes
  useEffect(() => {
    if (file && audioRef.current) {
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      audioRef.current.load();

      // Decode audio for waveform
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const audioContext = new AudioContext();
          const arrayBuffer = reader.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const channelData = audioBuffer.getChannelData(0);
          const samples = 300;
          const blockSize = Math.floor(channelData.length / samples);
          const peaks: number[] = [];
          for (let i = 0; i < samples; i++) {
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
              sum += Math.abs(channelData[i * blockSize + j]);
            }
            peaks.push(sum / blockSize);
          }
          // Normalize
          const max = Math.max(...peaks);
          const normalized = max > 0 ? peaks.map((p) => p / max) : peaks;
          setWaveformData(normalized);
          audioContext.close();
        } catch (err) {
          console.error("Failed to decode audio for waveform", err);
        }
      };
      reader.readAsArrayBuffer(file);

      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // Audio loaded metadata handler
  const onLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      setDuration(dur);
      setRange([0, dur]);
      setCurrentTime(0);
    }
  };

  // Playback control
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // If at end of range, restart from beginning of range
      if (currentTime >= range[1]) {
        audioRef.current.currentTime = range[0];
      }
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Update current time during playback
  const onTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);

      // Stop if we reach the end of the selected range
      if (time >= range[1]) {
        audioRef.current.pause();
        setIsPlaying(false);
        audioRef.current.currentTime = range[0];
      }
    }
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
    if (droppedFile?.type.startsWith("audio/")) {
      processFile(droppedFile);
    }
  }, []);

  // Format time (MM:SS.ms)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  // Draw waveform on canvas
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0 || duration <= 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerY = height / 2;
    const barWidth = width / waveformData.length;
    const maxBarHeight = height * 0.85;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw bars
    for (let i = 0; i < waveformData.length; i++) {
      const x = i * barWidth;
      const barH = Math.max(2, waveformData[i] * maxBarHeight);
      const timeAtBar = (i / waveformData.length) * duration;
      const inRange = timeAtBar >= range[0] && timeAtBar <= range[1];

      if (inRange) {
        ctx.fillStyle = "#3b82f6";
      } else {
        ctx.fillStyle = "#d1d5db";
      }

      const gap = 1;
      const w = Math.max(1, barWidth - gap);
      ctx.fillRect(x, centerY - barH / 2, w, barH);
    }

    // Draw range overlay borders
    const startX = (range[0] / duration) * width;
    const endX = (range[1] / duration) * width;

    // Left dimmed area
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, startX, height);
    // Right dimmed area
    ctx.fillRect(endX, 0, width - endX, height);

    // Start handle
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(startX - 2, 0, 4, height);
    // End handle
    ctx.fillRect(endX - 2, 0, 4, height);

    // Handle circles
    const handleRadius = 7;
    [startX, endX].forEach((hx) => {
      ctx.beginPath();
      ctx.arc(hx, centerY, handleRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#2563eb";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Playback position
    if (currentTime > 0) {
      const playX = (currentTime / duration) * width;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playX, 0);
      ctx.lineTo(playX, height);
      ctx.stroke();

      // Red dot at top
      ctx.beginPath();
      ctx.arc(playX, 5, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
    }
  }, [waveformData, range, duration, currentTime]);

  // Redraw waveform when data changes
  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Redraw on resize
  useEffect(() => {
    const handleResize = () => drawWaveform();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawWaveform]);

  // Animate playback position
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        drawWaveform();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationRef.current);
    }
  }, [isPlaying, drawWaveform]);

  // Waveform mouse interaction
  const getTimeFromMouseEvent = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const container = waveformContainerRef.current;
      if (!container || duration <= 0) return 0;
      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      return Math.round((x / rect.width) * duration * 100) / 100;
    },
    [duration],
  );

  const handleWaveformMouseDown = (e: React.MouseEvent) => {
    if (duration <= 0) return;
    const time = getTimeFromMouseEvent(e);
    const startDist = Math.abs(time - range[0]);
    const endDist = Math.abs(time - range[1]);
    const threshold = duration * 0.02; // 2% of duration

    if (startDist < threshold && startDist <= endDist) {
      setDraggingHandle("start");
    } else if (endDist < threshold) {
      setDraggingHandle("end");
    } else {
      // Click to seek
      setDraggingHandle("seek");
      if (audioRef.current) {
        const clampedTime = Math.max(range[0], Math.min(time, range[1]));
        audioRef.current.currentTime = clampedTime;
        setCurrentTime(clampedTime);
      }
    }
  };

  useEffect(() => {
    if (!draggingHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      const time = getTimeFromMouseEvent(e);
      if (draggingHandle === "start") {
        setRange([Math.max(0, Math.min(time, range[1] - 0.1)), range[1]]);
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(
            0,
            Math.min(time, range[1] - 0.1),
          );
          setCurrentTime(Math.max(0, Math.min(time, range[1] - 0.1)));
        }
      } else if (draggingHandle === "end") {
        setRange([
          range[0],
          Math.min(duration, Math.max(time, range[0] + 0.1)),
        ]);
      } else if (draggingHandle === "seek") {
        const clampedTime = Math.max(range[0], Math.min(time, range[1]));
        if (audioRef.current) {
          audioRef.current.currentTime = clampedTime;
          setCurrentTime(clampedTime);
        }
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

      const ext = file.name.split(".").pop() || "mp3";
      const inputName = `input.${ext}`;
      const outputName = `output.mp3`;

      // Write file to memory
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // Execute trim command
      // -ss: start time, -to: end time, -c:a libmp3lame: re-encode to ensure accurate cuts
      await ffmpeg.exec([
        "-i",
        inputName,
        "-ss",
        range[0].toString(),
        "-to",
        range[1].toString(),
        "-c:a",
        "libmp3lame",
        "-q:a",
        "2", // 고화질 variable bitrate
        outputName,
      ]);

      // Read result
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      // Clean up memory
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      console.error(err);
      setError("오디오를 자르지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setDownloadUrl(null);
    setRange([0, 0]);
    setDuration(0);
    setCurrentTime(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex w-full flex-col">
            <div className="hidden">
              <Scissors className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
              {dict?.audio_trimmer?.title || "Audio Trimmer"}
            </h1>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              {dict?.audio_trimmer?.subtitle ||
                "Cut and trim MP3 audio files directly in your browser. Fast, free, and private."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Hidden Audio Player - always mounted for ref access */}
            <audio
              ref={audioRef}
              onLoadedMetadata={onLoadedMetadata}
              onTimeUpdate={onTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />

            {/* Upload Section */}
            {!file && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-muted-foreground/30 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {dict?.audio_trimmer?.drop_zone ||
                    "Drag & drop your audio file here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {dict?.audio_trimmer?.supported ||
                    "Supported: MP3, WAV, OGG, M4A"}
                </p>
              </div>
            )}

            {/* Editor Section */}
            {file && !downloadUrl && (
              <Card className="w-full border-blue-100 dark:border-blue-900/50 animate-in fade-in slide-in-from-bottom-4">
                <CardHeader className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Music className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg line-clamp-1">
                          {file.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(duration)} •{" "}
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={reset}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-2">
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

                  {/* Waveform Visualization */}
                  <div className="space-y-2">
                    <div
                      ref={waveformContainerRef}
                      className="relative w-full h-32 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden cursor-crosshair select-none border border-gray-200 dark:border-gray-700"
                      onMouseDown={handleWaveformMouseDown}
                    >
                      {waveformData.length > 0 ? (
                        <canvas
                          ref={canvasRef}
                          className="w-full h-full"
                          style={{ display: "block" }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">
                            파형을 불러오는 중…
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>{formatTime(0)}</span>
                      <span>{formatTime(duration / 4)}</span>
                      <span>{formatTime(duration / 2)}</span>
                      <span>{formatTime((duration * 3) / 4)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Selection Range Info */}
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/50">
                    <div className="flex-1 text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        Start
                      </p>
                      <p className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {formatTime(range[0])}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-blue-200 dark:bg-blue-800" />
                    <div className="flex-1 text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        Duration
                      </p>
                      <p className="text-sm font-mono font-semibold">
                        {formatTime(range[1] - range[0])}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-blue-200 dark:bg-blue-800" />
                    <div className="flex-1 text-center">
                      <p className="text-xs text-muted-foreground mb-1">끝</p>
                      <p className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {formatTime(range[1])}
                      </p>
                    </div>
                  </div>

                  {/* Exact Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>시작 시간 (초)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max={range[1]}
                        value={Math.round(range[0] * 100) / 100}
                        onChange={(e) => {
                          const val = Math.max(
                            0,
                            parseFloat(e.target.value) || 0,
                          );
                          setRange([Math.min(val, range[1] - 0.1), range[1]]);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>종료 시간 (초)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min={range[0]}
                        max={duration}
                        value={Math.round(range[1] * 100) / 100}
                        onChange={(e) => {
                          const val = Math.min(
                            duration,
                            parseFloat(e.target.value) || duration,
                          );
                          setRange([range[0], Math.max(val, range[0] + 0.1)]);
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={handleTrim}
                    disabled={isProcessing || !ffmpegLoaded}
                    className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {dict?.audio_trimmer?.trimming || "Trimming..."}{" "}
                        {progress}%
                      </>
                    ) : (
                      <>
                        <Scissors className="mr-2 h-5 w-5" />
                        {dict?.audio_trimmer?.trim_btn || "Trim Audio"}
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
                    <div className="flex flex-col items-center text-center gap-4 mb-2">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <Download className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-800 dark:text-green-300">
                          다운로드 준비 완료!
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          New Duration: {formatTime(range[1] - range[0])}
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
                          {dict?.audio_trimmer?.download_btn ||
                            "Download Trimmed Audio"}
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        onClick={reset}
                        className="flex-1"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        다른 파일 자르기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
          </div>

          {/* Guide Section */}
          <div className="w-full max-w-6xl mx-auto mt-3 px-4 space-y-3">
            <section>
              <div className="mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  {dict?.audio_trimmer?.guide_title || "How to Trim Audio"}
                </h2>
                <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
                  {dict?.audio_trimmer?.guide_desc ||
                    "Cut your audio file in 3 simple steps."}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-2">
                {[
                  {
                    step: 1,
                    title: dict?.audio_trimmer?.step1_title || "Upload Audio",
                    desc:
                      dict?.audio_trimmer?.step1_desc ||
                      "Upload the MP3 or audio file you want to cut.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: dict?.audio_trimmer?.step2_title || "Select Range",
                    desc:
                      dict?.audio_trimmer?.step2_desc ||
                      "Use the sliders or enter exact times to select the part you want to keep.",
                    icon: Music,
                  },
                  {
                    step: 3,
                    title:
                      dict?.audio_trimmer?.step3_title || "Trim & Download",
                    desc:
                      dict?.audio_trimmer?.step3_desc ||
                      "Click 'Trim Audio' and download your new file instantly.",
                    icon: Scissors,
                  },
                ].map((step) => (
                  <Card
                    key={step.step}
                    className="border-blue-100 dark:border-blue-900/50"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold">
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
              <div className="text-center mb-2">
                <div className="hidden">
                  <Lightbulb className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  {dict?.audio_trimmer?.tips_title || "Audio Trimming Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {dict?.audio_trimmer?.tips_desc ||
                    "Get the best results for your audio cuts."}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-2">
                {[
                  {
                    title:
                      dict?.audio_trimmer?.tip1_title || "Precision Cutting",
                    desc:
                      dict?.audio_trimmer?.tip1_desc ||
                      "Use the manual input fields for 0.1s precision if the slider is not exact enough.",
                    icon: Scissors,
                  },
                  {
                    title: dict?.audio_trimmer?.tip2_title || "Audio Quality",
                    desc:
                      dict?.audio_trimmer?.tip2_desc ||
                      "We use high-quality VBR encoding to ensure your trimmed audio sounds just like the original.",
                    icon: Music,
                  },
                  {
                    title: dict?.audio_trimmer?.tip3_title || "Preview First",
                    desc:
                      dict?.audio_trimmer?.tip3_desc ||
                      "Always listen to your selected range before trimming to make sure you caught the right beat.",
                    icon: Play,
                  },
                  {
                    title: dict?.audio_trimmer?.tip4_title || "File Formats",
                    desc:
                      dict?.audio_trimmer?.tip4_desc ||
                      "You can upload various formats (WAV, OGG, M4A) and we'll automatically convert them to MP3.",
                    icon: Info,
                  },
                ].map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <div className="flex-shrink-0">
                      <tip.icon className="w-6 h-6 text-blue-500" />
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
          </div>
        </div>
        <aside className="hidden shrink-0 xl:block xl:w-[200px]">
          <ToolsSidebar category="video-audio" dict={dict} />
        </aside>
      </div>
    </div>
  );
}
