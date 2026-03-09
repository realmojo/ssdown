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
} from "./video-saver-client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DailymotionClientProps {
  dict: any;
}

export function DailymotionClient({ dict }: DailymotionClientProps) {
  const theme: ThemeConfig = {
    bgFrom: "from-blue-50",
    bgTo: "to-white dark:from-gray-900 dark:to-gray-950",
    iconBg: "bg-blue-500",
    iconColor: "text-white",
    titleFrom: "from-blue-600",
    titleTo: "to-blue-800",
    cardBorder: "border-blue-100 dark:border-blue-900/50",
    topBarGradient: "bg-gradient-to-r from-blue-500 to-blue-700",
    buttonSolid: "bg-blue-500 hover:bg-blue-600",
    inputFocus: "focus:ring-blue-500",
    downloadButtonHover: "hover:bg-blue-50",
    downloadButtonText: "text-blue-600 dark:text-blue-400",
    indicatorColor: "bg-blue-500",
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.dailymotion?.guide_title ||
              "How to Download Dailymotion Videos"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {dict?.dailymotion?.guide_desc ||
              "Download Dailymotion videos in high quality with just a few clicks."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: dict?.dailymotion?.step1_title || "Find Dailymotion Video",
              desc:
                dict?.dailymotion?.step1_desc ||
                "Open Dailymotion and navigate to the video you want to download. Copy the video URL from the address bar.",
              icon: Play,
            },
            {
              step: 2,
              title: dict?.dailymotion?.step2_title || "Copy Link",
              desc:
                dict?.dailymotion?.step2_desc ||
                "Copy the Dailymotion video URL. It should look like 'https://www.dailymotion.com/video/xxxxx' or 'https://dai.ly/xxxxx'.",
              icon: Share2,
            },
            {
              step: 3,
              title: dict?.dailymotion?.step3_title || "Download Video",
              desc:
                dict?.dailymotion?.step3_desc ||
                "Paste the Dailymotion URL into SSDown and click 'Download'. Choose your preferred quality and save the video to your device.",
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
            {dict?.dailymotion?.tips_title || "Dailymotion Download Tips"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.dailymotion?.tips_desc ||
              "Make the most of Dailymotion downloads with these helpful tips."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: dict?.dailymotion?.tip1_title || "Public Videos Only",
              desc:
                dict?.dailymotion?.tip1_desc ||
                "SSDown can only download public Dailymotion videos. Private or age-restricted content may not be accessible.",
              icon: CheckCircle2,
            },
            {
              title: dict?.dailymotion?.tip2_title || "High Quality Videos",
              desc:
                dict?.dailymotion?.tip2_desc ||
                "Download Dailymotion videos in their original quality, up to HD resolution with full audio support.",
              icon: Play,
            },
            {
              title: dict?.dailymotion?.tip3_title || "Direct Video URLs",
              desc:
                dict?.dailymotion?.tip3_desc ||
                "You can also paste direct video file URLs (dmcdn.net) to download videos directly.",
              icon: Share2,
            },
            {
              title: dict?.dailymotion?.tip4_title || "Respect Copyright",
              desc:
                dict?.dailymotion?.tip4_desc ||
                "Always respect creators' copyright. Only download content for personal use and give proper credit when sharing.",
              icon: Heart,
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
            {dict?.dailymotion?.features_title ||
              "Dailymotion Download Features"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.dailymotion?.features_desc ||
              "Everything you can download from Dailymotion."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: dict?.dailymotion?.feature1_title || "HD Videos",
              desc:
                dict?.dailymotion?.feature1_desc ||
                "Download Dailymotion videos in HD quality with full audio support.",
            },
            {
              title: dict?.dailymotion?.feature2_title || "Multiple Qualities",
              desc:
                dict?.dailymotion?.feature2_desc ||
                "Choose from multiple quality options available for each video.",
            },
            {
              title: dict?.dailymotion?.feature3_title || "Fast Downloads",
              desc:
                dict?.dailymotion?.feature3_desc ||
                "Download videos quickly with our optimized servers.",
            },
            {
              title: dict?.dailymotion?.feature4_title || "No Watermarks",
              desc:
                dict?.dailymotion?.feature4_desc ||
                "Download videos without any watermarks or branding.",
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
            {dict?.qna_dailymotion?.title || "Dailymotion FAQ"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.qna_dailymotion?.desc ||
              "Answers about downloading Dailymotion videos."}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {[1, 2, 3, 4, 5].map((i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">
                {dict?.qna_dailymotion?.[`faq_${i}_q`] || "Question"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.qna_dailymotion?.[`faq_${i}_a`] || "Answer"}
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
            {dict?.dailymotion?.feature_1_title || "HD Quality Videos"}
          </p>
          <p className="text-muted-foreground text-sm">
            {dict?.dailymotion?.feature_1_desc ||
              "Download Dailymotion videos in high definition with sound."}
          </p>
        </div>
        <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="font-semibold text-lg mb-2">
            {dict?.dailymotion?.feature_2_title || "Multiple Formats"}
          </p>
          <p className="text-muted-foreground text-sm">
            {dict?.dailymotion?.feature_2_desc ||
              "Download videos in various quality options from Dailymotion."}
          </p>
        </div>
      </div>
    </>
  );

  return (
    <VideoDownloaderClient
      type="dailymotion"
      dict={dict}
      theme={theme}
      icon={Play}
      title={dict?.dailymotion?.title || "Dailymotion Saver"}
      subtitle={
        dict?.dailymotion?.subtitle ||
        "Download Dailymotion videos instantly. High quality, no watermark."
      }
      placeholder={
        dict?.dailymotion?.placeholder || "Paste Dailymotion URL here..."
      }
      apiEndpoint="/api/dailymotion"
      downloadEndpoint="/api/dailymotion/download"
      noVideoError="No video found. Make sure the URL is valid."
      statsConfig={statsConfig}
      thumbnailAspect="aspect-video"
      thumbnailHeight="h-64"
      emptyState={emptyState}
      downloadFileName={(quality) => `dailymotion_video_${quality}.mp4`}
      faqSection={faqSection}
      slotId1="2395730401"
      slotId2="2395730401"
    />
  );
}
