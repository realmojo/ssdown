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
            alt="SSDown 로고"
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
          aria-label="주요 메뉴"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-muted-foreground hover:text-primary data-[state=open]:text-primary"
              >
                소프트웨어 <ChevronDown className="h-4 w-4" />
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
                  검색 및 필터
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
                다운로더 <ChevronDown className="h-4 w-4" />
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
              <DropdownMenuItem asChild>
                <a href="/kuaishou" className="w-full cursor-pointer">
                  Kuaishou (快手)
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
                도구 <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[640px] p-5">
              <div className="grid grid-cols-4 gap-6">
                {/* Image Column */}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">이미지</p>
                  <a href="/image/image-compressor" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">이미지 압축</a>
                  <a href="/image/image-converter" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">이미지 변환</a>
                  <a href="/image/social-image-resizer" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">소셜 이미지 크기 변환</a>
                  <a href="/image/background-remover" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">배경 제거</a>
                  <a href="/image/watermark-remover" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">워터마크 제거</a>
                  <a href="/image/favicon-generator" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">파비콘 생성기</a>
                  <a href="/image/color-palette-extractor" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">색상 팔레트</a>
                  <a href="/image/thumbnail-generator" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">썸네일 생성기</a>
                  <a href="/image/crop-image" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">이미지 자르기</a>
                  <a href="/image/flip-image" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">이미지 뒤집기</a>
                  <a href="/image/pixelate-image" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">모자이크 처리</a>
                  <a href="/image/black-and-white" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">흑백 변환</a>
                  <a href="/image/add-text-to-image" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">텍스트 추가</a>
                  <a href="/image/add-border-to-image" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">테두리 추가</a>
                  <a href="/image/combine-images" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">이미지 합치기</a>
                  <a href="/image/collage-maker" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">콜라주 만들기</a>
                  <a href="/image/round-image-maker" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">원형 이미지</a>
                  <a href="/image/image-metadata-viewer" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">메타데이터 보기</a>
                  <a href="/image/blur-image" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">이미지 흐리게</a>
                  <a href="/image/icon-to-png" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">아이콘 → PNG</a>
                </div>

                {/* Video & PDF Column */}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">영상 & PDF</p>
                  <a href="/video-audio/video-to-mp3" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">영상 → MP3</a>
                  <a href="/video-audio/video-to-gif" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">영상 → GIF</a>
                  <a href="/video-audio/video-frame-extractor" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">프레임 추출</a>
                  <a href="/video-audio/audio-trimmer" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">오디오 자르기</a>
                  <a href="/video-audio/mute-video" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">영상 음소거</a>
                  <a href="/video-audio/gif-to-mp4" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">GIF → MP4</a>
                  <a href="/video-audio/trim-video" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">영상 자르기</a>
                  <a href="/video-audio/silence-remover" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">무음 제거</a>
                  <a href="/video-audio/video-converter" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">영상 변환</a>
                  <a href="/video-audio/video-compressor" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">영상 압축</a>
                  <a href="/video-audio/audio-converter" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">오디오 변환</a>
                  <div className="my-2 border-t border-border" />
                  <a href="/pdf/merge-pdf" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">PDF 합치기</a>
                  <a href="/pdf/rotate-pdf" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">PDF 회전</a>
                  <a href="/pdf/delete-pdf-pages" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">페이지 삭제</a>
                  <a href="/pdf/split-pdf" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">PDF 분할</a>
                  <a href="/pdf/compress-pdf" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">PDF 압축</a>
                  <a href="/pdf/pdf-to-word" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">PDF → 워드</a>
                  <a href="/pdf/pdf-to-excel" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">PDF → 엑셀</a>
                  <a href="/pdf/pdf-to-jpg" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">PDF → JPG</a>
                  <a href="/pdf/pdf-to-png" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">PDF → PNG</a>
                  <a href="/pdf/pdf-editor" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">PDF 편집기</a>
                  <a href="/pdf/esign-pdf" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">PDF 전자 서명</a>
                </div>

                {/* File Column */}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">파일</p>
                  <a href="/file/json-to-xml" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">JSON → XML</a>
                  <a href="/file/xml-to-json" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">XML → JSON</a>
                  <a href="/file/csv-to-json" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">CSV → JSON</a>
                  <a href="/file/csv-to-xml" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">CSV → XML</a>
                  <a href="/file/xml-to-csv" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">XML → CSV</a>
                  <a href="/file/csv-to-excel" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">CSV → 엑셀</a>
                  <a href="/file/excel-to-csv" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">엑셀 → CSV</a>
                  <a href="/file/xml-to-excel" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">XML → 엑셀</a>
                  <a href="/file/excel-to-xml" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">엑셀 → XML</a>
                  <a href="/file/split-csv" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">CSV 분할</a>
                  <a href="/file/split-excel" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">엑셀 분할</a>
                  <a href="/file/excel-to-pdf" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">엑셀 → PDF</a>
                </div>

                {/* Utility Column */}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">유틸리티</p>
                  <a href="/utility/qr-code-generator" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">QR 코드 생성기</a>
                  <a href="/utility/aspect-ratio-calculator" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">화면비 계산기</a>
                  <a href="/utility/word-counter" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">글자 수 세기</a>
                  <a href="/utility/og-debugger" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">OG 태그 검사기</a>
                  <a href="/utility/mp3-splitter" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">MP3 분할기</a>
                  <a href="/utility/password-generator" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">비밀번호 생성기</a>
                  <a href="/utility/color-converter" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">색상 변환기</a>
                  <a href="/utility/text-case-converter" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">대소문자 변환기</a>
                  <a href="/utility/timestamp-converter" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">타임스탬프 변환기</a>
                  <a href="/utility/base64-url-encoder" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">Base64 / URL 인코더</a>
                  <a href="/utility/qr-code-scanner" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">QR 코드 스캐너</a>
                  <a href="/utility/json-formatter" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">JSON 포매터</a>
                  <a href="/utility/diff-checker" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">텍스트 비교기</a>
                  <a href="/utility/uuid-generator" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">UUID 생성기</a>
                  <a href="/utility/lorem-ipsum-generator" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">로렘 입숨</a>
                  <div className="my-2 border-t border-border" />
                  <a href="/social-text/hashtag-generator" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">해시태그 생성기</a>
                  <a href="/social-text/instagram-line-break" className="block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors">인스타그램 줄바꿈</a>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <a href="https://upscale.ssdown.app" target="_blank">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              화질 개선
            </Button>
          </a>
          <a href="/blog">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              블로그
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
                  <span className="sr-only">메뉴 열기</span>
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
                        소프트웨어
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
                          검색 및 필터
                        </a>
                      </div>
                    </div>

                    {/* Downloaders */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        다운로더
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
                        <a
                          href="/kuaishou"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Kuaishou (快手)
                        </a>
                      </div>
                    </div>

                    {/* Tools */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        도구
                      </h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 ml-2 border-l pl-4 border-muted">
                        <a href="/image/image-compressor" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>이미지 압축</a>
                        <a href="/image/image-converter" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>이미지 변환</a>
                        <a href="/image/social-image-resizer" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>소셜 이미지 크기 변환</a>
                        <a href="/image/background-remover" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>배경 제거</a>
                        <a href="/image/watermark-remover" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>워터마크 제거</a>
                        <a href="/image/favicon-generator" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>파비콘 생성기</a>
                        <a href="/image/color-palette-extractor" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>색상 팔레트</a>
                        <a href="/image/thumbnail-generator" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>썸네일 생성기</a>
                        <a href="/image/crop-image" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>이미지 자르기</a>
                        <a href="/image/flip-image" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>이미지 뒤집기</a>
                        <a href="/image/pixelate-image" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>모자이크 처리</a>
                        <a href="/image/black-and-white" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>흑백 변환</a>
                        <a href="/image/add-text-to-image" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>텍스트 추가</a>
                        <a href="/image/add-border-to-image" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>테두리 추가</a>
                        <a href="/image/combine-images" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>이미지 합치기</a>
                        <a href="/image/collage-maker" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>콜라주 만들기</a>
                        <a href="/image/round-image-maker" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>원형 이미지</a>
                        <a href="/image/image-metadata-viewer" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>메타데이터 보기</a>
                        <a href="/image/blur-image" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>이미지 흐리게</a>
                        <a href="/image/icon-to-png" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>아이콘 → PNG</a>
                        <a href="/video-audio/video-to-mp3" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>영상 → MP3</a>
                        <a href="/video-audio/video-to-gif" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>영상 → GIF</a>
                        <a href="/video-audio/video-frame-extractor" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>프레임 추출</a>
                        <a href="/video-audio/audio-trimmer" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>오디오 자르기</a>
                        <a href="/video-audio/mute-video" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>영상 음소거</a>
                        <a href="/video-audio/gif-to-mp4" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>GIF → MP4</a>
                        <a href="/video-audio/trim-video" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>영상 자르기</a>
                        <a href="/video-audio/silence-remover" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>무음 제거</a>
                        <a href="/video-audio/video-converter" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>영상 변환</a>
                        <a href="/video-audio/video-compressor" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>영상 압축</a>
                        <a href="/video-audio/audio-converter" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>오디오 변환</a>
                        <a href="/pdf/merge-pdf" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>PDF 합치기</a>
                        <a href="/pdf/rotate-pdf" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>PDF 회전</a>
                        <a href="/pdf/delete-pdf-pages" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>페이지 삭제</a>
                        <a href="/pdf/split-pdf" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>PDF 분할</a>
                        <a href="/pdf/compress-pdf" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>PDF 압축</a>
                        <a href="/pdf/pdf-to-word" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>PDF → 워드</a>
                        <a href="/pdf/pdf-to-excel" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>PDF → 엑셀</a>
                        <a href="/pdf/pdf-to-jpg" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>PDF → JPG</a>
                        <a href="/pdf/pdf-to-png" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>PDF → PNG</a>
                        <a href="/pdf/pdf-editor" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>PDF 편집기</a>
                        <a href="/pdf/esign-pdf" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>PDF 전자 서명</a>
                        <a href="/file/json-to-xml" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>JSON → XML</a>
                        <a href="/file/xml-to-json" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>XML → JSON</a>
                        <a href="/file/csv-to-json" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>CSV → JSON</a>
                        <a href="/file/csv-to-xml" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>CSV → XML</a>
                        <a href="/file/xml-to-csv" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>XML → CSV</a>
                        <a href="/file/csv-to-excel" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>CSV → 엑셀</a>
                        <a href="/file/excel-to-csv" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>엑셀 → CSV</a>
                        <a href="/file/xml-to-excel" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>XML → 엑셀</a>
                        <a href="/file/excel-to-xml" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>엑셀 → XML</a>
                        <a href="/file/split-csv" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>CSV 분할</a>
                        <a href="/file/split-excel" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>엑셀 분할</a>
                        <a href="/file/excel-to-pdf" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>엑셀 → PDF</a>
                        <a href="/utility/qr-code-generator" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>QR 코드 생성기</a>
                        <a href="/utility/aspect-ratio-calculator" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>화면비 계산기</a>
                        <a href="/utility/word-counter" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>글자 수 세기</a>
                        <a href="/utility/og-debugger" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>OG 태그 검사기</a>
                        <a href="/utility/mp3-splitter" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>MP3 분할기</a>
                        <a href="/utility/password-generator" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>비밀번호 생성기</a>
                        <a href="/utility/color-converter" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>색상 변환기</a>
                        <a href="/utility/text-case-converter" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>대소문자 변환기</a>
                        <a href="/utility/timestamp-converter" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>타임스탬프 변환기</a>
                        <a href="/utility/base64-url-encoder" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>Base64 / URL 인코더</a>
                        <a href="/utility/qr-code-scanner" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>QR 코드 스캐너</a>
                        <a href="/utility/json-formatter" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>JSON 포매터</a>
                        <a href="/utility/diff-checker" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>텍스트 비교기</a>
                        <a href="/utility/uuid-generator" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>UUID 생성기</a>
                        <a href="/utility/lorem-ipsum-generator" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>로렘 입숨</a>
                        <a href="/social-text/hashtag-generator" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>해시태그 생성기</a>
                        <a href="/social-text/instagram-line-break" className="text-sm hover:text-primary transition-colors py-0.5 text-muted-foreground" onClick={() => setIsOpen(false)}>인스타그램 줄바꿈</a>
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
                          화질 개선
                        </a>
                        <a
                          href="/blog"
                          className="text-base font-medium hover:text-primary transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          블로그
                        </a>
                      </div>
                    </div>

                    {/* Mobile Donate Button */}
                    <div className="mt-auto pt-4 border-t pb-2">
                      <PaypalDonateButton className="w-full justify-center" />
                    </div>

                    {/* Settings - Theme Switcher */}
                    <div className="flex items-center justify-between py-4 border-t">
                      <span className="text-sm font-medium">테마 설정</span>
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
