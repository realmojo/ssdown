"use client";

import { Camera, Heart, MessageCircle, Layers } from "lucide-react";
import {
  VideoDownloaderClient,
  ThemeConfig,
  StatsConfig,
} from "./video-downloader-client";
import { InstagramIcon } from "@/components/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface InstagramClientProps {
  dict: any;
}

export function InstagramClient({ dict }: InstagramClientProps) {
  const theme: ThemeConfig = {
    bgFrom: "from-purple-50",
    bgTo: "to-white dark:from-gray-900 dark:to-gray-950",
    iconBg: "bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-600",
    iconColor: "text-white",
    titleFrom: "from-purple-600",
    titleVia: "via-pink-600",
    titleTo: "to-orange-500",
    cardBorder: "border-purple-100 dark:border-purple-900/50",
    topBarGradient:
      "bg-gradient-to-r from-yellow-400 via-orange-500 to-purple-600",
    buttonGradient:
      "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
    inputFocus: "focus:ring-purple-500",
    downloadButtonHover: "hover:bg-purple-50",
    downloadButtonText: "text-purple-600 dark:text-purple-400",
    indicatorColor: "bg-purple-500",
  };

  const statsConfig: StatsConfig[] = [
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
      icon: Layers,
      color: "text-green-500",
      key: "shareCount",
    },
    {
      icon: Camera,
      color: "text-purple-500",
      key: "viewCount",
    },
  ];

  const faqSection = (
    <div className="w-full max-w-3xl mx-auto mt-20 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          {dict?.qna_instagram?.title || "Instagram FAQ"}
        </h2>
        <p className="text-muted-foreground">
          {dict?.qna_instagram?.desc ||
            "Answers about downloading Instagram Reels, Stories, and Photos."}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {[1, 2, 3, 4, 5].map((i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left">
              {dict?.qna_instagram?.[`faq_${i}_q`] || "Question"}
            </AccordionTrigger>
            <AccordionContent className="whitespace-pre-line text-muted-foreground">
              {dict?.qna_instagram?.[`faq_${i}_a`] || "Answer"}
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
          {dict?.instagram?.feature_1_title || "Reels & Videos"}
        </h3>
        <p className="text-muted-foreground text-sm">
          {dict?.instagram?.feature_1_desc ||
            "Download Instagram Reels and videos in high definition with sound."}
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="font-semibold text-lg mb-2">
          {dict?.instagram?.feature_2_title || "Photos & Stories"}
        </h3>
        <p className="text-muted-foreground text-sm">
          {dict?.instagram?.feature_2_desc ||
            "Save photos and stories from any public Instagram account easily."}
        </p>
      </div>
    </div>
  );

  return (
    <VideoDownloaderClient
      dict={dict}
      theme={theme}
      icon={InstagramIcon}
      title={dict?.instagram?.title || "Instagram Video Downloader"}
      subtitle={
        dict?.instagram?.subtitle ||
        "Download Instagram Reels, Videos, and Photos instantly. High quality, no watermark."
      }
      placeholder={
        dict?.instagram?.placeholder || "Paste Instagram URL here..."
      }
      apiEndpoint="/api/instagram"
      downloadEndpoint="/api/instagram/download"
      noVideoError="No video found in this Instagram reel. Make sure it contains a video."
      statsConfig={statsConfig}
      thumbnailAspect="aspect-[4/5]"
      thumbnailHeight="md:h-80"
      thumbnailImageProxy={(url) =>
        `/api/instagram/image?url=${encodeURIComponent(url)}`
      }
      avatarImageProxy={(url) =>
        `/api/instagram/image?url=${encodeURIComponent(url)}`
      }
      emptyState={emptyState}
      downloadFileName={(quality) => `instagram_video_${quality}.mp4`}
      faqSection={faqSection}
    />
  );
}
