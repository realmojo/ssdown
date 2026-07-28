"use client";

import {
  Camera,
  Heart,
  MessageCircle,
  Layers,
  BookOpen,
  Lightbulb,
  Info,
  CheckCircle2,
  Download,
  Image,
} from "lucide-react";
import { InstagramTechInsights } from "./instagram-tech-insights";
import {
  VideoDownloaderClient,
  ThemeConfig,
  StatsConfig,
} from "./video-saver-client";
import { InstagramIcon } from "@/components/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InstagramClientProps {
  dict: any;
}

export function InstagramClient({ dict }: InstagramClientProps) {
  const theme: ThemeConfig = {
    bgFrom: "from-purple-50",
    bgTo: "to-white dark:from-gray-900 dark:to-gray-950",
    iconBg: "bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-600",
    iconColor: "text-white",
    titleFrom: "from-purple-600",
    titleVia: "via-pink-600",
    titleTo: "to-orange-500",
    cardBorder: "border-purple-100 dark:border-purple-900/50",
    topBarGradient:
      "bg-gradient-to-r from-yellow-400 via-orange-500 to-purple-600",
    buttonGradient:
      "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
    inputFocus: "focus:ring-purple-500",
    downloadButtonHover: "hover:bg-purple-50",
    downloadButtonText: "text-purple-600 dark:text-purple-400",
    indicatorColor: "bg-purple-500",
  };

  const statsConfig: StatsConfig[] = [
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
      icon: Layers,
      color: "text-green-500",
      key: "shareCount",
    },
    {
      icon: Camera,
      color: "text-purple-500",
      key: "viewCount",
    },
  ];

  const guideSection = (
    <div className="w-full max-w-6xl mx-auto mt-20 px-4 space-y-16">
      {/* Step-by-Step Guide */}
      <section>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
            <BookOpen className="w-8 h-8 text-purple-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.instagram?.guide_title ||
              "인스타그램 릴스·스토리·사진 다운로드 방법"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {dict?.instagram?.guide_desc ||
              "몇 번의 클릭으로 인스타그램 콘텐츠를 고화질로 내려받으세요."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: dict?.instagram?.step1_title || "인스타그램 콘텐츠 찾기",
              desc:
                dict?.instagram?.step1_desc ||
                "인스타그램에서 내려받을 릴스, 스토리, 게시물로 이동한 뒤 점 세 개(...)나 공유 아이콘을 누르세요.",
              icon: Camera,
            },
            {
              step: 2,
              title: dict?.instagram?.step2_title || "링크 복사",
              desc:
                dict?.instagram?.step2_desc ||
                "메뉴에서 '링크 복사'를 선택하세요. 스토리는 직접 링크를 얻기 위해 브라우저 확장 프로그램이나 별도 도구가 필요할 수 있습니다.",
              icon: Layers,
            },
            {
              step: 3,
              title: dict?.instagram?.step3_title || "콘텐츠 다운로드",
              desc:
                dict?.instagram?.step3_desc ||
                "인스타그램 주소를 SSDown에 붙여넣고 '다운로드'를 누르세요. 원하는 화질을 골라 릴스, 영상, 사진을 기기에 저장할 수 있습니다.",
              icon: Download,
            },
          ].map((step) => (
            <Card
              key={step.step}
              className="border-purple-100 dark:border-purple-900/50"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 text-white font-bold">
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
            {dict?.instagram?.tips_title || "인스타그램 다운로드 팁"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.instagram?.tips_desc ||
              "인스타그램 다운로드를 더 잘 활용하는 팁입니다."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: dict?.instagram?.tip1_title || "공개 계정만 가능",
              desc:
                dict?.instagram?.tip1_desc ||
                "SSDown은 공개된 인스타그램 계정의 콘텐츠만 내려받을 수 있습니다. 비공개 계정의 콘텐츠는 계정 주인의 허락이 필요합니다.",
              icon: CheckCircle2,
            },
            {
              title: dict?.instagram?.tip2_title || "고화질 릴스",
              desc:
                dict?.instagram?.tip2_desc ||
                "인스타그램 릴스를 원본 화질 그대로, 최대 1080p HD 해상도와 온전한 소리로 내려받으세요.",
              icon: Camera,
            },
            {
              title: dict?.instagram?.tip3_title || "스토리 다운로드",
              desc:
                dict?.instagram?.tip3_desc ||
                "인스타그램 스토리는 사라지기 전(24시간 이내)에 내려받으세요. 스토리가 살아 있을 때 링크를 확보해야 합니다.",
              icon: Image,
            },
            {
              title: dict?.instagram?.tip4_title || "사생활 존중",
              desc:
                dict?.instagram?.tip4_desc ||
                "창작자의 사생활과 저작권을 언제나 존중해 주세요. 개인적인 용도로만 내려받고 공유할 때는 출처를 밝혀 주세요.",
              icon: Heart,
            },
          ].map((tip, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
            >
              <div className="flex-shrink-0">
                <tip.icon className="w-6 h-6 text-purple-500" />
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
            {dict?.instagram?.features_title || "인스타그램 다운로드 기능"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.instagram?.features_desc ||
              "인스타그램에서 내려받을 수 있는 모든 것입니다."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: dict?.instagram?.feature1_title || "릴스 & 영상",
              desc:
                dict?.instagram?.feature1_desc ||
                "인스타그램 릴스와 일반 영상을 HD 화질과 온전한 소리로 내려받으세요.",
            },
            {
              title: dict?.instagram?.feature2_title || "사진 & 캐러셀",
              desc:
                dict?.instagram?.feature2_desc ||
                "사진 한 장을 저장하거나 인스타그램 캐러셀 게시물의 모든 이미지를 내려받으세요.",
            },
            {
              title: dict?.instagram?.feature3_title || "스토리",
              desc:
                dict?.instagram?.feature3_desc ||
                "공개 계정의 인스타그램 스토리(사진과 영상)를 사라지기 전에 내려받으세요.",
            },
            {
              title: dict?.instagram?.feature4_title || "IGTV 영상",
              desc:
                dict?.instagram?.feature4_desc ||
                "긴 IGTV 콘텐츠를 고화질로 내려받아 오프라인에서 감상하세요.",
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

      <InstagramTechInsights />

      {/* FAQ Section */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {dict?.qna_instagram?.title || "Instagram FAQ"}
          </h2>
          <p className="text-muted-foreground">
            {dict?.qna_instagram?.desc ||
              "Answers about downloading Instagram Reels, 스토리, and Photos."}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {[1, 2, 3, 4, 5].map((i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">
                {dict?.qna_instagram?.[`faq_${i}_q`] || "Question"}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">
                {dict?.qna_instagram?.[`faq_${i}_a`] || "Answer"}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Instagram Platform Deep Dive */}
      <section className="bg-white dark:bg-gray-950 rounded-2xl border p-8 md:p-12">
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          인스타그램 콘텐츠 유형 완전 정리
        </h2>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>
            인스타그램은 다양한 콘텐츠 형식을 제공하며, 각각 특성과 다운로드 시 고려할 점이 다릅니다. 형식을 이해하면 필요한 것을 최고 화질로 정확히 저장할 수 있습니다.
          </p>
          <h3 className="text-xl font-semibold text-foreground">
            인스타그램 릴스
          </h3>
          <p>
            릴스는 틱톡과 직접 경쟁하는 인스타그램의 세로형 짧은 영상 형식입니다. 최대 90초 길이이며 9:16 비율(1080x1920 픽셀)로 표시됩니다. 릴스에는 음악, 효과, 자막이 함께 들어가는 경우가 많습니다. SSDown으로 릴스를 내려받으면 모든 오버레이와 소리가 포함된 영상 전체를, 창작자가 올린 원본 HD 화질 그대로 받게 됩니다.
          </p>
          <h3 className="text-xl font-semibold text-foreground">
            인스타그램 스토리
          </h3>
          <p>
            스토리는 하이라이트로 저장하지 않으면 24시간 뒤 사라지는 임시 콘텐츠입니다. 사진(5초간 표시)이나 영상(구간당 최대 60초) 형태이며, 투표·질문·링크 같은 상호작용 요소가 들어갈 수 있습니다. SSDown은 공개 계정의 스토리를 내려받을 수 있는데, 스토리가 사라지기 전에 주소를 확보하는 것이 관건입니다. 스토리를 내려받아도 원본 업로드 화질이 그대로 유지됩니다.
          </p>
          <h3 className="text-xl font-semibold text-foreground">
            캐러셀 게시물과 사진
          </h3>
          <p>
            인스타그램 캐러셀 게시물에는 사진이나 영상을 한 게시물에 최대 20개까지 담을 수 있습니다. 캐러셀 게시물 주소를 SSDown에 붙여넣으면 안에 있는 항목을 모두 내려받을 수 있습니다. 개별 사진은 원본 해상도로 저장되며, 세로형은 최대 1080x1350, 정사각형은 1080x1080 픽셀입니다.
          </p>
          <h3 className="text-xl font-semibold text-foreground">
            공개 계정과 개인정보
          </h3>
          <p>
            인스타그램은 엄격한 공개 설정을 제공하며 SSDown은 그 경계를 존중합니다. 공개 계정의 콘텐츠만 내려받을 수 있습니다. 비공개 계정이라면 승인된 팔로워에게만 보이며 외부 도구로는 접근할 수 없습니다. 이는 의도된 것으로, 저희는 창작자의 공개 설정을 존중하며 인스타그램의 접근 제어를 우회하려 시도하지 않습니다.
          </p>
        </div>
      </section>
    </div>
  );

  const faqSection = guideSection;

  const emptyState = (
    <div className="grid gap-6 sm:grid-cols-2 w-full pt-12 text-left">
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.instagram?.feature_1_title || "릴스 & 영상"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.instagram?.feature_1_desc ||
            "Download Instagram Reels and videos in high definition with sound."}
        </p>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
        <p className="font-semibold text-lg mb-2">
          {dict?.instagram?.feature_2_title || "Photos & 스토리"}
        </p>
        <p className="text-muted-foreground text-sm">
          {dict?.instagram?.feature_2_desc ||
            "Save photos and stories from any public Instagram account easily."}
        </p>
      </div>
    </div>
  );

  return (
    <VideoDownloaderClient
      type="instagram"
      dict={dict}
      theme={theme}
      icon={InstagramIcon}
      title={dict?.instagram?.title || "Instagram Saver"}
      subtitle={
        dict?.instagram?.subtitle ||
        "Download Instagram Reels, Videos, and Photos instantly. 고화질, no watermark."
      }
      placeholder={
        dict?.instagram?.placeholder || "Paste Instagram URL here..."
      }
      apiEndpoint="/api/instagram"
      downloadEndpoint="/api/instagram/download"
      noVideoError="이 인스타그램 릴스에서 영상을 찾지 못했습니다. 영상이 포함되어 있는지 확인해 주세요."
      statsConfig={statsConfig}
      thumbnailAspect="aspect-[4/5]"
      thumbnailHeight="md:h-80"
      thumbnailImageProxy={(url) => url}
      avatarImageProxy={(url) => url}
      emptyState={emptyState}
      downloadFileName={(quality) => `instagram_video_${quality}.mp4`}
      faqSection={faqSection}
      slotId1="3689271403"
      slotId2="3689271403"
    />
  );
}
