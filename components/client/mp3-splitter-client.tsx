"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  Upload,
  Download,
  Music,
  Scissors,
  Loader2,
  X,
  Plus,
  Trash2,
  Package,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

// Types only - actual imports happen dynamically
type FFmpeg = any;

type SplitMode = "equal" | "duration" | "custom";

interface Segment {
  start: number;
  duration: number;
}

interface ResultSegment {
  name: string;
  url: string;
  size: number;
}

const FAQ_ITEMS = [
  {
    q: "How does the MP3 splitter work?",
    a: "Upload an MP3 file, choose how you want to split it (equal parts, by duration, or at custom timestamps), and click Split. Everything runs inside your browser using WebAssembly, so your file never leaves your device.",
  },
  {
    q: "Is my audio file uploaded to a server?",
    a: "No. All processing happens locally in your browser. Your MP3 is never uploaded, stored, or sent to any server, which keeps your files completely private.",
  },
  {
    q: "Will splitting reduce the audio quality?",
    a: "No. The splitter uses stream copy, which cuts the file without re-encoding. Each segment keeps the exact same bitrate and quality as the original MP3.",
  },
  {
    q: "Can I download all the segments at once?",
    a: "Yes. After splitting, you can download each part individually or use the Download all (ZIP) button to bundle every segment into a single ZIP archive.",
  },
];

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Parse "mm:ss" or plain seconds into seconds. Returns null when invalid.
function parseTimestamp(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length !== 2) return null;
    const mins = Number(parts[0]);
    const secs = Number(parts[1]);
    if (!Number.isFinite(mins) || !Number.isFinite(secs) || secs >= 60) {
      return null;
    }
    return mins * 60 + secs;
  }
  const asNumber = Number(trimmed);
  return Number.isFinite(asNumber) ? asNumber : null;
}

// Build the list of segments to extract based on the selected mode.
function buildSegments(
  mode: SplitMode,
  duration: number,
  parts: number,
  segSeconds: number,
  timestamps: string[],
): Segment[] {
  if (duration <= 0) return [];

  if (mode === "equal") {
    const count = Math.max(1, Math.floor(parts));
    const length = duration / count;
    return Array.from({ length: count }, (_, i) => ({
      start: i * length,
      duration: length,
    }));
  }

  if (mode === "duration") {
    const step = segSeconds > 0 ? segSeconds : duration;
    const segments: Segment[] = [];
    for (let start = 0; start < duration; start += step) {
      segments.push({ start, duration: Math.min(step, duration - start) });
    }
    return segments;
  }

  // custom timestamps
  const cutPoints = timestamps
    .map(parseTimestamp)
    .filter(
      (t): t is number => t !== null && t > 0 && t < duration,
    )
    .sort((a, b) => a - b);

  const boundaries = [0, ...cutPoints, duration];
  const segments: Segment[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    if (end - start > 0.05) {
      segments.push({ start, duration: end - start });
    }
  }
  return segments;
}

