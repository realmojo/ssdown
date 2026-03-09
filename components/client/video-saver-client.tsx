"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Download,
  Loader2,
  Calendar,
  AlertCircle,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Adsense from "@/components/Adsense";
import { SeoContentSection } from "../seo-content-section";

export interface VideoItem {
  url: string;
  content_type: string;
  bitrate?: number | string;
  quality: string;
}

export interface VideoResponse {
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
    favoriteCount?: number;
    shareCount?: number;
    replyCount?: number;
    quoteCount?: number;
    viewCount?: number;
    [key: string]: number | undefined;
  };
  createdAt: string;
}

export interface ThemeConfig {
  // Background gradients
  bgFrom: string;
  bgTo: string;

  // Icon background
  iconBg: string;
  iconColor: string;

  // Title gradient
  titleFrom: string;
  titleVia?: string;
  titleTo: string;

  // Card border
  cardBorder: string;

  // Top bar gradient
  topBarGradient: string;

  // Button styles
  buttonGradient?: string;
  buttonSolid?: string;
  buttonHover?: string;

  // Input focus
  inputFocus: string;

  // Download button hover
  downloadButtonHover: string;
  downloadButtonText: string;

  // Indicator dot
  indicatorColor: string;
}

export interface StatsConfig {
  icon: LucideIcon;
  color: string;
  key: string;
  label?: string;
  getValue?: (stats: VideoResponse["stats"]) => number;
}

export interface VideoDownloaderClientProps {
  type: string;
  dict: any;
  theme: ThemeConfig;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  placeholder: string;
  apiEndpoint: string;
  downloadEndpoint: string;
  noVideoError: string;
  formatQuality?: (bitrate: string | number) => string;
  formatContent?: (content: string) => string;
  statsConfig?: StatsConfig[];
  thumbnailAspect?: string;
  thumbnailHeight?: string;
  thumbnailImageProxy?: (url: string) => string;
  avatarImageProxy?: (url: string) => string;
  emptyState: React.ReactNode;
  downloadFileName: (quality: string) => string;
  transformVideoUrl?: (url: string) => string;
  faqSection?: React.ReactNode;
  slotId1?: string;
}

