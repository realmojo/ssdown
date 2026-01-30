"use client";

import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  BookOpen,
  Lightbulb,
  Info,
  CheckCircle2,
  Download,
  Music,
} from "lucide-react";
import { TikTokTechInsights } from "./tiktok-tech-insights";
import {
  VideoDownloaderClient,
  ThemeConfig,
  StatsConfig,
} from "./video-saver-client";
import { TikTokIcon } from "@/components/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const guideSection = (
    <div className="w-full max-w-6xl mx-auto mt-20 px-4 space-y-16">
      {/* Step-by-Step Guide */}
      <section>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 mb-4">
            <BookOpen className="w-8 h-8 text-pink-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.tiktok?.guide_title ||
              "How to Download TikTok Videos Without Watermark"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {dict?.tiktok?.guide_desc ||
              "Download TikTok videos in high quality without the annoying watermark overlay."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: dict?.tiktok?.step1_title || "Open TikTok Video",
              desc:
                dict?.tiktok?.step1_desc ||
                "Open the TikTok app or website and find the video you want to download. Tap on the 'Share' button below the video.",
              icon: Eye,
            },
            {
              step: 2,
              title: dict?.tiktok?.step2_title || "Copy Video Link",
              desc:
                dict?.tiktok?.step2_desc ||
                "Select 'Copy link' from the share menu. The TikTok video URL will be copied to your clipboard automatically.",
              icon: Share2,
            },
            {
              step: 3,
              title: dict?.tiktok?.step3_title || "Download Without Watermark",
              desc:
                dict?.tiktok?.step3_desc ||
                "Paste the link into SSDown, click 'Download', and get your video in MP4 format without any watermark. You can also extract just the audio as MP3.",
              icon: Download,
            },
          ].map((step) => (
            <Card
              key={step.step}
              className="border-pink-100 dark:border-pink-900/50"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-500 text-white font-bold">
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

      {/* Tips & Best Practices */}
      <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
            <Lightbulb className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.tiktok?.tips_title || "TikTok Download Tips"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.tiktok?.tips_desc ||
              "Maximize your TikTok downloading experience with these helpful tips."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: dict?.tiktok?.tip1_title || "No Watermark Guarantee",
              desc:
                dict?.tiktok?.tip1_desc ||
                "SSDown removes the TikTok watermark automatically, giving you clean, professional-looking videos perfect for reposting or editing.",
              icon: CheckCircle2,
            },
            {
              title: dict?.tiktok?.tip2_title || "Extract Audio as MP3",
              desc:
                dict?.tiktok?.tip2_desc ||
                "Love a TikTok sound? Download just the audio track as an MP3 file to use in your own videos or music library.",
              icon: Music,
            },
            {
              title: dict?.tiktok?.tip3_title || "High Quality Downloads",
              desc:
                dict?.tiktok?.tip3_desc ||
                "Get videos in their original quality, up to 1080p HD resolution. No compression, no quality loss.",
              icon: CheckCircle2,
            },
            {
              title: dict?.tiktok?.tip4_title || "Respect Creators",
              desc:
                dict?.tiktok?.tip4_desc ||
                "Always credit the original creator when reposting TikTok videos. Support creators by following and engaging with their content.",
              icon: Heart,
            },
          ].map((tip, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
            >
              <div className="flex-shrink-0">
                <tip.icon className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{tip.title}</h3>
                <p className="text-sm text-muted-foreground">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features & Capabilities */}
      <section>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <Info className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.tiktok?.features_title || "TikTok Download Features"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.tiktok?.features_desc ||
              "Everything you need to download TikTok content."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: dict?.tiktok?.feature1_title || "Watermark-Free Videos",
              desc:
                dict?.tiktok?.feature1_desc ||
                "Download TikTok videos without the platform watermark for clean, professional content.",
            },
            {
              title: dict?.tiktok?.feature2_title || "MP4 & MP3 Formats",
              desc:
                dict?.tiktok?.feature2_desc ||
                "Choose between downloading the full video (MP4) or extracting just the audio (MP3).",
            },
            {
              title: dict?.tiktok?.feature3_title || "HD Quality",
              desc:
                dict?.tiktok?.feature3_desc ||
                "Get videos in high definition up to 1080p, preserving the original quality from TikTok.",
            },
            {
              title: dict?.tiktok?.feature4_title || "Fast Downloads",
              desc:
                dict?.tiktok?.feature4_desc ||
                "Optimized servers ensure quick downloads without long waiting times or queues.",
            },
          ].map((feature, idx) => (
            <Card key={idx} className="text-center">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <TikTokTechInsights />

      {/* FAQ Section */}
      <section>
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
      </section>
    </div>
  );

  const faqSection = guideSection;

  const emptyState = (
    <div className="grid gap-6 sm:grid-cols-2 w-full pt-12 text-left">
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.tiktok?.no_watermark || "No Watermark"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.tiktok?.desc_watermark ||
            "Get clear videos without the annoying TikTok watermark overlay."}
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.tiktok?.mp4_mp3 || "MP4 & MP3"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.tiktok?.desc_audio ||
            "Choose to download the video or just the audio track as MP3."}
        </p>
      </div>
    </div>
  );

  return (
    <VideoDownloaderClient
      type="tiktok"
      dict={dict}
      theme={theme}
      icon={TikTokIcon}
      title={dict?.tiktok?.title || "TikTok Saver"}
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
      slotId1="1620870631"
    />
  );
}
