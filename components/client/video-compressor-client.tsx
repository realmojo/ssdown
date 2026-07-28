"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  Film,
  Loader2,
  X,
  RotateCcw,
  Lightbulb,
  Info,
  Minimize2,
  Gauge,
  Sparkles,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

// Types only - actual imports happen dynamically
type FFmpeg = any;

const FALLBACK_FAQ: { question: string; answer: string }[] = [
  {
    question: "영상 용량이 얼마나 줄어드나요?",
    answer:
      "원본에 따라 다릅니다. 휴대폰이나 편집 프로그램에서 내보낸 영상은 과하게 인코딩된 경우가 많아 '균형' 설정에서 보통 40~70% 줄어듭니다. '최소 용량' 설정은 가로 1280px로 축소까지 해서 가장 크게 줄여 줍니다.",
  },
  {
    question: "압축하면 화질이 나빠지나요?",
    answer:
      "고화질 (CRF 23) is visually near-lossless. Balanced (CRF 28) is a great size-to-quality trade-off for sharing. Smallest (CRF 33 + downscale) prioritizes file size and is best for previews or messaging apps.",
  },
  {
    question: "큰 파일은 왜 압축이 느린가요?",
    answer:
      "모든 처리가 웹어셈블리로 빌드한 FFmpeg로 브라우저 안에서 이뤄지는데, 이는 단일 스레드로 동작합니다. 원활하게 쓰시려면 100MB 이하 영상을 권장하며, 더 큰 영상은 몇 분이 걸릴 수 있습니다.",
  },
  {
    question: "제 영상이 어딘가로 업로드되나요?",
    answer:
      "아니요. 압축은 웹어셈블리로 전적으로 기기 안에서 이뤄집니다. 영상이 브라우저를 벗어나지 않아 비공개로 유지됩니다.",
  },
  {
    question: "결과물은 어떤 형식인가요?",
    answer:
      "압축된 파일은 언제나 H.264 영상과 AAC 오디오를 쓰는 MP4입니다. 휴대폰, 브라우저, 소셜 플랫폼에서 가장 널리 호환되는 조합입니다.",
  },
];

type Preset = "high" | "balanced" | "smallest";

const PRESETS: {
  value: Preset;
  label: string;
  hint: string;
  crf: number;
  scale: boolean;
  icon: typeof Sparkles;
}[] = [
  {
    value: "high",
    label: "고화질",
    hint: "CRF 23 · near-lossless",
    crf: 23,
    scale: false,
    icon: Sparkles,
  },
  {
    value: "balanced",
    label: "Balanced",
    hint: "CRF 28 · best trade-off",
    crf: 28,
    scale: false,
    icon: Gauge,
  },
  {
    value: "smallest",
    label: "Smallest",
    hint: "CRF 33 · scaled to 1280px",
    crf: 33,
    scale: true,
    icon: Minimize2,
  },
];

const VIDEO_EXTENSIONS = [
  "mp4",
  "mov",
  "webm",
  "avi",
  "mkv",
  "m4v",
  "3gp",
  "flv",
  "wmv",
  "ts",
];

const MAX_RECOMMENDED_MB = 100;

