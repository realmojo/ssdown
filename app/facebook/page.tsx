export const runtime = "edge";

import { getDictionary } from "@/lib/get-dictionary";
import { FacebookClient } from "@/components/client/facebook-client";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/facebook`;

  return {
    title: dict.facebook?.seo_title || "Facebook Saver",
    description:
      dict.facebook?.seo_description ||
      "Download Facebook videos in HD/4K quality.",
    keywords: dict.facebook?.seo_keywords
      ? dict.facebook.seo_keywords.split(", ")
      : ["facebook saver", "facebook video saver", "fb download"],
    openGraph: {
      title: dict.facebook?.seo_title || "Facebook Saver",
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
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.facebook?.title || "Facebook Saver",
      description:
        dict.facebook?.subtitle || "Download Facebook videos easily.",
      images: ["https://ssdown.app/ssdown-facebook-og.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function FacebookPage() {
  const dict = await getDictionary();

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
      <FacebookClient dict={dict} />
    </>
  );
}
