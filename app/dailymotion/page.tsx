import { getDictionary } from "@/lib/get-dictionary";
import { DailymotionClient } from "@/components/client/dailymotion-client";
import { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/dailymotion`;

  return {
    robots: { index: true, follow: true },
    title: dict.dailymotion?.seo_title || "데일리모션 영상 도구",
    description:
      dict.dailymotion?.seo_description ||
      "데일리모션 영상 콘텐츠 관리 도구입니다.",
    keywords: dict.dailymotion?.seo_keywords
      ? dict.dailymotion.seo_keywords.split(", ")
      : ["데일리모션 영상 다운로드", "데일리모션 콘텐츠 저장"],
    openGraph: {
      title: dict.dailymotion?.seo_title || "데일리모션 영상 도구",
      description:
        dict.dailymotion?.seo_description ||
        "데일리모션 영상 콘텐츠 관리 도구입니다.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-dailymotion-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - 데일리모션 영상 도구",
        },
      ],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.dailymotion?.title || "데일리모션 영상 도구",
      description:
        dict.dailymotion?.subtitle || "데일리모션 영상 콘텐츠 도구입니다.",
      images: ["https://ssdown.app/ssdown-dailymotion-og.png"],
    },
    alternates: buildAlternates(new URL(canonical).pathname),
  };
}

export default async function DailymotionPage() {
  const dict = await getDictionary();

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3, 4, 5]
      .map((i) => {
        const qna = dict?.qna_dailymotion;
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
    name: "데일리모션 영상 다운로더",
    url: "https://ssdown.app/dailymotion",
    description:
      dict.dailymotion?.seo_description ||
      "데일리모션 영상 콘텐츠 관리 도구입니다.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "데일리모션 영상 다운로더", item: "https://ssdown.app/dailymotion" },
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
        crumbs={[{ label: "영상 다운로드", href: "/tools" }, { label: "데일리모션 다운로드" }]}
      >
        <DailymotionClient dict={dict} />
      </PageShell>
    </>
  );
}
