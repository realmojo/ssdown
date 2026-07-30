import { getDictionary } from "@/lib/get-dictionary";
import { NineGagClient } from "@/components/client/ninegag-client";

import { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const ninegagDict = (dict as any)["9gag"];

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/9gag`;

  return {
    robots: { index: true, follow: true },
    title: ninegagDict?.seo_title || "9GAG Video Tool",
    description:
      ninegagDict?.seo_description || "9GAG video content management tool.",
    keywords: ninegagDict?.seo_keywords
      ? ninegagDict.seo_keywords.split(", ")
      : ["9gag video tool", "9gag content tool"],
    openGraph: {
      title: ninegagDict?.seo_title || "9GAG Video Tool",
      description:
        ninegagDict?.seo_description || "9GAG video content management tool.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-9gag-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - 9GAG 영상 도구",
        },
      ],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ninegagDict?.title || "9GAG Video Tool",
      description: ninegagDict?.subtitle || "9GAG video content tool.",
      images: ["https://ssdown.app/ssdown-9gag-og.png"],
    },
    alternates: buildAlternates(new URL(canonical).pathname),
  };
}

export default async function NineGagPage() {
  const dict = await getDictionary();
  const ninegagDict = (dict as any)["9gag"];

  const pageSchema = {
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

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "9GAG Video Downloader",
    url: "https://ssdown.app/9gag",
    description:
      ninegagDict?.seo_description || "9GAG video content management tool.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "9GAG Video Downloader", item: "https://ssdown.app/9gag" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(pageSchema) }}
      />
      <PageShell
        crumbs={[{ label: "영상 다운로드", href: "/tools" }, { label: "9GAG 다운로드" }]}
      >
        <NineGagClient dict={dict} />
      </PageShell>
    </>
  );
}
