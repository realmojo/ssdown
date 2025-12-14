"use client";

import {
  Download,
  Share2,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  Smartphone,
  ExternalLink,
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
        <div className="absolute inset-0 bg-linear-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 -z-10" />
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
                <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <div className="absolute inset-0 bg-linear-to-br from-pink-50 to-transparent dark:from-pink-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-8 flex flex-col items-center gap-4 relative z-10">
                  <div className="p-4 rounded-2xl bg-linear-to-br from-pink-500 to-cyan-500 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
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
                <div className="absolute inset-0 bg-linear-to-br from-purple-50 to-transparent dark:from-purple-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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

            {/* Dailymotion Card */}
            <Link href={getPath("/dailymotion")} className="group">
              <Card className="h-full border-2 border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white dark:bg-gray-900/50 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-linear-to-br from-gray-50 to-transparent dark:from-gray-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-8 flex flex-col items-center gap-4 relative z-10">
                  <div className="p-4 rounded-2xl bg-gradient-to-tr from-gray-800 to-black text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <DailymotionIcon className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Dailymotion</h3>
                    <p className="text-sm text-muted-foreground">
                      {dict?.home?.card_dailymotion_desc || "Download HD videos"}
                    </p>
                  </div>
                  <div className="mt-auto pt-4 text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    {dict?.home?.get_started || "Get Started"}{" "}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* App Download Section */}
          <div className="w-full mt-16 pt-16 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col items-center space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dict?.home?.app_title || "Download Our Mobile App"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  {dict?.home?.app_subtitle ||
                    "Get SSDown on your mobile device for the best experience"}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                {/* Android App Button */}
                <a
                  href="https://play.google.com/store/apps/details?id=com.mojoday.ssdown"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-w-[200px]"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs leading-tight opacity-90">
                      GET IT ON
                    </span>
                    <span className="text-lg font-bold leading-tight">
                      Google Play
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-70 group-hover:opacity-100 transition-opacity" />
                </a>

                {/* iOS App Button */}
                <a
                  href="https://play.google.com/store/apps/details?id=com.mojoday.ssdown"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-gray-900 to-black hover:from-black hover:to-gray-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-w-[200px] dark:from-gray-100 dark:to-gray-200 dark:text-gray-900 dark:hover:from-gray-200 dark:hover:to-gray-100"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-white/20 dark:bg-gray-800/20 rounded-lg backdrop-blur-sm">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs leading-tight opacity-90">
                      Download on the
                    </span>
                    <span className="text-lg font-bold leading-tight">
                      App Store
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-70 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>
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
