"use client";

import { Heart, MessageCircle, Share2, Eye } from "lucide-react";
import {
  VideoDownloaderClient,
  ThemeConfig,
  StatsConfig,
} from "./video-downloader-client";
import { TikTokIcon } from "@/components/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TikTokClientProps {
  dict: any;
}

export function TikTokClient({ dict }: TikTokClientProps) {
  const theme: ThemeConfig = {
    bgFrom: "from-pink-50",
    bgTo: "to-white dark:from-gray-900 dark:to-gray-950",
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-500",
    titleFrom: "from-pink-500",
    titleTo: "to-cyan-500",
    cardBorder: "border-pink-100 dark:border-pink-900/50",
    topBarGradient: "bg-gradient-to-r from-pink-500 to-cyan-500",
    buttonGradient:
      "bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600",
    inputFocus: "focus:ring-pink-500",
    downloadButtonHover: "hover:bg-pink-50",
    downloadButtonText: "text-pink-600 dark:text-pink-400",
    indicatorColor: "bg-pink-500",
  };

  const statsConfig: StatsConfig[] = [
    {
      icon: Eye,
      color: "text-muted-foreground",
      key: "viewCount",
    },
    {
      icon: Heart,
      color: "text-pink-500",
      key: "favoriteCount",
    },
    {
      icon: MessageCircle,
      color: "text-blue-500",
      key: "replyCount",
    },
    {
      icon: Share2,
      color: "text-green-500",
      key: "shareCount",
    },
  ];

  const faqSection = (
    <div className="w-full max-w-3xl mx-auto mt-20 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          {dict?.qna_tiktok?.title || "TikTok FAQ"}
        </h2>
        <p className="text-muted-foreground">
          {dict?.qna_tiktok?.desc ||
            "Common questions about downloading TikTok videos without watermark."}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {[1, 2, 3, 4, 5].map((i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left">
              {dict?.qna_tiktok?.[`faq_${i}_q`] || "Question"}
            </AccordionTrigger>
            <AccordionContent className="whitespace-pre-line text-muted-foreground">
              {dict?.qna_tiktok?.[`faq_${i}_a`] || "Answer"}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );

  const emptyState = (
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
  );

  return (
    <VideoDownloaderClient
      dict={dict}
      theme={theme}
      icon={TikTokIcon}
      title={dict?.tiktok?.title || "TikTok Video Downloader"}
      subtitle={
        dict?.tiktok?.subtitle ||
        "Download TikTok videos without watermark. Save MP4 videos and MP3 audio instantly."
      }
      placeholder={dict?.tiktok?.placeholder || "Paste TikTok link here..."}
      apiEndpoint="/api/tiktok"
      downloadEndpoint="/api/tiktok/download"
      noVideoError="No video found in this TikTok. Make sure it contains a video."
      formatQuality={(bitrate) =>
        typeof bitrate === "string" ? bitrate : `${bitrate}p`
      }
      statsConfig={statsConfig}
      emptyState={emptyState}
      downloadFileName={(quality) => `tiktok_video_${quality}.mp4`}
      faqSection={faqSection}
    />
  );
}
