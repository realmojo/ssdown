import { getDictionary } from "@/lib/get-dictionary";
import { KuaishouClient } from "@/components/client/kuaishou-client";
import { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/kuaishou`;

  return {
    title:
      dict.kuaishou?.seo_title ||
      "콰이쇼우(快手) 영상 다운로드 — 워터마크 없이 | SSDown",
    description:
      dict.kuaishou?.seo_description ||
      "콰이쇼우(快手) 영상을 워터마크 없이 무료로 내려받으세요. 공개된 콰이쇼우 게시물의 HD MP4 영상과 MP3 음원을 바로 저장할 수 있습니다.",
    keywords: dict.kuaishou?.seo_keywords
      ? dict.kuaishou.seo_keywords.split(", ")
      : [
          "콰이쇼우 다운로드",
          "콰이쇼우 영상 다운로드",
          "콰이쇼우 워터마크 제거",
          "콰이쇼우 mp4 저장",
          "콰이쇼우 mp3 추출",
          "快手视频下载",
        ],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title:
        dict.kuaishou?.seo_title ||
        "콰이쇼우(快手) 영상 다운로드 — 워터마크 없이 | SSDown",
      description:
        dict.kuaishou?.seo_description ||
        "콰이쇼우(快手) 영상을 워터마크 없이 무료로 내려받으세요. HD MP4 영상과 MP3 음원을 바로 저장할 수 있습니다.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-kuaishou-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - 콰이쇼우 영상 다운로더",
        },
      ],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title:
        dict.kuaishou?.seo_title ||
        "콰이쇼우(快手) 영상 다운로드 — 워터마크 없이",
      description:
        dict.kuaishou?.seo_description ||
        "콰이쇼우 영상을 워터마크 없이 내려받으세요. MP4와 MP3를 바로 저장할 수 있습니다.",
      images: ["https://ssdown.app/ssdown-kuaishou-og.png"],
    },
    alternates: buildAlternates(new URL(canonical).pathname),
  };
}

export default async function KuaishouPage() {
  const dict = await getDictionary();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3, 4, 5]
      .map((i) => {
        const qna = dict?.qna_kuaishou;
        if (!qna) return null;
        const question = (qna as any)[`faq_${i}_q`];
        const answer = (qna as any)[`faq_${i}_a`];
        if (!question || !answer) return null;
        return {
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer,
          },
        };
      })
      .filter((item) => item !== null),
  };

  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SSDown 콰이쇼우 영상 다운로더",
    url: "https://ssdown.app/kuaishou",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "콰이쇼우(快手) 영상을 워터마크 없이 MP4나 MP3로 내려받는 무료 온라인 도구입니다.",
    featureList: [
      "No watermark",
      "HD quality",
      "MP3 extraction",
      "로그인 불필요",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <KuaishouClient dict={dict} />
    </>
  );
}
