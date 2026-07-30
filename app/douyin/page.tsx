import { getDictionary } from "@/lib/get-dictionary";
import { DouyinClient } from "@/components/client/douyin-client";
import { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";
import { PageShell } from "@/components/portal/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/douyin`;

  return {
    title:
      dict.douyin?.seo_title ||
      "더우인(抖音) 영상 다운로드 — 워터마크 없이 | SSDown",
    description:
      dict.douyin?.seo_description ||
      "더우인(抖音) 영상을 워터마크 없이 무료로 내려받으세요. 공개된 더우인 게시물의 HD MP4 영상과 MP3 음원을 바로 저장할 수 있습니다.",
    keywords: dict.douyin?.seo_keywords
      ? dict.douyin.seo_keywords.split(", ")
      : [
          "더우인 다운로드",
          "더우인 영상 다운로드",
          "더우인 워터마크 제거",
          "더우인 mp4 저장",
          "더우인 mp3 추출",
        ],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title:
        dict.douyin?.seo_title ||
        "더우인(抖音) 영상 다운로드 — 워터마크 없이 | SSDown",
      description:
        dict.douyin?.seo_description ||
        "더우인(抖音) 영상을 워터마크 없이 무료로 내려받으세요. HD MP4 영상과 MP3 음원을 바로 저장할 수 있습니다.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-douyin-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - 더우인 영상 다운로더",
        },
      ],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title:
        dict.douyin?.seo_title ||
        "더우인(抖音) 영상 다운로드 — 워터마크 없이",
      description:
        dict.douyin?.seo_description ||
        "더우인 영상을 워터마크 없이 내려받으세요. MP4와 MP3를 바로 저장할 수 있습니다.",
      images: ["https://ssdown.app/ssdown-douyin-og.png"],
    },
    alternates: buildAlternates(new URL(canonical).pathname),
  };
}

export default async function DouyinPage() {
  const dict = await getDictionary();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3, 4, 5]
      .map((i) => {
        const qna = dict?.qna_douyin;
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
    name: "SSDown 더우인 영상 다운로더",
    url: "https://ssdown.app/douyin",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "더우인(抖音) 영상을 워터마크 없이 MP4나 MP3로 내려받는 무료 온라인 도구입니다.",
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
      <PageShell
        crumbs={[{ label: "영상 다운로드", href: "/tools" }, { label: "더우인 다운로드" }]}
      >
        <DouyinClient dict={dict} />
      </PageShell>
    </>
  );
}
