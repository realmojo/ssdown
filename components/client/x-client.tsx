"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Download,
  Loader2,
  Heart,
  MessageCircle,
  Repeat,
  Eye,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { XIcon } from "@/components/ui/icons";

interface XClientProps {
  dict: any;
}

interface VideoItem {
  url: string;
  content_type: string;
  bitrate: number;
  quality: string;
}

interface TwitterResponse {
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
}

export function XClient({ dict }: XClientProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TwitterResponse | null>(null);

  const handleDownload = async () => {
    if (!url) return;
    setLoading(true);
    setData(null);

    // Mock API Call
    setTimeout(() => {
      const mockData: TwitterResponse = {
        id: "1996749284876615682",
        user: {
          name: "Kathleen Winchell ❤️🤍💙🇺🇸🇺🇸",
          screenName: "KathleenWinche3",
          avatar:
            "https://pbs.twimg.com/profile_images/1736600776930172929/f57UzfqX_normal.jpg",
        },
        content:
          "I’m happy with the verdict! Are you ? https://t.co/x93jQIIFVD",
        thumbnail:
          "https://pbs.twimg.com/amplify_video_thumb/1996749218937978880/img/-2MzuY9OU5_IK7IB.jpg",
        videoItems: [
          {
            url: "https://video.twimg.com/amplify_video/1996749218937978880/vid/avc1/320x568/We8tUgKzjdSrMi1S.mp4?tag=21",
            content_type: "video/mp4",
            bitrate: 632000,
            quality: "360p",
          },
          {
            url: "https://video.twimg.com/amplify_video/1996749218937978880/vid/avc1/480x852/hWeYYdJf1gjP9VF8.mp4?tag=21",
            content_type: "video/mp4",
            bitrate: 950000,
            quality: "480p",
          },
          {
            url: "https://video.twimg.com/amplify_video/1996749218937978880/vid/avc1/576x1024/55pCJ7mG6Zr3Hj3W.mp4?tag=21",
            content_type: "video/mp4",
            bitrate: 2176000,
            quality: "480p",
          },
        ],
        stats: {
          favoriteCount: 82877,
          shareCount: 7415,
          replyCount: 9500,
          quoteCount: 1125,
          viewCount: 2340726,
        },
        createdAt: "Fri Dec 05 01:11:41 +0000 2025",
      };

      setData(mockData);
      setLoading(false);
    }, 1500);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="w-full px-4 md:px-6 py-12 lg:py-24">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 mb-4 animate-bounce-slow">
            <XIcon className="h-12 w-12" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700 whitespace-nowrap">
            {dict?.x?.title || "X (Twitter) Video Downloader"}
          </h1>

          <p className="text-xl text-muted-foreground max-w-[600px]">
            {dict?.x?.subtitle ||
              "Save X (Twitter) videos and GIFs in MP4 format. High quality, free, and unlimited."}
          </p>

          <Card className="w-full shadow-xl border-blue-100 dark:border-blue-900/50 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600" />
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Input
                    placeholder={
                      dict?.x?.placeholder || "Paste X (Twitter) link here..."
                    }
                    className="h-14 text-lg bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-blue-500 text-black dark:text-white"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleDownload();
                    }}
                  />
                </div>
                <Button
                  size="lg"
                  className="h-14 text-lg bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 px-8 whitespace-nowrap"
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

          {data && (
            <Card className="w-full shadow-2xl border-blue-100 dark:border-blue-900/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                        {data.content.replace(/https:\/\/t\.co\/\w+/g, "")}
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
                          <Repeat className="w-4 h-4" />
                          <span className="text-xs font-medium">
                            {formatNumber(
                              data.stats.shareCount + data.stats.quoteCount
                            )}
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
                        {data.videoItems.map((video, index) => (
                          <a
                            key={index}
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                            <Button
                              variant="outline"
                              className="w-full h-12 justify-between px-6 bg-gray-50 hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 group transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-semibold">
                                  {video.quality}
                                </span>
                                <span className="text-xs text-muted-foreground hidden sm:inline-block">
                                  ({(video.bitrate / 1000).toFixed(0)}kbps)
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                                <span className="font-medium">Download</span>
                                <Download className="w-4 h-4" />
                              </div>
                            </Button>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {!data && (
            <div className="grid gap-6 sm:grid-cols-3 w-full pt-12 text-left">
              <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">
                  {dict?.common?.copy_link || "Copy Link"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {dict?.x?.desc_copy ||
                    "Find the tweet you want to download and copy its link."}
                </p>
              </div>
              <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">Paste URL</h3>
                <p className="text-muted-foreground text-sm">
                  {dict?.x?.desc_paste ||
                    "Paste the link into the input box above and hit download."}
                </p>
              </div>
              <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">
                  {dict?.common?.save_video || "Save Video"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {dict?.x?.desc_save ||
                    "Choose your preferred quality and save the video to your device."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
