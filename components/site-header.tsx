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
                Image <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/image-compressor"
                  className="w-full cursor-pointer"
                >
                  Image Compressor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/image-converter"
                  className="w-full cursor-pointer"
                >
                  Image Converter
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/social-image-resizer"
                  className="w-full cursor-pointer"
                >
                  Social Image Resizer
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/background-remover"
                  className="w-full cursor-pointer"
                >
                  Background Remover
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/watermark-remover"
                  className="w-full cursor-pointer"
                >
                  Watermark Remover
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/favicon-generator"
                  className="w-full cursor-pointer"
                >
                  Favicon Generator
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/color-palette-extractor"
                  className="w-full cursor-pointer"
                >
                  Color Palette Extractor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/thumbnail-generator"
                  className="w-full cursor-pointer"
                >
                  Thumbnail Generator
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/crop-image"
                  className="w-full cursor-pointer"
                >
                  Crop Image
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/flip-image"
                  className="w-full cursor-pointer"
                >
                  Flip Image
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/pixelate-image"
                  className="w-full cursor-pointer"
                >
                  Pixelate Image
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/black-and-white"
                  className="w-full cursor-pointer"
                >
                  Black & White
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/add-text-to-image"
                  className="w-full cursor-pointer"
                >
                  Add Text to Image
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/add-border-to-image"
                  className="w-full cursor-pointer"
                >
                  Add Border to Image
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/combine-images"
                  className="w-full cursor-pointer"
                >
                  Combine Images
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/collage-maker"
                  className="w-full cursor-pointer"
                >
                  Collage Maker
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/round-image-maker"
                  className="w-full cursor-pointer"
                >
                  Round Image Maker
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/image-metadata-viewer"
                  className="w-full cursor-pointer"
                >
                  Image Metadata Viewer
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/blur-image"
                  className="w-full cursor-pointer"
                >
                  Blur Image
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/image/icon-to-png"
                  className="w-full cursor-pointer"
                >
                  Icon to PNG
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
                Video & Audio <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/video-audio/video-to-mp3"
                  className="w-full cursor-pointer"
                >
                  Video to MP3
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/video-audio/video-to-gif"
                  className="w-full cursor-pointer"
                >
                  Video to GIF
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/video-audio/video-frame-extractor"
                  className="w-full cursor-pointer"
                >
                  Video Frame Extractor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/video-audio/audio-trimmer"
                  className="w-full cursor-pointer"
                >
                  Audio Trimmer
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
                Social & Text <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/social-text/hashtag-generator"
                  className="w-full cursor-pointer"
                >
                  Hashtag Generator
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/social-text/instagram-line-break"
                  className="w-full cursor-pointer"
                >
                  Instagram Line Break
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
                Utility <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/utility/youtube-thumbnail"
                  className="w-full cursor-pointer"
                >
                  YT Thumbnail Downloader
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/utility/youtube-preview"
                  className="w-full cursor-pointer"
                >
                  YT Preview Editor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/utility/qr-code-generator"
                  className="w-full cursor-pointer"
                >
                  QR Code Generator
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/utility/aspect-ratio-calculator"
                  className="w-full cursor-pointer"
                >
                  Aspect Ratio Calculator
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
                PDF <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-[70vh] overflow-y-auto"
            >
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/merge-pdf"
                  className="w-full cursor-pointer"
                >
                  Merge PDF
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/rotate-pdf"
                  className="w-full cursor-pointer"
                >
                  Rotate PDF
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/delete-pdf-pages"
                  className="w-full cursor-pointer"
                >
                  Delete PDF Pages
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/protect-pdf"
                  className="w-full cursor-pointer"
                >
                  Protect PDF
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/unlock-pdf"
                  className="w-full cursor-pointer"
                >
                  Unlock PDF
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/pdf-to-text"
                  className="w-full cursor-pointer"
                >
                  PDF to Text
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/split-pdf"
                  className="w-full cursor-pointer"
                >
                  Split PDF
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/rearrange-pdf"
                  className="w-full cursor-pointer"
                >
                  Rearrange PDF
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/crop-pdf"
                  className="w-full cursor-pointer"
                >
                  Crop PDF
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/pdf-page-numbers"
                  className="w-full cursor-pointer"
                >
                  PDF Page Numbers
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/pdf-watermark"
                  className="w-full cursor-pointer"
                >
                  PDF Watermark
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/add-text-to-pdf"
                  className="w-full cursor-pointer"
                >
                  Add Text to PDF
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/create-pdf"
                  className="w-full cursor-pointer"
                >
                  Create PDF
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/images-to-pdf"
                  className="w-full cursor-pointer"
                >
                  Images to PDF
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/pdf-to-jpg"
                  className="w-full cursor-pointer"
                >
                  PDF to JPG
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/pdf-to-png"
                  className="w-full cursor-pointer"
                >
                  PDF to PNG
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/pdf-editor"
                  className="w-full cursor-pointer"
                >
                  PDF Editor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/pdf/esign-pdf"
                  className="w-full cursor-pointer"
                >
                  eSign PDF
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
                File <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/file/json-to-xml"
                  className="w-full cursor-pointer"
                >
                  JSON to XML
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/file/xml-to-json"
                  className="w-full cursor-pointer"
                >
                  XML to JSON
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/file/csv-to-json"
                  className="w-full cursor-pointer"
                >
                  CSV to JSON
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/file/csv-to-xml"
                  className="w-full cursor-pointer"
                >
                  CSV to XML
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/file/xml-to-csv"
                  className="w-full cursor-pointer"
                >
                  XML to CSV
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/file/csv-to-excel"
                  className="w-full cursor-pointer"
                >
                  CSV to Excel
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/file/excel-to-csv"
                  className="w-full cursor-pointer"
                >
                  Excel to CSV
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/file/xml-to-excel"
                  className="w-full cursor-pointer"
                >
                  XML to Excel
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/file/excel-to-xml"
                  className="w-full cursor-pointer"
                >
                  Excel to XML
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/file/split-csv"
                  className="w-full cursor-pointer"
                >
                  Split CSV
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/file/split-excel"
                  className="w-full cursor-pointer"
                >
                  Split Excel
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  prefetch={false}
                  href="/file/excel-to-pdf"
                  className="w-full cursor-pointer"
                >
                  Excel to PDF
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
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Platform Tools
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <Link
                          prefetch={false}
                          href="/x"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict?.twitter || "X (Twitter)"}
                        </Link>
                        <Link
                          prefetch={false}
                          href="/tiktok"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict?.tiktok || "TikTok"}
                        </Link>
                        <Link
                          prefetch={false}
                          href="/instagram"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict?.instagram?.nav || "Instagram"}
                        </Link>
                        <Link
                          prefetch={false}
                          href="/facebook"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict?.facebook?.nav || "Facebook"}
                        </Link>
                        <Link
                          prefetch={false}
                          href="/dailymotion"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict?.dailymotion?.nav || "Dailymotion"}
                        </Link>
                        <Link
                          prefetch={false}
                          href="/9gag"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict?.["9gag"]?.nav || "9GAG"}
                        </Link>
                      </div>
                    </div>

                    {/* Image Tools */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Image Tools
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <Link
                          prefetch={false}
                          href="/image/image-compressor"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Image Compressor
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/image-converter"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Image Converter
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/social-image-resizer"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Social Image Resizer
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/background-remover"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Background Remover
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/watermark-remover"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Watermark Remover
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/favicon-generator"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Favicon Generator
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/color-palette-extractor"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Color Palette Extractor
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/thumbnail-generator"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Thumbnail Generator
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/crop-image"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Crop Image
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/flip-image"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Flip Image
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/pixelate-image"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Pixelate Image
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/black-and-white"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Black & White
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/add-text-to-image"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Add Text to Image
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/add-border-to-image"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Add Border to Image
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/combine-images"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Combine Images
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/collage-maker"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Collage Maker
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/round-image-maker"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Round Image Maker
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/image-metadata-viewer"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Image Metadata Viewer
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/blur-image"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Blur Image
                        </Link>
                        <Link
                          prefetch={false}
                          href="/image/icon-to-png"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Icon to PNG
                        </Link>
                      </div>
                    </div>

                    {/* Video & Audio */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Video & Audio
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <Link
                          prefetch={false}
                          href="/video-audio/video-to-mp3"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Video to MP3
                        </Link>
                        <Link
                          prefetch={false}
                          href="/video-audio/video-to-gif"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Video to GIF
                        </Link>
                        <Link
                          prefetch={false}
                          href="/video-audio/video-frame-extractor"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Video Frame Extractor
                        </Link>
                        <Link
                          prefetch={false}
                          href="/video-audio/audio-trimmer"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Audio Trimmer
                        </Link>
                      </div>
                    </div>

                    {/* Social & Text */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Social & Text
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <Link
                          prefetch={false}
                          href="/social-text/hashtag-generator"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Hashtag Generator
                        </Link>
                        <Link
                          prefetch={false}
                          href="/social-text/instagram-line-break"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Instagram Line Break
                        </Link>
                      </div>
                    </div>

                    {/* Utility */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Utility
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <Link
                          prefetch={false}
                          href="/utility/youtube-thumbnail"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          YT Thumbnail Downloader
                        </Link>
                        <Link
                          prefetch={false}
                          href="/utility/youtube-preview"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          YT Preview Editor
                        </Link>
                        <Link
                          prefetch={false}
                          href="/utility/qr-code-generator"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          QR Code Generator
                        </Link>
                        <Link
                          prefetch={false}
                          href="/utility/aspect-ratio-calculator"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Aspect Ratio Calculator
                        </Link>
                      </div>
                    </div>

                    {/* PDF Tools */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        PDF Tools
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <Link
                          prefetch={false}
                          href="/pdf/merge-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Merge PDF
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/rotate-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Rotate PDF
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/delete-pdf-pages"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Delete PDF Pages
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/protect-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Protect PDF
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/unlock-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Unlock PDF
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/pdf-to-text"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          PDF to Text
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/split-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Split PDF
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/rearrange-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Rearrange PDF
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/crop-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Crop PDF
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/pdf-page-numbers"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          PDF Page Numbers
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/pdf-watermark"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          PDF Watermark
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/add-text-to-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Add Text to PDF
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/create-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Create PDF
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/images-to-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Images to PDF
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/pdf-to-jpg"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          PDF to JPG
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/pdf-to-png"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          PDF to PNG
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/pdf-editor"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          PDF Editor
                        </Link>
                        <Link
                          prefetch={false}
                          href="/pdf/esign-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          eSign PDF
                        </Link>
                      </div>
                    </div>

                    {/* File Tools */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        File Tools
                      </h4>
                      <div className="flex flex-col gap-3 ml-2 border-l pl-4 border-muted">
                        <Link
                          prefetch={false}
                          href="/file/json-to-xml"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          JSON to XML
                        </Link>
                        <Link
                          prefetch={false}
                          href="/file/xml-to-json"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          XML to JSON
                        </Link>
                        <Link
                          prefetch={false}
                          href="/file/csv-to-json"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          CSV to JSON
                        </Link>
                        <Link
                          prefetch={false}
                          href="/file/csv-to-xml"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          CSV to XML
                        </Link>
                        <Link
                          prefetch={false}
                          href="/file/xml-to-csv"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          XML to CSV
                        </Link>
                        <Link
                          prefetch={false}
                          href="/file/csv-to-excel"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          CSV to Excel
                        </Link>
                        <Link
                          prefetch={false}
                          href="/file/excel-to-csv"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Excel to CSV
                        </Link>
                        <Link
                          prefetch={false}
                          href="/file/xml-to-excel"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          XML to Excel
                        </Link>
                        <Link
                          prefetch={false}
                          href="/file/excel-to-xml"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Excel to XML
                        </Link>
                        <Link
                          prefetch={false}
                          href="/file/split-csv"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Split CSV
                        </Link>
                        <Link
                          prefetch={false}
                          href="/file/split-excel"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Split Excel
                        </Link>
                        <Link
                          prefetch={false}
                          href="/file/excel-to-pdf"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Excel to PDF
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
                          onClick={() => setIsOpen(false)}
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