export function VideoDownloaderClient({
  // type, // type: "x", "tiktok", "instagram", "facebook", "9gag", "dailymotion"
  dict,
  theme,
  icon: Icon,
  title,
  subtitle,
  placeholder,
  apiEndpoint,
  // downloadEndpoint, // No longer needed - using direct video URL instead of API proxy
  noVideoError,
  formatQuality,
  formatContent,
  statsConfig,
  thumbnailAspect = "aspect-square",
  thumbnailHeight = "h-64",
  thumbnailImageProxy,
  avatarImageProxy,
  emptyState,
  // downloadFileName, // No longer needed - browser handles filename from direct URL
  transformVideoUrl,
  faqSection,
  slotId1,
}: VideoDownloaderClientProps) {
  // 플랫폼 타입 추출 (apiEndpoint에서)
  const getPlatformType = () => {
    if (apiEndpoint.includes("/x")) return "x";
    if (apiEndpoint.includes("/tiktok")) return "tiktok";
    if (apiEndpoint.includes("/instagram")) return "instagram";
    if (apiEndpoint.includes("/facebook")) return "facebook";
    if (apiEndpoint.includes("/9gag")) return "9gag";
    if (apiEndpoint.includes("/dailymotion")) return "dailymotion";
    return "unknown";
  };

  const platformType = getPlatformType();
  const storageKey = `ssdown_recent_urls_${platformType}`;
  const MAX_RECENT_URLS = 10;

  // 로컬스토리지에서 최근 URL 불러오기
  const getRecentUrls = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e);
    }
    return [];
  };

  // 로컬스토리지에 URL 저장
  const saveUrlToStorage = (urlToSave: string) => {
    if (typeof window === "undefined" || !urlToSave.trim()) return;
    try {
      const recentUrls = getRecentUrls();
      // 중복 제거 및 최신 항목을 맨 앞에 추가
      const filtered = recentUrls.filter((u) => u !== urlToSave);
      const updated = [urlToSave, ...filtered].slice(0, MAX_RECENT_URLS);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  };

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VideoResponse | VideoResponse[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [downloadingVideo, setDownloadingVideo] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleDownload = async () => {
    if (!termsAccepted) {
      setError("Please read and accept the terms before proceeding.");
      return;
    }

    if (!url.trim()) {
      setError(dict?.common?.error_url || "Please enter a valid URL");
      return;
    }

    setLoading(true);
    setData(null);
    setError(null);

    try {
      const response = await fetch(
        `${apiEndpoint}?url=${encodeURIComponent(url)}`,
      );
      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(
          result.message || result.error || "Failed to fetch video information",
        );
      }

      // 배열인지 객체인지 확인하고 처리
      if (Array.isArray(result)) {
        // 배열인 경우: 각 항목이 유효한지 확인
        const validItems = result.filter(
          (item) => item && item.videoItems && item.videoItems.length > 0,
        );
        if (validItems.length === 0) {
          throw new Error(noVideoError);
        }
        setData(validItems);
      } else {
        // 객체인 경우
        if (!result.videoItems || result.videoItems.length === 0) {
          throw new Error(noVideoError);
        }
        setData(result);
      }

      // 성공 시 URL을 로컬스토리지에 저장
      saveUrlToStorage(url.trim());
    } catch (err: any) {
      console.error("Error fetching video:", err);
      setError(
        err?.message ||
          "Failed to fetch video information. Please check the URL and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);
  };

  const getThumbnailUrl = (url: string) => {
    return thumbnailImageProxy ? thumbnailImageProxy(url) : url;
  };

  const getAvatarUrl = (url: string) => {
    return avatarImageProxy ? avatarImageProxy(url) : url;
  };

  const getQuality = (video: VideoItem) => {
    if (formatQuality && video.bitrate) {
      return formatQuality(video.bitrate);
    }
    return video.quality;
  };

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] bg-gradient-to-b ${theme.bgFrom} ${theme.bgTo}`}
    >
      <div className="w-full px-4 md:px-6 py-12 lg:py-24">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          <div
            className={`p-4 rounded-full ${theme.iconBg} ${theme.iconColor} mb-4 animate-in fade-in zoom-in duration-500`}
          >
            <Icon className="h-12 w-12" />
          </div>

          <h1
            className={`text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r ${
              theme.titleFrom
            } ${theme.titleVia || ""} ${theme.titleTo}`}
          >
            {title}
          </h1>

          <p className="text-xl text-muted-foreground max-w-[600px] mb-2">
            {subtitle}
          </p>

          <div className="w-full">
            <Adsense slotId={slotId1 || ""} />
          </div>

          <Card
            className={`w-full shadow-xl ${theme.cardBorder} overflow-hidden`}
          >
            <div className={`h-2 ${theme.topBarGradient}`} />
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Input
                      placeholder={placeholder}
                      className={`h-14 text-lg bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 ${theme.inputFocus} text-black dark:text-white`}
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading && termsAccepted) {
                          handleDownload();
                        }
                      }}
                      disabled={loading}
                    />
                  </div>
                  <Button
                    size="lg"
                    className={`h-14 text-lg ${
                      theme.buttonGradient || theme.buttonSolid
                    } ${
                      theme.buttonHover || ""
                    } text-white shadow-lg px-8 whitespace-nowrap transition-all ${!termsAccepted ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={handleDownload}
                    disabled={loading || !termsAccepted}
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

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      setError(null);
                    }}
                    className="mt-1 h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <label
                    htmlFor="terms-checkbox"
                    className="text-sm text-amber-900 dark:text-amber-200 cursor-pointer select-none"
                  >
                    <strong>
                      I understand this tool is for educational purposes only.
                    </strong>{" "}
                    I confirm that I have permission from the content owner,
                    will comply with all copyright laws and platform Terms of
                    Service, and will use downloaded content for personal,
                    non-commercial purposes only.
                  </label>
                </div>
              </div>
              {error && (
                <Alert variant="destructive" className="mt-4 text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {data &&
            (() => {
              // 배열인지 객체인지 확인
              const dataArray = Array.isArray(data) ? data : [data];

              return (
                <div className="w-full space-y-6">
                  {dataArray.map((item, itemIndex) => (
                    <Card
                      key={itemIndex}
                      className={`w-full shadow-2xl ${theme.cardBorder} overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700`}
                    >
                      <div className="bg-white dark:bg-gray-900">
                        <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
                          {/* Thumbnail */}
                          <div
                            className={`w-full md:w-1/3 relative ${thumbnailAspect} md:aspect-auto ${thumbnailHeight} rounded-xl overflow-hidden shadow-lg group bg-black/5`}
                          >
                            <Image
                              src={getThumbnailUrl(item.thumbnail)}
                              alt="Video Thumbnail"
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              unoptimized
                            />
                          </div>

                          {/* Content & Stats */}
                          <div className="flex-1 w-full text-left space-y-6">
                            {/* User Info Header */}
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                                  <Image
                                    src={getAvatarUrl(item.user.avatar)}
                                    alt={item.user.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                                    {item.user.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    @{item.user.screenName}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md whitespace-nowrap">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {new Date(
                                    item.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <p className="text-lg md:text-xl font-medium leading-relaxed dark:text-gray-100 line-clamp-3">
                                {formatContent
                                  ? formatContent(item.content)
                                  : item.content}
                              </p>

                              {/* Stats Grid */}
                              {statsConfig && statsConfig.length > 0 && (
                                <div className="grid grid-cols-4 gap-4 py-4 border-y border-gray-100 dark:border-gray-800">
                                  {statsConfig.map((stat, statIndex) => {
                                    const StatIcon = stat.icon;
                                    const value = stat.getValue
                                      ? stat.getValue(item.stats)
                                      : item.stats[stat.key] || 0;
                                    return (
                                      <div
                                        key={statIndex}
                                        className={`flex flex-col items-center gap-1 ${stat.color}`}
                                      >
                                        <StatIcon className="w-4 h-4" />
                                        <span className="text-xs font-medium">
                                          {typeof value === "number"
                                            ? formatNumber(value)
                                            : value}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Download Buttons */}
                            <div className="space-y-3">
                              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Download Options
                              </p>
                              <div className="grid gap-3">
                                {item.videoItems.map(
                                  (video: VideoItem, videoIndex: number) => {
                                    const downloadKey = `${itemIndex}-${videoIndex}`;
                                    const isDownloading =
                                      downloadingVideo === downloadKey;
                                    const quality = getQuality(video);
                                    const finalUrl = transformVideoUrl
                                      ? transformVideoUrl(video.url)
                                      : video.url;

                                    return (
                                      <a
                                        key={videoIndex}
                                        href={finalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full h-12 flex justify-between items-center px-6 bg-gray-50 ${
                                          theme.downloadButtonHover
                                        } dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-md group transition-all ${
                                          isDownloading
                                            ? "opacity-50 cursor-not-allowed pointer-events-none"
                                            : "cursor-pointer"
                                        }`}
                                        onClick={() => {
                                          setDownloadingVideo(downloadKey);
                                          setTimeout(() => {
                                            setDownloadingVideo(null);
                                          }, 2000);
                                        }}
                                      >
                                        <div className="flex items-center gap-3">
                                          <span
                                            className={`w-2 h-2 rounded-full ${theme.indicatorColor} animate-pulse`}
                                          />
                                          <span className="font-semibold">
                                            {quality}
                                          </span>
                                        </div>
                                        <div
                                          className={`flex items-center gap-2 ${theme.downloadButtonText} group-hover:translate-x-1 transition-transform`}
                                        >
                                          {isDownloading ? (
                                            <>
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                              <span className="font-medium">
                                                Opening...
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
                                      </a>
                                    );
                                  },
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              );
            })()}

          {!data && emptyState}
        </div>
      </div>

      {faqSection}

      {dict?.[getPlatformType()]?.seo_content && (
        <SeoContentSection
          title={dict[getPlatformType()].seo_content.title}
          content={[
            dict[getPlatformType()].seo_content.p1,
            dict[getPlatformType()].seo_content.p2,
            dict[getPlatformType()].seo_content.p3,
          ]}
        />
      )}
    </div>
  );
}
