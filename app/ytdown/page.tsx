import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { YtdownClient } from "@/components/client/ytdown-client";

import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/ytdown`;

  return {
    robots: { index: true, follow: true },
    title: dict.yt?.seo_title || "YouTube Video Downloader",
    description:
      dict.yt?.seo_description ||
      "Download YouTube videos and Shorts as MP4 (H.264 + AAC) for free.",
    keywords: dict.yt?.seo_keywords
      ? dict.yt.seo_keywords.split(", ")
      : ["youtube downloader", "youtube to mp4", "ytdown"],
    openGraph: {
      title: dict.yt?.seo_title || "YouTube Video Downloader",
      description:
        dict.yt?.seo_description ||
        "Download YouTube videos and Shorts as MP4 (H.264 + AAC) for free.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-yt-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - YouTube Video Downloader",
        },
      ],
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.yt?.title || "YouTube Video Downloader",
      description:
        dict.yt?.subtitle ||
        "Download YouTube videos and Shorts as MP4 for free.",
      images: ["https://ssdown.app/ssdown-yt-og.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function YtdownPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3, 4, 5]
      .map((i) => {
        const qna = dict?.qna_yt;
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
    name: "YouTube Video Downloader",
    url: "https://ssdown.app/ytdown",
    description:
      dict.yt?.seo_description ||
      "Download YouTube videos and Shorts as MP4 (H.264 + AAC) for free.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript. Works in any modern browser.",
    inLanguage: locale === "kr" ? "ko" : "en",
    image: "https://ssdown.app/ssdown-yt-og.png",
    featureList: [
      "Download YouTube videos as MP4 (H.264 + AAC)",
      "Download YouTube Shorts",
      "Choose 360p or 720p quality",
      "No signup or app install required",
      "Works on desktop and mobile",
    ],
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      {
        "@type": "ListItem",
        position: 2,
        name: "YouTube Video Downloader",
        item: "https://ssdown.app/ytdown",
      },
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
      <YtdownClient dict={dict} />
    </>
  );
}
