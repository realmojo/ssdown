"use client";

import { useState } from "react";

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
            {/* <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-muted-foreground hover:text-primary data-[state=open]:text-primary"
              >
                Platform Tools <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger> */}
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
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-muted-foreground hover:text-primary data-[state=open]:text-primary"
              >
                Image <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a
                  href="/image/image-compressor"
                  className="w-full cursor-pointer"
                >
                  Image Compressor
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/image/image-converter"
                  className="w-full cursor-pointer"
                >
                  Image Converter
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/image/social-image-resizer"
                  className="w-full cursor-pointer"
                >
                  Social Image Resizer
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/image/background-remover"
                  className="w-full cursor-pointer"
                >
                  Background Remover
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/image/watermark-remover"
                  className="w-full cursor-pointer"
                >
                  Watermark Remover
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/image/favicon-generator"
                  className="w-full cursor-pointer"
                >
                  Favicon Generator
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/image/color-palette-extractor"
                  className="w-full cursor-pointer"
                >
                  Color Palette Extractor
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/image/thumbnail-generator"
                  className="w-full cursor-pointer"
                >
                  Thumbnail Generator
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/image/crop-image" className="w-full cursor-pointer">
                  Crop Image
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/image/flip-image" className="w-full cursor-pointer">
                  Flip Image
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/image/pixelate-image"
                  className="w-full cursor-pointer"
                >
                  Pixelate Image
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/image/black-and-white"
                  className="w-full cursor-pointer"
                >
                  Black & White
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/image/add-text-to-image"
                  className="w-full cursor-pointer"
                >
                  Add Text to Image
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/image/add-border-to-image"
                  className="w-full cursor-pointer"
                >
                  Add Border to Image
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/image/combine-images"
                  className="w-full cursor-pointer"
                >
                  Combine Images
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/image/collage-maker"
                  className="w-full cursor-pointer"
                >
                  Collage Maker
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/image/round-image-maker"
                  className="w-full cursor-pointer"
                >
                  Round Image Maker
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/image/image-metadata-viewer"
                  className="w-full cursor-pointer"
                >
                  Image Metadata Viewer
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/image/blur-image" className="w-full cursor-pointer">
                  Blur Image
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/image/icon-to-png" className="w-full cursor-pointer">
                  Icon to PNG
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
                Video & Audio <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a
                  href="/video-audio/video-to-mp3"
                  className="w-full cursor-pointer"
                >
                  Video to MP3
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/video-audio/video-to-gif"
                  className="w-full cursor-pointer"
                >
                  Video to GIF
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/video-audio/video-frame-extractor"
                  className="w-full cursor-pointer"
                >
                  Video Frame Extractor
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/video-audio/audio-trimmer"
                  className="w-full cursor-pointer"
                >
                  Audio Trimmer
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/video-audio/mute-video"
                  className="w-full cursor-pointer"
                >
                  Mute Video
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/video-audio/gif-to-mp4"
                  className="w-full cursor-pointer"
                >
                  GIF to MP4
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/video-audio/trim-video"
                  className="w-full cursor-pointer"
                >
                  Trim Video
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
                Social & Text <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a
                  href="/social-text/hashtag-generator"
                  className="w-full cursor-pointer"
                >
                  Hashtag Generator
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/social-text/instagram-line-break"
                  className="w-full cursor-pointer"
                >
                  Instagram Line Break
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
                Utility <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a
                  href="/utility/youtube-thumbnail"
                  className="w-full cursor-pointer"
                >
                  YT Thumbnail Downloader
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/utility/youtube-preview"
                  className="w-full cursor-pointer"
                >
                  YT Preview Editor
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/utility/qr-code-generator"
                  className="w-full cursor-pointer"
                >
                  QR Code Generator
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/utility/aspect-ratio-calculator"
                  className="w-full cursor-pointer"
                >
                  Aspect Ratio Calculator
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
                PDF <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-[70vh] overflow-y-auto"
            >
              <DropdownMenuItem asChild>
                <a href="/pdf/merge-pdf" className="w-full cursor-pointer">
                  Merge PDF
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/pdf/rotate-pdf" className="w-full cursor-pointer">
                  Rotate PDF
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/pdf/delete-pdf-pages"
                  className="w-full cursor-pointer"
                >
                  Delete PDF Pages
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/pdf/protect-pdf" className="w-full cursor-pointer">
                  Protect PDF
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/pdf/unlock-pdf" className="w-full cursor-pointer">
                  Unlock PDF
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/pdf/pdf-to-text" className="w-full cursor-pointer">
                  PDF to Text
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/pdf/split-pdf" className="w-full cursor-pointer">
                  Split PDF
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/pdf/rearrange-pdf" className="w-full cursor-pointer">
                  Rearrange PDF
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/pdf/crop-pdf" className="w-full cursor-pointer">
                  Crop PDF
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/pdf/pdf-page-numbers"
                  className="w-full cursor-pointer"
                >
                  PDF Page Numbers
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/pdf/pdf-watermark" className="w-full cursor-pointer">
                  PDF Watermark
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="/pdf/add-text-to-pdf"
                  className="w-full cursor-pointer"
                >
                  Add Text to PDF
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/pdf/create-pdf" className="w-full cursor-pointer">
                  Create PDF
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/pdf/images-to-pdf" className="w-full cursor-pointer">
                  Images to PDF
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/pdf/pdf-to-jpg" className="w-full cursor-pointer">
                  PDF to JPG
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/pdf/pdf-to-png" className="w-full cursor-pointer">
                  PDF to PNG
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/pdf/pdf-editor" className="w-full cursor-pointer">
                  PDF Editor
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/pdf/esign-pdf" className="w-full cursor-pointer">
                  eSign PDF
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
                File <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="/file/json-to-xml" className="w-full cursor-pointer">
                  JSON to XML
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/file/xml-to-json" className="w-full cursor-pointer">
                  XML to JSON
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/file/csv-to-json" className="w-full cursor-pointer">
                  CSV to JSON
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/file/csv-to-xml" className="w-full cursor-pointer">
                  CSV to XML
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/file/xml-to-csv" className="w-full cursor-pointer">
                  XML to CSV
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/file/csv-to-excel" className="w-full cursor-pointer">
                  CSV to Excel
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/file/excel-to-csv" className="w-full cursor-pointer">
                  Excel to CSV
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/file/xml-to-excel" className="w-full cursor-pointer">
                  XML to Excel
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/file/excel-to-xml" className="w-full cursor-pointer">
                  Excel to XML
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/file/split-csv" className="w-full cursor-pointer">
                  Split CSV
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/file/split-excel" className="w-full cursor-pointer">
                  Split Excel
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/file/excel-to-pdf" className="w-full cursor-pointer">
                  Excel to PDF
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                    {/* Platform Tools Section */}
                    {/* <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Platform Tools
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
                      </div>
                    </div> */}

                    {/* Image Tools */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Image Tools
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <a
                          href="/image/image-compressor"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Image Compressor
                        </a>
                        <a
                          href="/image/image-converter"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Image Converter
                        </a>
                        <a
                          href="/image/social-image-resizer"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Social Image Resizer
                        </a>
                        <a
                          href="/image/background-remover"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Background Remover
                        </a>
                        <a
                          href="/image/watermark-remover"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Watermark Remover
                        </a>
                        <a
                          href="/image/favicon-generator"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Favicon Generator
                        </a>
                        <a
                          href="/image/color-palette-extractor"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Color Palette Extractor
                        </a>
                        <a
                          href="/image/thumbnail-generator"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Thumbnail Generator
                        </a>
                        <a
                          href="/image/crop-image"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Crop Image
                        </a>
                        <a
                          href="/image/flip-image"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Flip Image
                        </a>
                        <a
                          href="/image/pixelate-image"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Pixelate Image
                        </a>
                        <a
                          href="/image/black-and-white"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Black & White
                        </a>
                        <a
                          href="/image/add-text-to-image"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Add Text to Image
                        </a>
                        <a
                          href="/image/add-border-to-image"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Add Border to Image
                        </a>
                        <a
                          href="/image/combine-images"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Combine Images
                        </a>
                        <a
                          href="/image/collage-maker"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Collage Maker
                        </a>
                        <a
                          href="/image/round-image-maker"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Round Image Maker
                        </a>
                        <a
                          href="/image/image-metadata-viewer"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Image Metadata Viewer
                        </a>
                        <a
                          href="/image/blur-image"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Blur Image
                        </a>
                        <a
                          href="/image/icon-to-png"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Icon to PNG
                        </a>
                      </div>
                    </div>

                    {/* Video & Audio */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Video & Audio
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <a
                          href="/video-audio/video-to-mp3"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Video to MP3
                        </a>
                        <a
                          href="/video-audio/video-to-gif"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Video to GIF
                        </a>
                        <a
                          href="/video-audio/video-frame-extractor"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Video Frame Extractor
                        </a>
                        <a
                          href="/video-audio/audio-trimmer"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Audio Trimmer
                        </a>
                        <a
                          href="/video-audio/mute-video"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Mute Video
                        </a>
                        <a
                          href="/video-audio/gif-to-mp4"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          GIF to MP4
                        </a>
                        <a
                          href="/video-audio/trim-video"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Trim Video
                        </a>
                      </div>
                    </div>

                    {/* Social & Text */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Social & Text
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <a
                          href="/social-text/hashtag-generator"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Hashtag Generator
                        </a>
                        <a
                          href="/social-text/instagram-line-break"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Instagram Line Break
                        </a>
                      </div>
                    </div>

                    {/* Utility */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Utility
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <a
                          href="/utility/youtube-thumbnail"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          YT Thumbnail Downloader
                        </a>
                        <a
                          href="/utility/youtube-preview"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          YT Preview Editor
                        </a>
                        <a
                          href="/utility/qr-code-generator"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          QR Code Generator
                        </a>
                        <a
                          href="/utility/aspect-ratio-calculator"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Aspect Ratio Calculator
                        </a>
                      </div>
                    </div>

                    {/* PDF Tools */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        PDF Tools
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <a
                          href="/pdf/merge-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Merge PDF
                        </a>
                        <a
                          href="/pdf/rotate-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Rotate PDF
                        </a>
                        <a
                          href="/pdf/delete-pdf-pages"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Delete PDF Pages
                        </a>
                        <a
                          href="/pdf/protect-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Protect PDF
                        </a>
                        <a
                          href="/pdf/unlock-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Unlock PDF
                        </a>
                        <a
                          href="/pdf/pdf-to-text"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          PDF to Text
                        </a>
                        <a
                          href="/pdf/split-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Split PDF
                        </a>
                        <a
                          href="/pdf/rearrange-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Rearrange PDF
                        </a>
                        <a
                          href="/pdf/crop-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Crop PDF
                        </a>
                        <a
                          href="/pdf/pdf-page-numbers"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          PDF Page Numbers
                        </a>
                        <a
                          href="/pdf/pdf-watermark"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          PDF Watermark
                        </a>
                        <a
                          href="/pdf/add-text-to-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Add Text to PDF
                        </a>
                        <a
                          href="/pdf/create-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Create PDF
                        </a>
                        <a
                          href="/pdf/images-to-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Images to PDF
                        </a>
                        <a
                          href="/pdf/pdf-to-jpg"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          PDF to JPG
                        </a>
                        <a
                          href="/pdf/pdf-to-png"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          PDF to PNG
                        </a>
                        <a
                          href="/pdf/pdf-editor"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          PDF Editor
                        </a>
                        <a
                          href="/pdf/esign-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          eSign PDF
                        </a>
                      </div>
                    </div>

                    {/* File Tools */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        File Tools
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <a
                          href="/file/json-to-xml"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          JSON to XML
                        </a>
                        <a
                          href="/file/xml-to-json"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          XML to JSON
                        </a>
                        <a
                          href="/file/csv-to-json"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          CSV to JSON
                        </a>
                        <a
                          href="/file/csv-to-xml"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          CSV to XML
                        </a>
                        <a
                          href="/file/xml-to-csv"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          XML to CSV
                        </a>
                        <a
                          href="/file/csv-to-excel"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          CSV to Excel
                        </a>
                        <a
                          href="/file/excel-to-csv"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Excel to CSV
                        </a>
                        <a
                          href="/file/xml-to-excel"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          XML to Excel
                        </a>
                        <a
                          href="/file/excel-to-xml"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Excel to XML
                        </a>
                        <a
                          href="/file/split-csv"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Split CSV
                        </a>
                        <a
                          href="/file/split-excel"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Split Excel
                        </a>
                        <a
                          href="/file/excel-to-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Excel to PDF
                        </a>
                      </div>
                    </div>

                    {/* General Links */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        General
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
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
