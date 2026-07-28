import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { VideoConverterClient } from "@/components/client/video-converter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const FALLBACK_FAQ: { question: string; answer: string }[] = [
  {
    question: "어떤 영상 형식끼리 변환할 수 있나요?",
    answer:
      "MP4, MOV, WebM, AVI, MKV를 입력받아 MP4(H.264), WebM(VP8), MOV, AVI로 변환할 수 있습니다. 휴대폰, 브라우저, 소셜 미디어에서 가장 널리 호환되는 것은 MP4입니다.",
  },
  {
    question: "큰 파일은 왜 변환이 느린가요?",
    answer:
      "모든 처리가 웹어셈블리로 빌드한 FFmpeg로 브라우저 안에서 이뤄지는데, 이는 단일 스레드로 동작합니다. 원활하게 쓰시려면 100MB 이하 영상을 권장하며, 더 크거나 긴 영상은 몇 분이 걸릴 수 있습니다.",
  },
  {
    question: "제 영상이 서버에 업로드되나요?",
    answer:
      "아니요. 모든 처리가 웹어셈블리로 기기 안에서 이뤄집니다. 영상이 브라우저를 벗어나지 않아 완전히 비공개로 유지됩니다.",
  },
  {
    question: "MOV → MP4 변환이 가끔 거의 즉시 끝나는 이유는 무엇인가요?",
    answer:
      "원본이 이미 호환되는 코덱(H.264 영상, AAC 오디오)을 쓰고 있으면 재인코딩 없이 새 컨테이너로 다시 담기만 합니다. 코덱이 호환되지 않으면 자동으로 전체 재인코딩으로 전환됩니다.",
  },
  {
    question: "MP4와 WebM은 무엇이 다른가요?",
    answer:
      "MP4(H.264 + AAC)는 사실상 어디서나 재생됩니다. WebM(VP8)은 웹에 최적화된 개방형 무료 형식입니다. 호환성이 중요하면 MP4를, 개방형 형식이 꼭 필요하면 WebM을 고르세요.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  // Dict keys for this tool are added separately; access defensively.
  const page = (dict as Record<string, any>)?.page_video_converter;
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/video-converter`;

  const title =
    page?.meta_title ||
    "영상 변환기 - MP4, WebM, MOV, AVI 온라인 변환 | SSDown";
  const description =
    page?.meta_description ||
    "브라우저에서 바로 MP4, WebM, MOV, AVI를 서로 변환하세요. 무료이고 빠르며 업로드 없이 비공개로 처리됩니다.";

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

export default async function VideoConverterPage() {
  const dict = await getDictionary();

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const videoAudioLabel = dict?.breadcrumb?.video_audio || "Video & Audio";
  const page = (dict as Record<string, any>)?.page_video_converter;
  const breadcrumbLabel = page?.breadcrumb_title || "영상 변환기";
  const faqItems: { question: string; answer: string }[] =
    page?.faq || FALLBACK_FAQ;

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
      { "@type": "ListItem", position: 4, name: breadcrumbLabel, item: "https://ssdown.app/video-audio/video-converter" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "영상 변환기",
    url: "https://ssdown.app/video-audio/video-converter",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "무료 온라인 영상 변환기. 브라우저에서 바로 MP4, WebM, MOV, AVI를 서로 변환하세요. 빠르고 안전하며 비공개로 처리됩니다.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "온라인 영상 변환 방법",
    description:
      "무료 온라인 영상 변환기로 브라우저에서 안전하게 영상 형식을 바꾸세요.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "영상 파일 올리기",
        text: "MP4, MOV, WebM, AVI, MKV 파일을 선택하거나 도구 영역으로 끌어다 놓으세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "출력 형식 선택",
        text: "변환할 형식으로 MP4, WebM, MOV, AVI 중 하나를 고르세요.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "변환 후 다운로드",
        text: "변환을 실행해 결과를 미리 본 뒤 새 파일을 바로 내려받으세요.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: homeLabel, href: "/" },
            { label: toolsLabel, href: "/tools" },
            { label: videoAudioLabel, href: "/tools/video-audio" },
            {
              label: breadcrumbLabel,
              href: "/video-audio/video-converter",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <VideoConverterClient dict={dict} />
    </>
  );
}
