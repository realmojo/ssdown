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
import { KuaishouIcon } from "@/components/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KuaishouClientProps {
  dict: any;
}

export function KuaishouClient({ dict }: KuaishouClientProps) {
  const theme: ThemeConfig = {
    bgFrom: "from-orange-50",
    bgTo: "to-white dark:from-gray-900 dark:to-gray-950",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-500",
    titleFrom: "from-orange-500",
    titleTo: "to-yellow-400",
    cardBorder: "border-orange-100 dark:border-orange-900/50",
    topBarGradient: "bg-gradient-to-r from-orange-500 to-yellow-400",
    buttonGradient:
      "bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500",
    inputFocus: "focus:ring-orange-500",
    downloadButtonHover: "hover:bg-orange-50",
    downloadButtonText: "text-orange-600 dark:text-orange-400",
    indicatorColor: "bg-orange-500",
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
            <BookOpen className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            How to Download Kuaishou Videos Without Watermark
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Save Kuaishou (快手) videos in high quality — no watermark, no app required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: "Open Kuaishou Video",
              desc: "Open the Kuaishou app and find the video you want to download. Tap the Share (分享) button on the right side of the video.",
              icon: Eye,
            },
            {
              step: 2,
              title: "Copy Video Link",
              desc: "Tap '复制链接' (Copy link) from the share menu. The Kuaishou video URL will be copied to your clipboard.",
              icon: Share2,
            },
            {
              step: 3,
              title: "Download Without Watermark",
              desc: "Paste the link into SSDown above, click Download, and save your Kuaishou video as MP4 without any watermark overlay.",
              icon: Download,
            },
          ].map((step) => (
            <Card key={step.step} className="border-orange-100 dark:border-orange-900/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white font-bold">
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
          <h2 className="text-3xl font-bold tracking-tight mb-4">Kuaishou Download Tips</h2>
          <p className="text-muted-foreground">
            Get the most out of downloading Kuaishou content.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: "No Watermark",
              desc: "SSDown removes the Kuaishou watermark automatically, giving you clean videos without the username overlay.",
              icon: CheckCircle2,
            },
            {
              title: "Audio Extraction",
              desc: "Extract the audio track from any Kuaishou video as an MP3 file — perfect for trending sounds and background music.",
              icon: Music,
            },
            {
              title: "Original Quality",
              desc: "Videos are downloaded in their original resolution without re-encoding or compression.",
              icon: CheckCircle2,
            },
            {
              title: "Respect Creators",
              desc: "Always credit the original Kuaishou creator (快手号) when sharing downloaded content. Support creators by following them.",
              icon: Heart,
            },
          ].map((tip, idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
              <div className="flex-shrink-0">
                <tip.icon className="w-6 h-6 text-orange-500" />
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
          <h2 className="text-3xl font-bold tracking-tight mb-4">Kuaishou Download Features</h2>
          <p className="text-muted-foreground">Everything you need to save Kuaishou content.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Watermark-Free",
              desc: "Download Kuaishou videos without the platform watermark for clean, professional content.",
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
          <h2 className="text-3xl font-bold tracking-tight mb-4">Kuaishou FAQ</h2>
          <p className="text-muted-foreground">
            Common questions about downloading Kuaishou videos.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {[
            {
              q: "What is Kuaishou (快手)?",
              a: "Kuaishou is one of China's leading short-form video platforms with over 700 million registered users. Developed by Kuaishou Technology, it competes directly with Douyin (TikTok) in the Chinese market. The app is known for its authentic, grassroots content from everyday users.",
            },
            {
              q: "Can I download Kuaishou videos without a watermark?",
              a: "Yes. SSDown fetches the original video stream directly from Kuaishou servers before the watermark overlay is applied, so you get a clean MP4 file without any Kuaishou branding.",
            },
            {
              q: "What URL formats are supported?",
              a: "SSDown supports standard Kuaishou URLs (kuaishou.com/video/...) as well as short share links (v.kuaishou.com/...) and gifshow.com URLs generated by the Kuaishou app's share feature.",
            },
            {
              q: "Can I download private Kuaishou videos?",
              a: "No. SSDown can only download publicly accessible Kuaishou videos. Private or friend-only content cannot be fetched.",
            },
            {
              q: "Is downloading Kuaishou videos legal?",
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
          Understanding Kuaishou Video Downloads
        </h2>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>
            Kuaishou (快手) is China's second-largest short-form video platform with over
            700 million registered users. Founded in 2011, it predates Douyin (TikTok)
            and is known for its focus on authentic content from ordinary users rather
            than polished influencer productions.
          </p>
          <h3 className="text-xl font-semibold text-foreground">How Kuaishou Watermarks Work</h3>
          <p>
            Like other short-video platforms, Kuaishou adds a dynamic username watermark
            when you save videos through the official app. This overlay is applied
            client-side during export — the underlying video file stored on Kuaishou
            servers is watermark-free. SSDown accesses the original video stream directly,
            so you always get the clean version.
          </p>
          <h3 className="text-xl font-semibold text-foreground">Kuaishou vs Douyin</h3>
          <p>
            While Douyin (TikTok) is known for its algorithm-driven viral content,
            Kuaishou focuses on social connections and authentic everyday life content.
            Kuaishou has a stronger user base in China's lower-tier cities and rural areas,
            making it a unique window into Chinese culture beyond major metropolitan centers.
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
          Download Kuaishou (快手) videos without the platform watermark overlay.
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
      type="kuaishou"
      dict={dict}
      theme={theme}
      icon={KuaishouIcon}
      title="Kuaishou Saver (快手)"
      subtitle="Download Kuaishou videos without watermark. Save MP4 videos and MP3 audio instantly."
      placeholder="Paste Kuaishou link here... (e.g. https://www.kuaishou.com/video/...)"
      apiEndpoint="/api/kuaishou"
      downloadEndpoint="/api/kuaishou/download"
      noVideoError="No video found. Make sure the Kuaishou video is public."
      formatQuality={(bitrate) =>
        typeof bitrate === "string" ? bitrate : `${bitrate}p`
      }
      statsConfig={statsConfig}
      emptyState={emptyState}
      downloadFileName={(quality) => `kuaishou_video_${quality}.mp4`}
      faqSection={guideSection}
      slotId1="9629379592"
      slotId2="9629379592"
    />
  );
}
