import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { TrimVideoClient } from "@/components/client/trim-video-client";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/trim-video`;

  const title = dict.page_trim_video.meta_title;
  const description = dict.page_trim_video.meta_description;

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

export default async function TrimVideoPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_trim_video.faq.map((item: { question: string; answer: string }) => ({
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
      { "@type": "ListItem", position: 4, name: dict.page_trim_video.breadcrumb_title, item: "https://ssdown.app/video-audio/trim-video" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "동영상 자르기",
    url: "https://ssdown.app/video-audio/trim-video",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Cut and trim video clips online without losing quality.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "동영상 자르기 사용 방법",
    description: "Cut and trim video clips online without losing quality.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "비디오 업로드",
        text: "비디오 파일을 드래그 앤 드롭하거나 클릭하여 선택하세요. MP4, WebM, MKV 형식을 지원합니다.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "범위 선택",
        text: "타임라인 슬라이더를 사용하거나 정확한 시간을 입력하여 원하는 부분을 선택하세요.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "자르기 및 다운로드",
        text: "비디오 자르기를 클릭하고 결과를 다운로드하세요. 스트림 복사를 사용하여 매우 빠르게 처리됩니다.",
      }
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
          { label: dict.breadcrumb.tools, href: "/tools" },
          { label: dict.breadcrumb.video_audio, href: "/tools/video-audio" },
          { label: dict.page_trim_video.breadcrumb_title },
        ]}
      >
        <TrimVideoClient dict={dict} />
      </PageShell>
    </>
  );
}
