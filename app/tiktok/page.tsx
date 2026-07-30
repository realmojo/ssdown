import { getDictionary } from "@/lib/get-dictionary";
import { TikTokClient } from "@/components/client/tiktok-client";

import { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tiktok`;

  return {
    robots: { index: true, follow: true },
    title: dict.tiktok?.seo_title || "TikTok Video Tool",
    description:
      dict.tiktok?.seo_description ||
      "TikTok video content management tool.",
    keywords: dict.tiktok?.seo_keywords
      ? dict.tiktok.seo_keywords.split(", ")
      : ["틱톡 영상 다운로드", "틱톡 콘텐츠 저장"],
    openGraph: {
      title: dict.tiktok?.seo_title || "TikTok Video Tool",
      description:
        dict.tiktok?.seo_description ||
        "TikTok video content management tool.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-tiktok-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - 틱톡 영상 도구",
        },
      ],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.tiktok?.title || "TikTok Video Tool",
      description:
        dict.tiktok?.subtitle || "TikTok video content management tool.",
      images: ["https://ssdown.app/ssdown-tiktok-og.png"],
    },
    alternates: buildAlternates(new URL(canonical).pathname),
  };
}

export default async function TikTokPage() {
  const dict = await getDictionary();

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3, 4, 5]
      .map((i) => {
        const qna = dict?.qna_tiktok;
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
    name: "TikTok Video Downloader",
    url: "https://ssdown.app/tiktok",
    description:
      dict.tiktok?.seo_description ||
      "TikTok video content management tool.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "TikTok Video Downloader", item: "https://ssdown.app/tiktok" },
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
        crumbs={[{ label: "영상 다운로드", href: "/tools" }, { label: "틱톡 다운로드" }]}
      >
        <TikTokClient dict={dict} />
      </PageShell>
    </>
  );
}