export function Mp3SplitterClient({ dict }: { dict?: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [mode, setMode] = useState<SplitMode>("equal");
  const [numParts, setNumParts] = useState<number>(2);
  const [segSeconds, setSegSeconds] = useState<number>(30);
  const [timestamps, setTimestamps] = useState<string[]>(["1:00"]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<ResultSegment[]>([]);
  const [ffmpegLoaded, setFfmpegLoaded] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // Load FFmpeg on mount
  useEffect(() => {
    let cancelled = false;
    const loadFFmpeg = async () => {
      try {
        const { FFmpeg } = await import("@ffmpeg/ffmpeg");
        const { toBlobURL } = await import("@ffmpeg/util");
        const ffmpeg = new FFmpeg();

        ffmpeg.on("progress", ({ progress: p }: { progress: number }) => {
          setProgress(Math.min(100, Math.round(p * 100)));
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

        if (cancelled) return;
        ffmpegRef.current = ffmpeg;
        setFfmpegLoaded(true);
      } catch (err) {
        console.error("Failed to load FFmpeg", err);
        toast.error(
          "Failed to load the audio engine. Please refresh and try again.",
        );
      }
    };
    loadFFmpeg();
    return () => {
      cancelled = true;
    };
  }, []);

  // Release object URLs when results change / unmount
  useEffect(() => {
    return () => {
      results.forEach((r) => URL.revokeObjectURL(r.url));
    };
  }, [results]);

  const clearResults = useCallback(() => {
    setResults((prev) => {
      prev.forEach((r) => URL.revokeObjectURL(r.url));
      return [];
    });
    setProgress(0);
  }, []);

  const processFile = useCallback(
    (selectedFile: File) => {
      if (!selectedFile.type.startsWith("audio/")) {
        toast.error("Please upload a valid audio file (MP3 recommended).");
        return;
      }
      clearResults();
      setFile(selectedFile);
      setDuration(0);
    },
    [clearResults],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  // Load duration via a hidden audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!file || !audio) return;
    const url = URL.createObjectURL(file);
    audio.src = url;
    audio.load();
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
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

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) processFile(dropped);
    },
    [processFile],
  );

  const addTimestamp = () => setTimestamps((prev) => [...prev, ""]);

  const updateTimestamp = (index: number, value: string) => {
    setTimestamps((prev) => prev.map((t, i) => (i === index ? value : t)));
  };

  const removeTimestamp = (index: number) => {
    setTimestamps((prev) => prev.filter((_, i) => i !== index));
  };

  const reset = () => {
    clearResults();
    setFile(null);
    setDuration(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canSplit = Boolean(file) && ffmpegLoaded && duration > 0 && !isProcessing;

  const handleSplit = async () => {
    if (!file || !ffmpegRef.current) return;

    const segments = buildSegments(
      mode,
      duration,
      numParts,
      segSeconds,
      timestamps,
    );

    if (segments.length === 0) {
      toast.error("No valid segments to create. Check your split settings.");
      return;
    }
    if (segments.length > 100) {
      toast.error("Too many segments (max 100). Adjust your settings.");
      return;
    }

    setIsProcessing(true);
    clearResults();

    try {
      const ffmpeg = ffmpegRef.current;
      const { fetchFile } = await import("@ffmpeg/util");

      const inputName = "input.mp3";
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const produced: ResultSegment[] = [];
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const outputName = `part${i + 1}.mp3`;

        await ffmpeg.exec([
          "-i",
          inputName,
          "-ss",
          seg.start.toString(),
          "-t",
          seg.duration.toString(),
          "-c",
          "copy",
          "-y",
          outputName,
        ]);

        const data = await ffmpeg.readFile(outputName);
        const blob = new Blob([data], { type: "audio/mpeg" });
        produced.push({
          name: outputName,
          url: URL.createObjectURL(blob),
          size: blob.size,
        });
        await ffmpeg.deleteFile(outputName);
        setProgress(Math.round(((i + 1) / segments.length) * 100));
      }

      await ffmpeg.deleteFile(inputName);
      setResults(produced);
      toast.success(`Created ${produced.length} segment(s).`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to split the MP3. Please try a different file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadZip = async () => {
    if (results.length === 0) return;
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const seg of results) {
        const res = await fetch(seg.url);
        zip.file(seg.name, await res.blob());
      }
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      const base = file?.name.replace(/\.[^.]+$/, "") || "mp3";
      link.download = `${base}_segments.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Failed to build the ZIP archive.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-3xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 mb-6">
              <Scissors className="w-10 h-10 text-rose-600 dark:text-rose-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              MP3 Splitter
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              Split an MP3 into multiple parts right in your browser. Fast,
              private, and free — no upload to any server.
            </p>

            <Adsense slotId="7759160077" />

            {/* Hidden audio element for duration detection */}
            <audio
              ref={audioRef}
              onLoadedMetadata={onLoadedMetadata}
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
                    ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                    : "border-muted-foreground/30 hover:border-rose-500/50 hover:bg-rose-50/50 dark:hover:bg-rose-900/10"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  Drag &amp; drop your MP3 file here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse — MP3 recommended
                </p>
              </div>
            )}

            {/* Configuration Section */}
            {file && (
              <Card className="w-full border-rose-100 dark:border-rose-900/50 animate-in fade-in slide-in-from-bottom-4">
                <CardHeader className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg shrink-0">
                        <Music className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg line-clamp-1">
                          {file.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {duration > 0 ? formatTime(duration) : "…"} •{" "}
                          {formatSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={reset}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Mode selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(
                      [
                        { key: "equal", label: "Equal parts" },
                        { key: "duration", label: "By duration" },
                        { key: "custom", label: "Timestamps" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setMode(option.key)}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                          mode === option.key
                            ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                            : "border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Mode-specific inputs */}
                  {mode === "equal" && (
                    <div className="space-y-2">
                      <Label htmlFor="num-parts">Number of parts</Label>
                      <Input
                        id="num-parts"
                        type="number"
                        min={2}
                        max={100}
                        value={numParts}
                        onChange={(e) =>
                          setNumParts(
                            Math.max(1, parseInt(e.target.value, 10) || 1),
                          )
                        }
                      />
                      {duration > 0 && numParts > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Each part ≈ {formatTime(duration / numParts)}
                        </p>
                      )}
                    </div>
                  )}

                  {mode === "duration" && (
                    <div className="space-y-2">
                      <Label htmlFor="seg-seconds">Seconds per segment</Label>
                      <Input
                        id="seg-seconds"
                        type="number"
                        min={1}
                        value={segSeconds}
                        onChange={(e) =>
                          setSegSeconds(
                            Math.max(1, parseInt(e.target.value, 10) || 1),
                          )
                        }
                      />
                      {duration > 0 && segSeconds > 0 && (
                        <p className="text-xs text-muted-foreground">
                          ≈ {Math.ceil(duration / segSeconds)} segment(s)
                        </p>
                      )}
                    </div>
                  )}

                  {mode === "custom" && (
                    <div className="space-y-3">
                      <Label>Cut points (mm:ss)</Label>
                      <div className="space-y-2">
                        {timestamps.map((ts, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="1:30"
                              value={ts}
                              onChange={(e) =>
                                updateTimestamp(idx, e.target.value)
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTimestamp(idx)}
                              aria-label="Remove cut point"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addTimestamp}
                        className="gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        Add cut point
                      </Button>
                    </div>
                  )}

                  {/* Action button */}
                  <Button
                    onClick={handleSplit}
                    disabled={!canSplit}
                    className="w-full h-12 text-lg bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Splitting… {progress}%
                      </>
                    ) : !ffmpegLoaded ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading engine…
                      </>
                    ) : (
                      <>
                        <Scissors className="mr-2 h-5 w-5" />
                        Split MP3
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Results Section */}
            {results.length > 0 && (
              <div className="w-full mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-rose-100 dark:border-rose-900/50">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="w-5 h-5 text-rose-500" />
                      {results.length} Segment(s)
                    </CardTitle>
                    <Button
                      onClick={handleDownloadZip}
                      className="bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download all (ZIP)
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {results.map((seg, idx) => (
                      <div
                        key={seg.name}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-rose-50/40 dark:bg-rose-900/10"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm font-semibold shrink-0">
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{seg.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatSize(seg.size)}
                            </p>
                          </div>
                        </div>
                        <a href={seg.url} download={seg.name}>
                          <Button variant="outline" size="sm">
                            <Download className="mr-1.5 h-4 w-4" />
                            Download
                          </Button>
                        </a>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Guide, Tips, FAQ */}
          <div className="w-full max-w-5xl mx-auto mt-16 px-4 space-y-16">
            {/* How to Use */}
            <section>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  How to Use
                </h2>
                <p className="text-muted-foreground">
                  Split your MP3 into parts in a few clicks.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: "Upload MP3",
                    desc: "Drag and drop or select the MP3 file you want to split. It stays on your device.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: "Choose Split Mode",
                    desc: "Split into equal parts, fixed-length segments, or at your own custom timestamps.",
                    icon: ArrowRight,
                  },
                  {
                    step: 3,
                    title: "Download Parts",
                    desc: "Grab each segment individually or download everything at once as a ZIP archive.",
                    icon: Download,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Splitting Tips</h2>
                  <p className="text-muted-foreground">
                    Get the most out of the MP3 splitter.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Lossless Cuts",
                      desc: "Segments are created with stream copy, so there is no re-encoding and zero quality loss from the original file.",
                    },
                    {
                      title: "Split Long Recordings",
                      desc: "Use 'By duration' to break long podcasts, lectures, or DJ sets into evenly sized, easy-to-navigate chunks.",
                    },
                    {
                      title: "Precise Timestamps",
                      desc: "Choose 'Timestamps' and enter cut points in mm:ss to slice out exact chapters, songs, or highlights.",
                    },
                    {
                      title: "Everything Stays Private",
                      desc: "All processing runs in your browser with WebAssembly. Your audio is never uploaded to a server.",
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-rose-600 dark:text-rose-400 mb-2">
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
                <h2 className="text-2xl font-bold tracking-tight mb-4">FAQ</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {FAQ_ITEMS.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx + 1}`}>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
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
