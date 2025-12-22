import { i18n, type Locale } from "@/lib/i18n-config";
export const runtime = "edge";
import { getDictionary } from "@/lib/get-dictionary";
import { NineGagClient } from "@/components/client/ninegag-client";
import { getPostsByCategory } from "@/lib/posts";


import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const ninegagDict = (dict as any)["9gag"];

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/${lang === "en" ? "" : lang + "/"}9gag`;

  return {
    title: ninegagDict?.seo_title || "9GAG Video Downloader",
    description:
      ninegagDict?.seo_description || "Download 9GAG videos in high quality.",
    keywords: ninegagDict?.seo_keywords
      ? ninegagDict.seo_keywords.split(", ")
      : ["9gag downloader", "9gag video download"],
    openGraph: {
      title: ninegagDict?.seo_title || "9GAG Video Downloader",
      description:
        ninegagDict?.seo_description || "Download 9GAG videos securely.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-9gag-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - 9GAG Video Downloader",
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
      title: ninegagDict?.title || "9GAG Video Downloader",
      description: ninegagDict?.subtitle || "Download 9GAG videos online.",
      images: ["https://ssdown.app/ssdown-9gag-og.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function NineGagPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);
  const relatedPosts = await getPostsByCategory("9gag");

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
      <NineGagClient dict={dict} lang={params.lang} relatedPosts={relatedPosts} />
    </>
  );
}
