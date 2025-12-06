"use client";

import { useState } from "react";
import { Download, Loader2, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface TikTokClientProps {
  dict: any;
}

export function TikTokClient({ dict }: TikTokClientProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!url) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("TikTok download demo");
    }, 1500);
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
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <Button
                  size="lg"
                  className="h-14 text-lg bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-lg px-8 whitespace-nowrap"
                  onClick={handleDownload}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-5 w-5" />
                  )}
                  {dict?.common?.download || "Download"}
                </Button>
              </div>
            </CardContent>
          </Card>

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
        </div>
      </div>
    </div>
  );
}
