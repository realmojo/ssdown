export const runtime = "edge";

import { getDictionary } from "@/lib/get-dictionary";
import { XClient } from "@/components/client/x-client";

import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/x`;

  return {
    title: dict.x?.seo_title || "X (Twitter) Saver",
    description:
      dict.x?.seo_description || "Download X (Twitter) videos in high quality.",
    keywords: dict.x?.seo_keywords
      ? dict.x.seo_keywords.split(", ")
      : ["twitter saver", "x video download"],
    openGraph: {
      title: dict.x?.seo_title || "X (Twitter) Saver",
      description:
        dict.x?.seo_description || "Download X (Twitter) videos securely.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-x-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - X Saver",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.x?.title || "X (Twitter) Saver",
      description: dict.x?.subtitle || "Download X videos and GIFs online.",
      images: ["https://ssdown.app/ssdown-x-og.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function TwitterPage() {
  const dict = await getDictionary();
  // 동적 import로 번들 크기 최적화
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3, 4, 5]
      .map((i) => {
        const qna = dict?.qna;
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <XClient dict={dict} />
    </>
  );
}