export function VideoCompressorClient({ dict }: { dict?: any }) {
  const t = dict?.video_compressor || {};
  const faqItems: { question: string; answer: string }[] =
    dict?.page_video_compressor?.faq || FALLBACK_FAQ;

  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<Preset>("balanced");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // Load FFmpeg (single-threaded UMD core)
  const loadFFmpeg = async () => {
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();

      ffmpeg.on("progress", ({ progress }: { progress: number }) => {
        setProgress(Math.min(100, Math.max(0, Math.round(progress * 100))));
      });

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
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
        "Failed to load the video processing engine. Please refresh the page or try a different browser.",
      );
    }
  };

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const processFile = (selectedFile: File) => {
    const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "";
    const isVideo =
      selectedFile.type.startsWith("video/") || VIDEO_EXTENSIONS.includes(ext);
    if (!isVideo) {
      setError("올바른 영상 파일을 올려 주세요 (MP4, MOV, WebM, AVI, MKV).");
      return;
    }
    setFile(selectedFile);
    setDownloadUrl(null);
    setOutputSize(0);
    setProgress(0);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
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
    if (droppedFile) processFile(droppedFile);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes <= 0) return "0 MB";
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // H.264 + AAC MP4 output. Verified flags for @ffmpeg/core 0.12.6.
  const buildArgs = (
    inputName: string,
    outputName: string,
    selected: Preset,
  ): string[] => {
    const config = PRESETS.find((p) => p.value === selected) || PRESETS[1];
    const args = [
      "-i",
      inputName,
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-crf",
      String(config.crf),
    ];
    if (config.scale) {
      args.push("-vf", "scale='min(1280,iw)':-2");
    }
    args.push("-c:a", "aac", "-b:a", "128k", outputName);
    return args;
  };

  const handleCompress = async () => {
    if (!file || !ffmpegRef.current) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setOutputSize(0);

    const ffmpeg = ffmpegRef.current;
    const inputExt = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const inputName = `input.${inputExt}`;
    const outputName = "output.mp4";

    try {
      const { fetchFile } = await import("@ffmpeg/util");
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      await ffmpeg.exec(buildArgs(inputName, outputName, preset));

      const outData = (await ffmpeg.readFile(outputName)) as Uint8Array;
      if (!outData || outData.length === 0) {
        throw new Error("압축 결과가 빈 파일입니다.");
      }

      const blob = new Blob([new Uint8Array(outData)], { type: "video/mp4" });
      setDownloadUrl(URL.createObjectURL(blob));
      setOutputSize(blob.size);
      setProgress(100);

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to compress this video. The file may use an unsupported codec — try a smaller clip or a different source.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setDownloadUrl(null);
    setOutputSize(0);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const compressAgain = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setOutputSize(0);
    setProgress(0);
    setError(null);
  };

  const originalSize = file?.size || 0;
  const savedPct =
    originalSize > 0 && outputSize > 0
      ? Math.round(((originalSize - outputSize) / originalSize) * 100)
      : 0;
  const isLargeFile = !!file && file.size > MAX_RECOMMENDED_MB * 1024 * 1024;
  const outBaseName = file?.name?.replace(/\.[^.]+$/, "") || "video";

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-3xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 mb-6">
              <Minimize2 className="w-10 h-10 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t.title || "영상 압축"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {t.subtitle ||
                "화질 손상을 최소화하면서 브라우저에서 바로 영상 용량을 줄이세요. 빠르고 무료이며 아무것도 업로드되지 않습니다."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Upload Section */}
            {!file && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                    : "border-muted-foreground/30 hover:border-orange-500/50 hover:bg-orange-50/50 dark:hover:bg-orange-900/10"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,.mkv,.avi,.mov,.webm,.mp4"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Film className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {t.drop_zone || "여기에 영상 파일을 끌어다 놓으세요"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.supported || "Supported: MP4, MOV, WebM, AVI, MKV"}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-3">
                  {t.size_note ||
                    "전적으로 브라우저에서 실행됩니다. 속도를 위해 100MB 이하 영상을 권장합니다."}
                </p>
              </div>
            )}

            {/* Editor Section */}
            {file && !downloadUrl && (
              <Card className="w-full border-orange-100 dark:border-orange-900/50 animate-in fade-in slide-in-from-bottom-4">
                <CardHeader className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg shrink-0">
                        <Film className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg line-clamp-1">
                          {file.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {formatSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={reset}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                  {isLargeFile && (
                    <div className="flex gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {t.large_warning ||
                          "This file is larger than ~100MB. In-browser compression is single-threaded and may take several minutes or run out of memory."}
                      </p>
                    </div>
                  )}

                  {/* Preset selection */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      {t.preset_label || "Compression level"}
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {PRESETS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setPreset(opt.value)}
                          className={`rounded-lg border p-3 text-left transition-all ${
                            preset === opt.value
                              ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-500/30"
                              : "border-muted-foreground/20 hover:border-orange-400/60"
                          }`}
                        >
                          <div className="flex items-center gap-2 font-semibold">
                            <opt.icon className="w-4 h-4 text-orange-500" />
                            {opt.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 leading-tight">
                            {opt.hint}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={handleCompress}
                    disabled={isProcessing || !ffmpegLoaded}
                    className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t.compressing || "Compressing..."} {progress}%
                      </>
                    ) : !ffmpegLoaded ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t.loading_engine || "Loading engine..."}
                      </>
                    ) : (
                      <>
                        <Minimize2 className="mr-2 h-5 w-5" />
                        {t.compress_btn || "Compress Video"}
                      </>
                    )}
                  </Button>

                  {isProcessing && (
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Result Section */}
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
                          {t.result_title || "Compression Complete!"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {savedPct > 0
                            ? `${t.saved_prefix || "Saved"} ${savedPct}% — ${formatSize(
                                originalSize,
                              )} → ${formatSize(outputSize)}`
                            : `${formatSize(originalSize)} → ${formatSize(
                                outputSize,
                              )}`}
                        </p>
                      </div>
                    </div>

                    {/* Size comparison bar */}
                    <div className="flex items-center gap-3 mb-6 text-xs font-medium">
                      <span className="w-16 shrink-0 text-right text-muted-foreground">
                        {t.original_label || "Original"}
                      </span>
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-full bg-muted-foreground/40" />
                      </div>
                      <span className="w-20 shrink-0 tabular-nums">
                        {formatSize(originalSize)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-6 text-xs font-medium">
                      <span className="w-16 shrink-0 text-right text-muted-foreground">
                        {t.compressed_label || "Compressed"}
                      </span>
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                          style={{
                            width: `${
                              originalSize > 0
                                ? Math.max(
                                    4,
                                    Math.min(
                                      100,
                                      (outputSize / originalSize) * 100,
                                    ),
                                  )
                                : 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="w-20 shrink-0 tabular-nums text-orange-600 dark:text-orange-400">
                        {formatSize(outputSize)}
                      </span>
                    </div>

                    <video
                      src={downloadUrl}
                      controls
                      className="w-full rounded-lg mb-6 bg-black max-h-[360px]"
                    />

                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={downloadUrl}
                        download={`compressed_${outBaseName}.mp4`}
                        className="flex-1"
                      >
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                          <Download className="mr-2 h-4 w-4" />
                          {t.download_btn || "Download Video"}
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        onClick={compressAgain}
                        className="flex-1"
                      >
                        <Gauge className="mr-2 h-4 w-4" />
                        {t.compress_again_btn || "Try Another Level"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={reset}
                        className="flex-1"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {t.reset_btn || "New File"}
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

          {/* Guide Section */}
          <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {t.guide_title || "영상 압축 방법"}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t.guide_desc ||
                    "세 단계면 영상 용량을 줄일 수 있습니다."}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: t.step1_title || "영상 올리기",
                    desc:
                      t.step1_desc ||
                      "MP4, MOV, WebM, AVI, MKV 파일을 끌어다 놓거나 선택하세요.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title: t.step2_title || "Pick a compression level",
                    desc:
                      t.step2_desc ||
                      "Choose 고화질, Balanced, or Smallest depending on your goal.",
                    icon: Gauge,
                  },
                  {
                    step: 3,
                    title: t.step3_title || "Compress & download",
                    desc:
                      t.step3_desc ||
                      "실행해 전후 용량을 비교하고 결과를 미리 본 뒤 내려받으세요.",
                    icon: Download,
                  },
                ].map((step) => (
                  <Card
                    key={step.step}
                    className="border-orange-100 dark:border-orange-900/50"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white font-bold">
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
                  {t.tips_title || "Compression Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {t.tips_desc || "용량과 화질의 균형을 맞추는 방법입니다."}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: t.tip1_title || "'균형'부터 시작하세요",
                    desc:
                      t.tip1_desc ||
                      "균형(CRF 28)은 보기 좋은 화질을 유지하면서도 용량을 크게 줄여 주는 무난한 기본값입니다.",
                    icon: Gauge,
                  },
                  {
                    title: t.tip2_title || "공유용은 '최소 용량'",
                    desc:
                      t.tip2_desc ||
                      "'최소 용량' 설정은 가로 1280px로 축소까지 해서 메신저나 이메일 첨부에 적합합니다.",
                    icon: Minimize2,
                  },
                  {
                    title: t.tip3_title || "디테일이 필요하면 '높음'",
                    desc:
                      t.tip3_desc ||
                      "Use 고화질 (CRF 23) when you need near-lossless output and file size is a secondary concern.",
                    icon: Sparkles,
                  },
                  {
                    title: t.tip4_title || "파일 크기에 유의하세요",
                    desc:
                      t.tip4_desc ||
                      "모든 처리가 웹어셈블리로 기기에서 이뤄지므로 100MB 이하 영상이 가장 빠르고 안정적으로 압축됩니다.",
                    icon: Info,
                  },
                ].map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <div className="flex-shrink-0">
                      <tip.icon className="w-6 h-6 text-orange-500" />
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
                  {t.faq_title || "자주 묻는 질문"}
                </h2>
              </div>
              <div className="max-w-3xl mx-auto space-y-3">
                {faqItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-orange-100 dark:border-orange-900/50 rounded-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 p-4 text-left font-medium hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 text-orange-600 dark:text-orange-400 transition-transform ${
                          openFaq === idx ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openFaq === idx && (
                      <div className="p-4 pt-0 text-sm text-muted-foreground leading-relaxed">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
