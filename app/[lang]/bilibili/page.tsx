import { type Locale } from "@/lib/i18n-config";
export const runtime = "edge";
import { getDictionary } from "@/lib/get-dictionary";
import { BilibiliClient } from "@/components/client/bilibili-client";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  // Cast to any to access potential dynamic keys safely
  const bilibiliDict = (dict as any)["bilibili"];

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/${lang === "en" ? "" : lang + "/"}bilibili`;

  return {
    title: bilibiliDict?.seo_title || "Bilibili Video Downloader",
    description:
      bilibiliDict?.seo_description ||
      "Download Bilibili videos in high quality without watermark.",
    keywords: bilibiliDict?.seo_keywords
      ? bilibiliDict.seo_keywords.split(", ")
      : ["bilibili downloader", "bilibili video download", "bilibili to mp4"],
    openGraph: {
      title: bilibiliDict?.seo_title || "Bilibili Video Downloader",
      description:
        bilibiliDict?.seo_description ||
        "Download Bilibili videos in high quality without watermark.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-bilibili-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - Bilibili Video Downloader",
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
      title: bilibiliDict?.title || "Bilibili Video Downloader",
      description:
        bilibiliDict?.subtitle ||
        "Download Bilibili videos instantly. No watermark, high quality.",
      images: ["https://ssdown.app/ssdown-bilibili-og.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function BilibiliPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);
  const { getPostsByCategory } = await import("@/lib/posts");
  const relatedPosts = await getPostsByCategory("bilibili");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3, 4, 5]
      .map((i) => {
        const qna = (dict as any)?.qna_bilibili;
        if (!qna) return null;
        const question = qna[`faq_${i}_q`];
        const answer = qna[`faq_${i}_a`];
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
      <BilibiliClient
        dict={dict}
        lang={params.lang}
        relatedPosts={relatedPosts}
      />
    </>
  );
}
