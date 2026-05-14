import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { InstagramClient } from "@/components/client/instagram-client";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/instagram`;

  return {
    robots: { index: true, follow: true },
    title: dict.instagram?.seo_title || "Instagram Content Tool",
    description:
      dict.instagram?.seo_description ||
      "Instagram content management tool.",
    keywords: dict.instagram?.seo_keywords
      ? dict.instagram.seo_keywords.split(", ")
      : ["instagram content tool", "instagram media tool"],
    openGraph: {
      title: dict.instagram?.seo_title || "Instagram Content Tool",
      description:
        dict.instagram?.seo_description ||
        "Instagram content management tool.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-instagram-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - Instagram Content Tool",
        },
      ],
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.instagram?.title || "Instagram Content Tool",
      description:
        dict.instagram?.subtitle || "Instagram content management tool.",
      images: ["https://ssdown.app/ssdown-instagram-og.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function InstagramPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3, 4, 5]
      .map((i) => {
        const qna = dict?.qna_instagram;
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
    name: "Instagram Video Downloader",
    url: "https://ssdown.app/instagram",
    description:
      dict.instagram?.seo_description ||
      "Instagram content management tool.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "Instagram Video Downloader", item: "https://ssdown.app/instagram" },
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
      <InstagramClient dict={dict} />
    </>
  );
}
