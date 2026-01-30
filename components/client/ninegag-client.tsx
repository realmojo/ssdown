"use client";

import {
  MessageCircle,
  Eye,
  BookOpen,
  Lightbulb,
  Info,
  CheckCircle2,
  Download,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import {
  VideoDownloaderClient,
  ThemeConfig,
  StatsConfig,
} from "./video-saver-client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NineGagClientProps {
  dict: any;
}

export function NineGagClient({ dict }: NineGagClientProps) {
  const theme: ThemeConfig = {
    bgFrom: "from-orange-50",
    bgTo: "to-white dark:from-gray-900 dark:to-gray-950",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-500",
    titleFrom: "from-orange-500",
    titleTo: "to-orange-700",
    cardBorder: "border-orange-100 dark:border-orange-900/50",
    topBarGradient: "bg-gradient-to-r from-orange-400 to-orange-600",
    buttonSolid: "bg-orange-500 hover:bg-orange-600",
    inputFocus: "focus:ring-orange-500",
    downloadButtonHover: "hover:bg-orange-50",
    downloadButtonText: "text-orange-600 dark:text-orange-400",
    indicatorColor: "bg-green-500",
  };

  const statsConfig: StatsConfig[] = [
    {
      icon: Eye,
      color: "text-muted-foreground",
      key: "viewCount",
    },
    {
      icon: ThumbsUp,
      color: "text-pink-500",
      key: "favoriteCount",
    },
    {
      icon: MessageCircle,
      color: "text-orange-500",
      key: "replyCount",
    },
    {
      icon: ThumbsDown,
      color: "text-orange-500",
      key: "shareCount",
    },
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
            {dict?.["9gag"]?.guide_title || "How to Download 9GAG Videos"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {dict?.["9gag"]?.guide_desc ||
              "Follow these simple steps to download any video from 9GAG in high quality."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: dict?.["9gag"]?.step1_title || "Find the Video",
              desc:
                dict?.["9gag"]?.step1_desc ||
                "Navigate to 9GAG and find the video post you want to download. You can browse trending posts, search for specific content, or explore different categories.",
              icon: Eye,
            },
            {
              step: 2,
              title: dict?.["9gag"]?.step2_title || "Copy the Link",
              desc:
                dict?.["9gag"]?.step2_desc ||
                "Click on the 'Share' button or copy the URL from your browser's address bar. The link will be copied to your clipboard automatically.",
              icon: MessageCircle,
            },
            {
              step: 3,
              title: dict?.["9gag"]?.step3_title || "Paste & Download",
              desc:
                dict?.["9gag"]?.step3_desc ||
                "Paste the copied link into the input box above, click 'Download', and choose your preferred video quality. The video will be saved to your device instantly.",
              icon: Download,
            },
          ].map((step) => (
            <Card
              key={step.step}
              className="border-orange-100 dark:border-orange-900/50"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white font-bold">
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
            {dict?.["9gag"]?.tips_title || "Tips & Best Practices"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.["9gag"]?.tips_desc ||
              "Get the most out of 9GAG video downloads with these helpful tips."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: dict?.["9gag"]?.tip1_title || "Choose the Right Quality",
              desc:
                dict?.["9gag"]?.tip1_desc ||
                "Select the highest available quality for the best viewing experience. Higher quality videos take longer to download but offer superior visual clarity.",
              icon: CheckCircle2,
            },
            {
              title: dict?.["9gag"]?.tip2_title || "Download Memes & GIFs",
              desc:
                dict?.["9gag"]?.tip2_desc ||
                "SSDown supports downloading not just videos but also animated GIFs and memes from 9GAG. Save your favorite content for offline viewing.",
              icon: CheckCircle2,
            },
            {
              title: dict?.["9gag"]?.tip3_title || "Check Video Availability",
              desc:
                dict?.["9gag"]?.tip3_desc ||
                "Make sure the post actually contains a video. Some posts may only have images or text, which cannot be downloaded as video files.",
              icon: CheckCircle2,
            },
            {
              title: dict?.["9gag"]?.tip4_title || "Respect Copyright",
              desc:
                dict?.["9gag"]?.tip4_desc ||
                "Only download videos for personal use. Do not redistribute or use downloaded content for commercial purposes without permission from the creator.",
              icon: CheckCircle2,
            },
          ].map((tip, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
            >
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

      {/* Features & Capabilities */}
      <section>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <Info className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.["9gag"]?.features_title ||
              "What You Can Download from 9GAG"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.["9gag"]?.features_desc ||
              "SSDown supports various types of media from 9GAG."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: dict?.["9gag"]?.feature1_title || "Regular Videos",
              desc:
                dict?.["9gag"]?.feature1_desc ||
                "Download standard video posts in MP4 format with original quality preserved.",
            },
            {
              title: dict?.["9gag"]?.feature2_title || "Animated GIFs",
              desc:
                dict?.["9gag"]?.feature2_desc ||
                "Convert and download animated GIFs from 9GAG as MP4 video files.",
            },
            {
              title: dict?.["9gag"]?.feature3_title || "Multiple Qualities",
              desc:
                dict?.["9gag"]?.feature3_desc ||
                "Choose from available video qualities including HD and Full HD when available.",
            },
            {
              title: dict?.["9gag"]?.feature4_title || "Video Metadata",
              desc:
                dict?.["9gag"]?.feature4_desc ||
                "View video statistics including views, likes, and comments before downloading.",
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
              "Find answers to common questions about downloading videos from 9GAG."}
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
    </div>
  );

  const faqSection = guideSection;

  const emptyState = (
    <div className="grid gap-6 sm:grid-cols-3 w-full pt-12 text-left">
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.common?.copy_link || "Copy Link"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.["9gag"]?.desc_copy ||
            "Find the video post you want to download and copy its link."}
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">Paste URL</p>
        <p className="text-muted-foreground text-sm">
          {dict?.["9gag"]?.desc_paste ||
            "Paste the link into the input box above and hit download."}
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.common?.save_video || "Save Video"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.["9gag"]?.desc_save ||
            "Choose your preferred quality and save the video to your device."}
        </p>
      </div>
    </div>
  );

  // 9GAG logo SVG component
  const NineGagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm12.5 0a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
    </svg>
  );

  return (
    <VideoDownloaderClient
      type="9gag"
      dict={dict}
      theme={theme}
      icon={NineGagIcon}
      title={dict?.["9gag"]?.title || "9GAG Saver"}
      subtitle={
        dict?.["9gag"]?.subtitle ||
        "Save 9GAG videos and GIFs in MP4 format. High quality, free, and unlimited."
      }
      placeholder={dict?.["9gag"]?.placeholder || "Paste 9GAG link here..."}
      apiEndpoint="/api/9gag"
      downloadEndpoint="/api/9gag/download"
      noVideoError="No video found in this post. Make sure it contains a video."
      formatContent={(content) => content}
      statsConfig={statsConfig}
      emptyState={emptyState}
      downloadFileName={(quality) => `9gag_video_${quality}.mp4`}
      faqSection={faqSection}
      slotId1="4858242218"
    />
  );
}
