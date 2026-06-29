"use client";

import {
  Eye,
  Play,
  Share2,
  BookOpen,
  Lightbulb,
  Info,
  CheckCircle2,
  Download,
} from "lucide-react";
import {
  VideoDownloaderClient,
  ThemeConfig,
  StatsConfig,
} from "./video-saver-client";
import { YouTubeIcon } from "@/components/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface YtdownClientProps {
  dict: any;
}

export function YtdownClient({ dict }: YtdownClientProps) {
  const theme: ThemeConfig = {
    bgFrom: "from-red-50",
    bgTo: "to-white dark:from-gray-900 dark:to-gray-950",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600",
    titleFrom: "from-red-500",
    titleTo: "to-red-700",
    cardBorder: "border-red-100 dark:border-red-900/50",
    topBarGradient: "bg-gradient-to-r from-red-500 to-red-700",
    buttonSolid: "bg-red-600 hover:bg-red-700",
    inputFocus: "focus:ring-red-500",
    downloadButtonHover: "hover:bg-red-50",
    downloadButtonText: "text-red-600 dark:text-red-400",
    indicatorColor: "bg-red-500",
  };

  const statsConfig: StatsConfig[] = [
    {
      icon: Eye,
      color: "text-muted-foreground",
      key: "viewCount",
    },
  ];

  const guideSection = (
    <div className="w-full max-w-6xl mx-auto mt-20 px-4 space-y-16">
      {/* Step-by-Step Guide */}
      <section>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <BookOpen className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.yt?.guide_title || "How to Download YouTube Videos"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {dict?.yt?.guide_desc ||
              "Save any YouTube video or Short as a universally compatible MP4 in three simple steps."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: dict?.yt?.step1_title || "Find the Video",
              desc:
                dict?.yt?.step1_desc ||
                "Open YouTube in your browser or the app and go to the video or Short you want to download.",
              icon: Play,
            },
            {
              step: 2,
              title: dict?.yt?.step2_title || "Copy the Link",
              desc:
                dict?.yt?.step2_desc ||
                "Tap 'Share' then 'Copy link', or copy the URL straight from your browser's address bar.",
              icon: Share2,
            },
            {
              step: 3,
              title: dict?.yt?.step3_title || "Paste & Download",
              desc:
                dict?.yt?.step3_desc ||
                "Paste the link into the box above, click Download, choose your quality, and save the MP4 to your device.",
              icon: Download,
            },
          ].map((step) => (
            <Card key={step.step} className="border-red-100 dark:border-red-900/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white font-bold">
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
            {dict?.yt?.tips_title || "YouTube Download Tips"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.yt?.tips_desc || "Get the best results when saving YouTube videos."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: dict?.yt?.tip1_title || "Universal MP4 Format",
              desc:
                dict?.yt?.tip1_desc ||
                "SSDown delivers H.264 + AAC MP4 files that play everywhere — QuickTime, Windows, iPhone, Android, and every video editor.",
              icon: CheckCircle2,
            },
            {
              title: dict?.yt?.tip2_title || "Shorts Supported",
              desc:
                dict?.yt?.tip2_desc ||
                "Paste a YouTube Shorts link just like a regular video — SSDown detects and downloads it automatically.",
              icon: CheckCircle2,
            },
            {
              title: dict?.yt?.tip3_title || "Quality Options",
              desc:
                dict?.yt?.tip3_desc ||
                "Download 720p when it is available, with 360p as a reliable fallback. Choose the size that fits your needs.",
              icon: CheckCircle2,
            },
            {
              title: dict?.yt?.tip4_title || "Respect Copyright",
              desc:
                dict?.yt?.tip4_desc ||
                "Only download videos you have the right to use, and keep downloads for personal, non-commercial purposes.",
              icon: CheckCircle2,
            },
          ].map((tip, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
            >
              <div className="flex-shrink-0">
                <tip.icon className="w-6 h-6 text-red-600" />
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
            {dict?.yt?.features_title || "What You Can Download from YouTube"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.yt?.features_desc ||
              "SSDown focuses on clean, compatible, single-file video downloads."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: dict?.yt?.feature1_title || "Regular Videos",
              desc:
                dict?.yt?.feature1_desc ||
                "Download standard YouTube videos as MP4 with both video and audio combined in one file.",
            },
            {
              title: dict?.yt?.feature2_title || "YouTube Shorts",
              desc:
                dict?.yt?.feature2_desc ||
                "Save vertical Shorts to your device for offline viewing anywhere.",
            },
            {
              title: dict?.yt?.feature3_title || "H.264 + AAC",
              desc:
                dict?.yt?.feature3_desc ||
                "Every download uses widely supported H.264 video and AAC audio for maximum compatibility.",
            },
            {
              title: dict?.yt?.feature4_title || "No Signup Needed",
              desc:
                dict?.yt?.feature4_desc ||
                "No account, no app install, and no watermarks — just paste a link and download.",
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

      {/* FAQ Section */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.qna_yt?.title || "YouTube Downloader FAQ"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.qna_yt?.desc ||
              "Common questions about downloading YouTube videos and Shorts."}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {[1, 2, 3, 4, 5].map((i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">
                {dict?.qna_yt?.[`faq_${i}_q`] || "Question"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.qna_yt?.[`faq_${i}_a`] || "Answer"}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Related Tools (internal linking / topic cluster) */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.yt?.related_title || "Related YouTube & Video Tools"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {dict?.yt?.related_desc ||
              "Explore more free tools for working with YouTube and video content on SSDown."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              href: "/utility/youtube-thumbnail",
              title: "YouTube Thumbnail Downloader",
              desc: "Grab the full-resolution thumbnail image from any YouTube video.",
            },
            {
              href: "/utility/youtube-preview",
              title: "YouTube Preview Maker",
              desc: "Preview how your title and thumbnail look in YouTube search and feeds.",
            },
            {
              href: "/video-audio/video-to-mp3",
              title: "Convert Video to MP3",
              desc: "Extract audio from a downloaded video and save it as an MP3 file.",
            },
            {
              href: "/tiktok",
              title: "TikTok Video Downloader",
              desc: "Download TikTok videos without a watermark in MP4 format.",
            },
            {
              href: "/x",
              title: "X (Twitter) Video Downloader",
              desc: "Save videos and GIFs from X (Twitter) as MP4 files.",
            },
            {
              href: "/instagram",
              title: "Instagram Video Downloader",
              desc: "Download Instagram Reels, videos, and photos to your device.",
            },
          ].map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              className="block p-5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-red-300 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold mb-1 text-red-600 dark:text-red-400">
                {tool.title}
              </h3>
              <p className="text-sm text-muted-foreground">{tool.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );

  const emptyState = (
    <div className="grid gap-6 sm:grid-cols-3 w-full pt-12 text-left">
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.common?.copy_link || "Copy Link"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.yt?.desc_copy ||
            "Open the YouTube video or Short you want and copy its link."}
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">Paste URL</p>
        <p className="text-muted-foreground text-sm">
          {dict?.yt?.desc_paste ||
            "Paste the link into the box above and hit Download."}
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.common?.save_video || "Save Video"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.yt?.desc_save ||
            "Pick your preferred quality and save the MP4 to your device."}
        </p>
      </div>
    </div>
  );

  return (
    <VideoDownloaderClient
      type="yt"
      dict={dict}
      theme={theme}
      icon={YouTubeIcon}
      title={dict?.yt?.title || "YouTube Downloader"}
      subtitle={
        dict?.yt?.subtitle ||
        "Download YouTube videos and Shorts as MP4 (H.264 + AAC). Free, fast, and compatible with every device and player."
      }
      placeholder={
        dict?.yt?.placeholder ||
        "Paste a YouTube link here... (e.g. https://www.youtube.com/watch?v=...)"
      }
      apiEndpoint="/api/yt"
      downloadEndpoint="/api/yt/download"
      noVideoError="No downloadable video found for this YouTube link. The video may be private, age-restricted, region-locked, or temporarily blocked."
      statsConfig={statsConfig}
      thumbnailAspect="aspect-video"
      thumbnailHeight="h-64"
      emptyState={emptyState}
      downloadFileName={(quality) => `ssdown-youtube-${quality}.mp4`}
      faqSection={guideSection}
      slotId1="3265765425"
      slotId2="3265765425"
    />
  );
}
