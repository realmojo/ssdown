import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { KuaishouClient } from "@/components/client/kuaishou-client";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/kuaishou`;

  return {
    title:
      dict.kuaishou?.seo_title ||
      "Kuaishou Video Downloader (快手) — No Watermark | SSDown",
    description:
      dict.kuaishou?.seo_description ||
      "Download Kuaishou (快手) videos without watermark for free. Save HD MP4 videos and MP3 audio from any public Kuaishou post instantly.",
    keywords: dict.kuaishou?.seo_keywords
      ? dict.kuaishou.seo_keywords.split(", ")
      : [
          "kuaishou downloader",
          "download kuaishou video",
          "kuaishou no watermark",
          "kuaishou mp4",
          "kuaishou mp3",
          "快手视频下载",
        ],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title:
        dict.kuaishou?.seo_title ||
        "Kuaishou Video Downloader (快手) — No Watermark | SSDown",
      description:
        dict.kuaishou?.seo_description ||
        "Download Kuaishou (快手) videos without watermark for free. Save HD MP4 videos and MP3 audio instantly.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-kuaishou-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - Kuaishou Video Downloader",
        },
      ],
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title:
        dict.kuaishou?.seo_title ||
        "Kuaishou Video Downloader (快手) — No Watermark",
      description:
        dict.kuaishou?.seo_description ||
        "Download Kuaishou videos without watermark. Save MP4 and MP3 instantly.",
      images: ["https://ssdown.app/ssdown-kuaishou-og.png"],
    },
    alternates: {
      canonical,
      languages: {
        "en-US": `${baseUrl}/kuaishou`,
        "ko-KR": `${baseUrl}/kuaishou`,
      },
    },
  };
}

export default async function KuaishouPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3, 4, 5]
      .map((i) => {
        const qna = dict?.qna_kuaishou;
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
    name: "SSDown Kuaishou Video Downloader",
    url: "https://ssdown.app/kuaishou",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online tool to download Kuaishou (快手) videos without watermark as MP4 or MP3.",
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
      <KuaishouClient dict={dict} />
    </>
  );
}
