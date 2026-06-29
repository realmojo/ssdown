"use client";

import {
  CheckCircle2,
  Info,
  Shield,
  BookOpen,
  Globe,
  FileVideo,
  Lock,
  Smartphone,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  XIcon,
  TikTokIcon,
  InstagramIcon,
  FacebookIcon,
  DailymotionIcon,
  NineGagIcon,
  YouTubeIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function HomeClient() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* 1. H1 Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-50/30 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 -z-10" />
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-sm font-semibold mb-2">
            Free Online Tools Platform
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white pb-2 leading-tight">
            Free Online Tools <br className="hidden md:block" />
            for Everyday Digital Tasks
          </h1>

          {/* 2. Main Introduction Paragraph */}
          <div className="max-w-3xl mx-auto space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            <p className="font-medium">
              SSDown is a free online tools platform that helps users handle
              everyday digital tasks quickly and efficiently — from image
              editing to PDF management, video conversion, and more.
            </p>
            <p>
              All of our tools run directly in your browser, so your files never
              leave your device. No software installation required, no sign-up
              needed, and completely free to use.
            </p>
            <p>
              Whether you need to compress an image, merge PDF files, convert a
              video format, or transform data between formats, SSDown provides
              the right tool for the job — fast, secure, and accessible from any
              device.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Topics Covered (H2) */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight mb-8 text-center sm:text-left">
            What We Offer
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                SSDown provides a comprehensive suite of browser-based tools
                designed to simplify your digital workflow. Explore our growing
                collection of free tools across these categories.
              </p>
              <ul className="space-y-3">
                {[
                  "Image compression, conversion, and editing tools",
                  "PDF merge, split, rotate, and protection tools",
                  "Video and audio format conversion",
                  "File format transformation (JSON, CSV, XML, Excel)",
                  "Social media content creation helpers",
                  "Developer and designer utilities",
                  "Privacy-first processing — all in your browser",
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
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">
            Who Is This Helpful For?
          </h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            SSDown is designed for anyone who needs fast, free, and reliable
            online tools for everyday digital tasks.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                text: "Users needing quick image edits",
                desc: "Compress, convert, resize, crop, and enhance your images with our free browser-based tools.",
              },
              {
                text: "People working with PDF documents",
                desc: "Merge, split, rotate, protect, and edit PDFs without installing any software.",
              },
              {
                text: "Video and audio editors",
                desc: "Convert video formats, extract audio, create GIFs, and trim clips directly in your browser.",
              },
              {
                text: "Anyone handling data files",
                desc: "Transform between JSON, XML, CSV, and Excel formats with our free conversion tools.",
              },
              {
                text: "Social media content creators",
                desc: "Generate hashtags, format text, resize images for social platforms, and preview content.",
              },
              {
                text: "Developers and designers",
                desc: "Generate favicons, extract color palettes, create QR codes, and calculate aspect ratios.",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="border-0 shadow-sm bg-white dark:bg-gray-900"
              >
                <CardContent className="p-6 flex flex-col gap-3 h-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {item.text}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mood Palette Spotlight */}
      <section className="py-10 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl">
          <a
            href="https://moodpalette.ssdown.app"
            target="_blank"
            rel="noopener"
            className="flex flex-col sm:flex-row items-center gap-5 bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-950/30 dark:to-pink-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl p-6 hover:shadow-lg transition-all group"
          >
            <span className="text-5xl shrink-0">🎨</span>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-1">Featured Tool</p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-violet-600 transition-colors">
                Mood Palette — AI Color Palette Generator
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Generate stunning color palettes from mood, keywords, or images. Perfect for designers and creators.
              </p>
            </div>
            <span className="text-sm font-semibold text-violet-600 group-hover:underline shrink-0">
              Try it free →
            </span>
          </a>
        </div>
      </section>

      {/* 5. How It Works (H2) - New Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">
            How SSDown Works
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Our platform makes it easy to handle common digital tasks. Here is
            how you can get started in just a few steps.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose a Tool",
                desc: "Browse our collection of free online tools. Whether you need image editing, PDF management, video conversion, or file transformation — we have the right tool for you.",
                icon: Globe,
              },
              {
                step: "02",
                title: "Upload & Process",
                desc: "Upload your file or paste your content. Our tools process everything directly in your browser for maximum privacy and speed — no data is sent to external servers.",
                icon: FileVideo,
              },
              {
                step: "03",
                title: "Save & Share",
                desc: "Get your results instantly. Save the processed files to your device or share them directly. All tools are free with no limits on usage.",
                icon: Smartphone,
              },
            ].map((item, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                  <item.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="text-xs font-bold text-indigo-500 tracking-widest">
                  STEP {item.step}
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Tool Introduction (The ONLY place for downloaders) (H2) */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/20 border-y">
        <div className="container px-4 md:px-6 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              ⚠️ Educational Reference Tools (Use at Your Own Risk)
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              SSDown operates primarily as an information resource. We also
              provide auxiliary tools designed strictly for personal content
              management purposes. Each tool is tailored to the specific
              platform's content format and policies.
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

          {/* Tool Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <a href="/ytdown" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
              >
                <YouTubeIcon className="h-6 w-6 text-red-600" />
                <span className="font-semibold">YouTube Tool</span>
              </Button>
            </a>
            <a href="/x" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
              >
                <XIcon className="h-6 w-6" />
                <span className="font-semibold">X (Twitter) Tool</span>
              </Button>
            </a>
            <a href="/tiktok" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950 transition-all"
              >
                <TikTokIcon className="h-6 w-6" />
                <span className="font-semibold">TikTok Tool</span>
              </Button>
            </a>
            <a href="/instagram" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all"
              >
                <InstagramIcon className="h-6 w-6" />
                <span className="font-semibold">Instagram Tool</span>
              </Button>
            </a>
            <a href="/facebook" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
              >
                <FacebookIcon className="h-6 w-6" />
                <span className="font-semibold">Facebook Tool</span>
              </Button>
            </a>
            <a href="/dailymotion" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
              >
                <DailymotionIcon className="h-6 w-6" />
                <span className="font-semibold">Dailymotion Tool</span>
              </Button>
            </a>
            <a href="/9gag" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <NineGagIcon className="h-6 w-6" />
                <span className="font-semibold">9GAG Tool</span>
              </Button>
            </a>
            <a
              href="https://upscale.ssdown.app"
              target="_blank"
              rel="noopener noreferrer"
              className="group md:col-span-3"
            >
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950 transition-all"
              >
                <Sparkles className="h-6 w-6 text-violet-500" />
                <span className="font-semibold">Upscale Image & Video</span>
              </Button>
            </a>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">(Personal Use Only)</p>
          </div>
        </div>
      </section>

      {/* 7. Blog & Resources CTA (H2) - New Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">
            Learn More from Our Blog
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Our blog covers a wide range of topics to help you get the most out
            of our tools. From step-by-step tutorials to tips and tricks, we
            provide the knowledge you need.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "How-To Guides",
                desc: "Step-by-step tutorials for image editing, PDF management, video conversion, and file transformation. Learn how to get the most out of every tool.",
                color: "text-blue-500",
                bg: "bg-blue-100 dark:bg-blue-900/30",
              },
              {
                icon: Shield,
                title: "Safety & Privacy",
                desc: "Learn about online privacy, understand how browser-based processing keeps your data secure, and follow our best practices for safe file handling.",
                color: "text-green-500",
                bg: "bg-green-100 dark:bg-green-900/30",
              },
              {
                icon: Lock,
                title: "Tips & Best Practices",
                desc: "Discover optimization techniques, recommended settings for different use cases, and tips to improve your workflow with our tools.",
                color: "text-purple-500",
                bg: "bg-purple-100 dark:bg-purple-900/30",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="border-0 shadow-sm bg-gray-50 dark:bg-gray-900"
              >
                <CardContent className="p-6 space-y-4">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${item.bg}`}
                  >
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="/blog">
              <Button variant="outline" size="lg" className="gap-2">
                Visit Our Blog
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 8. Terms & Privacy Notice */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/20 border-t">
        <div className="container px-4 md:px-6 max-w-4xl space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Terms & Privacy</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground space-y-4">
            <p>
              SSDown processes files directly in your browser. We do not upload,
              store, or share your files on our servers. Your data stays on your
              device throughout the entire process.
            </p>
            <p>
              Our tools are provided free of charge for personal and commercial
              use. Users are responsible for ensuring their use of our tools
              complies with applicable laws and regulations.
            </p>
            <p>
              Have questions or feedback? Contact us at{" "}
              <a
                href="mailto:support@ssdown.app"
                className="text-indigo-600 hover:underline"
              >
                support@ssdown.app
              </a>{" "}
              and we will respond promptly.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Operation Policy (H2 - Transparency) */}
      <section className="py-16 bg-white dark:bg-gray-950 border-t">
        <div className="container px-4 md:px-6 max-w-4xl space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Operational Transparency
          </h2>
          <div className="text-muted-foreground leading-relaxed space-y-4">
            <p>
              SSDown prioritizes user experience above all else. We strive to
              avoid excessively intrusive advertising. While some advertisements
              may be displayed to support the maintenance and improvement of our
              service, we are committed to keeping them relevant and
              non-disruptive to your browsing experience.
            </p>
            <p>
              Our tools are maintained and updated regularly to ensure the best
              possible experience. SSDown is committed to providing reliable,
              high-quality tools that respect your privacy and simplify your
              digital workflow.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
