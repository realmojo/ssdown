import { type Locale } from "@/lib/i18n-config";

import { getDictionary } from "@/lib/get-dictionary";
import { DailymotionClient } from "@/components/client/dailymotion-client";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/${lang + "/"}dailymotion`;

  return {
    title: dict.dailymotion?.seo_title || "Dailymotion Video Downloader",
    description:
      dict.dailymotion?.seo_description ||
      "Download Dailymotion videos in high quality.",
    keywords: dict.dailymotion?.seo_keywords
      ? dict.dailymotion.seo_keywords.split(", ")
      : ["dailymotion downloader", "dailymotion video download"],
    openGraph: {
      title: dict.dailymotion?.seo_title || "Dailymotion Video Downloader",
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
      locale:
        lang === "en"
          ? "en_US"
          : lang === "jp"
          ? "ja_JP"
          : lang === "kr"
          ? "ko_KR"
          : lang === "pt"
          ? "pt_BR"
          : "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.dailymotion?.title || "Dailymotion Video Downloader",
      description:
        dict.dailymotion?.subtitle || "Download Dailymotion videos instantly.",
      images: ["https://ssdown.app/ssdown-dailymotion-og.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function DailymotionPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);

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
