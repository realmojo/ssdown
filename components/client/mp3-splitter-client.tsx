"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  Music,
  AudioLines,
  Loader2,
  X,
  Play,
  Pause,
  RotateCcw,
  Lightbulb,
  Info,
  Plus,
  Scissors,
  Archive,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import JSZip from "jszip";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

// Types only - actual imports happen dynamically
type FFmpeg = any;

const MIN_SPACING = 0.5; // Minimum seconds between two split points

interface SegmentResult {
  name: string;
  url: string;
  blob: Blob;
  duration: number;
}

// Sanitize a user-supplied segment name for filesystem safety.
const sanitizeName = (name: string) =>
  name.replace(/[^a-zA-Z0-9\-_ ]/g, "").trim() || "part";

export function Mp3SplitterClient({ dict }: { dict?: any }) {
  const t = dict?.mp3_splitter || {};

  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [markers, setMarkers] = useState<number[]>([]);
  const [customNames, setCustomNames] = useState<(string | undefined)[]>([]);
  const [results, setResults] = useState<SegmentResult[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | "seek" | null>(
    null,
  );
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [quickParts, setQuickParts] = useState<number>(3);
  const [quickInterval, setQuickInterval] = useState<number>(30);
  const [addTimeInput, setAddTimeInput] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const previewIndexRef = useRef<number | null>(null);

  // Derived segments from sorted markers
  const segments = useMemo(() => {
    if (duration <= 0) return [];
    const points = [0, ...markers, duration];
    const segs: { start: number; end: number; name: string }[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      segs.push({
        start: points[i],
        end: points[i + 1],
        name: customNames[i] ?? `part_${i + 1}`,
      });
    }
    return segs;
  }, [markers, duration, customNames]);

  // Load FFmpeg
  const loadFFmpeg = async () => {
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();

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
        t.error_load ||
          "Failed to load audio processing engine. Please try a different browser.",
      );
    }
  };

  useEffect(() => {
    loadFFmpeg();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("audio/")) {
      setError(t.error_invalid || "Please upload a valid audio file.");
      return;
    }
    setFile(selectedFile);
    setResults(null);
    setError(null);
    setProgress(0);
    setIsPlaying(false);
    setWaveformData([]);
    setMarkers([]);
    setCustomNames([]);
    setPreviewIndex(null);
    previewIndexRef.current = null;
  };

  // Set audio source and decode waveform when file changes
  useEffect(() => {
    if (file && audioRef.current) {
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      audioRef.current.load();

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

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setCurrentTime(0);
    }
  };

  // Format time (M:SS.d)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  // ---- Marker helpers ----
  const insertMarker = useCallback(
    (time: number) => {
      if (duration <= 0) return;
      if (time <= MIN_SPACING || time >= duration - MIN_SPACING) return;
      setMarkers((prev) => {
        // Reject if too close to an existing marker or an endpoint
        const tooClose = prev.some((m) => Math.abs(m - time) < MIN_SPACING);
        if (tooClose) return prev;
        const next = [...prev, time].sort((a, b) => a - b);
        return next;
      });
      setCustomNames([]);
    },
    [duration],
  );

  const removeMarker = useCallback((index: number) => {
    setMarkers((prev) => prev.filter((_, i) => i !== index));
    setCustomNames([]);
  }, []);

  const handleQuickEqual = () => {
    if (duration <= 0 || quickParts < 2) return;
    const next: number[] = [];
    for (let i = 1; i < quickParts; i++) {
      next.push((duration / quickParts) * i);
    }
    setMarkers(next.filter((m) => m > MIN_SPACING && m < duration - MIN_SPACING));
    setCustomNames([]);
  };

  const handleQuickInterval = () => {
    if (duration <= 0 || quickInterval < MIN_SPACING) return;
    const next: number[] = [];
    for (let t = quickInterval; t < duration - MIN_SPACING; t += quickInterval) {
      next.push(t);
    }
    setMarkers(next);
    setCustomNames([]);
  };

  // Playback control
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      previewIndexRef.current = null;
      setPreviewIndex(null);
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const previewSegment = (index: number) => {
    if (!audioRef.current) return;
    const seg = segments[index];
    if (!seg) return;
    if (previewIndex === index && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    previewIndexRef.current = index;
    setPreviewIndex(index);
    audioRef.current.currentTime = seg.start;
    setCurrentTime(seg.start);
    audioRef.current.play();
    setIsPlaying(true);
  };

  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    const time = audioRef.current.currentTime;
    setCurrentTime(time);
    // Stop preview at segment end
    const pIdx = previewIndexRef.current;
    if (pIdx !== null && segments[pIdx] && time >= segments[pIdx].end) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current.currentTime = segments[pIdx].start;
      setCurrentTime(segments[pIdx].start);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    ctx.clearRect(0, 0, width, height);

    const boundaries = [0, ...markers, duration];

    // Alternating segment background tints
    for (let s = 0; s < boundaries.length - 1; s++) {
      const x1 = (boundaries[s] / duration) * width;
      const x2 = (boundaries[s + 1] / duration) * width;
      ctx.fillStyle =
        s % 2 === 0 ? "rgba(20, 184, 166, 0.06)" : "rgba(6, 182, 212, 0.12)";
      ctx.fillRect(x1, 0, x2 - x1, height);
    }

    // Draw bars
    for (let i = 0; i < waveformData.length; i++) {
      const x = i * barWidth;
      const barH = Math.max(2, waveformData[i] * maxBarHeight);
      ctx.fillStyle = "#5eead4"; // teal-300
      const gap = 1;
      const w = Math.max(1, barWidth - gap);
      ctx.fillRect(x, centerY - barH / 2, w, barH);
    }

    // Draw markers
    markers.forEach((m) => {
      const mx = (m / duration) * width;
      ctx.strokeStyle = "#0d9488"; // teal-600
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mx, 0);
      ctx.lineTo(mx, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(mx, centerY, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#0d9488";
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

      ctx.beginPath();
      ctx.arc(playX, 5, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
    }
  }, [waveformData, markers, duration, currentTime]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  useEffect(() => {
    const handleResize = () => drawWaveform();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawWaveform]);

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
    const threshold = duration * 0.015; // 1.5% of duration

    // Find the nearest marker within threshold
    let nearest = -1;
    let nearestDist = Infinity;
    markers.forEach((m, i) => {
      const d = Math.abs(m - time);
      if (d < threshold && d < nearestDist) {
        nearest = i;
        nearestDist = d;
      }
    });

    if (nearest >= 0) {
      setDraggingIndex(nearest);
    } else {
      // Click to seek
      setDraggingIndex("seek");
      if (audioRef.current) {
        previewIndexRef.current = null;
        setPreviewIndex(null);
        audioRef.current.currentTime = time;
        setCurrentTime(time);
      }
    }
  };

  useEffect(() => {
    if (draggingIndex === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const time = getTimeFromMouseEvent(e);
      if (draggingIndex === "seek") {
        if (audioRef.current) {
          audioRef.current.currentTime = time;
          setCurrentTime(time);
        }
        return;
      }
      // Dragging a marker: clamp between neighbours with min spacing
      setMarkers((prev) => {
        const lower =
          draggingIndex === 0 ? 0 : prev[draggingIndex - 1];
        const upper =
          draggingIndex === prev.length - 1
            ? duration
            : prev[draggingIndex + 1];
        const clamped = Math.max(
          lower + MIN_SPACING,
          Math.min(time, upper - MIN_SPACING),
        );
        const next = [...prev];
        next[draggingIndex] = clamped;
        return next;
      });
    };

    const handleMouseUp = () => setDraggingIndex(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingIndex, duration, getTimeFromMouseEvent]);

  const renameSegment = (index: number, value: string) => {
    setCustomNames((prev) => {
      const next = [...prev];
      // Ensure array is long enough
      while (next.length < segments.length) next.push(undefined);
      next[index] = value;
      return next;
    });
  };

  // ---- Processing ----
  const handleSplit = async () => {
    if (!file || !ffmpegRef.current || segments.length < 1) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      const { fetchFile } = await import("@ffmpeg/util");

      const ext = file.name.split(".").pop() || "mp3";
      const inputName = `input.${ext}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const newResults: SegmentResult[] = [];

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const outputName = `seg_${i}.mp3`;

        await ffmpeg.exec([
          "-i",
          inputName,
          "-ss",
          seg.start.toString(),
          "-to",
          seg.end.toString(),
          "-c:a",
          "libmp3lame",
          "-q:a",
          "2",
          outputName,
        ]);

        const data = await ffmpeg.readFile(outputName);
        const blob = new Blob([data], { type: "audio/mpeg" });
        newResults.push({
          name: sanitizeName(seg.name),
          url: URL.createObjectURL(blob),
          blob,
          duration: seg.end - seg.start,
        });

        await ffmpeg.deleteFile(outputName);
        setProgress(Math.round(((i + 1) / segments.length) * 100));
      }

      await ffmpeg.deleteFile(inputName);
      setResults(newResults);
    } catch (err) {
      console.error(err);
      setError(t.error_split || "Failed to split audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!results || results.length === 0) return;
    const zip = new JSZip();
    const used = new Set<string>();
    results.forEach((r, i) => {
      let name = `${r.name}.mp3`;
      if (used.has(name)) name = `${r.name}_${i + 1}.mp3`;
      used.add(name);
      zip.file(name, r.blob);
    });
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    const baseName = (file?.name || "audio").replace(/\.[^.]+$/, "");
    link.href = url;
    link.download = `mp3-split_${baseName}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    if (results) results.forEach((r) => URL.revokeObjectURL(r.url));
    setFile(null);
    setResults(null);
    setMarkers([]);
    setCustomNames([]);
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setWaveformData([]);
    setPreviewIndex(null);
    previewIndexRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const themeGradient = "from-teal-500 to-cyan-500";

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-3xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/30 mb-6">
              <AudioLines className="w-10 h-10 text-teal-600 dark:text-teal-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t.title || "MP3 Splitter"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {t.subtitle ||
                "Split an MP3 into multiple parts right in your browser. Fast, free, and private."}
            </p>

            <Adsense slotId="7759160077" />

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
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                    : "border-muted-foreground/30 hover:border-teal-500/50 hover:bg-teal-50/50 dark:hover:bg-teal-900/10"
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
                  {t.drop_zone || "Drag & drop your audio file here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.supported || "Supported: MP3, WAV, OGG, M4A"}
                </p>
              </div>
            )}

            {/* Editor Section */}
            {file && !results && (
              <Card className="w-full border-teal-100 dark:border-teal-900/50 animate-in fade-in slide-in-from-bottom-4">
                <CardHeader className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg shrink-0">
                        <Music className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="min-w-0">
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
                <CardContent className="pt-8 space-y-6">
                  {/* Playback Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-12 w-12 rounded-full"
                      onClick={togglePlay}
                    >
                      {isPlaying && previewIndex === null ? (
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
                            {t.loading_waveform || "Loading waveform..."}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>{formatTime(0)}</span>
                      <span>{formatTime(duration / 2)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Add split point controls */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-teal-200 dark:border-teal-900/50"
                      onClick={() => insertMarker(currentTime)}
                    >
                      <Scissors className="mr-2 h-4 w-4 text-teal-600" />
                      {t.add_here || "Add Split Point Here"}
                    </Button>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max={duration}
                        placeholder={t.exact_time || "Time (sec)"}
                        value={addTimeInput}
                        onChange={(e) => setAddTimeInput(e.target.value)}
                        className="max-w-[140px]"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const v = parseFloat(addTimeInput);
                          if (!Number.isNaN(v)) insertMarker(v);
                          setAddTimeInput("");
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        {t.add || "Add"}
                      </Button>
                    </div>
                  </div>

                  {/* Quick Split controls */}
                  <div className="grid sm:grid-cols-2 gap-4 p-4 bg-teal-50 dark:bg-teal-950/30 rounded-lg border border-teal-100 dark:border-teal-900/50">
                    <div className="space-y-2">
                      <Label className="text-xs">
                        {t.quick_equal || "Quick Split: Equal Parts"}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="2"
                          value={quickParts}
                          onChange={(e) =>
                            setQuickParts(parseInt(e.target.value) || 2)
                          }
                          className="max-w-[100px]"
                        />
                        <Button
                          variant="outline"
                          onClick={handleQuickEqual}
                          className="flex-1"
                        >
                          {t.generate || "Generate"}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">
                        {t.quick_interval || "Quick Split: Every X seconds"}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={quickInterval}
                          onChange={(e) =>
                            setQuickInterval(parseInt(e.target.value) || 1)
                          }
                          className="max-w-[100px]"
                        />
                        <Button
                          variant="outline"
                          onClick={handleQuickInterval}
                          className="flex-1"
                        >
                          {t.generate || "Generate"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Marker chips */}
                  {markers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {markers.map((m, i) => (
                        <button
                          key={i}
                          onClick={() => removeMarker(i)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 transition-colors"
                        >
                          {formatTime(m)}
                          <X className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Segment list */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">
                      {(t.segments || "Segments")} ({segments.length})
                    </p>
                    {segments.map((seg, i) => (
                      <div
                        key={i}
                        className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
                      >
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-500 text-white text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        <Input
                          value={seg.name}
                          onChange={(e) => renameSegment(i, e.target.value)}
                          className="h-8 flex-1 min-w-[120px]"
                        />
                        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                          {formatTime(seg.start)} → {formatTime(seg.end)} (
                          {formatTime(seg.end - seg.start)})
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0"
                          onClick={() => previewSegment(i)}
                          aria-label="Preview segment"
                        >
                          {previewIndex === i && isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={handleSplit}
                    disabled={isProcessing || !ffmpegLoaded}
                    className={`w-full h-12 text-lg bg-gradient-to-r ${themeGradient} text-white hover:opacity-90`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t.splitting || "Splitting..."} {progress}%
                      </>
                    ) : (
                      <>
                        <Scissors className="mr-2 h-5 w-5" />
                        {t.split_btn || "Split Audio"}
                      </>
                    )}
                  </Button>
                  {!ffmpegLoaded && (
                    <p className="text-xs text-center text-muted-foreground">
                      {t.loading_engine || "Loading audio engine..."}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Results Section */}
            {results && (
              <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-green-100 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center gap-3 mb-6">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <Download className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-800 dark:text-green-300">
                          {t.ready_title || "Your segments are ready!"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {results.length}{" "}
                          {t.files_created || "files created"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      {results.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                        >
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-500 text-white text-xs font-bold shrink-0">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {r.name}.mp3
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTime(r.duration)} •{" "}
                              {(r.blob.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <a href={r.url} download={`${r.name}.mp3`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-teal-200 dark:border-teal-900/50"
                            >
                              <Download className="mr-1.5 h-4 w-4" />
                              {t.download || "Download"}
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleDownloadAll}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        {t.download_all || "Download All (.zip)"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={reset}
                        className="flex-1"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {t.split_another || "Split Another"}
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
          <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {t.guide_title || "How to Split an MP3"}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t.guide_desc ||
                    "Cut one audio file into multiple parts in 3 simple steps."}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: t.step1_title || "Upload Audio",
                    desc:
                      t.step1_desc ||
                      "Upload the MP3 or audio file you want to split.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: t.step2_title || "Add Split Points",
                    desc:
                      t.step2_desc ||
                      "Place markers on the waveform, or use Quick Split to generate equal parts automatically.",
                    icon: Scissors,
                  },
                  {
                    step: 3,
                    title: t.step3_title || "Split & Download",
                    desc:
                      t.step3_desc ||
                      "Click 'Split Audio', then download each part or grab them all as a ZIP.",
                    icon: Download,
                  },
                ].map((step) => (
                  <Card
                    key={step.step}
                    className="border-teal-100 dark:border-teal-900/50"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-500 text-white font-bold">
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
                  {t.tips_title || "MP3 Splitting Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {t.tips_desc || "Get the best results when splitting audio."}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: t.tip1_title || "Precise Markers",
                    desc:
                      t.tip1_desc ||
                      "Drag markers on the waveform or type an exact time to place split points down to a tenth of a second.",
                    icon: Scissors,
                  },
                  {
                    title: t.tip2_title || "Quick Split",
                    desc:
                      t.tip2_desc ||
                      "Use Equal Parts to divide a track into N pieces, or Fixed Interval to cut every X seconds automatically.",
                    icon: AudioLines,
                  },
                  {
                    title: t.tip3_title || "Preview First",
                    desc:
                      t.tip3_desc ||
                      "Play each segment before splitting so every part starts and ends exactly where you want.",
                    icon: Play,
                  },
                  {
                    title: t.tip4_title || "100% Private",
                    desc:
                      t.tip4_desc ||
                      "Everything runs in your browser. Your file is never uploaded to any server.",
                    icon: Info,
                  },
                ].map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <div className="flex-shrink-0">
                      <tip.icon className="w-6 h-6 text-teal-500" />
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
            {(dict?.page_mp3_splitter?.faq || FALLBACK_FAQ).length > 0 && (
              <section>
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold tracking-tight mb-4">
                    {t.faq_title || "Frequently Asked Questions"}
                  </h2>
                </div>
                <div className="max-w-3xl mx-auto space-y-4">
                  {(dict?.page_mp3_splitter?.faq || FALLBACK_FAQ).map(
                    (
                      item: { question: string; answer: string },
                      idx: number,
                    ) => (
                      <div
                        key={idx}
                        className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40"
                      >
                        <h3 className="font-semibold mb-2">{item.question}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
        <aside className="hidden lg:block w-64 shrink-0">
          <ToolsSidebar category="utility" dict={dict} />
        </aside>
      </div>
    </div>
  );
}

const FALLBACK_FAQ = [
  {
    question: "How does the MP3 splitter work?",
    answer:
      "You place split points on the waveform (or auto-generate them with Quick Split). Each region between two points becomes a separate MP3 file that you can download individually or all at once as a ZIP.",
  },
  {
    question: "Is there a limit on the number of segments or file size?",
    answer:
      "There is no hard limit on the number of segments. Because processing happens in your browser's memory, very large files may be slower on low-memory devices, but typical music and podcast files split quickly.",
  },
  {
    question: "Is the audio quality preserved?",
    answer:
      "Yes. Each segment is encoded with high-quality VBR (LAME -q:a 2), so the parts sound essentially identical to the source audio.",
  },
  {
    question: "Is my file uploaded to a server?",
    answer:
      "No. All splitting is done locally in your browser using WebAssembly. Your audio never leaves your device, so it stays completely private.",
  },
  {
    question: "What input formats are supported?",
    answer:
      "You can upload MP3, WAV, OGG, and M4A files. The tool automatically decodes them and exports each segment as an MP3.",
  },
];
