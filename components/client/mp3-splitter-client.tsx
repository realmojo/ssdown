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
    q: "MP3 분할기는 어떻게 동작하나요?",
    a: "MP3 파일을 올리고 분할 방식(균등 분할, 길이 기준, 지정 시점)을 고른 뒤 분할을 누르세요. 모든 처리가 웹어셈블리로 브라우저 안에서 이뤄지므로 파일이 기기를 벗어나지 않습니다.",
  },
  {
    q: "제 오디오 파일이 서버에 업로드되나요?",
    a: "아니요. 모든 처리가 브라우저 안에서 이뤄집니다. MP3가 업로드되거나 저장되거나 서버로 전송되지 않아 파일이 완전히 비공개로 유지됩니다.",
  },
  {
    q: "분할하면 음질이 떨어지나요?",
    a: "아니요. 스트림 복사 방식으로 재인코딩 없이 잘라내므로, 각 구간이 원본 MP3와 완전히 같은 비트레이트와 음질을 유지합니다.",
  },
  {
    q: "나뉜 파일을 한 번에 받을 수 있나요?",
    a: "네. 분할 후 각 파일을 하나씩 받거나, 전체 다운로드(ZIP) 버튼으로 모든 구간을 ZIP 파일 하나로 묶어 받을 수 있습니다.",
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
        toast.error("올바른 오디오 파일을 올려 주세요 (MP3 권장).");
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
      toast.error("만들 수 있는 구간이 없습니다. 분할 설정을 확인해 주세요.");
      return;
    }
    if (segments.length > 100) {
      toast.error("구간이 너무 많습니다 (최대 100개). 설정을 조정해 주세요.");
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
      toast.error("MP3를 분할하지 못했습니다. 다른 파일로 시도해 주세요.");
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
      toast.error("ZIP 파일을 만들지 못했습니다.");
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex w-full flex-col">
            <div className="hidden">
              <Scissors className="w-10 h-10 text-rose-600 dark:text-rose-400" />
            </div>
            <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
              MP3 분할기
            </h1>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              브라우저에서 바로 MP3를 여러 개로 나눠 보세요. 빠르고 안전하며 무료이고, 서버에 올리지 않습니다.
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
                  여기에 MP3 파일을 끌어다 놓으세요
                </p>
                <p className="text-sm text-muted-foreground">
                  또는 클릭해서 선택하세요 — MP3 권장
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
                <CardContent className="pt-6 space-y-2">
                  {/* Mode selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(
                      [
                        { key: "equal", label: "균등 분할" },
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
                      <Label htmlFor="num-parts">분할 개수</Label>
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
                      <Label htmlFor="seg-seconds">구간당 초</Label>
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
                      <Label>자를 지점 (분:초)</Label>
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
                              aria-label="지점 삭제"
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
                        자를 지점 추가
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
                        엔진을 불러오는 중…
                      </>
                    ) : (
                      <>
                        <Scissors className="mr-2 h-5 w-5" />
                        MP3 분할
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Results Section */}
            {results.length > 0 && (
              <div className="w-full mt-2 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                      전체 다운로드 (ZIP)
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
                            다운로드
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
          <div className="w-full max-w-5xl mx-auto mt-3 px-4 space-y-3">
            {/* How to Use */}
            <section>
              <div className="text-center mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  이용 방법
                </h2>
                <p className="text-muted-foreground">
                  몇 번의 클릭으로 MP3를 나눠 보세요.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-2">
                {[
                  {
                    step: 1,
                    title: "MP3 업로드",
                    desc: "나눌 MP3 파일을 끌어다 놓거나 선택하세요. 파일은 기기에 그대로 있습니다.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: "분할 방식 선택",
                    desc: "균등 분할, 정해진 길이, 직접 지정한 시점 중에서 고르세요.",
                    icon: ArrowRight,
                  },
                  {
                    step: 3,
                    title: "분할 파일 다운로드",
                    desc: "각 구간을 하나씩 받거나 전체를 ZIP으로 한 번에 내려받으세요.",
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
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-2 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">분할 팁</h2>
                  <p className="text-muted-foreground">
                    MP3 분할기를 더 잘 활용하는 방법입니다.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "무손실 자르기",
                      desc: "구간은 스트림 복사로 만들어지므로 재인코딩이 없고 원본 대비 음질 손실이 전혀 없습니다.",
                    },
                    {
                      title: "긴 녹음 나누기",
                      desc: "긴 팟캐스트나 강의, DJ 세트를 고르게 나누어 찾기 쉽게 만들려면 '길이 기준'을 사용하세요.",
                    },
                    {
                      title: "정확한 시간 지정",
                      desc: "'지정 시점'을 고르고 분:초 형식으로 자를 지점을 입력하면 원하는 챕터나 곡, 하이라이트만 정확히 잘라낼 수 있습니다.",
                    },
                    {
                      title: "모든 처리는 비공개",
                      desc: "모든 처리가 웹어셈블리로 브라우저 안에서 이뤄집니다. 오디오가 서버로 업로드되지 않습니다.",
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
              <div className="text-center mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">자주 묻는 질문</h2>
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
        <aside className="hidden shrink-0 xl:block xl:w-[200px]">
          <ToolsSidebar category="utility" dict={dict} />
        </aside>
      </div>
    </div>
  );
}
