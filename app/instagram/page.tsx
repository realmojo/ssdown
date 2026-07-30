import { getDictionary } from "@/lib/get-dictionary";
import { InstagramClient } from "@/components/client/instagram-client";
import { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";
import { PageShell } from "@/components/portal/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/instagram`;

  return {
    robots: { index: true, follow: true },
    title: dict.instagram?.seo_title || "인스타그램 콘텐츠 도구",
    description:
      dict.instagram?.seo_description ||
      "인스타그램 콘텐츠 관리 도구입니다.",
    keywords: dict.instagram?.seo_keywords
      ? dict.instagram.seo_keywords.split(", ")
      : ["인스타그램 콘텐츠 저장", "인스타그램 미디어 다운로드"],
    openGraph: {
      title: dict.instagram?.seo_title || "인스타그램 콘텐츠 도구",
      description:
        dict.instagram?.seo_description ||
        "인스타그램 콘텐츠 관리 도구입니다.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-instagram-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - 인스타그램 콘텐츠 도구",
        },
      ],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.instagram?.title || "인스타그램 콘텐츠 도구",
      description:
        dict.instagram?.subtitle || "인스타그램 콘텐츠 관리 도구입니다.",
      images: ["https://ssdown.app/ssdown-instagram-og.png"],
    },
    alternates: buildAlternates(new URL(canonical).pathname),
  };
}

export default async function InstagramPage() {
  const dict = await getDictionary();

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
    name: "인스타그램 영상 다운로더",
    url: "https://ssdown.app/instagram",
    description:
      dict.instagram?.seo_description ||
      "인스타그램 콘텐츠 관리 도구입니다.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "인스타그램 영상 다운로더", item: "https://ssdown.app/instagram" },
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
      <PageShell
        crumbs={[{ label: "영상 다운로드", href: "/tools" }, { label: "인스타그램 다운로드" }]}
      >
        <InstagramClient dict={dict} />
      </PageShell>
    </>
  );
}
