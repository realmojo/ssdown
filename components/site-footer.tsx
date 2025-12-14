"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
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
            <Link href={getPath("/")} className="inline-block">
              <span className="font-bold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-300">
                SSDown
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {dict?.home?.subtitle || "The ultimate video downloader for X (Twitter), TikTok, Instagram, and Facebook. Fast, free, and secure."}
            </p>
            <div className="flex items-center gap-4 pt-2">
               <Link href={getPath("/x")} className="text-muted-foreground hover:text-black dark:hover:text-white transition-colors" aria-label="X (Twitter)">
                  <XIcon className="h-5 w-5" />
               </Link>
            </div>
          </div>

          {/* Tools Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">Tools</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href={getPath("/x")} className="hover:text-primary transition-colors">
                  {dict?.nav?.twitter || "X (Twitter) Downloader"}
                </Link>
              </li>
              <li>
                <Link href={getPath("/tiktok")} className="hover:text-primary transition-colors">
                  {dict?.nav?.tiktok || "TikTok Downloader"}
                </Link>
              </li>
              <li>
                <Link href={getPath("/instagram")} className="hover:text-primary transition-colors">
                  {dict?.nav?.instagram || "Instagram Downloader"}
                </Link>
              </li>
              <li>
                <Link href={getPath("/facebook")} className="hover:text-primary transition-colors">
                  {dict?.nav?.facebook || "Facebook Downloader"}
                </Link>
              </li>
              <li>
                <Link href={getPath("/dailymotion")} className="hover:text-primary transition-colors">
                  {dict?.nav?.dailymotion || "Dailymotion Downloader"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">Company</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
               <li>
                <Link href={getPath("/about")} className="hover:text-primary transition-colors">
                  {dict?.about?.nav || dict?.nav?.about || "About Us"}
                </Link>
              </li>
              <li>
                <Link href={getPath("/contact")} className="hover:text-primary transition-colors">
                  {dict?.contact?.nav || dict?.nav?.contact || "Contact"}
                </Link>
              </li>
            </ul>
          </div>

           {/* Legal Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">Legal</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
               <li>
                <Link href={getPath("/privacy")} className="hover:text-primary transition-colors">
                  {dict?.privacy || "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link href={getPath("/terms")} className="hover:text-primary transition-colors">
                   {dict?.terms || "Terms of Service"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} SSDown. All rights reserved.</p>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Theme</span>
                <ModeToggle />
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
