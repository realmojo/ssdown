"use client";

import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Video,
  BookOpen,
  Lightbulb,
  Info,
  CheckCircle2,
  Download,
  VideoIcon,
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const guideSection = (
    <div className="w-full max-w-6xl mx-auto mt-20 px-4 space-y-16">
      {/* Step-by-Step Guide */}
      <section>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.facebook?.guide_title || "How to Download Facebook Videos"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {dict?.facebook?.guide_desc ||
              "Download Facebook videos in HD and 4K quality for offline viewing."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: dict?.facebook?.step1_title || "Find the Video",
              desc:
                dict?.facebook?.step1_desc ||
                "Navigate to Facebook and find the video you want to download. Make sure the video is set to public visibility.",
              icon: Video,
            },
            {
              step: 2,
              title: dict?.facebook?.step2_title || "Get the Link",
              desc:
                dict?.facebook?.step2_desc ||
                "Click on the video to open it, then click the 'Share' button and select 'Copy link' to get the video URL.",
              icon: Share2,
            },
            {
              step: 3,
              title: dict?.facebook?.step3_title || "Download HD Video",
              desc:
                dict?.facebook?.step3_desc ||
                "Paste the Facebook video link into SSDown, choose your preferred quality (HD, 2K, or 4K), and download instantly.",
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
            {dict?.facebook?.tips_title || "Facebook Download Tips"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.facebook?.tips_desc ||
              "Get the best results when downloading Facebook videos."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: dict?.facebook?.tip1_title || "Public Videos Only",
              desc:
                dict?.facebook?.tip1_desc ||
                "SSDown can only download videos from public Facebook posts. Private or friends-only videos cannot be downloaded.",
              icon: CheckCircle2,
            },
            {
              title: dict?.facebook?.tip2_title || "Choose Quality Wisely",
              desc:
                dict?.facebook?.tip2_desc ||
                "Select the highest available quality for the best viewing experience. 4K videos are larger but offer superior clarity.",
              icon: VideoIcon,
            },
            {
              title: dict?.facebook?.tip3_title || "Live Videos",
              desc:
                dict?.facebook?.tip3_desc ||
                "Live videos can be downloaded after the broadcast ends and is saved as a regular video post on Facebook.",
              icon: Video,
            },
            {
              title: dict?.facebook?.tip4_title || "Respect Copyright",
              desc:
                dict?.facebook?.tip4_desc ||
                "Only download videos for personal use. Do not redistribute or use downloaded content commercially without permission.",
              icon: ThumbsUp,
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
            {dict?.facebook?.features_title || "Facebook Video Features"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.facebook?.features_desc ||
              "What you can download from Facebook."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: dict?.facebook?.feature1_title || "HD & 4K Quality",
              desc:
                dict?.facebook?.feature1_desc ||
                "Download Facebook videos in multiple quality options including 1080p HD, 2K, and 4K when available.",
            },
            {
              title: dict?.facebook?.feature2_title || "Regular Videos",
              desc:
                dict?.facebook?.feature2_desc ||
                "Download standard Facebook videos from posts, pages, and groups in MP4 format.",
            },
            {
              title: dict?.facebook?.feature3_title || "Live Recordings",
              desc:
                dict?.facebook?.feature3_desc ||
                "Download Facebook Live videos after the broadcast ends and is saved as a regular video.",
            },
            {
              title: dict?.facebook?.feature4_title || "Offline Viewing",
              desc:
                dict?.facebook?.feature4_desc ||
                "Save videos to your device for offline viewing anytime, anywhere without internet connection.",
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
      </section>
    </div>
  );

  const faqSection = guideSection;

  const emptyState = (
    <div className="grid gap-6 sm:grid-cols-2 w-full pt-12 text-left">
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.facebook?.feature_1_title || "HD Videos"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.facebook?.feature_1_desc ||
            "Download public Facebook videos in 1080p, 2K, and 4K quality."}
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.facebook?.feature_2_title || "Watch Offline"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.facebook?.feature_2_desc ||
            "Save videos to your device to watch them anytime, anywhere without internet."}
        </p>
      </div>
    </div>
  );

  return (
    <VideoDownloaderClient
      type="facebook"
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
      slotId1="3584688990"
    />
  );
}
