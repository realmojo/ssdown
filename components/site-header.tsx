"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ChevronDown, Menu } from "lucide-react";
import { PaypalDonateButton } from "@/components/paypal-donate-button";

interface SiteHeaderProps {
  dict: any;
}

export function SiteHeader({ dict }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link
          prefetch={false}
          href="/"
          className="flex items-center gap-2 font-bold text-xl mr-6 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.png"
            alt="SSDown Logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          <span className="hidden md:inline bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            SSDown
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-4 text-sm font-medium"
          aria-label="Main navigation"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-muted-foreground hover:text-primary data-[state=open]:text-primary"
              >
                Platform Tools <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/x"
                  className="w-full cursor-pointer"
                >
                  {dict?.twitter || "X (Twitter)"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/tiktok"
                  className="w-full cursor-pointer"
                >
                  {dict?.tiktok || "TikTok"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/instagram"
                  className="w-full cursor-pointer"
                >
                  {dict?.instagram?.nav || "Instagram"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/facebook"
                  className="w-full cursor-pointer"
                >
                  {dict?.facebook?.nav || "Facebook"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/dailymotion"
                  className="w-full cursor-pointer"
                >
                  {dict?.dailymotion?.nav || "Dailymotion"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/9gag"
                  className="w-full cursor-pointer"
                >
                  {dict?.["9gag"]?.nav || "9GAG"}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-muted-foreground hover:text-primary data-[state=open]:text-primary"
              >
                Tools <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/tools/youtube-thumbnail"
                  className="w-full cursor-pointer"
                >
                  YT Thumbnail Downloader
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/tools/youtube-preview"
                  className="w-full cursor-pointer"
                >
                  YT Preview Editor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/tools/video-to-mp3"
                  className="w-full cursor-pointer"
                >
                  Video to MP3
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/tools/video-to-gif"
                  className="w-full cursor-pointer"
                >
                  Video to GIF
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/tools/video-frame-extractor"
                  className="w-full cursor-pointer"
                >
                  Video Frame Extractor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/tools/audio-trimmer"
                  className="w-full cursor-pointer"
                >
                  Audio Trimmer
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/tools/image-converter"
                  className="w-full cursor-pointer"
                >
                  Image Converter
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/tools/social-image-resizer"
                  className="w-full cursor-pointer"
                >
                  Social Image Resizer
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/tools/instagram-line-break"
                  className="w-full cursor-pointer"
                >
                  Instagram Line Break
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/tools/qr-code-generator"
                  className="w-full cursor-pointer"
                >
                  QR Code Generator
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/tools/aspect-ratio-calculator"
                  className="w-full cursor-pointer"
                >
                  Aspect Ratio Calculator
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/tools/thumbnail-generator"
                  className="w-full cursor-pointer"
                >
                  Thumbnail Generator
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/tools/hashtag-generator"
                  className="w-full cursor-pointer"
                >
                  Hashtag Generator
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/tools/watermark-remover"
                  className="w-full cursor-pointer"
                >
                  Watermark Remover
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link prefetch={false} href="/blog">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              Blog
            </Button>
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <PaypalDonateButton className="hidden md:flex mr-2" />
          {/* PC Theme Toggle */}
          <div className="hidden md:block">
            <ModeToggle />
          </div>

          {/* Mobile Navigation Sidebar */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
                <SheetHeader className="p-6 text-left border-b">
                  <SheetTitle>{dict?.home || "Menu"}</SheetTitle>
                </SheetHeader>
                <div className="h-[calc(100vh-80px)] overflow-y-auto px-6 py-4">
                  <div className="flex flex-col gap-8 pb-10">
                    {/* Platform Tools Section */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Platform Tools
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <Link
                          prefetch={false}
                          href="/x"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          {dict?.twitter || "X (Twitter)"}
                        </Link>
                        <Link
                          prefetch={false}
                          href="/tiktok"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          {dict?.tiktok || "TikTok"}
                        </Link>
                        <Link
                          prefetch={false}
                          href="/instagram"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          {dict?.instagram?.nav || "Instagram"}
                        </Link>
                        <Link
                          prefetch={false}
                          href="/facebook"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          {dict?.facebook?.nav || "Facebook"}
                        </Link>
                        <Link
                          prefetch={false}
                          href="/dailymotion"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          {dict?.dailymotion?.nav || "Dailymotion"}
                        </Link>
                        <Link
                          prefetch={false}
                          href="/9gag"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          {dict?.["9gag"]?.nav || "9GAG"}
                        </Link>
                      </div>
                    </div>

                    {/* Tools Section */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Creator Tools
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <Link
                          prefetch={false}
                          href="/tools/youtube-thumbnail"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          YT Thumbnail Downloader
                        </Link>
                        <Link
                          prefetch={false}
                          href="/tools/youtube-preview"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          YT Preview Editor
                        </Link>
                        <Link
                          prefetch={false}
                          href="/tools/video-to-mp3"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          Video to MP3
                        </Link>
                        <Link
                          prefetch={false}
                          href="/tools/video-to-gif"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          Video to GIF
                        </Link>
                        <Link
                          prefetch={false}
                          href="/tools/video-frame-extractor"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          Video Frame Extractor
                        </Link>
                        <Link
                          prefetch={false}
                          href="/tools/audio-trimmer"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          Audio Trimmer
                        </Link>
                        <Link
                          prefetch={false}
                          href="/tools/image-converter"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          Image Converter
                        </Link>
                        <Link
                          prefetch={false}
                          href="/tools/social-image-resizer"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          Social Image Resizer
                        </Link>
                        <Link
                          prefetch={false}
                          href="/tools/instagram-line-break"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          Instagram Line Break
                        </Link>
                        <Link
                          prefetch={false}
                          href="/tools/qr-code-generator"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          QR Code Generator
                        </Link>
                        <Link
                          prefetch={false}
                          href="/tools/aspect-ratio-calculator"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          Aspect Ratio Calculator
                        </Link>
                        <Link
                          prefetch={false}
                          href="/tools/thumbnail-generator"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          Thumbnail Generator
                        </Link>
                        <Link
                          prefetch={false}
                          href="/tools/hashtag-generator"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          Hashtag Generator
                        </Link>
                        <Link
                          prefetch={false}
                          href="/tools/watermark-remover"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          Watermark Remover
                        </Link>
                      </div>
                    </div>

                    {/* General Links */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        General
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <Link
                          prefetch={false}
                          href="/blog"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                        >
                          Blog
                        </Link>
                      </div>
                    </div>

                    {/* Mobile Donate Button */}
                    <div className="mt-auto pt-4 border-t pb-2">
                      <PaypalDonateButton className="w-full justify-center" />
                    </div>

                    {/* Settings - Theme Switcher */}
                    <div className="flex items-center justify-between py-4 border-t">
                      <span className="text-sm font-medium">Theme Setting</span>
                      <ModeToggle />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
