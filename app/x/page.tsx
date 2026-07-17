import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { XClient } from "@/components/client/x-client";

import { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/x`;

  return {
    robots: { index: true, follow: true },
    title: dict.x?.seo_title || "X (Twitter) Video Tool",
    description:
      dict.x?.seo_description || "X (Twitter) video content management tool.",
    keywords: dict.x?.seo_keywords
      ? dict.x.seo_keywords.split(", ")
      : ["x video tool", "twitter video tool"],
    openGraph: {
      title: dict.x?.seo_title || "X (Twitter) Video Tool",
      description:
        dict.x?.seo_description || "X (Twitter) video content management tool.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-x-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - X Video Tool",
        },
      ],
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.x?.title || "X (Twitter) Video Tool",
      description: dict.x?.subtitle || "X (Twitter) video content tool.",
      images: ["https://ssdown.app/ssdown-x-og.png"],
    },
    alternates: buildAlternates(new URL(canonical).pathname, locale),
  };
}

export default async function TwitterPage() {
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

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "X (Twitter) Video Downloader",
    url: "https://ssdown.app/x",
    description:
      dict.x?.seo_description || "X (Twitter) video content management tool.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "X (Twitter) Video Downloader", item: "https://ssdown.app/x" },
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
      <XClient dict={dict} />
    </>
  );
}
