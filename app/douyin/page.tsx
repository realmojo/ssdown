import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { DouyinClient } from "@/components/client/douyin-client";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/douyin`;

  return {
    title:
      dict.douyin?.seo_title ||
      "Douyin Video Downloader (抖音) — No Watermark | SSDown",
    description:
      dict.douyin?.seo_description ||
      "Download Douyin (抖音) videos without watermark for free. Save HD MP4 videos and MP3 audio from any public Douyin post instantly.",
    keywords: dict.douyin?.seo_keywords
      ? dict.douyin.seo_keywords.split(", ")
      : [
          "douyin downloader",
          "download douyin video",
          "douyin no watermark",
          "douyin mp4",
          "douyin mp3",
        ],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title:
        dict.douyin?.seo_title ||
        "Douyin Video Downloader (抖音) — No Watermark | SSDown",
      description:
        dict.douyin?.seo_description ||
        "Download Douyin (抖音) videos without watermark for free. Save HD MP4 videos and MP3 audio instantly.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-douyin-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - Douyin Video Downloader",
        },
      ],
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title:
        dict.douyin?.seo_title ||
        "Douyin Video Downloader (抖音) — No Watermark",
      description:
        dict.douyin?.seo_description ||
        "Download Douyin videos without watermark. Save MP4 and MP3 instantly.",
      images: ["https://ssdown.app/ssdown-douyin-og.png"],
    },
    alternates: {
      canonical,
      languages: {
        "en-US": `${baseUrl}/douyin`,
        "ko-KR": `${baseUrl}/douyin`,
      },
    },
  };
}

export default async function DouyinPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

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
    name: "SSDown Douyin Video Downloader",
    url: "https://ssdown.app/douyin",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online tool to download Douyin (抖音) videos without watermark as MP4 or MP3.",
    featureList: [
      "No watermark",
      "HD quality",
      "MP3 extraction",
      "No login required",
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
      <DouyinClient dict={dict} />
    </>
  );
}
