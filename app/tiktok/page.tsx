import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { TikTokClient } from "@/components/client/tiktok-client";

import { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tiktok`;

  return {
    robots: { index: true, follow: true },
    title: dict.tiktok?.seo_title || "TikTok Video Tool",
    description:
      dict.tiktok?.seo_description ||
      "TikTok video content management tool.",
    keywords: dict.tiktok?.seo_keywords
      ? dict.tiktok.seo_keywords.split(", ")
      : ["tiktok video tool", "tiktok content tool"],
    openGraph: {
      title: dict.tiktok?.seo_title || "TikTok Video Tool",
      description:
        dict.tiktok?.seo_description ||
        "TikTok video content management tool.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-tiktok-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - TikTok Video Tool",
        },
      ],
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.tiktok?.title || "TikTok Video Tool",
      description:
        dict.tiktok?.subtitle || "TikTok video content management tool.",
      images: ["https://ssdown.app/ssdown-tiktok-og.png"],
    },
    alternates: buildAlternates(new URL(canonical).pathname, locale),
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

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "TikTok Video Downloader",
    url: "https://ssdown.app/tiktok",
    description:
      dict.tiktok?.seo_description ||
      "TikTok video content management tool.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "TikTok Video Downloader", item: "https://ssdown.app/tiktok" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TikTokClient dict={dict} />
    </>
  );
}
