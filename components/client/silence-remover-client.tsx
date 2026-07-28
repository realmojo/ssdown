"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  Music,
  Waves,
  Loader2,
  X,
  Play,
  RotateCcw,
  Lightbulb,
  Info,
  Sliders,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

// Types only - actual imports happen dynamically
type FFmpeg = any;

const FALLBACK_FAQ: { question: string; answer: string }[] = [
  {
    question: "무음 감지는 어떻게 동작하나요?",
    answer:
      "FFmpeg가 선택한 감도 기준값과 오디오의 음량을 비교해, 그 기준보다 조용한 상태가 설정한 최소 길이 이상 이어지는 구간을 제거합니다.",
  },
  {
    question: "작은 목소리까지 잘려 나가지는 않나요?",
    answer:
      "기준값이 너무 공격적이면 그럴 수 있습니다. 작은 목소리가 잘린다면 감도 값을 높여(예: -35에서 -30으로 덜 낮게) 다시 시도로 새 설정으로 재처리해 보세요.",
  },
  {
    question: "어떤 오디오 형식을 지원하나요?",
    answer:
      "오디오 자르기 도구와 동일하게 MP3, WAV, OGG, M4A를 모두 지원합니다. 처리 결과는 언제나 고음질 MP3로 저장됩니다.",
  },
  {
    question: "제 파일이 서버에 업로드되나요?",
    answer:
      "아니요. 모든 처리가 웹어셈블리(WASM으로 빌드한 FFmpeg)로 브라우저 안에서 이뤄집니다. 오디오가 기기를 벗어나지 않습니다.",
  },
  {
    question: "설정을 바꿔 다시 처리할 수 있나요?",
    answer:
      "네. 처리 후 다시 시도 버튼으로 감도와 최소 무음 길이를 조정해 같은 파일에 다시 적용할 수 있습니다. 파일을 다시 올릴 필요가 없습니다.",
  },
];

