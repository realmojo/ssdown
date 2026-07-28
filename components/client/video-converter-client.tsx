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
  RefreshCw,
  Zap,
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
    question: "어떤 영상 형식끼리 변환할 수 있나요?",
    answer:
      "MP4, MOV, WebM, AVI, MKV를 입력받아 MP4(H.264), WebM(VP8), MOV, AVI로 변환할 수 있습니다. 휴대폰, 브라우저, 소셜 미디어에서 가장 널리 호환되는 것은 MP4입니다.",
  },
  {
    question: "큰 파일은 왜 변환이 느린가요?",
    answer:
      "모든 처리가 웹어셈블리로 빌드한 FFmpeg로 브라우저 안에서 이뤄지는데, 이는 단일 스레드로 동작합니다. 원활하게 쓰시려면 100MB 이하 영상을 권장하며, 더 크거나 긴 영상은 몇 분이 걸릴 수 있습니다.",
  },
  {
    question: "제 영상이 서버에 업로드되나요?",
    answer:
      "아니요. 모든 처리가 웹어셈블리로 기기 안에서 이뤄집니다. 영상이 브라우저를 벗어나지 않아 완전히 비공개로 유지됩니다.",
  },
  {
    question: "MOV → MP4 변환이 가끔 거의 즉시 끝나는 이유는 무엇인가요?",
    answer:
      "원본이 이미 호환되는 코덱(H.264 영상, AAC 오디오)을 쓰고 있으면 재인코딩 없이 새 컨테이너로 다시 담기만 합니다. 코덱이 호환되지 않으면 자동으로 전체 재인코딩으로 전환됩니다.",
  },
  {
    question: "MP4와 WebM은 무엇이 다른가요?",
    answer:
      "MP4(H.264 + AAC)는 사실상 어디서나 재생됩니다. WebM(VP8)은 웹에 최적화된 개방형 무료 형식입니다. 호환성이 중요하면 MP4를, 개방형 형식이 꼭 필요하면 WebM을 고르세요.",
  },
];

type OutputFormat = "mp4" | "webm" | "mov" | "avi";

const FORMAT_OPTIONS: { value: OutputFormat; label: string; hint: string }[] = [
  { value: "mp4", label: "MP4", hint: "H.264 + AAC · best compatibility" },
  { value: "webm", label: "WebM", hint: "VP8 · open web format" },
  { value: "mov", label: "MOV", hint: "H.264 · Apple QuickTime" },
  { value: "avi", label: "AVI", hint: "H.264 · legacy container" },
];

const MIME_BY_FORMAT: Record<OutputFormat, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
};

// Formats that browsers can reliably preview inline.
const PREVIEWABLE: OutputFormat[] = ["mp4", "webm"];

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

