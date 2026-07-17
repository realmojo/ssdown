import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { NineGagClient } from "@/components/client/ninegag-client";

import { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const ninegagDict = (dict as any)["9gag"];

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/9gag`;

  return {
    robots: { index: true, follow: true },
    title: ninegagDict?.seo_title || "9GAG Video Tool",
    description:
      ninegagDict?.seo_description || "9GAG video content management tool.",
    keywords: ninegagDict?.seo_keywords
      ? ninegagDict.seo_keywords.split(", ")
      : ["9gag video tool", "9gag content tool"],
    openGraph: {
      title: ninegagDict?.seo_title || "9GAG Video Tool",
      description:
        ninegagDict?.seo_description || "9GAG video content management tool.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-9gag-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - 9GAG Video Tool",
        },
      ],
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ninegagDict?.title || "9GAG Video Tool",
      description: ninegagDict?.subtitle || "9GAG video content tool.",
      images: ["https://ssdown.app/ssdown-9gag-og.png"],
    },
    alternates: buildAlternates(new URL(canonical).pathname, locale),
  };
}

export default async function NineGagPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const ninegagDict = (dict as any)["9gag"];

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

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "9GAG Video Downloader",
    url: "https://ssdown.app/9gag",
    description:
      ninegagDict?.seo_description || "9GAG video content management tool.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "9GAG Video Downloader", item: "https://ssdown.app/9gag" },
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
      <NineGagClient dict={dict} />
    </>
  );
}
