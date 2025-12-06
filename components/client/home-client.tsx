"use client";

import { useState } from "react";
import {
  Download,
  Loader2,
  Link2,
  Share2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface HomeClientProps {
  dict: any;
  lang: string;
}

export function HomeClient({ dict, lang }: HomeClientProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const getPath = (path: string) => {
    if (lang === "en") return path;
    return `/${lang}${path === "/" ? "" : path}`;
  };

  const handleDownload = async () => {
    if (!url) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // For demo, just alert
      alert("This is a demo. In a real app, this would process: " + url);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 -z-10" />
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient-x pb-2">
              {dict?.home?.title || "The Ultimate Video Downloader"}
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              {dict?.home?.subtitle ||
                "Download high-quality videos from your favorite platforms effortlessly. Fast, free, and secure."}
            </p>
          </div>

          {/* Main Downloader Component */}
          <Card className="w-full max-w-2xl shadow-2xl border-indigo-100 dark:border-indigo-900/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder={
                      dict?.common?.paste_url || "Paste video URL here..."
                    }
                    className="pl-10 h-12 text-lg bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 transition-all focus:ring-2 focus:ring-indigo-500 text-black dark:text-white"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <Button
                  size="lg"
                  className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                  onClick={handleDownload}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-5 w-5" />
                  )}
                  {dict?.common?.download || "Download"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Supported Platforms Preview */}
          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <Link href={getPath("/x")}>
              <Button
                variant="outline"
                className="rounded-full h-12 px-6 border-gray-200 dark:border-gray-800 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group"
              >
                <span className="font-semibold">
                  {dict?.home?.twitter_btn || "X (Twitter)"}
                </span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href={getPath("/tiktok")}>
              <Button
                variant="outline"
                className="rounded-full h-12 px-6 border-gray-200 dark:border-gray-800 hover:border-pink-500 hover:text-pink-600 dark:hover:text-pink-400 transition-all group"
              >
                <span className="font-semibold">
                  {dict?.home?.tiktok_btn || "TikTok"}
                </span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors">
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                <Download className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">
                {dict?.common?.fast_downloads || "Fast Downloads"}
              </h3>
              <p className="text-muted-foreground">
                Lightning fast download speeds for all your videos.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">
                {dict?.common?.high_quality || "High Quality"}
              </h3>
              <p className="text-muted-foreground">
                Keep the original quality of the videos you download.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-colors">
              <div className="p-3 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400">
                <Share2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">
                {dict?.common?.easy_sharing || "Easy Sharing"}
              </h3>
              <p className="text-muted-foreground">
                Download and share videos across platforms seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
