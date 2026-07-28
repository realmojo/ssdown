"use client";

import {
  Heart,
  MessageCircle,
  Repeat,
  Eye,
  BookOpen,
  Lightbulb,
  Info,
  CheckCircle2,
  Download,
} from "lucide-react";
import { XTechInsights } from "./x-tech-insights";
import {
  VideoDownloaderClient,
  ThemeConfig,
  StatsConfig,
} from "./video-saver-client";
import { XIcon } from "@/components/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface XClientProps {
  dict: any;
}

export function XClient({ dict }: XClientProps) {
  const theme: ThemeConfig = {
    bgFrom: "from-blue-50",
    bgTo: "to-white dark:from-gray-900 dark:to-gray-950",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-500",
    titleFrom: "from-blue-500",
    titleTo: "to-blue-700",
    cardBorder: "border-blue-100 dark:border-blue-900/50",
    topBarGradient: "bg-gradient-to-r from-blue-400 to-blue-600",
    buttonSolid: "bg-blue-500 hover:bg-blue-600",
    inputFocus: "focus:ring-blue-500",
    downloadButtonHover: "hover:bg-blue-50",
    downloadButtonText: "text-blue-600 dark:text-blue-400",
    indicatorColor: "bg-green-500",
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
      icon: Repeat,
      color: "text-green-500",
      key: "shareCount",
      getValue: (stats) => (stats.shareCount || 0) + (stats.quoteCount || 0),
    },
  ];

  const guideSection = (
    <div className="w-full max-w-6xl mx-auto mt-20 px-4 space-y-16">
      {/* Step-by-Step Guide */}
      <section>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.x?.guide_title || "X(트위터) 영상 다운로드 방법"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {dict?.x?.guide_desc ||
              "아래 단계만 따라 하면 X(트위터)의 어떤 영상이든 고화질로 내려받을 수 있습니다."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: dict?.x?.step1_title || "영상 찾기",
              desc:
                dict?.x?.step1_desc ||
                "X(트위터)에서 내려받을 영상이 담긴 게시물을 찾으세요. 사용자나 해시태그를 검색하거나 타임라인을 둘러봐도 됩니다.",
              icon: Eye,
            },
            {
              step: 2,
              title: dict?.x?.step2_title || "링크 복사",
              desc:
                dict?.x?.step2_desc ||
                "게시물의 '공유' 버튼(또는 점 세 개 메뉴)을 누르고 '링크 복사'를 선택하세요. 주소가 클립보드에 자동으로 복사됩니다.",
              icon: MessageCircle,
            },
            {
              step: 3,
              title: dict?.x?.step3_title || "붙여넣고 다운로드",
              desc:
                dict?.x?.step3_desc ||
                "복사한 링크를 위 입력창에 붙여넣고 '다운로드'를 누른 뒤 원하는 화질을 고르세요. 영상이 기기에 바로 저장됩니다.",
              icon: Download,
            },
          ].map((step) => (
            <Card
              key={step.step}
              className="border-blue-100 dark:border-blue-900/50"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold">
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
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
            <Lightbulb className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.x?.tips_title || "활용 팁"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.x?.tips_desc ||
              "X 영상 다운로드를 더 잘 활용하는 팁입니다."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: dict?.x?.tip1_title || "알맞은 화질 고르기",
              desc:
                dict?.x?.tip1_desc ||
                "가장 좋은 화질로 보려면 제공되는 최고 화질을 고르세요. 화질이 높을수록 내려받는 데 오래 걸리지만 훨씬 선명합니다.",
              icon: CheckCircle2,
            },
            {
              title: dict?.x?.tip2_title || "GIF도 다운로드",
              desc:
                dict?.x?.tip2_desc ||
                "SSDown은 X의 움직이는 GIF 다운로드도 지원합니다. GIF가 담긴 게시물 링크를 붙여넣으면 MP4 영상 파일로 내려받을 수 있습니다.",
              icon: CheckCircle2,
            },
            {
              title: dict?.x?.tip3_title || "영상 포함 여부 확인",
              desc:
                dict?.x?.tip3_desc ||
                "게시물에 실제로 영상이 있는지 확인하세요. 이미지나 글만 있는 게시물은 영상 파일로 내려받을 수 없습니다.",
              icon: CheckCircle2,
            },
            {
              title: dict?.x?.tip4_title || "저작권 존중",
              desc:
                dict?.x?.tip4_desc ||
                "개인적인 용도로만 내려받으세요. 창작자의 허락 없이 재배포하거나 상업적으로 이용하지 마세요.",
              icon: CheckCircle2,
            },
          ].map((tip, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
            >
              <div className="flex-shrink-0">
                <tip.icon className="w-6 h-6 text-blue-500" />
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
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <Info className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.x?.features_title || "X에서 내려받을 수 있는 것"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.x?.features_desc ||
              "SSDown은 X(트위터)의 다양한 미디어를 지원합니다."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: dict?.x?.feature1_title || "일반 영상",
              desc:
                dict?.x?.feature1_desc ||
                "일반 영상 게시물을 원본 화질 그대로 MP4로 내려받으세요.",
            },
            {
              title: dict?.x?.feature2_title || "움직이는 GIF",
              desc:
                dict?.x?.feature2_desc ||
                "변환 후 다운로드 animated GIFs from tweets as MP4 video files.",
            },
            {
              title: dict?.x?.feature3_title || "여러 화질 지원",
              desc:
                dict?.x?.feature3_desc ||
                "HD, 풀HD, 제공되는 경우 4K까지 원하는 화질을 고르세요.",
            },
            {
              title: dict?.x?.feature4_title || "영상 정보",
              desc:
                dict?.x?.feature4_desc ||
                "내려받기 전에 조회수, 좋아요, 리트윗, 답글 등 영상 정보를 확인하세요.",
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

      <XTechInsights />

      {/* FAQ Section */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.qna?.title || "자주 묻는 질문"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.qna?.desc ||
              "Find answers to common questions about downloading videos from X (Twitter)."}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {[1, 2, 3, 4, 5].map((i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">
                {dict?.qna?.[`faq_${i}_q`] || "Question"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.qna?.[`faq_${i}_a`] || "Answer"}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* X/Twitter Platform Deep Dive */}
      <section className="bg-white dark:bg-gray-950 rounded-2xl border p-8 md:p-12">
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          X(트위터) 영상 콘텐츠 이해하기
        </h2>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>
            X(옛 트위터)는 영상 공유 플랫폼으로 크게 발전했습니다. 처음에는 짧은 클립만 올릴 수 있었지만, 지금은 프리미엄 사용자의 경우 최대 2시간 20분 길이의 영상을 지원해 속보 영상부터 긴 콘텐츠와 라이브 방송까지 폭넓게 다룰 수 있습니다.
          </p>
          <h3 className="text-xl font-semibold text-foreground">X의 영상 형식</h3>
          <p>
            X는 MP4(H.264)와 MOV 등 여러 영상 형식을 지원합니다. 영상을 올리면 X는 이를 여러 화질로 자동 변환하는데, 보통 360p에서 1080p 이상까지입니다. SSDown은 사용할 수 있는 모든 화질을 찾아내 원하는 것을 고를 수 있게 해 줍니다. 모바일 시청용으로 용량이 작은 파일이 필요하든, 보관용으로 최고 화질이 필요하든 선택하실 수 있습니다.
          </p>
          <h3 className="text-xl font-semibold text-foreground">GIF와 움직이는 콘텐츠</h3>
          <p>
            X에서 "GIF"로 보이는 것은 사실 짧게 반복되는 MP4 영상입니다. X는 효율을 위해 업로드된 GIF 파일을 MP4 형식으로 변환합니다. SSDown으로 X의 GIF를 내려받으면 어떤 기기에서도 매끄럽게 재생되는 MP4 파일을 받게 됩니다. MP4가 용량은 작고 화질은 좋기 때문에 원래 GIF 형식보다 오히려 낫습니다.
          </p>
          <h3 className="text-xl font-semibold text-foreground">알아둘 콘텐츠 정책</h3>
          <p>
            X의 이용약관은 플랫폼에서 콘텐츠를 볼 수 있는 제한적인 권한을 이용자에게 부여합니다. 개인적인 참고, 오프라인 시청, 교육 목적의 다운로드는 일반적으로 문제되지 않습니다. 다만 출처 없이 남의 콘텐츠를 다시 올리거나 상업적으로 이용하거나 허락 없이 배포하면 X의 정책과 저작권법을 모두 위반할 수 있습니다. 언제나 원작자의 권리를 존중해 주세요.
          </p>
        </div>
      </section>
    </div>
  );

  const faqSection = guideSection;

  const emptyState = (
    <div className="grid gap-6 sm:grid-cols-3 w-full pt-12 text-left">
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.common?.copy_link || "링크 복사"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.x?.desc_copy ||
            "Find the tweet you want to download and copy its link."}
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">주소 붙여넣기</p>
        <p className="text-muted-foreground text-sm">
          {dict?.x?.desc_paste ||
            "Paste the link into the input box above and hit download."}
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.common?.save_video || "Save Video"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.x?.desc_save ||
            "Choose your preferred quality and save the video to your device."}
        </p>
      </div>
    </div>
  );

  return (
    <VideoDownloaderClient
      type="x"
      dict={dict}
      theme={theme}
      icon={XIcon}
      title={dict?.x?.title || "X (Twitter) Saver"}
      subtitle={
        dict?.x?.subtitle ||
        "Save X (Twitter) videos and GIFs in MP4 format. 고화질, free, and unlimited."
      }
      placeholder={dict?.x?.placeholder || "Paste X (Twitter) link here..."}
      apiEndpoint="/api/x"
      downloadEndpoint="/api/x/download"
      noVideoError="이 트윗에서 영상을 찾지 못했습니다. 영상이 포함되어 있는지 확인해 주세요."
      formatContent={(content) => content.replace(/https:\/\/t\.co\/\w+/g, "")}
      statsConfig={statsConfig}
      emptyState={emptyState}
      downloadFileName={(quality) => `x_video_${quality}.mp4`}
      faqSection={faqSection}
      slotId1="3265765425"
      slotId2="3265765425"
    />
  );
}
