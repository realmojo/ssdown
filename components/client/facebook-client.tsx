"use client";

import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Video,
  BookOpen,
  Lightbulb,
  Info,
  CheckCircle2,
  Download,
  VideoIcon,
} from "lucide-react";
import { FacebookTechInsights } from "./facebook-tech-insights";
import {
  VideoDownloaderClient,
  ThemeConfig,
  StatsConfig,
} from "./video-saver-client";
import { FacebookIcon } from "@/components/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FacebookClientProps {
  dict: any;
}

export function FacebookClient({ dict }: FacebookClientProps) {
  const theme: ThemeConfig = {
    bgFrom: "from-blue-50",
    bgTo: "to-white dark:from-gray-900 dark:to-gray-950",
    iconBg: "bg-blue-600",
    iconColor: "text-white",
    titleFrom: "from-blue-600",
    titleVia: "via-blue-500",
    titleTo: "to-blue-400",
    cardBorder: "border-blue-100 dark:border-blue-900/50",
    topBarGradient: "bg-gradient-to-r from-blue-600 to-blue-400",
    buttonGradient:
      "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600",
    inputFocus: "focus:ring-blue-500",
    downloadButtonHover: "hover:bg-blue-50",
    downloadButtonText: "text-blue-600 dark:text-blue-400",
    indicatorColor: "bg-blue-500",
  };

  const statsConfig: StatsConfig[] = [
    {
      icon: ThumbsUp,
      color: "text-blue-500",
      key: "favoriteCount",
    },
    {
      icon: MessageCircle,
      color: "text-blue-400",
      key: "replyCount",
    },
    {
      icon: Share2,
      color: "text-blue-600",
      key: "shareCount",
    },
    {
      icon: Video,
      color: "text-blue-500",
      key: "viewCount",
    },
  ];

  const guideSection = (
    <div className="w-full max-w-6xl mx-auto mt-3 px-4 space-y-3">
      {/* Step-by-Step Guide */}
      <section>
        <div className="mb-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
            {dict?.facebook?.guide_title || "페이스북 영상 다운로드 방법"}
          </h2>
          <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
            {dict?.facebook?.guide_desc ||
              "페이스북 영상을 HD·4K 화질로 내려받아 오프라인에서 감상하세요."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-2">
          {[
            {
              step: 1,
              title: dict?.facebook?.step1_title || "영상 찾기",
              desc:
                dict?.facebook?.step1_desc ||
                "페이스북에서 내려받을 영상을 찾으세요. 영상이 전체 공개로 설정되어 있는지 확인해 주세요.",
              icon: Video,
            },
            {
              step: 2,
              title: dict?.facebook?.step2_title || "링크 가져오기",
              desc:
                dict?.facebook?.step2_desc ||
                "영상을 눌러 연 뒤 '공유' 버튼을 누르고 '링크 복사'를 선택해 영상 주소를 복사하세요.",
              icon: Share2,
            },
            {
              step: 3,
              title: dict?.facebook?.step3_title || "HD 영상 다운로드",
              desc:
                dict?.facebook?.step3_desc ||
                "페이스북 영상 링크를 SSDown에 붙여넣고 원하는 화질(HD, 2K, 4K)을 고른 뒤 바로 내려받으세요.",
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
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
            <Lightbulb className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
            {dict?.facebook?.tips_title || "페이스북 다운로드 팁"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.facebook?.tips_desc ||
              "페이스북 영상을 내려받을 때 가장 좋은 결과를 얻는 방법입니다."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-2">
          {[
            {
              title: dict?.facebook?.tip1_title || "공개 영상만 가능",
              desc:
                dict?.facebook?.tip1_desc ||
                "SSDown은 전체 공개된 페이스북 게시물의 영상만 내려받을 수 있습니다. 비공개나 친구 공개 영상은 내려받을 수 없습니다.",
              icon: CheckCircle2,
            },
            {
              title: dict?.facebook?.tip2_title || "화질은 신중하게",
              desc:
                dict?.facebook?.tip2_desc ||
                "가장 좋은 화질로 감상하려면 제공되는 최고 화질을 고르세요. 4K는 용량이 크지만 훨씬 선명합니다.",
              icon: VideoIcon,
            },
            {
              title: dict?.facebook?.tip3_title || "라이브 영상",
              desc:
                dict?.facebook?.tip3_desc ||
                "라이브 영상은 방송이 끝나고 페이스북에 일반 영상 게시물로 저장된 뒤에 내려받을 수 있습니다.",
              icon: Video,
            },
            {
              title: dict?.facebook?.tip4_title || "저작권 존중",
              desc:
                dict?.facebook?.tip4_desc ||
                "개인적인 용도로만 내려받으세요. 허락 없이 재배포하거나 상업적으로 이용하지 마세요.",
              icon: ThumbsUp,
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
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <Info className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
            {dict?.facebook?.features_title || "페이스북 영상 기능"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.facebook?.features_desc ||
              "페이스북에서 내려받을 수 있는 것입니다."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            {
              title: dict?.facebook?.feature1_title || "HD·4K 화질",
              desc:
                dict?.facebook?.feature1_desc ||
                "1080p HD, 2K, 4K 등 제공되는 여러 화질로 페이스북 영상을 내려받으세요.",
            },
            {
              title: dict?.facebook?.feature2_title || "일반 영상",
              desc:
                dict?.facebook?.feature2_desc ||
                "게시물, 페이지, 그룹의 일반 페이스북 영상을 MP4로 내려받으세요.",
            },
            {
              title: dict?.facebook?.feature3_title || "라이브 녹화본",
              desc:
                dict?.facebook?.feature3_desc ||
                "페이스북 라이브 영상은 방송이 끝나 일반 영상으로 저장된 뒤 내려받을 수 있습니다.",
            },
            {
              title: dict?.facebook?.feature4_title || "오프라인 감상",
              desc:
                dict?.facebook?.feature4_desc ||
                "영상을 기기에 저장해 인터넷 없이 언제 어디서나 감상하세요.",
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

      <FacebookTechInsights />

      {/* FAQ Section */}
      <section>
        <div className="text-center mb-2">
          <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
            {dict?.qna_facebook?.title || "Facebook FAQ"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.qna_facebook?.desc ||
              "Help with downloading Facebook videos in HD and 4K."}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {[1, 2, 3, 4, 5].map((i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">
                {dict?.qna_facebook?.[`faq_${i}_q`] || "Question"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.qna_facebook?.[`faq_${i}_a`] || "Answer"}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Facebook Platform Deep Dive */}
      <section className="bg-white dark:bg-gray-950 rounded-2xl border p-8 md:p-12">
        <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
          페이스북 영상 콘텐츠 이해하기
        </h2>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-2 text-muted-foreground">
          <p>
            페이스북은 하루 수십억 회의 영상 조회수를 기록하는 세계 최대 영상 플랫폼 중 하나입니다. 개인의 추억부터 전문 콘텐츠까지, 페이스북의 영상 생태계를 이해하면 다운로드를 훨씬 효율적으로 관리할 수 있습니다.
          </p>
          <h3 className="text-xl font-semibold text-foreground">페이스북 영상 화질 옵션</h3>
          <p>
            페이스북은 최대 4K(3840x2160) 해상도의 영상 업로드를 지원하지만, 업로드 과정에서 영상을 압축하는 경우가 많습니다. SSDown은 다운로드 시 사용할 수 있는 모든 화질 옵션을 보여 줍니다. 보통 SD(360p~480p)와 HD(720p~1080p) 버전이 제공되며, 원본이 4K로 올라온 영상이라면 더 높은 화질도 선택할 수 있습니다. 오프라인에서 가장 좋은 화질로 보시려면 언제나 최고 화질을 고르시길 권합니다.
          </p>
          <h3 className="text-xl font-semibold text-foreground">페이스북 라이브 영상</h3>
          <p>
            페이스북 라이브는 실시간으로 영상을 방송하는 기능입니다. 방송이 끝나면 페이스북은 이를 일반 영상 게시물로 저장합니다. SSDown은 이렇게 저장된 라이브 영상도 일반 페이스북 영상과 똑같이 내려받을 수 있습니다. 다만 진행 중인 라이브는 내려받을 수 없으며, 방송이 끝나고 저장될 때까지 기다려야 합니다.
          </p>
          <h3 className="text-xl font-semibold text-foreground">공개 설정과 접근 권한</h3>
          <p>
            페이스북은 영상 게시물에 전체 공개, 친구, 친구의 친구, 나만 보기 등 세분화된 공개 설정을 제공합니다. SSDown은 "전체 공개"로 설정된 영상에만 접근할 수 있습니다. 비공개 그룹에 올라온 영상이나 친구 공개 게시물, 대상이 제한된 영상은 외부 도구로 내려받을 수 없습니다. 중요한 차이이니 내려받기 전에 게시물의 공개 범위 아이콘을 꼭 확인하세요.
          </p>
          <h3 className="text-xl font-semibold text-foreground">페이스북 워치와 릴스</h3>
          <p>
            페이스북 워치는 창작자와 언론사의 짧은 영상과 긴 영상을 함께 제공하는 전용 영상 공간입니다. 페이스북 릴스는 틱톡이나 인스타그램 릴스와 비슷한, 최대 90초 길이의 세로형 짧은 영상입니다. 워치 영상과 릴스 모두 공개 상태라면 SSDown으로 내려받을 수 있습니다. 방법은 동일합니다. 영상 주소를 복사해 SSDown에 붙여넣기만 하면 됩니다.
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
          {dict?.facebook?.feature_1_title || "HD Videos"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.facebook?.feature_1_desc ||
            "Download public Facebook videos in 1080p, 2K, and 4K quality."}
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.facebook?.feature_2_title || "Watch Offline"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.facebook?.feature_2_desc ||
            "Save videos to your device to watch them anytime, anywhere without internet."}
        </p>
      </div>
    </div>
  );

  return (
    <VideoDownloaderClient
      type="facebook"
      dict={dict}
      theme={theme}
      icon={FacebookIcon}
      title={dict?.facebook?.title || "페이스북 영상 다운로드"}
      subtitle={
        dict?.facebook?.subtitle ||
        "페이스북 영상을 간편하게 내려받으세요. 고화질, 무료, 안전."
      }
      placeholder={
        dict?.facebook?.placeholder || "Paste Facebook video URL here..."
      }
      apiEndpoint="/api/facebook"
      downloadEndpoint="/api/facebook/download"
      noVideoError="영상을 찾지 못했습니다. 공개된 페이스북 영상 링크가 맞는지 확인해 주세요."
      statsConfig={statsConfig}
      emptyState={emptyState}
      downloadFileName={(quality) => `facebook_video_${quality}.mp4`}
      faqSection={faqSection}
      slotId1="3584688990"
      slotId2="3584688990"
    />
  );
}
