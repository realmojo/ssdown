import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { FacebookClient } from "@/components/client/facebook-client";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/facebook`;

  return {
    robots: { index: false, follow: false },
    title: dict.facebook?.seo_title || "Facebook Video Tool",
    description:
      dict.facebook?.seo_description ||
      "Facebook video content management tool.",
    keywords: dict.facebook?.seo_keywords
      ? dict.facebook.seo_keywords.split(", ")
      : ["facebook video tool", "facebook content tool"],
    openGraph: {
      title: dict.facebook?.seo_title || "Facebook Video Tool",
      description:
        dict.facebook?.seo_description ||
        "Facebook video content management tool.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-facebook-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - Facebook Video Tool",
        },
      ],
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.facebook?.title || "Facebook Video Tool",
      description:
        dict.facebook?.subtitle || "Facebook video content management tool.",
      images: ["https://ssdown.app/ssdown-facebook-og.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function FacebookPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

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
