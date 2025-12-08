"use client";

import {
  Heart,
  MessageCircle,
  Repeat,
  Eye,
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
} from "./video-downloader-client";
import { XIcon } from "@/components/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostSection } from "@/components/PostSection";

interface XClientProps {
  dict: any;
  lang: string;
  relatedPosts?: any[];
}

export function XClient({ dict, lang, relatedPosts = [] }: XClientProps) {
  const getPath = (path: string) => {
    if (lang === "en") return path;
    return `/${lang}${path === "/" ? "" : path}`;
  };
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

  const guideSection = (
    <div className="w-full max-w-6xl mx-auto mt-20 px-4 space-y-16">
      {/* Step-by-Step Guide */}
      <section>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.x?.guide_title || "How to Download X (Twitter) Videos"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {dict?.x?.guide_desc ||
              "Follow these simple steps to download any video from X (Twitter) in high quality."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: dict?.x?.step1_title || "Find the Video",
              desc:
                dict?.x?.step1_desc ||
                "Navigate to X (Twitter) and find the tweet containing the video you want to download. You can search for specific users, hashtags, or browse your timeline.",
              icon: Eye,
            },
            {
              step: 2,
              title: dict?.x?.step2_title || "Copy the Link",
              desc:
                dict?.x?.step2_desc ||
                "Click on the 'Share' button (or the three dots menu) on the tweet and select 'Copy link'. The URL will be copied to your clipboard automatically.",
              icon: MessageCircle,
            },
            {
              step: 3,
              title: dict?.x?.step3_title || "Paste & Download",
              desc:
                dict?.x?.step3_desc ||
                "Paste the copied link into the input box above, click 'Download', and choose your preferred video quality. The video will be saved to your device instantly.",
              icon: Download,
            },
          ].map((step) => (
            <Card
              key={step.step}
              className="border-blue-100 dark:border-blue-900/50"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold">
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
            {dict?.x?.tips_title || "Tips & Best Practices"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.x?.tips_desc ||
              "Get the most out of X video downloads with these helpful tips."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: dict?.x?.tip1_title || "Choose the Right Quality",
              desc:
                dict?.x?.tip1_desc ||
                "Select the highest available quality for the best viewing experience. Higher quality videos take longer to download but offer superior visual clarity.",
              icon: CheckCircle2,
            },
            {
              title: dict?.x?.tip2_title || "Download GIFs Too",
              desc:
                dict?.x?.tip2_desc ||
                "SSDown supports downloading animated GIFs from X. Just paste the tweet link containing a GIF and download it as an MP4 video file.",
              icon: CheckCircle2,
            },
            {
              title: dict?.x?.tip3_title || "Check Video Availability",
              desc:
                dict?.x?.tip3_desc ||
                "Make sure the tweet actually contains a video. Some tweets may only have images or text, which cannot be downloaded as video files.",
              icon: CheckCircle2,
            },
            {
              title: dict?.x?.tip4_title || "Respect Copyright",
              desc:
                dict?.x?.tip4_desc ||
                "Only download videos for personal use. Do not redistribute or use downloaded content for commercial purposes without permission from the creator.",
              icon: CheckCircle2,
            },
          ].map((tip, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
            >
              <div className="flex-shrink-0">
                <tip.icon className="w-6 h-6 text-blue-500" />
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
            {dict?.x?.features_title || "What You Can Download from X"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.x?.features_desc ||
              "SSDown supports various types of media from X (Twitter)."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: dict?.x?.feature1_title || "Regular Videos",
              desc:
                dict?.x?.feature1_desc ||
                "Download standard video tweets in MP4 format with original quality preserved.",
            },
            {
              title: dict?.x?.feature2_title || "Animated GIFs",
              desc:
                dict?.x?.feature2_desc ||
                "Convert and download animated GIFs from tweets as MP4 video files.",
            },
            {
              title: dict?.x?.feature3_title || "Multiple Qualities",
              desc:
                dict?.x?.feature3_desc ||
                "Choose from available video qualities including HD, Full HD, and 4K when available.",
            },
            {
              title: dict?.x?.feature4_title || "Video Metadata",
              desc:
                dict?.x?.feature4_desc ||
                "View video statistics including views, likes, retweets, and replies before downloading.",
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
      </section>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <PostSection
          posts={relatedPosts}
          lang={lang}
          category="x"
          getPath={getPath}
        />
      )}
    </div>
  );

  const faqSection = guideSection;

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
