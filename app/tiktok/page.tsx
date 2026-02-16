import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { TikTokClient } from "@/components/client/tiktok-client";

import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tiktok`;

  return {
    title: dict.tiktok?.seo_title || "TikTok Saver",
    description:
      dict.tiktok?.seo_description ||
      "Download TikTok videos without watermark.",
    keywords: dict.tiktok?.seo_keywords
      ? dict.tiktok.seo_keywords.split(", ")
      : ["tiktok saver", "tiktok no watermark"],
    openGraph: {
      title: dict.tiktok?.seo_title || "TikTok Saver",
      description:
        dict.tiktok?.seo_description ||
        "Download TikTok videos without watermark.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-tiktok-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - TikTok Saver",
        },
      ],
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.tiktok?.title || "TikTok Saver",
      description:
        dict.tiktok?.subtitle || "Download TikTok videos without watermark.",
      images: ["https://ssdown.app/ssdown-tiktok-og.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function TikTokPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3, 4, 5]
      .map((i) => {
        const qna = dict?.qna_tiktok;
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
      <TikTokClient dict={dict} />
    </>
  );
}
