"use client";

import {
  Camera,
  Heart,
  MessageCircle,
  Layers,
  BookOpen,
  Lightbulb,
  Info,
  CheckCircle2,
  Download,
  Image,
} from "lucide-react";
import { InstagramTechInsights } from "./instagram-tech-insights";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const guideSection = (
    <div className="w-full max-w-6xl mx-auto mt-20 px-4 space-y-16">
      {/* Step-by-Step Guide */}
      <section>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
            <BookOpen className="w-8 h-8 text-purple-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.instagram?.guide_title ||
              "How to Download Instagram Reels, Stories & Photos"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {dict?.instagram?.guide_desc ||
              "Download Instagram content in high quality with just a few clicks."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: dict?.instagram?.step1_title || "Find Instagram Content",
              desc:
                dict?.instagram?.step1_desc ||
                "Open Instagram and navigate to the Reel, Story, or post you want to download. Tap the three dots (...) or share icon.",
              icon: Camera,
            },
            {
              step: 2,
              title: dict?.instagram?.step2_title || "Copy Link",
              desc:
                dict?.instagram?.step2_desc ||
                "Select 'Copy link' from the menu. For Stories, you may need to use a browser extension or third-party tool to get the direct link.",
              icon: Layers,
            },
            {
              step: 3,
              title: dict?.instagram?.step3_title || "Download Content",
              desc:
                dict?.instagram?.step3_desc ||
                "Paste the Instagram URL into SSDown and click 'Download'. Choose your preferred quality and save Reels, videos, or photos to your device.",
              icon: Download,
            },
          ].map((step) => (
            <Card
              key={step.step}
              className="border-purple-100 dark:border-purple-900/50"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 text-white font-bold">
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
            {dict?.instagram?.tips_title || "Instagram Download Tips"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.instagram?.tips_desc ||
              "Make the most of Instagram downloads with these helpful tips."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: dict?.instagram?.tip1_title || "Public Accounts Only",
              desc:
                dict?.instagram?.tip1_desc ||
                "SSDown can only download content from public Instagram accounts. Private account content requires the account owner's permission.",
              icon: CheckCircle2,
            },
            {
              title: dict?.instagram?.tip2_title || "High Quality Reels",
              desc:
                dict?.instagram?.tip2_desc ||
                "Download Instagram Reels in their original quality, up to 1080p HD resolution with full audio support.",
              icon: Camera,
            },
            {
              title: dict?.instagram?.tip3_title || "Stories Download",
              desc:
                dict?.instagram?.tip3_desc ||
                "Download Instagram Stories before they expire (24 hours). Make sure to get the link while the Story is still active.",
              icon: Image,
            },
            {
              title: dict?.instagram?.tip4_title || "Respect Privacy",
              desc:
                dict?.instagram?.tip4_desc ||
                "Always respect creators' privacy and copyright. Only download content for personal use and give proper credit when sharing.",
              icon: Heart,
            },
          ].map((tip, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
            >
              <div className="flex-shrink-0">
                <tip.icon className="w-6 h-6 text-purple-500" />
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
            {dict?.instagram?.features_title || "Instagram Download Features"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.instagram?.features_desc ||
              "Everything you can download from Instagram."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: dict?.instagram?.feature1_title || "Reels & Videos",
              desc:
                dict?.instagram?.feature1_desc ||
                "Download Instagram Reels and regular videos in HD quality with full audio support.",
            },
            {
              title: dict?.instagram?.feature2_title || "Photos & Carousels",
              desc:
                dict?.instagram?.feature2_desc ||
                "Save single photos or download all images from Instagram carousel posts.",
            },
            {
              title: dict?.instagram?.feature3_title || "Stories",
              desc:
                dict?.instagram?.feature3_desc ||
                "Download Instagram Stories (photos and videos) from public accounts before they expire.",
            },
            {
              title: dict?.instagram?.feature4_title || "IGTV Videos",
              desc:
                dict?.instagram?.feature4_desc ||
                "Download longer-form IGTV content in high quality for offline viewing.",
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

      <InstagramTechInsights />

      {/* FAQ Section */}
      <section>
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
      </section>
    </div>
  );

  const faqSection = guideSection;

  const emptyState = (
    <div className="grid gap-6 sm:grid-cols-2 w-full pt-12 text-left">
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.instagram?.feature_1_title || "Reels & Videos"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.instagram?.feature_1_desc ||
            "Download Instagram Reels and videos in high definition with sound."}
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.instagram?.feature_2_title || "Photos & Stories"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.instagram?.feature_2_desc ||
            "Save photos and stories from any public Instagram account easily."}
        </p>
      </div>
    </div>
  );

  return (
    <VideoDownloaderClient
      type="instagram"
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
      slotId1="3689271403"
    />
  );
}
