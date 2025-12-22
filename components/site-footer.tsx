"use client";

import { XIcon } from "@/components/ui/icons";

interface SiteFooterProps {
  dict: any;
  lang: string;
}

export function SiteFooter({ dict, lang }: SiteFooterProps) {
  const getPath = (path: string) => {
    if (lang === "en") return path;
    return `/${lang}${path}`;
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-gray-50/50 dark:bg-gray-950/50 backdrop-blur-xl">
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <a target="_self" href={getPath("/")} className="inline-block">
              <span className="font-bold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-300">
                SSDown
              </span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {dict?.home?.subtitle ||
                "The ultimate video downloader for X (Twitter), TikTok, Instagram, and Facebook. Fast, free, and secure."}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                target="_self"
                href={getPath("/x")}
                className="text-muted-foreground hover:text-black dark:hover:text-white transition-colors"
                aria-label="X (Twitter)"
              >
                <XIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Tools Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">
              Tools
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  target="_self"
                  href={getPath("/x")}
                  className="hover:text-primary transition-colors"
                >
                  {dict?.nav?.twitter || "X (Twitter) Downloader"}
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href={getPath("/tiktok")}
                  className="hover:text-primary transition-colors"
                >
                  {dict?.nav?.tiktok || "TikTok Downloader"}
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href={getPath("/instagram")}
                  className="hover:text-primary transition-colors"
                >
                  {dict?.nav?.instagram || "Instagram Downloader"}
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href={getPath("/facebook")}
                  className="hover:text-primary transition-colors"
                >
                  {dict?.nav?.facebook || "Facebook Downloader"}
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href={getPath("/9gag")}
                  className="hover:text-primary transition-colors"
                >
                  {dict?.nav?.ninegag || "9GAG Downloader"}
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href={getPath("/dailymotion")}
                  className="hover:text-primary transition-colors"
                >
                  {dict?.nav?.dailymotion || "Dailymotion Downloader"}
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href={getPath("/bilibili")}
                  className="hover:text-primary transition-colors"
                >
                  {dict?.nav?.bilibili || "Bilibili Downloader"}
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  target="_self"
                  href={getPath("/about")}
                  className="hover:text-primary transition-colors"
                >
                  {dict?.about?.nav || dict?.nav?.about || "About Us"}
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href={getPath("/contact")}
                  className="hover:text-primary transition-colors"
                >
                  {dict?.contact?.nav || dict?.nav?.contact || "Contact"}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">
              Legal
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  target="_self"
                  href={getPath("/privacy")}
                  className="hover:text-primary transition-colors"
                >
                  {dict?.privacy || "Privacy Policy"}
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href={getPath("/terms")}
                  className="hover:text-primary transition-colors"
                >
                  {dict?.terms || "Terms of Service"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} SSDown. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
