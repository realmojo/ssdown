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
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white pb-2 leading-tight">
            How to Safely Use Online Video Content
          </h1>

          {/* 2. Main Introduction Paragraph */}
          <div className="max-w-3xl mx-auto space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            <p className="font-medium">
              SSDown is an informational guide dedicated to helping users manage
              and utilize online video content efficiently within the boundaries
              of personal use and legal compliance.
            </p>
            <p>
              Online video content can be a valuable resource for learning,
              archiving, and offline reference in various situations. Our goal
              is to assist users in understanding content policies and copyright
              regulations, ensuring a safe and responsible digital experience.
            </p>
            <p>
              Whether you are a student looking to save educational material for
              offline study, a content creator researching trends across
              platforms, or simply someone who wants to keep a personal archive
              of memorable moments, understanding how to handle digital video
              content responsibly is essential in today's connected world.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Topics Covered (H2) */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight mb-8 text-center sm:text-left">
            What We Cover at SSDown
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We provide comprehensive information on the following topics
                related to video content utilization. Each topic is covered
                in-depth through our blog posts, guides, and tool documentation,
                helping you make informed decisions about your digital content.
              </p>
              <ul className="space-y-3">
                {[
                  "Summary of content usage policies by platform",
                  "Guidelines for personal archiving & offline viewing",
                  "Methods for organizing and managing video files",
                  "Guides on privacy protection and security",
                  "Troubleshooting common video playback issues",
                  "Video codec and format compatibility guides",
                  "Best practices for content creators and researchers",
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
            SSDown is designed for a wide range of users who need to manage,
            study, or archive digital video content in a safe and legal manner.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                text: "Users managing personal video archives",
                desc: "Keep your favorite content organized and accessible offline for personal enjoyment.",
              },
              {
                text: "Those curious about platform policies",
                desc: "Learn how each social media platform handles content downloading and sharing.",
              },
              {
                text: "People needing offline educational content",
                desc: "Save lectures, tutorials, and learning materials for study without internet access.",
              },
              {
                text: "Anyone organizing digital files systematically",
                desc: "Use our guides on metadata, codecs, and file management to keep your library tidy.",
              },
              {
                text: "Users seeking safe content consumption methods",
                desc: "Protect your privacy and security while browsing and downloading content online.",
              },
              {
                text: "Content creators researching trends",
                desc: "Study successful videos across platforms to improve your own content strategy.",
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

      {/* 5. How It Works (H2) - New Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">
            How SSDown Works
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Our platform provides a straightforward approach to video content
            management. Here is how you can get started in just a few steps.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Find the Content",
                desc: "Navigate to the social media platform and locate the video you'd like to save. Copy the URL from the address bar or share menu of the platform.",
                icon: Globe,
              },
              {
                step: "02",
                title: "Paste & Process",
                desc: "Select the appropriate tool on SSDown and paste the copied URL. Our system will analyze the content and present you with available options including quality and format.",
                icon: FileVideo,
              },
              {
                step: "03",
                title: "Download & Manage",
                desc: "Choose your preferred quality and save the file to your device. Use our blog guides to learn about organizing files, understanding codecs, and managing your media library effectively.",
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
              Video Content Management Tools
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              SSDown operates primarily as an information resource. We also
              provide auxiliary tools designed strictly for personal content
              management purposes. Each tool is tailored to the specific
              platform's content format and policies.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200 max-w-2xl mx-auto">
              <strong>Notice:</strong> These tools are for convenience only. All
              copyrights belong to the original creators and platforms. Users
              must strictly adhere to the terms of service of each platform.
            </div>
          </div>

          {/* Tool Links */}
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
              (Personal Use Only)
            </p>
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
            Our blog covers a wide range of topics to help you navigate the
            world of digital video content safely and effectively. From
            technical guides to ethical considerations, we provide the knowledge
            you need.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Technical Guides",
                desc: "Learn about video codecs like H.264, H.265, VP9, and AV1. Understand container formats, resolution differences, and how to choose the best settings for your needs.",
                color: "text-blue-500",
                bg: "bg-blue-100 dark:bg-blue-900/30",
              },
              {
                icon: Shield,
                title: "Safety & Privacy",
                desc: "Protect yourself from malware-laden download sites, understand tracking parameters in social media links, and learn to browse safely with our security-focused guides.",
                color: "text-green-500",
                bg: "bg-green-100 dark:bg-green-900/30",
              },
              {
                icon: Lock,
                title: "Ethics & Copyright",
                desc: "Understand the balance between digital preservation and copyright law. Learn about fair use, creator rights, and responsible content archiving practices.",
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
            <Link href="/blog">
              <Button variant="outline" size="lg" className="gap-2">
                Visit Our Blog
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Copyright & Legal Notice (H2 - Essential) */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/20 border-t">
        <div className="container px-4 md:px-6 max-w-4xl space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Important Legal & Copyright Notice
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground space-y-4">
            <p>
              SSDown does not host, store, or archive any media files on its
              servers. We act solely as a conduit for information and management
              tools, based on publicly available URLs provided by users. All
              content remains on the original platform's servers and is accessed
              directly by the user's browser.
            </p>
            <p>
              We do not encourage or endorse any illegal use of content. All
              users are responsible for complying with the copyright laws of
              their respective countries and the Terms of Service of the
              platforms they use. Downloading copyrighted material without
              permission may violate applicable laws, and users assume all
              responsibility for their actions.
            </p>
            <p>
              If you are a content creator and believe that your work is being
              accessed improperly through our tools, please contact us at{" "}
              <a
                href="mailto:support@ssdown.app"
                className="text-indigo-600 hover:underline"
              >
                support@ssdown.app
              </a>{" "}
              and we will take appropriate action promptly.
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
              Our tools are maintained and updated regularly to ensure
              compatibility with platform changes. We monitor the Terms of
              Service of all supported platforms and adjust our tools
              accordingly. SSDown is committed to operating within legal
              boundaries and promoting responsible digital content management.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
