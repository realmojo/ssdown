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
    robots: { index: true, follow: true },
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

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Facebook Video Downloader",
    url: "https://ssdown.app/facebook",
    description:
      dict.facebook?.seo_description ||
      "Facebook video content management tool.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "Facebook Video Downloader", item: "https://ssdown.app/facebook" },
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
      <FacebookClient dict={dict} />
    </>
  );
}
