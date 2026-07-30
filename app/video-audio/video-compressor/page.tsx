import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { VideoCompressorClient } from "@/components/client/video-compressor-client";
import { PageShell } from "@/components/portal/page-shell";

const FALLBACK_FAQ: { question: string; answer: string }[] = [
  {
    question: "영상 용량이 얼마나 줄어드나요?",
    answer:
      "원본에 따라 다릅니다. 휴대폰이나 편집 프로그램에서 내보낸 영상은 과하게 인코딩된 경우가 많아 '균형' 설정에서 보통 40~70% 줄어듭니다. '최소 용량' 설정은 가로 1280px로 축소까지 해서 가장 크게 줄여 줍니다.",
  },
  {
    question: "압축하면 화질이 나빠지나요?",
    answer:
      "고화질 (CRF 23) is visually near-lossless. Balanced (CRF 28) is a great size-to-quality trade-off for sharing. Smallest (CRF 33 + downscale) prioritizes file size and is best for previews or messaging apps.",
  },
  {
    question: "큰 파일은 왜 압축이 느린가요?",
    answer:
      "모든 처리가 웹어셈블리로 빌드한 FFmpeg로 브라우저 안에서 이뤄지는데, 이는 단일 스레드로 동작합니다. 원활하게 쓰시려면 100MB 이하 영상을 권장하며, 더 큰 영상은 몇 분이 걸릴 수 있습니다.",
  },
  {
    question: "제 영상이 어딘가로 업로드되나요?",
    answer:
      "아니요. 압축은 웹어셈블리로 전적으로 기기 안에서 이뤄집니다. 영상이 브라우저를 벗어나지 않아 비공개로 유지됩니다.",
  },
  {
    question: "결과물은 어떤 형식인가요?",
    answer:
      "압축된 파일은 언제나 H.264 영상과 AAC 오디오를 쓰는 MP4입니다. 휴대폰, 브라우저, 소셜 플랫폼에서 가장 널리 호환되는 조합입니다.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  // Dict keys for this tool are added separately; access defensively.
  const page = (dict as Record<string, any>)?.page_video_compressor;
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/video-compressor`;

  const title =
    page?.meta_title ||
    "영상 압축 - 온라인 동영상 용량 줄이기 | SSDown";
  const description =
    page?.meta_description ||
    "화질 손상을 최소화하면서 브라우저에서 영상 용량을 줄이세요. 무료이고 빠르며 업로드 없이 비공개로 처리됩니다.";

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

export default async function VideoCompressorPage() {
  const dict = await getDictionary();

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const videoAudioLabel = dict?.breadcrumb?.video_audio || "Video & Audio";
  const page = (dict as Record<string, any>)?.page_video_compressor;
  const breadcrumbLabel = page?.breadcrumb_title || "영상 압축";
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
      { "@type": "ListItem", position: 4, name: breadcrumbLabel, item: "https://ssdown.app/video-audio/video-compressor" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "영상 압축",
    url: "https://ssdown.app/video-audio/video-compressor",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "무료 온라인 영상 압축 도구. 브라우저에서 바로 영상 용량을 줄이세요. 빠르고 안전하며 비공개로 처리됩니다.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "온라인 영상 압축 방법",
    description:
      "무료 온라인 영상 압축 도구로 브라우저에서 안전하게 영상 용량을 줄이세요.",
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
        name: "압축 수준 선택",
        text: "Pick 고화질, Balanced, or Smallest depending on how much you want to reduce the size.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "압축 후 다운로드",
        text: "압축을 실행해 용량을 비교하고 결과를 미리 본 뒤 작아진 파일을 내려받으세요.",
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
      <PageShell
        sidebar={false}
        crumbs={[
          { label: toolsLabel, href: "/tools" },
          { label: videoAudioLabel, href: "/tools/video-audio" },
          { label: breadcrumbLabel },
        ]}
      >
        <VideoCompressorClient dict={dict} />
      </PageShell>
    </>
  );
}
