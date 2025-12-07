"use client";

import { CheckCircle2, Globe2, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AboutClientProps {
  dict: any;
}

export function AboutClient({ dict }: AboutClientProps) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 text-center bg-gray-50 dark:bg-gray-900/20">
        <div className="container px-4 md:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white">
            {dict?.about?.title || "About SSDown"}
          </h1>
          <p className="mx-auto max-w-[800px] text-gray-600 md:text-xl dark:text-gray-300">
            {dict?.about?.subtitle || "Your Ultimate Social Media Video Downloader"}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 space-y-20">
          
          {/* Introduction & Mission */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
               <div className="inline-block rounded-lg bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {dict?.about?.mission_title || "Our Mission"}
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Making Content Accessible</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                 {dict?.about?.description || "SSDown is a comprehensive online tool designed to help you download videos from various social media platforms."}
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                 {dict?.about?.mission_desc || "We believe that content should be accessible offline without restrictions."}
              </p>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl flex items-center justify-center p-8">
               {/* Abstract visual or logo placeholder */}
               <Globe2 className="w-32 h-32 text-white/80" />
            </div>
          </div>

          {/* Features Grid */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">{dict?.about?.features_title || "Why Use SSDown?"}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gray-50 dark:bg-gray-900/50">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold">No Watermarks</h3>
                  <p className="text-muted-foreground text-sm">
                    {dict?.about?.feature_1 || "Clean downloads without annoying logos."}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gray-50 dark:bg-gray-900/50">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold">High Quality</h3>
                  <p className="text-muted-foreground text-sm">
                     {dict?.about?.feature_2 || "Support for HD, Full HD, and 4K resolutions."}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gray-50 dark:bg-gray-900/50">
                 <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold">Fast Speeds</h3>
                  <p className="text-muted-foreground text-sm">
                     {dict?.about?.feature_3 || "Optimized servers for lightning-fast processing."}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gray-50 dark:bg-gray-900/50">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold">Privacy Focused</h3>
                  <p className="text-muted-foreground text-sm">
                    {dict?.about?.feature_4 || "We don't store your download history."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Section */}
           <div className="rounded-3xl bg-indigo-600 dark:bg-indigo-900 text-white p-12 text-center">
             <h2 className="text-2xl font-bold mb-4">{dict?.about?.contact_title || "Contact Us"}</h2>
             <p className="text-indigo-100 max-w-2xl mx-auto mb-8">
               {dict?.about?.contact_desc || "Have questions, suggestions, or issues? We'd love to hear from you."}
             </p>
             <a href="mailto:support@ssdown.app" className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
               Email Support
             </a>
           </div>

        </div>
      </section>
    </div>
  );
}
