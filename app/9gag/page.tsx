import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { NineGagClient } from "@/components/client/ninegag-client";

import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const ninegagDict = (dict as any)["9gag"];

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/9gag`;

  return {
    title: ninegagDict?.seo_title || "9GAG Saver",
    description:
      ninegagDict?.seo_description || "Download 9GAG videos in high quality.",
    keywords: ninegagDict?.seo_keywords
      ? ninegagDict.seo_keywords.split(", ")
      : ["9gag saver", "9gag video download"],
    openGraph: {
      title: ninegagDict?.seo_title || "9GAG Saver",
      description:
        ninegagDict?.seo_description || "Download 9GAG videos securely.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-9gag-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - 9GAG Saver",
        },
      ],
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ninegagDict?.title || "9GAG Saver",
      description: ninegagDict?.subtitle || "Download 9GAG videos online.",
      images: ["https://ssdown.app/ssdown-9gag-og.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function NineGagPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

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
      <NineGagClient dict={dict} />
    </>
  );
}
