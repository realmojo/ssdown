"use client";

import { useState } from "react";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/lib/i18n-utils";

interface SiteHeaderProps {
  dict: any;
  locale: Locale;
}

export function SiteHeader({ dict, locale }: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <a
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
        </a>

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
                Software <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/software/windows" className="w-full cursor-pointer">
                  Windows
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/software/mac" className="w-full cursor-pointer">
                  Mac
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/software/android" className="w-full cursor-pointer">
                  Android
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/software/iphone" className="w-full cursor-pointer">
                  iOS
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/search" className="w-full cursor-pointer">
                  Search & Filter
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-muted-foreground hover:text-primary data-[state=open]:text-primary"
              >
                Downloaders <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/x" className="w-full cursor-pointer">
                  {dict?.twitter || "X (Twitter)"}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/tiktok" className="w-full cursor-pointer">
                  {dict?.tiktok || "TikTok"}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/instagram" className="w-full cursor-pointer">
                  {dict?.instagram?.nav || "Instagram"}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/facebook" className="w-full cursor-pointer">
                  {dict?.facebook?.nav || "Facebook"}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/dailymotion" className="w-full cursor-pointer">
                  {dict?.dailymotion?.nav || "Dailymotion"}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/9gag" className="w-full cursor-pointer">
                  {dict?.["9gag"]?.nav || "9GAG"}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/douyin" className="w-full cursor-pointer">
                  Douyin (抖音)
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tools Mega Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-muted-foreground hover:text-primary data-[state=open]:text-primary"
              >
                Tools <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[640px] p-5">
              <div className="grid grid-cols-4 gap-6">
                {/* Image Column */}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Image</p>
                  <a href="/image/image-compressor" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Image Compressor</a>
                  <a href="/image/image-converter" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Image Converter</a>
                  <a href="/image/social-image-resizer" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Social Image Resizer</a>
                  <a href="/image/background-remover" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Background Remover</a>
                  <a href="/image/watermark-remover" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Watermark Remover</a>
                  <a href="/image/favicon-generator" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Favicon Generator</a>
                  <a href="/image/color-palette-extractor" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Color Palette</a>
                  <a href="/image/thumbnail-generator" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Thumbnail Generator</a>
                  <a href="/image/crop-image" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Crop Image</a>
                  <a href="/image/flip-image" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Flip Image</a>
                  <a href="/image/pixelate-image" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Pixelate Image</a>
                  <a href="/image/black-and-white" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Black & White</a>
                  <a href="/image/add-text-to-image" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Add Text</a>
                  <a href="/image/add-border-to-image" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Add Border</a>
                  <a href="/image/combine-images" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Combine Images</a>
                  <a href="/image/collage-maker" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Collage Maker</a>
                  <a href="/image/round-image-maker" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Round Image</a>
                  <a href="/image/image-metadata-viewer" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Metadata Viewer</a>
                  <a href="/image/blur-image" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Blur Image</a>
                  <a href="/image/icon-to-png" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Icon to PNG</a>
                </div>

                {/* Video & PDF Column */}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Video & PDF</p>
                  <a href="/video-audio/video-to-mp3" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Video to MP3</a>
                  <a href="/video-audio/video-to-gif" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Video to GIF</a>
                  <a href="/video-audio/video-frame-extractor" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Frame Extractor</a>
                  <a href="/video-audio/audio-trimmer" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Audio Trimmer</a>
                  <a href="/video-audio/mute-video" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Mute Video</a>
                  <a href="/video-audio/gif-to-mp4" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">GIF to MP4</a>
                  <a href="/video-audio/trim-video" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Trim Video</a>
                  <div className="my-2 border-t border-border" />
                  <a href="/pdf/merge-pdf" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Merge PDF</a>
                  <a href="/pdf/rotate-pdf" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Rotate PDF</a>
                  <a href="/pdf/delete-pdf-pages" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Delete Pages</a>
                  <a href="/pdf/split-pdf" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Split PDF</a>
                  <a href="/pdf/compress-pdf" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Compress PDF</a>
                  <a href="/pdf/pdf-to-word" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">PDF to Word</a>
                  <a href="/pdf/pdf-to-excel" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">PDF to Excel</a>
                  <a href="/pdf/pdf-to-jpg" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">PDF to JPG</a>
                  <a href="/pdf/pdf-to-png" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">PDF to PNG</a>
                  <a href="/pdf/pdf-editor" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">PDF Editor</a>
                  <a href="/pdf/esign-pdf" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">eSign PDF</a>
                </div>

                {/* File Column */}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">File</p>
                  <a href="/file/json-to-xml" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">JSON to XML</a>
                  <a href="/file/xml-to-json" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">XML to JSON</a>
                  <a href="/file/csv-to-json" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">CSV to JSON</a>
                  <a href="/file/csv-to-xml" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">CSV to XML</a>
                  <a href="/file/xml-to-csv" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">XML to CSV</a>
                  <a href="/file/csv-to-excel" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">CSV to Excel</a>
                  <a href="/file/excel-to-csv" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Excel to CSV</a>
                  <a href="/file/xml-to-excel" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">XML to Excel</a>
                  <a href="/file/excel-to-xml" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Excel to XML</a>
                  <a href="/file/split-csv" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Split CSV</a>
                  <a href="/file/split-excel" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Split Excel</a>
                  <a href="/file/excel-to-pdf" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Excel to PDF</a>
                </div>

                {/* Utility Column */}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Utility</p>
                  <a href="/utility/youtube-thumbnail" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">YT Thumbnail Downloader</a>
                  <a href="/utility/youtube-preview" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">YT Preview Editor</a>
                  <a href="/utility/qr-code-generator" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">QR Code Generator</a>
                  <a href="/utility/aspect-ratio-calculator" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Aspect Ratio Calculator</a>
                  <a href="/utility/word-counter" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Word Counter</a>
                  <div className="my-2 border-t border-border" />
                  <a href="/social-text/hashtag-generator" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Hashtag Generator</a>
                  <a href="/social-text/instagram-line-break" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Instagram Line Break</a>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <a href="https://upscale.ssdown.app" target="_blank">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              Upscale
            </Button>
          </a>
          <a href="/blog">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              Blog
            </Button>
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <PaypalDonateButton className="hidden md:flex mr-2" />
          {/* PC Language Switcher */}
          <div className="hidden md:block">
            <LanguageSwitcher locale={locale} />
          </div>
          {/* PC Theme Toggle */}
          <div className="hidden md:block">
            <ModeToggle />
          </div>

          {/* Mobile Navigation Sidebar */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
                    {/* Software */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Software
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <a
                          href="/software/windows"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Windows
                        </a>
                        <a
                          href="/software/mac"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Mac
                        </a>
                        <a
                          href="/software/android"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Android
                        </a>
                        <a
                          href="/software/iphone"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          iOS
                        </a>
                        <a
                          href="/search"
                          className="text-base font-medium hover:text-primary transition-colors py-1 text-blue-600"
                          onClick={() => setIsOpen(false)}
                        >
                          Search & Filter
                        </a>
                      </div>
                    </div>

                    {/* Downloaders */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Downloaders
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <a
                          href="/x"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict?.twitter || "X (Twitter)"}
                        </a>
                        <a
                          href="/tiktok"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict?.tiktok || "TikTok"}
                        </a>
                        <a
                          href="/instagram"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict?.instagram?.nav || "Instagram"}
                        </a>
                        <a
                          href="/facebook"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict?.facebook?.nav || "Facebook"}
                        </a>
                        <a
                          href="/dailymotion"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict?.dailymotion?.nav || "Dailymotion"}
                        </a>
                        <a
                          href="/9gag"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict?.["9gag"]?.nav || "9GAG"}
                        </a>
                        <a
                          href="/douyin"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Douyin (抖音)
                        </a>
                      </div>
                    </div>

                    {/* Tools */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Tools
                      </h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 ml-2 border-l pl-4 border-muted">
                        <a href="/image/image-compressor" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Image Compressor</a>
                        <a href="/image/image-converter" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Image Converter</a>
                        <a href="/image/social-image-resizer" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Social Image Resizer</a>
                        <a href="/image/background-remover" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Background Remover</a>
                        <a href="/image/watermark-remover" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Watermark Remover</a>
                        <a href="/image/favicon-generator" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Favicon Generator</a>
                        <a href="/image/color-palette-extractor" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Color Palette</a>
                        <a href="/image/thumbnail-generator" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Thumbnail Generator</a>
                        <a href="/image/crop-image" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Crop Image</a>
                        <a href="/image/flip-image" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Flip Image</a>
                        <a href="/image/pixelate-image" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Pixelate Image</a>
                        <a href="/image/black-and-white" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Black & White</a>
                        <a href="/image/add-text-to-image" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Add Text</a>
                        <a href="/image/add-border-to-image" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Add Border</a>
                        <a href="/image/combine-images" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Combine Images</a>
                        <a href="/image/collage-maker" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Collage Maker</a>
                        <a href="/image/round-image-maker" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Round Image</a>
                        <a href="/image/image-metadata-viewer" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Metadata Viewer</a>
                        <a href="/image/blur-image" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Blur Image</a>
                        <a href="/image/icon-to-png" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Icon to PNG</a>
                        <a href="/video-audio/video-to-mp3" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Video to MP3</a>
                        <a href="/video-audio/video-to-gif" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Video to GIF</a>
                        <a href="/video-audio/video-frame-extractor" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Frame Extractor</a>
                        <a href="/video-audio/audio-trimmer" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Audio Trimmer</a>
                        <a href="/video-audio/mute-video" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Mute Video</a>
                        <a href="/video-audio/gif-to-mp4" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>GIF to MP4</a>
                        <a href="/video-audio/trim-video" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Trim Video</a>
                        <a href="/pdf/merge-pdf" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Merge PDF</a>
                        <a href="/pdf/rotate-pdf" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Rotate PDF</a>
                        <a href="/pdf/delete-pdf-pages" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Delete Pages</a>
                        <a href="/pdf/split-pdf" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Split PDF</a>
                        <a href="/pdf/compress-pdf" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Compress PDF</a>
                        <a href="/pdf/pdf-to-word" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>PDF to Word</a>
                        <a href="/pdf/pdf-to-excel" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>PDF to Excel</a>
                        <a href="/pdf/pdf-to-jpg" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>PDF to JPG</a>
                        <a href="/pdf/pdf-to-png" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>PDF to PNG</a>
                        <a href="/pdf/pdf-editor" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>PDF Editor</a>
                        <a href="/pdf/esign-pdf" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>eSign PDF</a>
                        <a href="/file/json-to-xml" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>JSON to XML</a>
                        <a href="/file/xml-to-json" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>XML to JSON</a>
                        <a href="/file/csv-to-json" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>CSV to JSON</a>
                        <a href="/file/csv-to-xml" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>CSV to XML</a>
                        <a href="/file/xml-to-csv" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>XML to CSV</a>
                        <a href="/file/csv-to-excel" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>CSV to Excel</a>
                        <a href="/file/excel-to-csv" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Excel to CSV</a>
                        <a href="/file/xml-to-excel" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>XML to Excel</a>
                        <a href="/file/excel-to-xml" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Excel to XML</a>
                        <a href="/file/split-csv" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Split CSV</a>
                        <a href="/file/split-excel" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Split Excel</a>
                        <a href="/file/excel-to-pdf" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Excel to PDF</a>
                        <a href="/utility/youtube-thumbnail" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>YT Thumbnail Downloader</a>
                        <a href="/utility/youtube-preview" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>YT Preview Editor</a>
                        <a href="/utility/qr-code-generator" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>QR Code Generator</a>
                        <a href="/utility/aspect-ratio-calculator" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Aspect Ratio Calculator</a>
                        <a href="/utility/word-counter" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Word Counter</a>
                        <a href="/social-text/hashtag-generator" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Hashtag Generator</a>
                        <a href="/social-text/instagram-line-break" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Instagram Line Break</a>
                      </div>
                    </div>

                    {/* General Links */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        General
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <a
                          href="https://upscale.ssdown.app"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Upscale
                        </a>
                        <a
                          href="/blog"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Blog
                        </a>
                      </div>
                    </div>

                    {/* Mobile Donate Button */}
                    <div className="mt-auto pt-4 border-t pb-2">
                      <PaypalDonateButton className="w-full justify-center" />
                    </div>

                    {/* Settings - Language Switcher */}
                    <div className="flex items-center justify-between py-4 border-t">
                      <span className="text-sm font-medium">
                        {locale === "kr" ? "언어" : "Language"}
                      </span>
                      <LanguageSwitcher locale={locale} />
                    </div>

                    {/* Settings - Theme Switcher */}
                    <div className="flex items-center justify-between py-4 border-t">
                      <span className="text-sm font-medium">
                        {locale === "kr" ? "테마 설정" : "Theme Setting"}
                      </span>
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
