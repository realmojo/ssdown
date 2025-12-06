"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Download,
  Loader2,
  Music2,
  Heart,
  MessageCircle,
  Eye,
  Calendar,
  Share2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TikTokClientProps {
  dict: any;
}

interface VideoItem {
  url: string;
  content_type: string;
  bitrate: string | number; // Can be string like "480p" or number
}

interface TikTokResponse {
  id: string;
  user: {
    name: string;
    screenName: string;
    avatar: string;
  };
  content: string;
  thumbnail: string;
  videoItems: VideoItem[];
  stats: {
    favoriteCount: number;
    shareCount: number;
    replyCount: number;
    quoteCount: number;
    viewCount: number;
  };
  createdAt: string;
  tt_chain_token?: string;
}

export function TikTokClient({ dict }: TikTokClientProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TikTokResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadingVideo, setDownloadingVideo] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!url.trim()) {
      setError(dict?.common?.error_url || "Please enter a valid URL");
      return;
    }

    setLoading(true);
    setData(null);
    setError(null);

    try {
      const response = await fetch(
        `/api/tiktok?url=${encodeURIComponent(url)}`
      );
      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(
          result.message || result.error || "Failed to fetch video information"
        );
      }

      // Check if videoItems exists and has items
      if (!result.videoItems || result.videoItems.length === 0) {
        throw new Error(
          "No video found in this TikTok. Make sure it contains a video."
        );
      }

      setData(result);
    } catch (err: any) {
      console.error("Error fetching video:", err);
      setError(
        err?.message ||
          "Failed to fetch video information. Please check the URL and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVideoDownload = async (videoUrl: string, quality: string) => {
    setDownloadingVideo(videoUrl);
    try {
      // Decode the URL first to handle the encoded format
      const decodedUrl = decodeURIComponent(videoUrl);
      const response = await fetch(
        `/api/tiktok/download?videoUrl=${encodeURIComponent(decodedUrl)}`
      );

      if (!response.ok) {
        throw new Error("Failed to download video");
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `tiktok_video_${quality}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      console.error("Error downloading video:", err);
      alert(err?.message || "Failed to download video. Please try again.");
    } finally {
      setDownloadingVideo(null);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="w-full px-4 md:px-6 py-12 lg:py-24">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          <div className="p-4 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-500 mb-4 animate-bounce-slow">
            <Music2 className="h-12 w-12" />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-500">
            {dict?.tiktok?.title || "TikTok Video Downloader"}
          </h1>

          <p className="text-xl text-muted-foreground max-w-[600px]">
            {dict?.tiktok?.subtitle ||
              "Download TikTok videos without watermark. Save MP4 videos and MP3 audio instantly."}
          </p>

          <Card className="w-full shadow-xl border-pink-100 dark:border-pink-900/50 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-pink-500 to-cyan-500" />
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Input
                    placeholder={
                      dict?.tiktok?.placeholder || "Paste TikTok link here..."
                    }
                    className="h-14 text-lg bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-pink-500 text-black dark:text-white"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) {
                        handleDownload();
                      }
                    }}
                    disabled={loading}
                  />
                </div>
                <Button
                  size="lg"
                  className="h-14 text-lg bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-lg px-8 whitespace-nowrap"
                  onClick={handleDownload}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {dict?.common?.processing || "Processing..."}
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      {dict?.common?.download || "Download"}
                    </>
                  )}
                </Button>
              </div>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {data && (
            <Card className="w-full shadow-2xl border-pink-100 dark:border-pink-900/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-white dark:bg-gray-900">
                <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
                  {/* Thumbnail */}
                  <div className="w-full md:w-1/3 relative aspect-[9/16] md:aspect-auto md:h-64 rounded-xl overflow-hidden shadow-lg group">
                    <Image
                      src={data.thumbnail}
                      alt="Video Thumbnail"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized // Since we are using external URL
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </div>

                  {/* Content & Stats */}
                  <div className="flex-1 w-full text-left space-y-6">
                    {/* User Info Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                          <Image
                            src={data.user.avatar}
                            alt={data.user.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                            {data.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            @{data.user.screenName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md whitespace-nowrap">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(data.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-lg md:text-xl font-medium leading-relaxed dark:text-gray-100">
                        {data.content}
                      </p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 py-4 border-y border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            {formatNumber(data.stats.viewCount)}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1 text-pink-500">
                          <Heart className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            {formatNumber(data.stats.favoriteCount)}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1 text-blue-500">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            {formatNumber(data.stats.replyCount)}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1 text-green-500">
                          <Share2 className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            {formatNumber(data.stats.shareCount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Download Buttons */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Download Options
                      </p>
                      <div className="grid gap-3">
                        {data.videoItems.map((video, index) => {
                          const isDownloading = downloadingVideo === video.url;
                          const quality =
                            typeof video.bitrate === "string"
                              ? video.bitrate
                              : `${video.bitrate}p`;
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full h-12 justify-between px-6 bg-gray-50 hover:bg-pink-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 group transition-all"
                              onClick={() =>
                                handleVideoDownload(video.url, quality)
                              }
                              disabled={isDownloading}
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                                <span className="font-semibold">{quality}</span>
                                <span className="text-xs text-muted-foreground hidden sm:inline-block uppercase">
                                  {video.content_type}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 group-hover:translate-x-1 transition-transform">
                                {isDownloading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="font-medium">
                                      {dict?.common?.downloading ||
                                        "Downloading..."}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="font-medium">
                                      Download
                                    </span>
                                    <Download className="w-4 h-4" />
                                  </>
                                )}
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {!data && (
            <div className="grid gap-6 sm:grid-cols-2 w-full pt-12 text-left">
              <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">
                  {dict?.tiktok?.no_watermark || "No Watermark"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {dict?.tiktok?.desc_watermark ||
                    "Get clear videos without the annoying TikTok watermark overlay."}
                </p>
              </div>
              <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">
                  {dict?.tiktok?.mp4_mp3 || "MP4 & MP3"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {dict?.tiktok?.desc_audio ||
                    "Choose to download the video or just the audio track as MP3."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
