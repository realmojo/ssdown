"use client";

import { ThumbsUp, MessageCircle, Share2, Video } from "lucide-react";
import {
  VideoDownloaderClient,
  ThemeConfig,
  StatsConfig,
} from "./video-downloader-client";
import { FacebookIcon } from "@/components/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FacebookClientProps {
  dict: any;
}

export function FacebookClient({ dict }: FacebookClientProps) {
  const theme: ThemeConfig = {
    bgFrom: "from-blue-50",
    bgTo: "to-white dark:from-gray-900 dark:to-gray-950",
    iconBg: "bg-blue-600",
    iconColor: "text-white",
    titleFrom: "from-blue-600",
    titleVia: "via-blue-500",
    titleTo: "to-blue-400",
    cardBorder: "border-blue-100 dark:border-blue-900/50",
    topBarGradient: "bg-gradient-to-r from-blue-600 to-blue-400",
    buttonGradient:
      "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600",
    inputFocus: "focus:ring-blue-500",
    downloadButtonHover: "hover:bg-blue-50",
    downloadButtonText: "text-blue-600 dark:text-blue-400",
    indicatorColor: "bg-blue-500",
  };

  const statsConfig: StatsConfig[] = [
    {
      icon: ThumbsUp,
      color: "text-blue-500",
      key: "favoriteCount",
    },
    {
      icon: MessageCircle,
      color: "text-blue-400",
      key: "replyCount",
    },
    {
      icon: Share2,
      color: "text-blue-600",
      key: "shareCount",
    },
    {
      icon: Video,
      color: "text-blue-500",
      key: "viewCount",
    },
  ];

  const faqSection = (
    <div className="w-full max-w-3xl mx-auto mt-20 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          {dict?.qna_facebook?.title || "Facebook FAQ"}
        </h2>
        <p className="text-muted-foreground">
          {dict?.qna_facebook?.desc ||
            "Help with downloading Facebook videos in HD and 4K."}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {[1, 2, 3, 4, 5].map((i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left">
              {dict?.qna_facebook?.[`faq_${i}_q`] || "Question"}
            </AccordionTrigger>
            <AccordionContent className="whitespace-pre-line text-muted-foreground">
              {dict?.qna_facebook?.[`faq_${i}_a`] || "Answer"}
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
          {dict?.facebook?.feature_1_title || "HD Videos"}
        </h3>
        <p className="text-muted-foreground text-sm">
          {dict?.facebook?.feature_1_desc ||
            "Download public Facebook videos in 1080p, 2K, and 4K quality."}
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="font-semibold text-lg mb-2">
          {dict?.facebook?.feature_2_title || "Watch Offline"}
        </h3>
        <p className="text-muted-foreground text-sm">
          {dict?.facebook?.feature_2_desc ||
            "Save videos to your device to watch them anytime, anywhere without internet."}
        </p>
      </div>
    </div>
  );

  return (
    <VideoDownloaderClient
      dict={dict}
      theme={theme}
      icon={FacebookIcon}
      title={dict?.facebook?.title || "Facebook Video Downloader"}
      subtitle={
        dict?.facebook?.subtitle ||
        "Download Facebook videos easily. High quality, free, and secure."
      }
      placeholder={
        dict?.facebook?.placeholder || "Paste Facebook video URL here..."
      }
      apiEndpoint="/api/facebook"
      downloadEndpoint="/api/facebook/download"
      noVideoError="No video found. Make sure the link is a valid public Facebook video."
      statsConfig={statsConfig}
      emptyState={emptyState}
      downloadFileName={(quality) => `facebook_video_${quality}.mp4`}
      faqSection={faqSection}
    />
  );
}
