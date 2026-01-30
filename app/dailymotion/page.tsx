export const runtime = "edge";

import { getDictionary } from "@/lib/get-dictionary";
import { DailymotionClient } from "@/components/client/dailymotion-client";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/dailymotion`;

  return {
    title: dict.dailymotion?.seo_title || "Dailymotion Saver",
    description:
      dict.dailymotion?.seo_description ||
      "Download Dailymotion videos in high quality.",
    keywords: dict.dailymotion?.seo_keywords
      ? dict.dailymotion.seo_keywords.split(", ")
      : ["dailymotion saver", "dailymotion video download"],
    openGraph: {
      title: dict.dailymotion?.seo_title || "Dailymotion Saver",
      description:
        dict.dailymotion?.seo_description ||
        "Download Dailymotion videos instantly.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-dailymotion-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - Dailymotion Downloader",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.dailymotion?.title || "Dailymotion Saver",
      description:
        dict.dailymotion?.subtitle || "Download Dailymotion videos instantly.",
      images: ["https://ssdown.app/ssdown-dailymotion-og.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function DailymotionPage() {
  const dict = await getDictionary();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3, 4, 5]
      .map((i) => {
        const qna = dict?.qna_dailymotion;
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
      <DailymotionClient dict={dict} />
    </>
  );
}
