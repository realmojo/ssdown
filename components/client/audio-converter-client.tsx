"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  Music,
  FileAudio,
  Loader2,
  X,
  RotateCcw,
  Lightbulb,
  Info,
  Archive,
  CheckCircle2,
  AlertCircle,
  Settings2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import JSZip from "jszip";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

// Types only - actual imports happen dynamically
type FFmpeg = any;

type OutputFormat = "mp3" | "wav" | "ogg" | "m4a" | "flac";
type Mp3Bitrate = "128" | "192" | "320";
type ItemStatus = "pending" | "processing" | "done" | "error";

interface FormatConfig {
  ext: string;
  mime: string;
  label: string;
}

// Output format registry — extension, MIME type, and display label per format.
const FORMAT_CONFIG: Record<OutputFormat, FormatConfig> = {
  mp3: { ext: "mp3", mime: "audio/mpeg", label: "MP3" },
  wav: { ext: "wav", mime: "audio/wav", label: "WAV" },
  ogg: { ext: "ogg", mime: "audio/ogg", label: "OGG" },
  m4a: { ext: "m4a", mime: "audio/mp4", label: "M4A (AAC)" },
  flac: { ext: "flac", mime: "audio/flac", label: "FLAC" },
};

// Accept common audio and video files; video files have their audio track extracted.
const ACCEPT = "audio/*,video/*,.m4a,.flac,.ogg,.webm";

interface QueueItem {
  id: string;
  file: File;
  status: ItemStatus;
  progress: number;
  outputUrl?: string;
  outputBlob?: Blob;
  outputName?: string;
  outputSize?: number;
  error?: string;
}

// Build the FFmpeg argument list for a given output format/bitrate. `-vn` drops
// any video stream so video inputs yield an audio-only file.
function buildFFmpegArgs(
  inputName: string,
  outputName: string,
  format: OutputFormat,
  bitrate: Mp3Bitrate,
): string[] {
  const base = ["-i", inputName, "-vn"];
  switch (format) {
    case "mp3":
      return [...base, "-c:a", "libmp3lame", "-b:a", `${bitrate}k`, outputName];
    case "wav":
      return [...base, "-c:a", "pcm_s16le", outputName];
    case "ogg":
      return [...base, "-c:a", "libvorbis", "-q:a", "5", outputName];
    case "m4a":
      return [...base, "-c:a", "aac", "-b:a", "192k", outputName];
    case "flac":
      return [...base, "-c:a", "flac", outputName];
  }
}

const stripExt = (name: string) => name.replace(/\.[^.]+$/, "");

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

let idCounter = 0;
const nextId = () => `item_${Date.now()}_${idCounter++}`;

