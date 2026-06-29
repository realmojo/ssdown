"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Music, Film } from "lucide-react";

// Single-threaded UMD ffmpeg.wasm — does NOT require SharedArrayBuffer / COOP /
// COEP headers (same approach as the video-to-mp3 tool).
type FFmpegInstance = any;

interface YtTheme {
  downloadButtonHover: string;
  downloadButtonText: string;
  indicatorColor: string;
}

interface YtItem {
  quality: string;
  content_type: string;
  kind: "progressive" | "merge" | "audio";
  url: string;
  videoUrl?: string;
  audioUrl?: string;
}

interface YtDownloadsProps {
  item: {
    id: string;
    videoItems: YtItem[];
  };
  theme: YtTheme;
}

const FFMPEG_BASE = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

function saveBlob(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export function YtDownloads({ item, theme }: YtDownloadsProps) {
  const ffmpegRef = useRef<FFmpegInstance | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [stage, setStage] = useState<string>("");
  const [pct, setPct] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const ensureFfmpeg = async (): Promise<FFmpegInstance> => {
    if (ffmpegRef.current) return ffmpegRef.current;
    setStage("Loading converter (~30 MB, first time only)…");
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL(`${FFMPEG_BASE}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${FFMPEG_BASE}/ffmpeg-core.wasm`, "application/wasm"),
    });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  };

  const fetchWithProgress = async (
    url: string,
    onProgress: (p: number) => void,
  ): Promise<Uint8Array> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Stream download failed (HTTP ${res.status})`);
    const total = Number(res.headers.get("content-length") || 0);
    if (!res.body || !total) {
      const buf = new Uint8Array(await res.arrayBuffer());
      onProgress(1);
      return buf;
    }
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        received += value.length;
        onProgress(received / total);
      }
    }
    const out = new Uint8Array(received);
    let offset = 0;
    for (const c of chunks) {
      out.set(c, offset);
      offset += c.length;
    }
    return out;
  };

  const handleMerge = async (v: YtItem) => {
    if (busyKey || !v.videoUrl || !v.audioUrl) return;
    setBusyKey(v.quality);
    setError(null);
    setPct(0);
    try {
      const ffmpeg = await ensureFfmpeg();

      setStage("Downloading video…");
      const videoData = await fetchWithProgress(v.videoUrl, (p) =>
        setPct(Math.round(p * 100)),
      );

      setStage("Downloading audio…");
      setPct(0);
      const audioData = await fetchWithProgress(v.audioUrl, (p) =>
        setPct(Math.round(p * 100)),
      );

      setStage("Merging video + audio…");
      setPct(0);
      await ffmpeg.writeFile("v.mp4", videoData);
      await ffmpeg.writeFile("a.m4a", audioData);
      // Stream copy (remux) — both are already H.264 + AAC, so no re-encode.
      await ffmpeg.exec([
        "-i",
        "v.mp4",
        "-i",
        "a.m4a",
        "-c",
        "copy",
        "-movflags",
        "+faststart",
        "out.mp4",
      ]);
      const out = await ffmpeg.readFile("out.mp4");
      saveBlob(new Blob([out], { type: "video/mp4" }), `ssdown-youtube-${item.id}-${v.quality}.mp4`);

      // Free the in-memory FS.
      try {
        await ffmpeg.deleteFile("v.mp4");
        await ffmpeg.deleteFile("a.m4a");
        await ffmpeg.deleteFile("out.mp4");
      } catch {
        /* ignore */
      }
    } catch (e: any) {
      setError(
        e?.message ||
          "Merge failed. The video may be too large for in-browser processing — try a lower resolution.",
      );
    } finally {
      setBusyKey(null);
      setStage("");
      setPct(0);
    }
  };

  const hasMerge = item.videoItems.some((v) => v.kind === "merge");

  return (
    <div className="grid gap-3">
      {item.videoItems.map((v, i) => {
        const isBusy = busyKey === v.quality;
        const isAudio = v.kind === "audio";
        const Icon = isAudio ? Music : v.kind === "merge" ? Film : Download;

        // Progressive single-file and audio-only: straight proxy download link.
        if (v.kind !== "merge") {
          return (
            <a
              key={i}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full h-12 flex justify-between items-center px-6 bg-gray-50 ${theme.downloadButtonHover} dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-md group transition-all cursor-pointer ${busyKey ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${theme.indicatorColor} animate-pulse`} />
                <span className="font-semibold">{v.quality}</span>
              </div>
              <div className={`flex items-center gap-2 ${theme.downloadButtonText} group-hover:translate-x-1 transition-transform`}>
                <span className="font-medium">Download</span>
                <Icon className="w-4 h-4" />
              </div>
            </a>
          );
        }

        // Merge: download video + audio, then remux in the browser.
        return (
          <button
            key={i}
            type="button"
            disabled={!!busyKey}
            onClick={() => handleMerge(v)}
            className={`w-full min-h-12 flex flex-col justify-center px-6 py-2 bg-gray-50 ${theme.downloadButtonHover} dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-md group transition-all ${busyKey ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${theme.indicatorColor} animate-pulse`} />
                <span className="font-semibold">{v.quality}</span>
              </div>
              <div className={`flex items-center gap-2 ${theme.downloadButtonText} ${isBusy ? "" : "group-hover:translate-x-1"} transition-transform`}>
                {isBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-medium text-sm">{stage}</span>
                  </>
                ) : (
                  <>
                    <span className="font-medium">Download</span>
                    <Film className="w-4 h-4" />
                  </>
                )}
              </div>
            </div>
            {isBusy && pct > 0 && (
              <div className="w-full mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </button>
        );
      })}

      {hasMerge && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          Higher-resolution options are combined from separate video and audio
          streams directly in your browser — no upload, nothing leaves your
          device. The first such download loads a one-time converter (~30 MB).
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
