"use client";

import { Heart, MessageCircle, Repeat, Eye } from "lucide-react";
import {
  VideoDownloaderClient,
  ThemeConfig,
  StatsConfig,
} from "./video-downloader-client";
import { XIcon } from "@/components/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface XClientProps {
  dict: any;
}

export function XClient({ dict }: XClientProps) {
  const theme: ThemeConfig = {
    bgFrom: "from-blue-50",
    bgTo: "to-white dark:from-gray-900 dark:to-gray-950",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-500",
    titleFrom: "from-blue-500",
    titleTo: "to-blue-700",
    cardBorder: "border-blue-100 dark:border-blue-900/50",
    topBarGradient: "bg-gradient-to-r from-blue-400 to-blue-600",
    buttonSolid: "bg-blue-500 hover:bg-blue-600",
    inputFocus: "focus:ring-blue-500",
    downloadButtonHover: "hover:bg-blue-50",
    downloadButtonText: "text-blue-600 dark:text-blue-400",
    indicatorColor: "bg-green-500",
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
      icon: Repeat,
      color: "text-green-500",
      key: "shareCount",
      getValue: (stats) => (stats.shareCount || 0) + (stats.quoteCount || 0),
    },
  ];

  const faqSection = (
    <div className="w-full max-w-3xl mx-auto mt-20 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          {dict?.qna?.title || "Frequently Asked Questions"}
        </h2>
        <p className="text-muted-foreground">
          {dict?.qna?.desc ||
            "Find answers to common questions about downloading videos from X (Twitter)."}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {[1, 2, 3, 4, 5].map((i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left">
              {dict?.qna?.[`faq_${i}_q`] || "Question"}
            </AccordionTrigger>
            <AccordionContent className="whitespace-pre-line text-muted-foreground">
              {dict?.qna?.[`faq_${i}_a`] || "Answer"}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );

  const emptyState = (
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
  );

  return (
    <VideoDownloaderClient
      dict={dict}
      theme={theme}
      icon={XIcon}
      title={dict?.x?.title || "X (Twitter) Video Downloader"}
      subtitle={
        dict?.x?.subtitle ||
        "Save X (Twitter) videos and GIFs in MP4 format. High quality, free, and unlimited."
      }
      placeholder={dict?.x?.placeholder || "Paste X (Twitter) link here..."}
      apiEndpoint="/api/x"
      downloadEndpoint="/api/x/download"
      noVideoError="No video found in this tweet. Make sure it contains a video."
      formatContent={(content) => content.replace(/https:\/\/t\.co\/\w+/g, "")}
      statsConfig={statsConfig}
      emptyState={emptyState}
      downloadFileName={(quality) => `x_video_${quality}.mp4`}
      faqSection={faqSection}
    />
  );
}
