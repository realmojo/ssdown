"use client";

import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  BookOpen,
  Lightbulb,
  Info,
  CheckCircle2,
  Download,
  Music,
} from "lucide-react";
import { TikTokTechInsights } from "./tiktok-tech-insights";
import {
  VideoDownloaderClient,
  ThemeConfig,
  StatsConfig,
} from "./video-saver-client";
import { TikTokIcon } from "@/components/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TikTokClientProps {
  dict: any;
}

export function TikTokClient({ dict }: TikTokClientProps) {
  const theme: ThemeConfig = {
    bgFrom: "from-pink-50",
    bgTo: "to-white dark:from-gray-900 dark:to-gray-950",
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-500",
    titleFrom: "from-pink-500",
    titleTo: "to-cyan-500",
    cardBorder: "border-pink-100 dark:border-pink-900/50",
    topBarGradient: "bg-gradient-to-r from-pink-500 to-cyan-500",
    buttonGradient:
      "bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600",
    inputFocus: "focus:ring-pink-500",
    downloadButtonHover: "hover:bg-pink-50",
    downloadButtonText: "text-pink-600 dark:text-pink-400",
    indicatorColor: "bg-pink-500",
  };

  const statsConfig: StatsConfig[] = [
    {
      icon: Eye,
      color: "text-muted-foreground",
      key: "viewCount",
    },
    {
      icon: Heart,
      color: "text-pink-500",
      key: "favoriteCount",
    },
    {
      icon: MessageCircle,
      color: "text-blue-500",
      key: "replyCount",
    },
    {
      icon: Share2,
      color: "text-green-500",
      key: "shareCount",
    },
  ];

  const guideSection = (
    <div className="w-full max-w-6xl mx-auto mt-3 px-4 space-y-3">
      {/* Step-by-Step Guide */}
      <section>
        <div className="mb-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 mb-4">
            <BookOpen className="w-8 h-8 text-pink-500" />
          </div>
          <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
            {dict?.tiktok?.guide_title ||
              "틱톡 영상 워터마크 없이 내려받는 방법"}
          </h2>
          <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
            {dict?.tiktok?.guide_desc ||
              "거슬리는 워터마크 없이 틱톡 영상을 고화질로 내려받으세요."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-2">
          {[
            {
              step: 1,
              title: dict?.tiktok?.step1_title || "틱톡 영상 열기",
              desc:
                dict?.tiktok?.step1_desc ||
                "틱톡 앱이나 웹사이트에서 내려받을 영상을 찾은 뒤 영상 아래의 '공유' 버튼을 누르세요.",
              icon: Eye,
            },
            {
              step: 2,
              title: dict?.tiktok?.step2_title || "영상 링크 복사",
              desc:
                dict?.tiktok?.step2_desc ||
                "공유 메뉴에서 '링크 복사'를 선택하세요. 틱톡 영상 주소가 클립보드에 자동으로 복사됩니다.",
              icon: Share2,
            },
            {
              step: 3,
              title: dict?.tiktok?.step3_title || "워터마크 없이 다운로드",
              desc:
                dict?.tiktok?.step3_desc ||
                "링크를 SSDown에 붙여넣고 '다운로드'를 누르면 워터마크 없는 MP4 영상을 받을 수 있습니다. 오디오만 MP3로 추출할 수도 있습니다.",
              icon: Download,
            },
          ].map((step) => (
            <Card
              key={step.step}
              className="border-pink-100 dark:border-pink-900/50"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-500 text-white font-bold">
                    {step.step}
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 활용 팁 */}
      <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
            <Lightbulb className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
            {dict?.tiktok?.tips_title || "틱톡 다운로드 팁"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.tiktok?.tips_desc ||
              "틱톡 다운로드를 200% 활용하는 팁입니다."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-2">
          {[
            {
              title: dict?.tiktok?.tip1_title || "워터마크 없음 보장",
              desc:
                dict?.tiktok?.tip1_desc ||
                "SSDown이 틱톡 워터마크를 자동으로 제거해, 다시 올리거나 편집하기 좋은 깔끔한 영상을 제공합니다.",
              icon: CheckCircle2,
            },
            {
              title: dict?.tiktok?.tip2_title || "오디오를 MP3로 추출",
              desc:
                dict?.tiktok?.tip2_desc ||
                "마음에 드는 틱톡 사운드가 있나요? 오디오만 MP3로 내려받아 직접 만드는 영상이나 음악 보관함에 활용하세요.",
              icon: Music,
            },
            {
              title: dict?.tiktok?.tip3_title || "고화질 다운로드",
              desc:
                dict?.tiktok?.tip3_desc ||
                "최대 1080p HD 해상도의 원본 화질 그대로 받으세요. 추가 압축도, 화질 손실도 없습니다.",
              icon: CheckCircle2,
            },
            {
              title: dict?.tiktok?.tip4_title || "창작자 존중",
              desc:
                dict?.tiktok?.tip4_desc ||
                "틱톡 영상을 다시 올릴 때는 언제나 원작자를 밝혀 주세요. 팔로우하고 소통하며 창작자를 응원해 주세요.",
              icon: Heart,
            },
          ].map((tip, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
            >
              <div className="flex-shrink-0">
                <tip.icon className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{tip.title}</h3>
                <p className="text-sm text-muted-foreground">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features & Capabilities */}
      <section>
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <Info className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
            {dict?.tiktok?.features_title || "틱톡 다운로드 기능"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.tiktok?.features_desc ||
              "틱톡 콘텐츠를 내려받는 데 필요한 모든 기능입니다."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            {
              title: dict?.tiktok?.feature1_title || "워터마크 없는 영상",
              desc:
                dict?.tiktok?.feature1_desc ||
                "플랫폼 워터마크 없이 틱톡 영상을 내려받아 깔끔한 콘텐츠로 활용하세요.",
            },
            {
              title: dict?.tiktok?.feature2_title || "MP4 & MP3 형식",
              desc:
                dict?.tiktok?.feature2_desc ||
                "영상 전체(MP4)를 내려받거나 오디오만(MP3) 추출하는 것 중에서 고르세요.",
            },
            {
              title: dict?.tiktok?.feature3_title || "HD 화질",
              desc:
                dict?.tiktok?.feature3_desc ||
                "틱톡의 원본 화질을 유지한 채 최대 1080p 고화질로 받으세요.",
            },
            {
              title: dict?.tiktok?.feature4_title || "빠른 다운로드",
              desc:
                dict?.tiktok?.feature4_desc ||
                "최적화된 서버로 긴 대기나 순번 없이 빠르게 내려받을 수 있습니다.",
            },
          ].map((feature, idx) => (
            <Card key={idx} className="text-center">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <TikTokTechInsights />

      {/* FAQ Section */}
      <section>
        <div className="text-center mb-2">
          <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
            {dict?.qna_tiktok?.title || "TikTok FAQ"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.qna_tiktok?.desc ||
              "Common questions about downloading TikTok videos without watermark."}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {[1, 2, 3, 4, 5].map((i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">
                {dict?.qna_tiktok?.[`faq_${i}_q`] || "Question"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.qna_tiktok?.[`faq_${i}_a`] || "Answer"}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* TikTok Platform Deep Dive */}
      <section className="bg-white dark:bg-gray-950 rounded-2xl border p-8 md:p-12">
        <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
          틱톡 영상 다운로드 이해하기
        </h2>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-2 text-muted-foreground">
          <p>
            틱톡은 10억 명이 넘는 사용자가 매일 콘텐츠를 만들고 공유하는 세계에서 가장 인기 있는 숏폼 영상 플랫폼이 되었습니다. 틱톡이 영상 콘텐츠를 다루는 방식을 알아두면 다운로드를 훨씬 잘 활용할 수 있습니다.
          </p>
          <h3 className="text-xl font-semibold text-foreground">틱톡 워터마크의 원리</h3>
          <p>
            틱톡은 공식 앱에서 영상을 보거나 저장할 때 움직이는 워터마크를 덧씌웁니다. 보통 창작자의 사용자명과 틱톡 로고가 표시됩니다. 이 워터마크는 원본 영상 파일에 새겨진 것이 아니라 재생과 내보내기 과정에서 얹히는 레이어입니다. SSDown은 워터마크가 적용되기 전의 원본 영상 스트림에 접근하므로 깨끗한 영상을 내려받을 수 있습니다.
          </p>
          <h3 className="text-xl font-semibold text-foreground">틱톡 영상 화질과 형식</h3>
          <p>
            틱톡 영상은 보통 세로 형식(9:16 비율)에 최대 1080x1920 픽셀 해상도로 업로드됩니다. 플랫폼은 H.264 영상 코덱과 AAC 오디오를 MP4 컨테이너에 담아 사용합니다. SSDown은 다운로드 시 재인코딩이나 압축 없이 원본 해상도와 화질을 그대로 유지하므로, 창작자가 올린 것과 완전히 같은 화질을 받게 됩니다.
          </p>
          <h3 className="text-xl font-semibold text-foreground">오디오 추출 from TikTok</h3>
          <p>
            틱톡의 독특한 점 하나는 방대한 유행 음원 라이브러리입니다. SSDown을 이용하면 틱톡 영상에서 오디오만 MP3 파일로 추출할 수 있습니다. 곡을 찾으려는 창작자, 유행하는 음원 흐름을 살펴보려는 음악가, 특정 사운드가 마음에 든 분 모두에게 유용합니다. 다만 추출한 오디오에도 영상 전체와 동일한 저작권 문제가 적용된다는 점을 유의하세요.
          </p>
          <h3 className="text-xl font-semibold text-foreground">틱톡 콘텐츠의 올바른 이용</h3>
          <p>
            틱톡 창작자들은 콘텐츠에 많은 시간과 창의력을 쏟습니다. 틱톡 영상을 내려받을 때는 언제나 창작자의 의도를 고려하세요. 콘텐츠를 공유하거나 인용할 계획이라면 사용자명을 언급해 원작자를 밝혀 주세요. 남의 콘텐츠를 자기 것처럼 다시 올리지 말고, 창작자의 명시적 허락 없이 상업적으로 이용하지 마세요.
          </p>
        </div>
      </section>
    </div>
  );

  const faqSection = guideSection;

  const emptyState = (
    <div className="grid gap-2 sm:grid-cols-2 w-full pt-12 text-left">
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.tiktok?.no_watermark || "No Watermark"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.tiktok?.desc_watermark ||
            "Get clear videos without the annoying TikTok watermark overlay."}
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.tiktok?.mp4_mp3 || "MP4 & MP3"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.tiktok?.desc_audio ||
            "Choose to download the video or just the audio track as MP3."}
        </p>
      </div>
    </div>
  );

  return (
    <VideoDownloaderClient
      type="tiktok"
      dict={dict}
      theme={theme}
      icon={TikTokIcon}
      title={dict?.tiktok?.title || "틱톡 영상 다운로드"}
      subtitle={
        dict?.tiktok?.subtitle ||
        "틱톡 영상을 워터마크 없이 내려받으세요. MP4 영상과 MP3 음원을 바로 저장합니다."
      }
      placeholder={dict?.tiktok?.placeholder || "틱톡 링크를 붙여넣으세요…"}
      apiEndpoint="/api/tiktok"
      downloadEndpoint="/api/tiktok/download"
      noVideoError="이 틱톡 게시물에서 영상을 찾지 못했습니다. 영상이 포함되어 있는지 확인해 주세요."
      formatQuality={(bitrate) =>
        typeof bitrate === "string" ? bitrate : `${bitrate}p`
      }
      statsConfig={statsConfig}
      emptyState={emptyState}
      downloadFileName={(quality) => `tiktok_video_${quality}.mp4`}
      faqSection={faqSection}
      slotId1="1620870631"
      slotId2="1620870631"
    />
  );
}
