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
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

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
      setError("Please upload a valid audio file.");
      return;
    }

    setFile(selectedFile);
    setDownloadUrl(null);
    setError(null);
    setProgress(0);
    setIsPlaying(false);

    // Create audio URL to get duration
    const url = URL.createObjectURL(selectedFile);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
    }
  };

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
        "2", // High quality variable bitrate
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
      setError("Failed to trim audio. Please try again.");
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
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-3xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 mb-6">
          <Scissors className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.audio_trimmer?.title || "Audio Trimmer"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.audio_trimmer?.subtitle ||
            "Cut and trim MP3 audio files directly in your browser. Fast, free, and private."}
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
            <CardContent className="pt-8 space-y-8">
              {/* Hidden Audio Player */}
              <audio
                ref={audioRef}
                onLoadedMetadata={onLoadedMetadata}
                onTimeUpdate={onTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              {/* Controls & Waveform Placeholder */}
              <div className="space-y-6">
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

                {/* Range Slider */}
                <div className="pt-6 pb-2 px-2">
                  <Slider
                    defaultValue={[0, duration]}
                    value={range}
                    max={duration}
                    step={0.1}
                    minStepsBetweenThumbs={1}
                    onValueChange={(val: number[]) => {
                      setRange([val[0], val[1]]);
                      // Update current time to start of range if likely dragging start handle
                      if (Math.abs(val[0] - range[0]) > 0) {
                        if (audioRef.current)
                          audioRef.current.currentTime = val[0];
                        setCurrentTime(val[0]);
                      }
                    }}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>{formatTime(range[0])}</span>
                    <span>{formatTime(range[1])}</span>
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
                      value={range[0]}
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
                    <Label>End Time (sec)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min={range[0]}
                      max={duration}
                      value={range[1]}
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
                    {dict?.audio_trimmer?.trimming || "Trimming..."} {progress}%
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
                <div className="flex flex-col items-center text-center gap-4 mb-6">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Download className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-300">
                      Ready to Download!
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
                  <Button variant="outline" onClick={reset} className="flex-1">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Trim Another
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
              {dict?.audio_trimmer?.guide_title || "How to Trim Audio"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.audio_trimmer?.guide_desc ||
                "Cut your audio file in 3 simple steps."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
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
                title: dict?.audio_trimmer?.step3_title || "Trim & Download",
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
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.audio_trimmer?.tips_title || "Audio Trimming Tips"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.audio_trimmer?.tips_desc ||
                "Get the best results for your audio cuts."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: dict?.audio_trimmer?.tip1_title || "Precision Cutting",
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
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
