"use client";

import {
  Download,
  Share2,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  XIcon,
  TikTokIcon,
  InstagramIcon,
  FacebookIcon,
} from "@/components/ui/icons";

interface HomeClientProps {
  dict: any;
  lang: string;
}

export function HomeClient({ dict, lang }: HomeClientProps) {
  const getPath = (path: string) => {
    if (lang === "en") return path;
    return `/${lang}${path === "/" ? "" : path}`;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 -z-10" />
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-10">
          <div className="space-y-6 max-w-4xl">
            <div className="inline-block rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-4 py-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-4 animate-fade-in-up">
              {dict?.home?.hero_badge || "🚀 The #1 Social Media Downloader"}
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white pb-2 leading-tight">
              {dict?.home?.title || "Download Videos Instantly & Freely"}
            </h1>
            <p className="mx-auto max-w-[800px] text-gray-600 md:text-xl dark:text-gray-300 leading-relaxed">
              {dict?.home?.subtitle ||
                "Save high-quality videos from X, TikTok, and Instagram without watermarks. The fastest and most secure way to keep your favorite content."}
            </p>
          </div>

          {/* Platform Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-12">
            {/* X (Twitter) Card */}
            <Link href={getPath("/x")} className="group">
              <Card className="h-full border-2 border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-8 flex flex-col items-center gap-4 relative z-10">
                  <div className="p-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <XIcon className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">X (Twitter)</h3>
                    <p className="text-sm text-muted-foreground">
                      {dict?.home?.card_x_desc || "Download videos & GIFs"}
                    </p>
                  </div>
                  <div className="mt-auto pt-4 text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    {dict?.home?.get_started || "Get Started"}{" "}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* TikTok Card */}
            <Link href={getPath("/tiktok")} className="group">
              <Card className="h-full border-2 border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent dark:from-pink-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-8 flex flex-col items-center gap-4 relative z-10">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500 to-cyan-500 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <TikTokIcon className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">TikTok</h3>
                    <p className="text-sm text-muted-foreground">
                      {dict?.home?.card_tiktok_desc || "No watermark videos"}
                    </p>
                  </div>
                  <div className="mt-auto pt-4 text-pink-600 dark:text-pink-400 font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    {dict?.home?.get_started || "Get Started"}{" "}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Instagram Card */}
            <Link href={getPath("/instagram")} className="group">
              <Card className="h-full border-2 border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-8 flex flex-col items-center gap-4 relative z-10">
                  <div className="p-4 rounded-2xl bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-600 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <InstagramIcon className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Instagram</h3>
                    <p className="text-sm text-muted-foreground">
                      {dict?.home?.card_insta_desc || "Reels, Stories & Photos"}
                    </p>
                  </div>
                  <div className="mt-auto pt-4 text-purple-600 dark:text-purple-400 font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    {dict?.home?.get_started || "Get Started"}{" "}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Facebook Card */}
            <Link href={getPath("/facebook")} className="group">
              <Card className="h-full border-2 border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-8 flex flex-col items-center gap-4 relative z-10">
                  <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FacebookIcon className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Facebook</h3>
                    <p className="text-sm text-muted-foreground">
                      {dict?.home?.card_facebook_desc || "HD & 4K Videos"}
                    </p>
                  </div>
                  <div className="mt-auto pt-4 text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    {dict?.home?.get_started || "Get Started"}{" "}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats Section */}
      <section className="py-12 border-y bg-gray-50/50 dark:bg-gray-900/20">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h4 className="text-4xl font-bold text-gray-900 dark:text-white">
                100%
              </h4>
              <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                {dict?.home?.stat_free || "Free to Use"}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-4xl font-bold text-gray-900 dark:text-white">
                1M+
              </h4>
              <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                {dict?.home?.stat_downloads || "Downloads"}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-4xl font-bold text-gray-900 dark:text-white">
                0s
              </h4>
              <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                {dict?.home?.stat_wait || "Wait Time"}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-4xl font-bold text-gray-900 dark:text-white">
                4K
              </h4>
              <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                {dict?.home?.stat_quality || "Supported Quality"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              {dict?.home?.why_title || "Why Choose SSDown?"}
            </h2>
            <p className="text-muted-foreground max-w-[600px] mx-auto text-lg">
              {dict?.home?.why_desc ||
                "We provide the best tools to help you save and enjoy content offline."}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-start space-y-4 p-8 rounded-3xl bg-gray-50 dark:bg-gray-900/50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
              <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">
                {dict?.common?.fast_downloads || "Lightning Fast"}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {dict?.home?.feature_fast_desc ||
                  "Our optimized servers ensure you get your videos in seconds, not minutes. No queues, no waiting."}
              </p>
            </div>
            <div className="flex flex-col items-start space-y-4 p-8 rounded-3xl bg-gray-50 dark:bg-gray-900/50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
              <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">
                {dict?.common?.high_quality || "Original Quality"}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {dict?.home?.feature_quality_desc ||
                  "We don't compress your videos. Get the exact same quality as the source, up to 4K resolution."}
              </p>
            </div>
            <div className="flex flex-col items-start space-y-4 p-8 rounded-3xl bg-gray-50 dark:bg-gray-900/50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
              <div className="p-3 rounded-2xl bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">
                {dict?.common?.secure_private || "Secure & Private"}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {dict?.home?.feature_secure_desc ||
                  "We respect your privacy. No logs are kept, and no personal information is required to use our service."}
              </p>
            </div>
            <div className="flex flex-col items-start space-y-4 p-8 rounded-3xl bg-gray-50 dark:bg-gray-900/50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
              <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">
                {dict?.common?.mobile_friendly || "Mobile Friendly"}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {dict?.home?.feature_mobile_desc ||
                  "Works perfectly on iPhone, Android, tablets, and desktop. No app installation needed."}
              </p>
            </div>
            <div className="flex flex-col items-start space-y-4 p-8 rounded-3xl bg-gray-50 dark:bg-gray-900/50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
              <div className="p-3 rounded-2xl bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                <Download className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">
                {dict?.common?.unlimited_downloads || "Unlimited Downloads"}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {dict?.home?.feature_unlimited_desc ||
                  "No daily limits or restrictions. Download as many videos as you want, completely free forever."}
              </p>
            </div>
            <div className="flex flex-col items-start space-y-4 p-8 rounded-3xl bg-gray-50 dark:bg-gray-900/50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800">
              <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400">
                <Share2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">
                {dict?.common?.easy_sharing || "Easy Sharing"}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {dict?.home?.feature_sharing_desc ||
                  "Download and share directly to WhatsApp, Telegram, or any other platform with a single click."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-900 -z-10" />
        <div className="container px-4 md:px-6 text-center text-white space-y-8">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            {dict?.home?.cta_title || "Ready to Start Downloading?"}
          </h2>
          <p className="text-indigo-100 max-w-[600px] mx-auto text-xl">
            {dict?.home?.cta_desc ||
              "Join millions of users who trust SSDown for their video downloading needs."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={getPath("/x")}>
              <Button
                size="lg"
                className="h-14 px-8 text-lg bg-white text-indigo-600 hover:bg-gray-100 hover:text-indigo-700 font-bold border-0"
              >
                {dict?.home?.cta_btn_x || "Try for X (Twitter)"}
              </Button>
            </Link>
            <Link href={getPath("/tiktok")}>
              <Button
                size="lg"
                className="h-14 px-8 text-lg bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold"
              >
                {dict?.home?.cta_btn_tiktok || "Try for TikTok"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
