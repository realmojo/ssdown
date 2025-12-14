import { i18n, type Locale } from "@/lib/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";
import { XClient } from "@/components/client/x-client";
import { getPostsByCategory } from "@/lib/posts";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/${lang === "en" ? "" : lang + "/"}x`;

  return {
    title: dict.x?.seo_title || "X (Twitter) Video Downloader",
    description:
      dict.x?.seo_description || "Download X (Twitter) videos in high quality.",
    keywords: dict.x?.seo_keywords
      ? dict.x.seo_keywords.split(", ")
      : ["twitter downloader", "x video download"],
    openGraph: {
      title: dict.x?.seo_title || "X (Twitter) Video Downloader",
      description:
        dict.x?.seo_description || "Download X (Twitter) videos securely.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-x-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - X Video Downloader",
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
      title: dict.x?.title || "X (Twitter) Video Downloader",
      description: dict.x?.subtitle || "Download X videos and GIFs online.",
      images: ["https://ssdown.app/ssdown-x-og.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function TwitterPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);
  const relatedPosts = await getPostsByCategory("x");

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
      <XClient dict={dict} lang={params.lang} relatedPosts={relatedPosts} />
    </>
  );
}
