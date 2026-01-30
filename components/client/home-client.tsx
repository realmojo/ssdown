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

export function HomeClient() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* 1. H1 Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-50/30 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 -z-10" />
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-sm font-semibold mb-2">
            Video Technology & Archivists Hub
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white pb-2 leading-tight">
            Understanding Video Technology <br className="hidden md:block" />
            and Digital Content Management
          </h1>

          {/* 2. Main Introduction Paragraph */}
          <div className="max-w-3xl mx-auto space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            <p className="font-medium">
              SSDown is an educational platform dedicated to teaching users
              about video technology, codec standards, digital archiving ethics,
              and responsible content management practices.
            </p>
            <p>
              We provide comprehensive information about how online video
              platforms work, helping users understand the technical aspects of
              HLS streaming, container formats (MP4/WebM), and the legal
              implications of digital media consumption.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Topics Covered (H2) */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight mb-8 text-center sm:text-left">
            Educational Resources
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Explore our in-depth technical guides and policy analyses:
              </p>
              <ul className="space-y-3">
                {[
                  "Understanding Video Codecs (H.264 vs HEVC)",
                  "How HLS Streaming Technology Works",
                  "Digital Copyright & Fair Use Guidelines",
                  "Platform-Specific Media Infrastructure Analysis",
                  "Ethical Principles of Digital Archiving",
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
            Who Is This Platform For?
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              "Digital Archivists",
              "Tech Enthusiasts",
              "Content Creators",
              "Media Students",
              "Copyright Researchers",
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

      {/* 5. Tool Introduction */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              ⚠️ Educational Reference Tools (Use at Your Own Risk)
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We provide these tools for{" "}
              <strong>educational purposes only</strong> to demonstrate how
              video URL parsing and media extraction works.
            </p>
            <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-900 p-6 rounded-lg text-sm text-left max-w-2xl mx-auto space-y-3">
              <strong className="text-red-800 dark:text-red-200 block mb-3 text-base">
                ⚠️ IMPORTANT DISCLAIMER:
              </strong>
              <p className="text-red-900/90 dark:text-red-200/90 font-medium">
                These tools are provided solely for educational purposes to
                demonstrate how video URLs work. Users MUST:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-red-900/80 dark:text-red-200/80">
                <li>
                  <strong>Obtain explicit permission</strong> from content
                  creators before downloading
                </li>
                <li>
                  <strong>Comply with all platform Terms of Service</strong> (X,
                  TikTok, Instagram, Facebook, etc.)
                </li>
                <li>
                  <strong>
                    Respect all copyright and intellectual property rights
                  </strong>
                </li>
                <li>
                  <strong>Use only for legally permitted purposes</strong> in
                  their jurisdiction
                </li>
              </ul>
              <p className="text-red-900/90 dark:text-red-200/90 font-semibold mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                SSDown does NOT encourage or endorse any violation of platform
                policies or copyright laws.
                <span className="block mt-1">
                  Misuse of these tools may result in legal consequences.
                </span>
              </p>
            </div>
          </div>

          {/* Renamed & Refined Tool Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <Link href="/x" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
              >
                <XIcon className="h-6 w-6" />
                <span className="font-semibold">X (Twitter) Tool</span>
              </Button>
            </Link>
            <Link href="/tiktok" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950 transition-all"
              >
                <TikTokIcon className="h-6 w-6" />
                <span className="font-semibold">TikTok Tool</span>
              </Button>
            </Link>
            <Link href="/instagram" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all"
              >
                <InstagramIcon className="h-6 w-6" />
                <span className="font-semibold">Instagram Tool</span>
              </Button>
            </Link>
            <Link href="/facebook" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
              >
                <FacebookIcon className="h-6 w-6" />
                <span className="font-semibold">Facebook Tool</span>
              </Button>
            </Link>
            <Link href="/dailymotion" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
              >
                <DailymotionIcon className="h-6 w-6" />
                <span className="font-semibold">Dailymotion Tool</span>
              </Button>
            </Link>
            <Link href="/9gag" className="group">
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
              👉 (Personal Use Only)
            </p>
          </div>
        </div>
      </section>

      {/* 6. Copyright & Legal Notice (H2 - Essential) */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/20 border-t">
        <div className="container px-4 md:px-6 max-w-4xl space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Important Legal & Copyright Notice
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
            <p>
              SSDown does not host, store, or archive any media files on its
              servers. We act solely as a conduit for information and management
              tools, based on publicly available URLs provided by users.
            </p>
            <p>
              We do not encourage or endorse any illegal use of content. All
              users are responsible for complying with the copyright laws of
              their respective countries and the Terms of Service of the
              platforms they use.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Operation Policy (H2 - Transparency) */}
      <section className="py-16 bg-white dark:bg-gray-950 border-t">
        <div className="container px-4 md:px-6 max-w-4xl space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Operational Transparency
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            SSDown prioritizes user experience above all else. We strive to
            avoid excessively intrusive advertising. While some advertisements
            may be displayed to support the maintenance and improvement of our
            service, we are committed to keeping them relevant.
          </p>
        </div>
      </section>
    </div>
  );
}
