"use client";

import {
  CheckCircle2,
  Info, // Added Icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  XIcon,
  TikTokIcon,
  InstagramIcon,
  FacebookIcon,
  DailymotionIcon,
  NineGagIcon,
} from "@/components/ui/icons";

interface HomeClientProps {
  dict: any;
  lang: string;
}

export function HomeClient({ dict, lang }: HomeClientProps) {
  const getPath = (path: string) => {
    return `/${lang}${path === "/" ? "" : path}`;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* 1. H1 Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-50/30 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 -z-10" />
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white pb-2 leading-tight">
            {dict.home?.h1_title || "How to Safely Use Online Video Content"}
          </h1>

          {/* 2. Main Introduction Paragraph */}
          <div className="max-w-3xl mx-auto space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            <p className="font-medium">
              {dict.home?.intro_p1 ||
                "SSDown is an informational guide dedicated to helping users manage and utilize online video content efficiently within the boundaries of personal use and legal compliance."}
            </p>
            <p>
              {dict.home?.intro_p2 ||
                "Online video content can be a valuable resource for learning, archiving, and offline reference in various situations. Our goal is to assist users in understanding content policies and copyright regulations, ensuring a safe and responsible digital experience."}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Topics Covered (H2) */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight mb-8 text-center sm:text-left">
            {dict.home?.topics_title || "What We Cover at SSDown"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {dict.home?.topics_desc ||
                  "We provide comprehensive information on the following topics related to video content utilization:"}
              </p>
              <ul className="space-y-3">
                {[
                  dict.home?.topic_1 ||
                    "Summary of content usage policies by platform",
                  dict.home?.topic_2 ||
                    "Guidelines for personal archiving & offline viewing",
                  dict.home?.topic_3 ||
                    "Methods for organizing and managing video files",
                  dict.home?.topic_4 ||
                    "Guides on privacy protection and security",
                  dict.home?.topic_5 ||
                    "Troubleshooting common video playback issues",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                  >
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 flex items-center justify-center">
              <Info className="w-24 h-24 text-indigo-200 dark:text-indigo-900" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Who is this for? (H2) */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/20 border-y">
        <div className="container px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">
            {dict.home?.target_title || "Who Is This Helpful For?"}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              dict.home?.target_1 || "Users managing personal video archives",
              dict.home?.target_2 || "Those curious about platform policies",
              dict.home?.target_3 ||
                "People needing offline educational content",
              dict.home?.target_4 ||
                "Anyone organizing digital files systematically",
              dict.home?.target_5 ||
                "Users seeking safe content consumption methods",
            ].map((text, i) => (
              <Card
                key={i}
                className="border-0 shadow-sm bg-white dark:bg-gray-900"
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-4 h-full justify-center">
                  <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Tool Introduction (The ONLY place for downloaders) (H2) */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              {dict.home?.tools_title || "Video Content Management Tools"}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {dict.home?.tools_desc ||
                "SSDown operates primarily as an information resource. We also provide auxiliary tools designed strictly for personal content management purposes."}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200 max-w-2xl mx-auto">
              <strong>{dict.home?.notice_label || "Notice:"}</strong>{" "}
              {dict.home?.tools_notice ||
                "These tools are for convenience only. All copyrights belong to the original creators and platforms. Users must strictly adhere to the terms of service of each platform."}
            </div>
          </div>

          {/* Renamed & Refined Tool Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <Link href={getPath("/x")} className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
              >
                <XIcon className="h-6 w-6" />
                <span className="font-semibold">X (Twitter) Tool</span>
              </Button>
            </Link>
            <Link href={getPath("/tiktok")} className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950 transition-all"
              >
                <TikTokIcon className="h-6 w-6" />
                <span className="font-semibold">TikTok Tool</span>
              </Button>
            </Link>
            <Link href={getPath("/instagram")} className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all"
              >
                <InstagramIcon className="h-6 w-6" />
                <span className="font-semibold">Instagram Tool</span>
              </Button>
            </Link>
            <Link href={getPath("/facebook")} className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
              >
                <FacebookIcon className="h-6 w-6" />
                <span className="font-semibold">Facebook Tool</span>
              </Button>
            </Link>
            <Link href={getPath("/dailymotion")} className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
              >
                <DailymotionIcon className="h-6 w-6" />
                <span className="font-semibold">Dailymotion Tool</span>
              </Button>
            </Link>
            <Link href={getPath("/9gag")} className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <NineGagIcon className="h-6 w-6" />
                <span className="font-semibold">9GAG Tool</span>
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              👉 {dict.home?.personal_use_only || "(Personal Use Only)"}
            </p>
          </div>
        </div>
      </section>

      {/* 6. Copyright & Legal Notice (H2 - Essential) */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/20 border-t">
        <div className="container px-4 md:px-6 max-w-4xl space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            {dict.home?.legal_title || "Important Legal & Copyright Notice"}
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
            <p>
              {dict.home?.legal_p1 ||
                "SSDown does not host, store, or archive any media files on its servers. We act solely as a conduit for information and management tools, based on publicly available URLs provided by users."}
            </p>
            <p>
              {dict.home?.legal_p2 ||
                "We do not encourage or endorse any illegal use of content. All users are responsible for complying with the copyright laws of their respective countries and the Terms of Service of the platforms they use."}
            </p>
          </div>
        </div>
      </section>

      {/* 7. Operation Policy (H2 - Transparency) */}
      <section className="py-16 bg-white dark:bg-gray-950 border-t">
        <div className="container px-4 md:px-6 max-w-4xl space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            {dict.home?.transparency_title || "Operational Transparency"}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {dict.home?.transparency_desc ||
              "SSDown prioritizes user experience above all else. We strive to avoid excessively intrusive advertising. While some advertisements may be displayed to support the maintenance and improvement of our service, we are committed to keeping them relevant."}
          </p>
        </div>
      </section>
    </div>
  );
}
