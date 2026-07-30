import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { SilenceRemoverClient } from "@/components/client/silence-remover-client";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

const FALLBACK_FAQ: { question: string; answer: string }[] = [
  {
    question: "무음 감지는 어떻게 동작하나요?",
    answer:
      "FFmpeg가 선택한 감도 기준값과 오디오의 음량을 비교해, 그 기준보다 조용한 상태가 설정한 최소 길이 이상 이어지는 구간을 제거합니다.",
  },
  {
    question: "작은 목소리까지 잘려 나가지는 않나요?",
    answer:
      "기준값이 너무 공격적이면 그럴 수 있습니다. 작은 목소리가 잘린다면 감도 값을 높여(예: -35에서 -30으로 덜 낮게) 다시 시도로 새 설정으로 재처리해 보세요.",
  },
  {
    question: "어떤 오디오 형식을 지원하나요?",
    answer:
      "오디오 자르기 도구와 동일하게 MP3, WAV, OGG, M4A를 모두 지원합니다. 처리 결과는 언제나 고음질 MP3로 저장됩니다.",
  },
  {
    question: "제 파일이 서버에 업로드되나요?",
    answer:
      "아니요. 모든 처리가 웹어셈블리(WASM으로 빌드한 FFmpeg)로 브라우저 안에서 이뤄집니다. 오디오가 기기를 벗어나지 않습니다.",
  },
  {
    question: "설정을 바꿔 다시 처리할 수 있나요?",
    answer:
      "네. 처리 후 다시 시도 버튼으로 감도와 최소 무음 길이를 조정해 같은 파일에 다시 적용할 수 있습니다. 파일을 다시 올릴 필요가 없습니다.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/silence-remover`;

  const title =
    dict?.page_silence_remover?.meta_title ||
    "무음 제거 - 오디오의 무음 구간 삭제 | SSDown";
  const description =
    dict?.page_silence_remover?.meta_description ||
    "브라우저에서 오디오 파일의 무음 구간을 자동으로 찾아 제거합니다. 무료이고 빠르며 비공개로 처리됩니다.";

  return {
    title,
    description,
    alternates: buildAlternates(new URL(canonical).pathname),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      locale: "ko_KR",
      type: "website",
      images: [{ url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["https://ssdown.app/logo.png"] },
  };
}

export default async function SilenceRemoverPage() {
  const dict = await getDictionary();

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const videoAudioLabel = dict?.breadcrumb?.video_audio || "Video & Audio";
  const breadcrumbLabel =
    dict?.page_silence_remover?.breadcrumb_title || "무음 제거";
  const faqItems: { question: string; answer: string }[] =
    dict?.page_silence_remover?.faq || FALLBACK_FAQ;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: homeLabel, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: toolsLabel, item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: videoAudioLabel, item: "https://ssdown.app/tools/video-audio" },
      { "@type": "ListItem", position: 4, name: breadcrumbLabel, item: "https://ssdown.app/video-audio/silence-remover" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "무음 제거",
    url: "https://ssdown.app/video-audio/silence-remover",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "무료 온라인 무음 제거 도구. 브라우저에서 오디오의 무음 구간을 찾아 잘라냅니다. 빠르고 안전하며 비공개로 처리됩니다.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "온라인 오디오 무음 제거 방법",
    description:
      "무료 온라인 무음 제거 도구로 브라우저에서 안전하게 오디오의 무음 구간을 없애세요.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "오디오 파일 올리기",
        text: "오디오 파일을 선택하거나 도구 영역으로 끌어다 놓으세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "감도와 최소 무음 길이 조절",
        text: "무음을 얼마나 민감하게 감지할지, 얼마나 긴 구간부터 제거할지 정하세요.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "무음 제거 후 다운로드",
        text: "파일을 처리하고 결과를 미리 들어본 뒤 정리된 오디오를 바로 내려받으세요.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />
      <PageShell
        sidebar={false}
        crumbs={[
          { label: toolsLabel, href: "/tools" },
          { label: videoAudioLabel, href: "/tools/video-audio" },
          { label: breadcrumbLabel },
        ]}
      >
        <SilenceRemoverClient dict={dict} />
      </PageShell>
    </>
  );
}
