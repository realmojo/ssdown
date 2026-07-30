import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { AudioConverterClient } from "@/components/client/audio-converter-client";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

const FALLBACK_FAQ: { question: string; answer: string }[] = [
  {
    question: "어떤 오디오 형식끼리 변환할 수 있나요?",
    answer:
      "MP3, WAV, OGG, M4A(AAC), FLAC으로 변환할 수 있습니다. 입력은 이 형식들에 더해 WebM 오디오도 가능하며, 영상 파일(MP4, MOV, WebM)을 넣으면 오디오 트랙만 추출해 줍니다.",
  },
  {
    question: "여러 파일을 한 번에 변환할 수 있나요?",
    answer:
      "네. 원하는 만큼 파일을 목록에 추가하고 전체 변환을 누르면 됩니다. 파일이 차례로 처리되며, 하나가 실패해도 나머지는 계속 진행됩니다.",
  },
  {
    question: "MP3 비트레이트 옵션은 무슨 뜻인가요?",
    answer:
      "비트레이트는 용량과 음질의 균형을 결정합니다. 128 kbps는 용량이 작아 음성에 적합하고, 192 kbps는 무난한 기본값이며, 320 kbps는 용량은 크지만 MP3 중 최고 음질입니다.",
  },
  {
    question: "제 오디오가 서버에 업로드되나요?",
    answer:
      "아니요. 모든 변환이 웹어셈블리(WASM으로 빌드한 FFmpeg)로 브라우저 안에서 이뤄집니다. 파일이 기기를 벗어나지 않아 완전히 비공개로 처리됩니다.",
  },
  {
    question: "전체를 한 번에 받으려면 어떻게 하나요?",
    answer:
      "변환 후 파일을 하나씩 받거나, 전체 다운로드를 눌러 변환된 모든 파일을 ZIP 하나로 묶어 받을 수 있습니다.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/audio-converter`;

  // Dictionary keys for this tool are provisioned separately; access loosely.
  const d = dict as Record<string, any>;
  const title =
    d?.page_audio_converter?.meta_title ||
    "오디오 변환기 - MP3, WAV, OGG, M4A, FLAC 변환 | SSDown";
  const description =
    d?.page_audio_converter?.meta_description ||
    "무료 온라인 오디오 변환기. MP3, WAV, OGG, M4A, FLAC을 서로 변환하거나 영상에서 오디오를 추출할 수 있으며 모두 브라우저에서 처리됩니다. 일괄 변환을 지원하고 빠르며 비공개로 처리됩니다.";

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

export default async function AudioConverterPage() {
  const dict = await getDictionary();

  // Dictionary keys for this tool are provisioned separately; access loosely.
  const d = dict as Record<string, any>;
  const homeLabel = d?.breadcrumb?.home || "Home";
  const toolsLabel = d?.breadcrumb?.tools || "Tools";
  const videoAudioLabel = d?.breadcrumb?.video_audio || "Video & Audio";
  const breadcrumbLabel =
    d?.page_audio_converter?.breadcrumb_title || "오디오 변환기";
  const faqItems: { question: string; answer: string }[] =
    d?.page_audio_converter?.faq || FALLBACK_FAQ;

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
      { "@type": "ListItem", position: 4, name: breadcrumbLabel, item: "https://ssdown.app/video-audio/audio-converter" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "오디오 변환기",
    url: "https://ssdown.app/video-audio/audio-converter",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "무료 온라인 오디오 변환기. 브라우저에서 MP3, WAV, OGG, M4A, FLAC을 서로 변환하거나 영상에서 오디오를 추출하세요. 빠르고 안전하며 비공개로 처리됩니다.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "온라인 오디오 변환 방법",
    description:
      "무료 온라인 오디오 변환기로 브라우저에서 안전하게 오디오 형식을 바꾸세요.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "오디오 또는 영상 파일 추가",
        text: "파일을 하나 이상 선택하거나 도구 영역으로 끌어다 놓으세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "출력 형식 선택",
        text: "MP3, WAV, OGG, M4A, FLAC 중에서 고르고 MP3의 경우 비트레이트를 설정하세요.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "변환 후 다운로드",
        text: "전체를 변환한 뒤 파일을 하나씩 받거나 ZIP으로 한 번에 받으세요.",
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
        <AudioConverterClient dict={dict} />
      </PageShell>
    </>
  );
}