export function AudioConverterClient({ dict }: { dict?: any }) {
  const t = dict?.audio_converter || {};

  const [items, setItems] = useState<QueueItem[]>([]);
  const [format, setFormat] = useState<OutputFormat>("mp3");
  const [bitrate, setBitrate] = useState<Mp3Bitrate>("192");
  const [isConverting, setIsConverting] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // Load FFmpeg (single-threaded UMD core, no COOP/COEP headers required)
  const loadFFmpeg = useCallback(async () => {
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      ffmpegRef.current = ffmpeg;
      setFfmpegLoaded(true);
    } catch (err) {
      console.error("Failed to load FFmpeg", err);
      setLoadError(
        t.error_load ||
          "Failed to load the audio engine. Please refresh or try a different browser.",
      );
    }
  }, [t.error_load]);

  useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((it) => it.outputUrl && URL.revokeObjectURL(it.outputUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const incoming = Array.from(fileList).filter(
      (f) => f.type.startsWith("audio/") || f.type.startsWith("video/") || /\.(m4a|flac|ogg|wav|mp3|aac|webm)$/i.test(f.name),
    );
    if (incoming.length === 0) return;
    setItems((prev) => [
      ...prev,
      ...incoming.map((file) => ({
        id: nextId(),
        file,
        status: "pending" as ItemStatus,
        progress: 0,
      })),
    ]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target?.outputUrl) URL.revokeObjectURL(target.outputUrl);
      return prev.filter((it) => it.id !== id);
    });
  };

  const patchItem = (id: string, patch: Partial<QueueItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  // Drag & drop handlers
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
      if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  // Convert a single queue item; errors are captured on the item, not thrown.
  const convertItem = async (ffmpeg: FFmpeg, item: QueueItem) => {
    const { fetchFile } = await import("@ffmpeg/util");
    const cfg = FORMAT_CONFIG[format];
    const inputExt = item.file.name.split(".").pop() || "dat";
    const inputName = `in_${item.id}.${inputExt}`;
    const outputName = `out_${item.id}.${cfg.ext}`;

    const onProgress = ({ progress }: { progress: number }) => {
      patchItem(item.id, {
        progress: Math.min(100, Math.max(0, Math.round(progress * 100))),
      });
    };

    ffmpeg.on("progress", onProgress);
    try {
      patchItem(item.id, { status: "processing", progress: 0 });
      await ffmpeg.writeFile(inputName, await fetchFile(item.file));
      await ffmpeg.exec(buildFFmpegArgs(inputName, outputName, format, bitrate));

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: cfg.mime });
      const outputName2 = `${stripExt(item.file.name)}.${cfg.ext}`;
      patchItem(item.id, {
        status: "done",
        progress: 100,
        outputUrl: URL.createObjectURL(blob),
        outputBlob: blob,
        outputName: outputName2,
        outputSize: blob.size,
      });

      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});
    } catch (err) {
      console.error("Conversion failed", err);
      patchItem(item.id, {
        status: "error",
        error: t.error_convert || "Conversion failed for this file.",
      });
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});
    } finally {
      ffmpeg.off("progress", onProgress);
    }
  };

  const handleConvertAll = async () => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg || isConverting) return;

    // Snapshot the files that still need converting.
    const pending = items.filter(
      (it) => it.status === "pending" || it.status === "error",
    );
    if (pending.length === 0) return;

    setIsConverting(true);
    try {
      for (const item of pending) {
        await convertItem(ffmpeg, item);
      }
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadAll = async () => {
    const done = items.filter((it) => it.status === "done" && it.outputBlob);
    if (done.length === 0) return;
    const zip = new JSZip();
    const used = new Set<string>();
    done.forEach((it, i) => {
      let name = it.outputName || `audio_${i + 1}.${FORMAT_CONFIG[format].ext}`;
      if (used.has(name)) {
        name = `${stripExt(name)}_${i + 1}.${FORMAT_CONFIG[format].ext}`;
      }
      used.add(name);
      zip.file(name, it.outputBlob as Blob);
    });
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted-audio_${FORMAT_CONFIG[format].ext}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    items.forEach((it) => it.outputUrl && URL.revokeObjectURL(it.outputUrl));
    setItems([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const doneCount = items.filter((it) => it.status === "done").length;
  const pendingCount = items.filter(
    (it) => it.status === "pending" || it.status === "error",
  ).length;

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-3xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 mb-6">
              <FileAudio className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t.title || "Audio Converter"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {t.subtitle ||
                "Convert between MP3, WAV, OGG, M4A, and FLAC — or extract audio from video — right in your browser. Batch, fast, and private."}
            </p>

            <Adsense slotId="7759160077" />

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Upload Section */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                  : "border-muted-foreground/30 hover:border-violet-500/50 hover:bg-violet-50/50 dark:hover:bg-violet-900/10"
              }`}
            >
              <Music className="w-14 h-14 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {t.drop_zone || "Drag & drop your files here, or click to browse"}
              </p>
              <p className="text-sm text-muted-foreground">
                {t.supported ||
                  "Audio: MP3, WAV, OGG, M4A/AAC, FLAC, WebM — video files are accepted too (audio track extracted)."}
              </p>
            </div>

            {/* Output Settings */}
            {items.length > 0 && (
              <Card className="w-full mt-6 border-violet-100 dark:border-violet-900/50">
                <CardHeader className="border-b pb-4">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    <CardTitle className="text-lg">
                      {t.output_settings || "Output Settings"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t.output_format || "Output Format"}</Label>
                      <Select
                        value={format}
                        onValueChange={(v) => setFormat(v as OutputFormat)}
                        disabled={isConverting}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(FORMAT_CONFIG) as OutputFormat[]).map(
                            (f) => (
                              <SelectItem key={f} value={f}>
                                {FORMAT_CONFIG[f].label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    {format === "mp3" && (
                      <div className="space-y-2">
                        <Label>{t.bitrate || "MP3 Bitrate"}</Label>
                        <Select
                          value={bitrate}
                          onValueChange={(v) => setBitrate(v as Mp3Bitrate)}
                          disabled={isConverting}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="128">128 kbps (smaller)</SelectItem>
                            <SelectItem value="192">192 kbps (balanced)</SelectItem>
                            <SelectItem value="320">320 kbps (best)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Queue */}
            {items.length > 0 && (
              <div className="w-full mt-6 space-y-3">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
                  >
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg shrink-0">
                      {it.status === "done" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : it.status === "error" ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : it.status === "processing" ? (
                        <Loader2 className="w-5 h-5 text-violet-600 dark:text-violet-400 animate-spin" />
                      ) : (
                        <FileAudio className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {it.status === "done" && it.outputName
                          ? it.outputName
                          : it.file.name}
                      </p>
                      {it.status === "processing" ? (
                        <div className="mt-1.5">
                          <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div
                              className="h-full bg-violet-500 transition-all duration-200"
                              style={{ width: `${it.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t.converting || "Converting"} {it.progress}%
                          </p>
                        </div>
                      ) : it.status === "done" && it.outputSize != null ? (
                        <p className="text-xs text-muted-foreground">
                          {formatSize(it.file.size)} → {formatSize(it.outputSize)}
                        </p>
                      ) : it.status === "error" ? (
                        <p className="text-xs text-red-500">
                          {it.error || "Conversion failed."}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {formatSize(it.file.size)}
                        </p>
                      )}
                    </div>
                    {it.status === "done" && it.outputUrl ? (
                      <a href={it.outputUrl} download={it.outputName}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-violet-200 dark:border-violet-900/50 shrink-0"
                        >
                          <Download className="mr-1.5 h-4 w-4" />
                          {t.download || "Download"}
                        </Button>
                      </a>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0"
                        onClick={() => removeItem(it.id)}
                        disabled={it.status === "processing"}
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={handleConvertAll}
                    disabled={isConverting || !ffmpegLoaded || pendingCount === 0}
                    className="flex-1 h-12 text-base bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90"
                  >
                    {isConverting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t.converting_all || "Converting..."}
                      </>
                    ) : (
                      <>
                        <FileAudio className="mr-2 h-5 w-5" />
                        {t.convert_all || "Convert All"}
                        {pendingCount > 0 ? ` (${pendingCount})` : ""}
                      </>
                    )}
                  </Button>
                  {doneCount > 1 && (
                    <Button
                      onClick={handleDownloadAll}
                      variant="outline"
                      disabled={isConverting}
                      className="flex-1 h-12 text-base border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400"
                    >
                      <Archive className="mr-2 h-5 w-5" />
                      {t.download_all || "Download All (.zip)"}
                    </Button>
                  )}
                  <Button
                    onClick={reset}
                    variant="ghost"
                    disabled={isConverting}
                    className="sm:w-auto h-12"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t.clear || "Clear"}
                  </Button>
                </div>
              </div>
            )}

            {!ffmpegLoaded && !loadError && (
              <p className="mt-4 text-xs text-center text-muted-foreground">
                {t.loading_engine || "Loading audio engine..."}
              </p>
            )}

            {loadError && (
              <div className="w-full mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {loadError}
                </p>
              </div>
            )}
          </div>

          {/* Guide Section */}
          <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {t.guide_title || "How to Convert Audio"}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t.guide_desc ||
                    "Change audio formats in 3 simple steps — entirely in your browser."}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: t.step1_title || "Add Files",
                    desc:
                      t.step1_desc ||
                      "Drop in one or more audio files. Video files work too — we'll extract just the audio.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: t.step2_title || "Pick a Format",
                    desc:
                      t.step2_desc ||
                      "Choose MP3, WAV, OGG, M4A, or FLAC, and set the MP3 bitrate if needed.",
                    icon: Settings2,
                  },
                  {
                    step: 3,
                    title: t.step3_title || "Convert & Download",
                    desc:
                      t.step3_desc ||
                      "Convert everything, then download each file or grab them all as a ZIP.",
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

            {/* Tips Section */}
            <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
                  <Lightbulb className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {t.tips_title || "Audio Conversion Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {t.tips_desc || "Get the best results from your conversions."}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: t.tip1_title || "Pick the Right Format",
                    desc:
                      t.tip1_desc ||
                      "Use MP3 or M4A for everyday sharing, WAV or FLAC when you need lossless quality for editing or archiving.",
                    icon: FileAudio,
                  },
                  {
                    title: t.tip2_title || "Bitrate vs. Size",
                    desc:
                      t.tip2_desc ||
                      "Higher MP3 bitrates sound better but produce larger files. 192 kbps is a great balance for most music.",
                    icon: Settings2,
                  },
                  {
                    title: t.tip3_title || "Extract Audio from Video",
                    desc:
                      t.tip3_desc ||
                      "Drop an MP4, MOV, or WebM file and the converter pulls out just the audio track for you.",
                    icon: Music,
                  },
                  {
                    title: t.tip4_title || "100% Private",
                    desc:
                      t.tip4_desc ||
                      "Everything runs in your browser with WebAssembly. Your files are never uploaded to a server.",
                    icon: Info,
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
                      <p className="text-sm text-muted-foreground">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ Section */}
            {(dict?.page_audio_converter?.faq || FALLBACK_FAQ).length > 0 && (
              <section>
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold tracking-tight mb-4">
                    {t.faq_title || "Frequently Asked Questions"}
                  </h2>
                </div>
                <div className="max-w-3xl mx-auto space-y-4">
                  {(dict?.page_audio_converter?.faq || FALLBACK_FAQ).map(
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
          <ToolsSidebar category="video-audio" dict={dict} />
        </aside>
      </div>
    </div>
  );
}

const FALLBACK_FAQ = [
  {
    question: "Which audio formats can I convert between?",
    answer:
      "You can convert to MP3, WAV, OGG, M4A (AAC), and FLAC. As input you can use any of those formats plus WebM audio — and you can even drop in a video file and we'll extract just the audio track.",
  },
  {
    question: "Can I convert multiple files at once?",
    answer:
      "Yes. Add as many files as you like to the queue and click Convert All. Each file is processed one after another, and if one file fails the rest keep going.",
  },
  {
    question: "What do the MP3 bitrate options mean?",
    answer:
      "Bitrate controls the trade-off between file size and quality. 128 kbps is compact, 192 kbps is a good all-round default, and 320 kbps is the highest MP3 quality with the largest file size.",
  },
  {
    question: "Is my audio uploaded to a server?",
    answer:
      "No. All conversion happens locally in your browser using WebAssembly. Your files never leave your device, so the process is completely private.",
  },
  {
    question: "How do I download everything at once?",
    answer:
      "After conversion you can download each file individually, or click Download All to bundle every converted file into a single ZIP archive.",
  },
];