export function VideoConverterClient({ dict }: { dict?: any }) {
  const t = dict?.video_converter || {};
  const faqItems: { question: string; answer: string }[] =
    dict?.page_video_converter?.faq || FALLBACK_FAQ;

  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<OutputFormat>("mp4");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("mp4");
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

  // Re-encode args per target format. Verified against @ffmpeg/core 0.12.6
  // (libx264, aac, libvpx, libvorbis are all compiled in).
  const buildEncodeArgs = (
    inputName: string,
    outputName: string,
    target: OutputFormat,
  ): string[] => {
    if (target === "webm") {
      return [
        "-i",
        inputName,
        "-c:v",
        "libvpx",
        "-b:v",
        "1M",
        "-c:a",
        "libvorbis",
        outputName,
      ];
    }
    // mp4 / mov / avi all use H.264 + AAC
    return [
      "-i",
      inputName,
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-crf",
      "26",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      outputName,
    ];
  };

  const handleConvert = async () => {
    if (!file || !ffmpegRef.current) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setOutputSize(0);

    const ffmpeg = ffmpegRef.current;
    const target = format;
    const inputExt = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const inputName = `input.${inputExt}`;
    const outputName = `output.${target}`;

    try {
      const { fetchFile } = await import("@ffmpeg/util");
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      let outData: Uint8Array | null = null;

      // Fast path: try a stream copy remux first for container-only targets.
      // If codecs are incompatible the copy produces no usable output and we
      // fall back to a full re-encode automatically.
      const canRemux = target === "mp4" || target === "mov";
      if (canRemux) {
        try {
          await ffmpeg.exec(["-i", inputName, "-c", "copy", outputName]);
          const remuxed = (await ffmpeg.readFile(outputName)) as Uint8Array;
          if (remuxed && remuxed.length > 0) outData = remuxed;
        } catch {
          // ignore and re-encode below
        }
        if (!outData) {
          try {
            await ffmpeg.deleteFile(outputName);
          } catch {
            // output may not exist; safe to ignore
          }
        }
      }

      if (!outData) {
        setProgress(0);
        await ffmpeg.exec(buildEncodeArgs(inputName, outputName, target));
        outData = (await ffmpeg.readFile(outputName)) as Uint8Array;
      }

      if (!outData || outData.length === 0) {
        throw new Error("변환 결과가 빈 파일입니다.");
      }

      const blob = new Blob([new Uint8Array(outData)], {
        type: MIME_BY_FORMAT[target],
      });
      setDownloadUrl(URL.createObjectURL(blob));
      setOutputSize(blob.size);
      setOutputFormat(target);
      setProgress(100);

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to convert this video. The file may use an unsupported codec — try a different output format or a smaller clip.",
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

  const convertAgain = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setOutputSize(0);
    setProgress(0);
    setError(null);
  };

  const isLargeFile = !!file && file.size > MAX_RECOMMENDED_MB * 1024 * 1024;
  const outBaseName = file?.name?.replace(/\.[^.]+$/, "") || "video";

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-3xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 mb-6">
              <RefreshCw className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t.title || "영상 변환기"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {t.subtitle ||
                "브라우저에서 바로 MP4, WebM, MOV, AVI를 서로 변환하세요. 빠르고 무료이며 아무것도 업로드되지 않습니다."}
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
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                    : "border-muted-foreground/30 hover:border-violet-500/50 hover:bg-violet-50/50 dark:hover:bg-violet-900/10"
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
              <Card className="w-full border-violet-100 dark:border-violet-900/50 animate-in fade-in slide-in-from-bottom-4">
                <CardHeader className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg shrink-0">
                        <Film className="w-6 h-6 text-violet-600 dark:text-violet-400" />
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
                          "This file is larger than ~100MB. In-browser conversion is single-threaded and may take several minutes or run out of memory."}
                      </p>
                    </div>
                  )}

                  {/* Output format selection */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      {t.format_label || "Convert to"}
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {FORMAT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormat(opt.value)}
                          className={`rounded-lg border p-3 text-left transition-all ${
                            format === opt.value
                              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 ring-2 ring-violet-500/30"
                              : "border-muted-foreground/20 hover:border-violet-400/60"
                          }`}
                        >
                          <div className="font-semibold">{opt.label}</div>
                          <div className="text-xs text-muted-foreground mt-1 leading-tight">
                            {opt.hint}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={handleConvert}
                    disabled={isProcessing || !ffmpegLoaded}
                    className="w-full h-12 text-lg bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90 text-white"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t.converting || "Converting..."} {progress}%
                      </>
                    ) : !ffmpegLoaded ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t.loading_engine || "Loading engine..."}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5" />
                        {t.convert_btn || "Convert Video"}
                      </>
                    )}
                  </Button>

                  {isProcessing && (
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-200"
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
                          {t.result_title || "Conversion Complete!"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatSize(file?.size || 0)} →{" "}
                          {formatSize(outputSize)} ·{" "}
                          {outputFormat.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {PREVIEWABLE.includes(outputFormat) ? (
                      <video
                        src={downloadUrl}
                        controls
                        className="w-full rounded-lg mb-6 bg-black max-h-[360px]"
                      />
                    ) : (
                      <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground mb-6">
                        <Info className="w-4 h-4" />
                        {t.no_preview ||
                          "In-browser preview isn't available for this format — download the file to play it."}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={downloadUrl}
                        download={`${outBaseName}.${outputFormat}`}
                        className="flex-1"
                      >
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                          <Download className="mr-2 h-4 w-4" />
                          {t.download_btn || "Download Video"}
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        onClick={convertAgain}
                        className="flex-1"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t.convert_again_btn || "Convert Again"}
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
                  {t.guide_title || "영상 변환 방법"}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t.guide_desc ||
                    "세 단계면 영상 형식을 바꿀 수 있습니다."}
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
                    title: t.step2_title || "Choose a format",
                    desc:
                      t.step2_desc ||
                      "출력 형식으로 MP4, WebM, MOV, AVI 중 하나를 고르세요.",
                    icon: RefreshCw,
                  },
                  {
                    step: 3,
                    title: t.step3_title || "Convert & download",
                    desc:
                      t.step3_desc ||
                      "변환을 실행해 결과를 미리 본 뒤 바로 내려받으세요.",
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
                  {t.tips_title || "Conversion Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {t.tips_desc || "변환에서 가장 좋은 결과를 얻는 방법입니다."}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: t.tip1_title || "MP4 for Compatibility",
                    desc:
                      t.tip1_desc ||
                      "MP4(H.264 + AAC)는 사실상 모든 기기, 브라우저, 소셜 플랫폼에서 재생되는 안전한 기본값입니다.",
                    icon: Film,
                  },
                  {
                    title: t.tip2_title || "Instant Remux",
                    desc:
                      t.tip2_desc ||
                      "코덱이 이미 맞으면 재인코딩 없이 다시 담기만 하므로 MOV → MP4 같은 변환은 거의 즉시 끝납니다.",
                    icon: Zap,
                  },
                  {
                    title: t.tip3_title || "영상은 작게 유지하세요",
                    desc:
                      t.tip3_desc ||
                      "모든 처리가 웹어셈블리로 기기에서 이뤄지므로 100MB 이하 영상이 가장 빠르고 안정적으로 변환됩니다.",
                    icon: Info,
                  },
                  {
                    title: t.tip4_title || "WebM은 개방형",
                    desc:
                      t.tip4_desc ||
                      "로열티가 없고 웹에 최적화된 형식이 꼭 필요할 때 WebM(VP8)을 고르세요. 다만 인코딩은 MP4보다 느립니다.",
                    icon: RefreshCw,
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
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  {t.faq_title || "자주 묻는 질문"}
                </h2>
              </div>
              <div className="max-w-3xl mx-auto space-y-3">
                {faqItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-violet-100 dark:border-violet-900/50 rounded-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 p-4 text-left font-medium hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 text-violet-600 dark:text-violet-400 transition-transform ${
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
