import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { VideoToMp3Client } from "@/components/client/video-to-mp3-client";
import { PageShell } from "@/components/portal/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/video-to-mp3`;

  const title = dict.page_video_to_mp3.meta_title;
  const description = dict.page_video_to_mp3.meta_description;

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

export default async function VideoToMp3Page() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_video_to_mp3.faq.map((item: { question: string; answer: string }) => ({
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
      { "@type": "ListItem", position: 1, name: dict.breadcrumb.home, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: dict.breadcrumb.tools, item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.video_audio, item: "https://ssdown.app/tools/video-audio" },
      { "@type": "ListItem", position: 4, name: dict.page_video_to_mp3.breadcrumb_title, item: "https://ssdown.app/video-audio/video-to-mp3" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Video to MP3 Converter",
    url: "https://ssdown.app/video-audio/video-to-mp3",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online video to MP3 converter. Extract audio from MP4, WebM, AVI and other video formats. Fast, private, no upload required.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Convert Video to MP3 Online",
    description:
      "Extract audio from any video file and save it as MP3 using SSDown, free and browser-based.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "비디오 파일 선택",
        text: "파일을 드래그하거나 선택하세요. MP4, WebM, MKV 등 다양한 형식을 지원합니다.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "MP3로 변환",
        text: "변환 버튼을 누르세요. FFmpeg 기술을 사용하여 브라우저 내에서 직접 변환이 이루어집니다.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "MP3 다운로드",
        text: "변환이 완료되면 다운로드 버튼을 눌러 기기에 저장하세요.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <PageShell
        sidebar={false}
        crumbs={[
          { label: dict.breadcrumb.tools, href: "/tools" },
          { label: dict.breadcrumb.video_audio, href: "/tools/video-audio" },
          { label: dict.page_video_to_mp3.breadcrumb_title },
        ]}
      >
        <VideoToMp3Client dict={dict} />
      </PageShell>
    </>
  );
}