export function SilenceRemoverClient({ dict }: { dict?: any }) {
  const t = dict?.silence_remover || {};
  const faqItems: { question: string; answer: string }[] =
    dict?.page_silence_remover?.faq || FALLBACK_FAQ;

  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [sensitivity, setSensitivity] = useState<number>(-35);
  const [minSilence, setMinSilence] = useState<number>(0.5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [outputDuration, setOutputDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load FFmpeg (single-threaded UMD core)
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
        "Failed to load audio processing engine. Please try refreshing the page or using a different browser.",
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
    setOutputDuration(0);
    setError(null);
    setWaveformData([]);
  };

  // Set audio source and decode waveform when file changes
  useEffect(() => {
    if (file && audioRef.current) {
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      audioRef.current.load();

      // Decode audio for waveform preview
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

  // Audio loaded metadata handler
  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
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

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Draw a simple (non-interactive) waveform preview
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

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

    for (let i = 0; i < waveformData.length; i++) {
      const x = i * barWidth;
      const barH = Math.max(2, waveformData[i] * maxBarHeight);
      ctx.fillStyle = "#65a30d"; // lime-600
      const gap = 1;
      const w = Math.max(1, barWidth - gap);
      ctx.fillRect(x, centerY - barH / 2, w, barH);
    }
  }, [waveformData]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  useEffect(() => {
    const handleResize = () => drawWaveform();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawWaveform]);

  // Silence removal logic
  const handleRemoveSilence = async () => {
    if (!file || !ffmpegRef.current) return;

    setIsProcessing(true);
    setError(null);
    // Clear any previous result but keep the uploaded file
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setOutputDuration(0);

    try {
      const ffmpeg = ffmpegRef.current;
      const { fetchFile } = await import("@ffmpeg/util");

      const ext = file.name.split(".").pop() || "mp3";
      const inputName = `input.${ext}`;
      const outputName = `output.mp3`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // Chain two silenceremove instances:
      //  1) strip a single leading silence period from the start
      //  2) strip every interior/trailing silence longer than minSilence
      const threshold = sensitivity;
      const filter =
        `silenceremove=start_periods=1:start_duration=0:start_threshold=${threshold}dB:detection=peak,` +
        `silenceremove=stop_periods=-1:stop_duration=${minSilence}:stop_threshold=${threshold}dB:detection=peak`;

      await ffmpeg.exec([
        "-i",
        inputName,
        "-af",
        filter,
        "-c:a",
        "libmp3lame",
        "-q:a",
        "2",
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (err) {
      console.error(err);
      setError("무음 구간을 제거하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Measure processed audio duration once its metadata loads
  const onResultLoadedMetadata = () => {
    if (resultAudioRef.current) {
      setOutputDuration(resultAudioRef.current.duration);
    }
  };

  // Try Again: keep the file, clear only the previous result so the user can
  // tweak the sliders and re-process without re-uploading.
  const tryAgain = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setOutputDuration(0);
    setError(null);
  };

  // Full reset
  const reset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setDownloadUrl(null);
    setOutputDuration(0);
    setDuration(0);
    setWaveformData([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const reductionPct =
    duration > 0 && outputDuration > 0
      ? Math.max(0, Math.round(((duration - outputDuration) / duration) * 100))
      : 0;

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-3xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-lime-100 dark:bg-lime-900/30 mb-6">
              <Waves className="w-10 h-10 text-lime-700 dark:text-lime-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t.title || "무음 제거"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {t.subtitle ||
                "Automatically detect and remove silent gaps from your audio, right in your browser. Fast, free, and private."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Hidden source audio player - always mounted for ref access */}
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
                    ? "border-lime-500 bg-lime-50 dark:bg-lime-900/20"
                    : "border-muted-foreground/30 hover:border-lime-500/50 hover:bg-lime-50/50 dark:hover:bg-lime-900/10"
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
                <p className="text-xs text-muted-foreground/70 mt-3">
                  {t.video_note ||
                    "Audio files only for now — video support may come later."}
                </p>
              </div>
            )}

            {/* Editor Section */}
            {file && !downloadUrl && (
              <Card className="w-full border-lime-100 dark:border-lime-900/50 animate-in fade-in slide-in-from-bottom-4">
                <CardHeader className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-lime-100 dark:bg-lime-900/30 rounded-lg">
                        <Music className="w-6 h-6 text-lime-700 dark:text-lime-400" />
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
                <CardContent className="pt-8 space-y-8">
                  {/* Waveform Preview */}
                  <div className="space-y-2">
                    <div className="relative w-full h-28 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden select-none border border-gray-200 dark:border-gray-700">
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
                  </div>

                  {/* Sensitivity Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-lime-700 dark:text-lime-400" />
                        {t.sensitivity_label || "Sensitivity"}
                      </Label>
                      <span className="text-sm font-mono font-semibold text-lime-700 dark:text-lime-400">
                        {sensitivity} dB
                      </span>
                    </div>
                    <Slider
                      value={[sensitivity]}
                      min={-60}
                      max={-20}
                      step={1}
                      onValueChange={(v) => setSensitivity(v[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t.sensitivity_aggressive || "Aggressive"}</span>
                      <span>
                        {t.sensitivity_hint ||
                          "Lower dB cuts more; higher dB cuts only true silence"}
                      </span>
                      <span>{t.sensitivity_conservative || "Conservative"}</span>
                    </div>
                  </div>

                  {/* Minimum Silence Length Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Waves className="w-4 h-4 text-lime-700 dark:text-lime-400" />
                        {t.min_silence_label || "Minimum Silence Length"}
                      </Label>
                      <span className="text-sm font-mono font-semibold text-lime-700 dark:text-lime-400">
                        {minSilence.toFixed(1)}s
                      </span>
                    </div>
                    <Slider
                      value={[minSilence]}
                      min={0.3}
                      max={3.0}
                      step={0.1}
                      onValueChange={(v) => setMinSilence(v[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t.min_silence_hint ||
                        "Only gaps at least this long will be removed."}
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={handleRemoveSilence}
                    disabled={isProcessing || !ffmpegLoaded}
                    className="w-full h-12 text-lg bg-gradient-to-r from-lime-500 to-green-500 hover:opacity-90 text-white"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t.processing || "Processing..."}
                      </>
                    ) : !ffmpegLoaded ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t.loading_engine || "Loading engine..."}
                      </>
                    ) : (
                      <>
                        <Waves className="mr-2 h-5 w-5" />
                        {t.remove_btn || "Remove Silence"}
                      </>
                    )}
                  </Button>
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
                          {t.result_title || "Silence Removed!"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {reductionPct > 0
                            ? `${t.removed_prefix || "Removed"} ${reductionPct}% ${
                                t.removed_suffix || "silence"
                              } — ${formatTime(duration)} → ${formatTime(
                                outputDuration,
                              )}`
                            : `${formatTime(duration)} → ${formatTime(
                                outputDuration,
                              )}`}
                        </p>
                      </div>
                    </div>

                    {/* Processed audio preview */}
                    <audio
                      ref={resultAudioRef}
                      src={downloadUrl}
                      onLoadedMetadata={onResultLoadedMetadata}
                      controls
                      className="w-full mb-6"
                    />

                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={downloadUrl}
                        download={`silence_removed_${
                          file?.name?.replace(/\.[^.]+$/, "") || "audio"
                        }.mp3`}
                        className="flex-1"
                      >
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                          <Download className="mr-2 h-4 w-4" />
                          {t.download_btn || "Download Audio"}
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        onClick={tryAgain}
                        className="flex-1"
                      >
                        <Sliders className="mr-2 h-4 w-4" />
                        {t.try_again_btn || "Try Again"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={reset}
                        className="flex-1"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {t.reset_btn || "Remove Another File"}
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
                  {t.guide_title || "How it Works"}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t.guide_desc ||
                    "Remove silent gaps from your audio in 3 simple steps."}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: t.step1_title || "오디오 파일 올리기",
                    desc:
                      t.step1_desc ||
                      "Drag and drop or select the MP3, WAV, OGG, or M4A file you want to clean up.",
                    icon: Upload,
                  },
                  {
                    step: 2,
                    title:
                      t.step2_title ||
                      "감도와 최소 무음 길이 조절",
                    desc:
                      t.step2_desc ||
                      "Choose how aggressively silence is detected and how long a gap must be before it gets cut.",
                    icon: Sliders,
                  },
                  {
                    step: 3,
                    title: t.step3_title || "무음 제거 후 다운로드",
                    desc:
                      t.step3_desc ||
                      "파일을 처리하고 결과를 미리 들어본 뒤 정리된 오디오를 바로 내려받으세요.",
                    icon: Download,
                  },
                ].map((step) => (
                  <Card
                    key={step.step}
                    className="border-lime-100 dark:border-lime-900/50"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-lime-500 text-white font-bold">
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
                  {t.tips_title || "Silence Removal Tips"}
                </h2>
                <p className="text-muted-foreground">
                  {t.tips_desc || "Get the cleanest results from your audio."}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: t.tip1_title || "Podcasts & Interviews",
                    desc:
                      t.tip1_desc ||
                      "Spoken-word recordings usually work great with the default settings — start there before tweaking anything.",
                    icon: Music,
                  },
                  {
                    title: t.tip2_title || "Music & Ambient Audio",
                    desc:
                      t.tip2_desc ||
                      "Music or ambient recordings may need a lower (more negative) threshold so quiet passages aren't cut by mistake.",
                    icon: Sliders,
                  },
                  {
                    title: t.tip3_title || "Always Preview",
                    desc:
                      t.tip3_desc ||
                      "Listen to the processed result before downloading, and use Try Again to fine-tune the settings.",
                    icon: Play,
                  },
                  {
                    title: t.tip4_title || "Shorter Minimum = More Cuts",
                    desc:
                      t.tip4_desc ||
                      "A shorter minimum silence length catches more small pauses, but too short can make speech feel choppy.",
                    icon: Info,
                  },
                ].map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <div className="flex-shrink-0">
                      <tip.icon className="w-6 h-6 text-lime-600" />
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
                    className="border border-lime-100 dark:border-lime-900/50 rounded-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 p-4 text-left font-medium hover:bg-lime-50/50 dark:hover:bg-lime-900/10 transition-colors"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 text-lime-700 dark:text-lime-400 transition-transform ${
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
