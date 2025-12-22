"use client";

import {
  Play,
  Heart,
  MessageCircle,
  Share2,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BilibiliIcon } from "@/components/ui/icons";

interface BilibiliClientProps {
  dict: any;
}

export function BilibiliClient({ dict }: BilibiliClientProps) {
  const theme: ThemeConfig = {
    bgFrom: "from-pink-50",
    bgTo: "to-white dark:from-gray-900 dark:to-gray-950",
    iconBg: "bg-pink-500",
    iconColor: "text-white",
    titleFrom: "from-pink-500",
    titleTo: "to-pink-600",
    cardBorder: "border-pink-100 dark:border-pink-900/50",
    topBarGradient: "bg-gradient-to-r from-pink-400 to-pink-600",
    buttonSolid: "bg-pink-500 hover:bg-pink-600",
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
            {dict?.bilibili?.guide_title || "How to Download Bilibili Videos"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {dict?.bilibili?.guide_desc ||
              "Download Bilibili videos in high quality with just a few clicks."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: dict?.bilibili?.step1_title || "Find Bilibili Video",
              desc:
                dict?.bilibili?.step1_desc ||
                "Open Bilibili app or website and navigate to the video you want to download.",
              icon: Play,
            },
            {
              step: 2,
              title: dict?.bilibili?.step2_title || "Copy Link",
              desc:
                dict?.bilibili?.step2_desc ||
                "Copy the Bilibili video URL. It usually looks like 'bilibili.com/video/BV...' or uses a short link.",
              icon: Share2,
            },
            {
              step: 3,
              title: dict?.bilibili?.step3_title || "Download Video",
              desc:
                dict?.bilibili?.step3_desc ||
                "Paste the Bilibili URL into SSDown and click 'Download'. Choose your preferred resolution.",
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
            {dict?.bilibili?.tips_title || "Bilibili Download Tips"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.bilibili?.tips_desc ||
              "Get the best experience when downloading from Bilibili."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: dict?.bilibili?.tip1_title || "Supports 'BV' IDs",
              desc:
                dict?.bilibili?.tip1_desc ||
                "SSDown supports the modern Bilibili 'BV' video IDs as well as older 'av' IDs.",
              icon: CheckCircle2,
            },
            {
              title: dict?.bilibili?.tip2_title || "Normal & High Quality",
              desc:
                dict?.bilibili?.tip2_desc ||
                "We try to provide the highest quality available for generic users.",
              icon: Play,
            },
            {
              title: dict?.bilibili?.tip3_title || "Batch Downloads",
              desc:
                dict?.bilibili?.tip3_desc ||
                "Currently, we support single video downloads. Batch support is coming soon.",
              icon: Share2,
            },
            {
              title: dict?.bilibili?.tip4_title || "Respect Copyright",
              desc:
                dict?.bilibili?.tip4_desc ||
                "Please respect the intellectual property rights of content creators on Bilibili.",
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
            {dict?.bilibili?.features_title || "Bilibili Download Features"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.bilibili?.features_desc ||
              "Key features of our Bilibili video downloader."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: dict?.bilibili?.feature1_title || "HD Videos",
              desc:
                dict?.bilibili?.feature1_desc ||
                "Support for HD video downloads from Bilibili.",
            },
            {
              title: dict?.bilibili?.feature2_title || "Audio Support",
              desc:
                dict?.bilibili?.feature2_desc ||
                "Video downloads include audio tracks automatically merged.",
            },
            {
              title: dict?.bilibili?.feature3_title || "Fast Speed",
              desc:
                dict?.bilibili?.feature3_desc ||
                "Optimized for fast downloading from Bilibili servers.",
            },
            {
              title: dict?.bilibili?.feature4_title || "Free Forever",
              desc:
                dict?.bilibili?.feature4_desc ||
                "No hidden costs or premium subscriptions required.",
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
            {dict?.qna_bilibili?.title || "Bilibili FAQ"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.qna_bilibili?.desc ||
              "Common questions about downloading Bilibili videos."}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {[1, 2, 3, 4, 5].map((i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">
                {dict?.qna_bilibili?.[`faq_${i}_q`] || "Question"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.qna_bilibili?.[`faq_${i}_a`] || "Answer"}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );

  const faqSection = guideSection;

  const emptyState = (
    <>
      <div className="grid gap-6 sm:grid-cols-2 w-full pt-12 text-left">
        <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="font-semibold text-lg mb-2">
            {dict?.bilibili?.feature_1_title || "Full HD Support"}
          </p>
          <p className="text-muted-foreground text-sm">
            {dict?.bilibili?.feature_1_desc ||
              "Download Bilibili videos in the best available quality."}
          </p>
        </div>
        <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="font-semibold text-lg mb-2">
            {dict?.bilibili?.feature_2_title || "Fast & Free"}
          </p>
          <p className="text-muted-foreground text-sm">
            {dict?.bilibili?.feature_2_desc ||
              "No registration required. Unlimited downloads."}
          </p>
        </div>
      </div>
    </>
  );

  return (
    <VideoDownloaderClient
      type="bilibili"
      dict={dict}
      theme={theme}
      icon={BilibiliIcon}
      title={dict?.bilibili?.title || "Bilibili Video Downloader"}
      subtitle={
        dict?.bilibili?.subtitle ||
        "Download Bilibili videos instantly. No watermark, high quality."
      }
      placeholder={dict?.bilibili?.placeholder || "Paste Bilibili URL here..."}
      apiEndpoint="/api/bilibili"
      downloadEndpoint="/api/bilibili/download"
      noVideoError="No video found. Make sure the URL is valid."
      statsConfig={statsConfig}
      thumbnailAspect="aspect-video"
      thumbnailHeight="h-64"
      thumbnailImageProxy={(url) =>
        `/api/bilibili/image?url=${encodeURIComponent(url)}`
      }
      avatarImageProxy={(url) =>
        `/api/bilibili/image?url=${encodeURIComponent(url)}`
      }
      emptyState={emptyState}
      downloadFileName={(quality) => `bilibili_video_${quality}.mp4`}
      faqSection={faqSection}
      slotId1="2395730401"
    />
  );
}
