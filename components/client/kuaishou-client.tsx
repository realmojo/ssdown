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
import {
  VideoDownloaderClient,
  ThemeConfig,
  StatsConfig,
} from "./video-saver-client";
import { KuaishouIcon } from "@/components/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KuaishouClientProps {
  dict: any;
}

export function KuaishouClient({ dict }: KuaishouClientProps) {
  const theme: ThemeConfig = {
    bgFrom: "from-orange-50",
    bgTo: "to-white dark:from-gray-900 dark:to-gray-950",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-500",
    titleFrom: "from-orange-500",
    titleTo: "to-yellow-400",
    cardBorder: "border-orange-100 dark:border-orange-900/50",
    topBarGradient: "bg-gradient-to-r from-orange-500 to-yellow-400",
    buttonGradient:
      "bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500",
    inputFocus: "focus:ring-orange-500",
    downloadButtonHover: "hover:bg-orange-50",
    downloadButtonText: "text-orange-600 dark:text-orange-400",
    indicatorColor: "bg-orange-500",
  };

  const statsConfig: StatsConfig[] = [
    { icon: Eye, color: "text-muted-foreground", key: "viewCount" },
    { icon: Heart, color: "text-red-500", key: "favoriteCount" },
    { icon: MessageCircle, color: "text-blue-500", key: "replyCount" },
    { icon: Share2, color: "text-green-500", key: "shareCount" },
  ];

  const guideSection = (
    <div className="w-full max-w-6xl mx-auto mt-20 px-4 space-y-16">
      {/* Step-by-Step Guide */}
      <section>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
            <BookOpen className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            콰이쇼우 영상 워터마크 없이 내려받는 방법
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            콰이쇼우(快手) 영상을 고화질로 저장하세요. 워터마크도, 앱 설치도 필요 없습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: "콰이쇼우 영상 열기",
              desc: "콰이쇼우 앱에서 내려받을 영상을 찾은 뒤 영상 오른쪽의 공유(分享) 버튼을 누르세요.",
              icon: Eye,
            },
            {
              step: 2,
              title: "영상 링크 복사",
              desc: "공유 메뉴에서 '复制链接'(링크 복사)를 누르세요. 콰이쇼우 영상 주소가 클립보드에 복사됩니다.",
              icon: Share2,
            },
            {
              step: 3,
              title: "워터마크 없이 다운로드",
              desc: "위 SSDown 입력창에 링크를 붙여넣고 다운로드를 누르면 워터마크 없는 MP4로 저장됩니다.",
              icon: Download,
            },
          ].map((step) => (
            <Card key={step.step} className="border-orange-100 dark:border-orange-900/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white font-bold">
                    {step.step}
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
            <Lightbulb className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">콰이쇼우 다운로드 팁</h2>
          <p className="text-muted-foreground">
            콰이쇼우 콘텐츠를 더 잘 활용하는 방법입니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: "No Watermark",
              desc: "SSDown removes the Kuaishou watermark automatically, giving you clean videos without the username overlay.",
              icon: CheckCircle2,
            },
            {
              title: "오디오 추출",
              desc: "콰이쇼우 영상의 오디오만 MP3로 추출하세요. 유행하는 사운드나 배경음악에 안성맞춤입니다.",
              icon: Music,
            },
            {
              title: "원본 화질",
              desc: "재인코딩이나 압축 없이 원본 해상도 그대로 내려받습니다.",
              icon: CheckCircle2,
            },
            {
              title: "창작자 존중",
              desc: "내려받은 콘텐츠를 공유할 때는 원작자의 콰이쇼우 계정(快手号)을 꼭 밝혀 주세요. 팔로우로 창작자를 응원해 주세요.",
              icon: Heart,
            },
          ].map((tip, idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
              <div className="flex-shrink-0">
                <tip.icon className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{tip.title}</h3>
                <p className="text-sm text-muted-foreground">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <Info className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">콰이쇼우 다운로드 기능</h2>
          <p className="text-muted-foreground">콰이쇼우 콘텐츠를 저장하는 데 필요한 모든 기능입니다.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Watermark-Free",
              desc: "플랫폼 워터마크 없이 콰이쇼우 영상을 내려받아 깔끔한 콘텐츠로 활용하세요.",
            },
            {
              title: "MP4 & MP3",
              desc: "영상 전체를 MP4로 저장하거나 오디오만 MP3로 추출하세요.",
            },
            {
              title: "HD 화질",
              desc: "원본 해상도를 그대로 유지해 화질 손실이 없습니다.",
            },
            {
              title: "로그인 불필요",
              desc: "계정도 앱 설치도 필요 없습니다. 붙여넣고 내려받기만 하면 됩니다.",
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

      {/* FAQ */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-4">콰이쇼우 자주 묻는 질문</h2>
          <p className="text-muted-foreground">
            콰이쇼우 영상 다운로드에 대해 자주 묻는 질문입니다.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {[
            {
              q: "콰이쇼우(快手)가 무엇인가요?",
              a: "Kuaishou is one of China's leading short-form video platforms with over 700 million registered users. Developed by Kuaishou Technology, it competes directly with Douyin (TikTok) in the Chinese market. The app is known for its authentic, grassroots content from everyday users.",
            },
            {
              q: "콰이쇼우 영상을 워터마크 없이 내려받을 수 있나요?",
              a: "Yes. SSDown fetches the original video stream directly from Kuaishou servers before the watermark overlay is applied, so you get a clean MP4 file without any Kuaishou branding.",
            },
            {
              q: "어떤 주소 형식을 지원하나요?",
              a: "SSDown supports standard Kuaishou URLs (kuaishou.com/video/...) as well as short share links (v.kuaishou.com/...) and gifshow.com URLs generated by the Kuaishou app's share feature.",
            },
            {
              q: "비공개 콰이쇼우 영상도 내려받을 수 있나요?",
              a: "No. SSDown can only download publicly accessible Kuaishou videos. Private or friend-only content cannot be fetched.",
            },
            {
              q: "콰이쇼우 영상 다운로드는 합법인가요?",
              a: "Downloading videos for personal use is generally acceptable. However, redistributing, re-uploading, or using content commercially without the creator's permission may violate copyright law. Always respect the original creator.",
            },
          ].map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Deep Dive */}
      <section className="bg-white dark:bg-gray-950 rounded-2xl border p-8 md:p-12">
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          콰이쇼우 영상 다운로드 이해하기
        </h2>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>
            콰이쇼우(快手)는 등록 사용자 7억 명이 넘는 중국 2위 숏폼 영상 플랫폼입니다. 2011년에 시작해 더우인(틱톡)보다 역사가 길며, 잘 다듬어진 인플루언서 콘텐츠보다 평범한 사용자들의 진솔한 일상에 집중하는 것으로 알려져 있습니다.
          </p>
          <h3 className="text-xl font-semibold text-foreground">콰이쇼우 워터마크의 원리</h3>
          <p>
            다른 숏폼 플랫폼과 마찬가지로 콰이쇼우도 공식 앱에서 영상을 저장하면 사용자명이 움직이는 워터마크를 넣습니다. 이 워터마크는 내보내기 과정에서 기기 쪽에서 덧씌워지는 것이라, 콰이쇼우 서버에 저장된 원본 영상 파일에는 없습니다. SSDown은 원본 영상 스트림에 직접 접근하므로 언제나 깨끗한 영상을 받을 수 있습니다.
          </p>
          <h3 className="text-xl font-semibold text-foreground">콰이쇼우와 더우인의 차이</h3>
          <p>
            더우인(틱톡)이 알고리즘 기반의 바이럴 콘텐츠로 유명하다면, 콰이쇼우는 사람 사이의 관계와 진솔한 일상에 초점을 둡니다. 중소도시와 농촌 지역에 사용자 기반이 두터워, 대도시 너머의 중국 문화를 들여다볼 수 있는 독특한 창구이기도 합니다.
          </p>
        </div>
      </section>
    </div>
  );

  const emptyState = (
    <div className="grid gap-6 sm:grid-cols-2 w-full pt-12 text-left">
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">워터마크 없음</p>
        <p className="text-muted-foreground text-sm">
          콰이쇼우(快手) 영상을 플랫폼 워터마크 없이 내려받으세요.
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">MP4 & MP3</p>
        <p className="text-muted-foreground text-sm">
          영상 전체를 저장하거나 오디오만 MP3로 추출할 수 있습니다.
        </p>
      </div>
    </div>
  );

  return (
    <VideoDownloaderClient
      type="kuaishou"
      dict={dict}
      theme={theme}
      icon={KuaishouIcon}
      title="콰이쇼우 다운로더 (快手)"
      subtitle="콰이쇼우 영상을 워터마크 없이 내려받으세요. MP4 영상과 MP3 음원을 바로 저장할 수 있습니다."
      placeholder="콰이쇼우 링크를 붙여넣으세요… (예: https://www.kuaishou.com/video/...)"
      apiEndpoint="/api/kuaishou"
      downloadEndpoint="/api/kuaishou/download"
      noVideoError="영상을 찾지 못했습니다. 콰이쇼우 영상이 공개 상태인지 확인해 주세요."
      formatQuality={(bitrate) =>
        typeof bitrate === "string" ? bitrate : `${bitrate}p`
      }
      statsConfig={statsConfig}
      emptyState={emptyState}
      downloadFileName={(quality) => `kuaishou_video_${quality}.mp4`}
      faqSection={guideSection}
      slotId1="9629379592"
      slotId2="9629379592"
    />
  );
}
