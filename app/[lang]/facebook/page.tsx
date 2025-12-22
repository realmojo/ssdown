import { i18n, type Locale } from "@/lib/i18n-config";
export const runtime = "edge";
import { getDictionary } from "@/lib/get-dictionary";
import { FacebookClient } from "@/components/client/facebook-client";
import { Metadata } from "next";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/${lang === "en" ? "" : lang + "/"}facebook`;

  return {
    title: dict.facebook?.seo_title || "Facebook Video Downloader",
    description:
      dict.facebook?.seo_description ||
      "Download Facebook videos in HD/4K quality.",
    keywords: dict.facebook?.seo_keywords
      ? dict.facebook.seo_keywords.split(", ")
      : ["facebook downloader", "facebook video saver", "fb download"],
    openGraph: {
      title: dict.facebook?.seo_title || "Facebook Video Downloader",
      description:
        dict.facebook?.seo_description ||
        "Download Facebook videos in high quality.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-facebook-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - Facebook Downloader",
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
      title: dict.facebook?.title || "Facebook Video Downloader",
      description:
        dict.facebook?.subtitle || "Download Facebook videos easily.",
      images: ["https://ssdown.app/ssdown-facebook-og.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function FacebookPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);
  const { getPostsByCategory } = await import("@/lib/posts");
  const relatedPosts = await getPostsByCategory("facebook");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3, 4, 5]
      .map((i) => {
        const qna = dict?.qna_facebook;
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
      <FacebookClient
        dict={dict}
        lang={params.lang}
        relatedPosts={relatedPosts}
      />
    </>
  );
}
