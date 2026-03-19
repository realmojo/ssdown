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
import {
  VideoDownloaderClient,
  ThemeConfig,
  StatsConfig,
} from "./video-saver-client";
import { DouyinIcon } from "@/components/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DouyinClientProps {
  dict: any;
}

export function DouyinClient({ dict }: DouyinClientProps) {
  const theme: ThemeConfig = {
    bgFrom: "from-red-50",
    bgTo: "to-white dark:from-gray-900 dark:to-gray-950",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
    titleFrom: "from-red-500",
    titleTo: "to-orange-400",
    cardBorder: "border-red-100 dark:border-red-900/50",
    topBarGradient: "bg-gradient-to-r from-red-500 to-orange-400",
    buttonGradient:
      "bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500",
    inputFocus: "focus:ring-red-500",
    downloadButtonHover: "hover:bg-red-50",
    downloadButtonText: "text-red-600 dark:text-red-400",
    indicatorColor: "bg-red-500",
  };

  const statsConfig: StatsConfig[] = [
    { icon: Eye, color: "text-muted-foreground", key: "viewCount" },
    { icon: Heart, color: "text-red-500", key: "favoriteCount" },
    { icon: MessageCircle, color: "text-blue-500", key: "replyCount" },
    { icon: Share2, color: "text-green-500", key: "shareCount" },
  ];

  const guideSection = (
    <div className="w-full max-w-6xl mx-auto mt-20 px-4 space-y-16">
      {/* Step-by-Step Guide */}
      <section>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <BookOpen className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            How to Download Douyin Videos Without Watermark
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Save Douyin (抖音) videos in high quality — no watermark, no app required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: "Open Douyin Video",
              desc: "Open the Douyin app and find the video you want to download. Tap the Share (分享) button on the right side of the video.",
              icon: Eye,
            },
            {
              step: 2,
              title: "Copy Video Link",
              desc: "Tap '复制链接' (Copy link) from the share menu. The Douyin video URL will be copied to your clipboard.",
              icon: Share2,
            },
            {
              step: 3,
              title: "Download Without Watermark",
              desc: "Paste the link into SSDown above, click Download, and save your Douyin video as MP4 without any watermark overlay.",
              icon: Download,
            },
          ].map((step) => (
            <Card key={step.step} className="border-red-100 dark:border-red-900/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white font-bold">
                    {step.step}
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
            <Lightbulb className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Douyin Download Tips</h2>
          <p className="text-muted-foreground">
            Get the most out of downloading Douyin content.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: "No Watermark",
              desc: "SSDown removes the Douyin watermark automatically, giving you clean videos without the username overlay.",
              icon: CheckCircle2,
            },
            {
              title: "Audio Extraction",
              desc: "Extract the audio track from any Douyin video as an MP3 file — perfect for trending sounds and BGM.",
              icon: Music,
            },
            {
              title: "Original Quality",
              desc: "Videos are downloaded in their original resolution without re-encoding or compression.",
              icon: CheckCircle2,
            },
            {
              title: "Respect Creators",
              desc: "Always credit the original Douyin creator (抖音号) when sharing downloaded content. Support creators by following them.",
              icon: Heart,
            },
          ].map((tip, idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
              <div className="flex-shrink-0">
                <tip.icon className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{tip.title}</h3>
                <p className="text-sm text-muted-foreground">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <Info className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Douyin Download Features</h2>
          <p className="text-muted-foreground">Everything you need to save Douyin content.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Watermark-Free",
              desc: "Download Douyin videos without the platform watermark for clean, professional content.",
            },
            {
              title: "MP4 & MP3",
              desc: "Save the full video as MP4 or extract just the audio as MP3.",
            },
            {
              title: "HD Quality",
              desc: "Preserve the original video resolution — no quality loss.",
            },
            {
              title: "No Login Required",
              desc: "No account or app installation needed. Just paste and download.",
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

      {/* FAQ */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Douyin FAQ</h2>
          <p className="text-muted-foreground">
            Common questions about downloading Douyin videos.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {[
            {
              q: "What is Douyin (抖音)?",
              a: "Douyin is the original Chinese version of TikTok, developed by ByteDance. It operates separately from the international TikTok app and is only accessible within China. It has over 700 million monthly active users.",
            },
            {
              q: "Can I download Douyin videos without a watermark?",
              a: "Yes. SSDown fetches the original video stream before the watermark overlay is applied, so you get a clean MP4 file without any Douyin branding.",
            },
            {
              q: "What URL formats are supported?",
              a: "SSDown supports standard Douyin URLs (douyin.com/video/...) as well as short share links (v.douyin.com/...) generated by the Douyin app's share feature.",
            },
            {
              q: "Can I download private Douyin videos?",
              a: "No. SSDown can only download publicly accessible Douyin videos. Private or friend-only content cannot be fetched.",
            },
            {
              q: "Is downloading Douyin videos legal?",
              a: "Downloading videos for personal use is generally acceptable. However, redistributing, re-uploading, or using content commercially without the creator's permission may violate copyright law. Always respect the original creator.",
            },
          ].map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Deep Dive */}
      <section className="bg-white dark:bg-gray-950 rounded-2xl border p-8 md:p-12">
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          Understanding Douyin Video Downloads
        </h2>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>
            Douyin (抖音) is China's leading short-form video platform with over 700 million
            monthly active users. While it shares technology with TikTok, Douyin operates
            as a completely separate platform under Chinese internet regulations, featuring
            different content, creators, and trending sounds.
          </p>
          <h3 className="text-xl font-semibold text-foreground">How Douyin Watermarks Work</h3>
          <p>
            Like TikTok, Douyin adds a dynamic username watermark when you save videos
            through the official app. This overlay is applied client-side during export —
            the underlying video file is watermark-free. SSDown accesses the original
            video stream directly, so you always get the clean version.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Douyin Video Quality</h3>
          <p>
            Douyin videos use the same H.264/H.265 codec pipeline as TikTok, typically
            encoded in vertical 9:16 format at up to 1080×1920 resolution. SSDown
            downloads the highest available quality without re-encoding, so there is
            zero quality loss from the original upload.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Douyin vs TikTok</h3>
          <p>
            Douyin and TikTok are both made by ByteDance but run on entirely separate
            servers and content ecosystems. Douyin content is not available on TikTok and
            vice versa. If you want to save a Douyin video to share internationally,
            downloading it via SSDown and re-uploading to your preferred platform is
            the most reliable approach.
          </p>
        </div>
      </section>
    </div>
  );

  const emptyState = (
    <div className="grid gap-6 sm:grid-cols-2 w-full pt-12 text-left">
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">No Watermark</p>
        <p className="text-muted-foreground text-sm">
          Download Douyin (抖音) videos without the platform watermark overlay.
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">MP4 & MP3</p>
        <p className="text-muted-foreground text-sm">
          Save the full video or extract just the audio track as MP3.
        </p>
      </div>
    </div>
  );

  return (
    <VideoDownloaderClient
      type="douyin"
      dict={dict}
      theme={theme}
      icon={DouyinIcon}
      title="Douyin Saver (抖音)"
      subtitle="Download Douyin videos without watermark. Save MP4 videos and MP3 audio instantly."
      placeholder="Paste Douyin link here... (e.g. https://v.douyin.com/...)"
      apiEndpoint="/api/douyin"
      downloadEndpoint="/api/douyin/download"
      noVideoError="No video found. Make sure the Douyin video is public."
      formatQuality={(bitrate) =>
        typeof bitrate === "string" ? bitrate : `${bitrate}p`
      }
      statsConfig={statsConfig}
      emptyState={emptyState}
      downloadFileName={(quality) => `douyin_video_${quality}.mp4`}
      faqSection={guideSection}
      slotId1="9629379592"
      slotId2="9629379592"
    />
  );
}
