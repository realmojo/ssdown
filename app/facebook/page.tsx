import { getDictionary } from "@/lib/get-dictionary";
import { FacebookClient } from "@/components/client/facebook-client";
import { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/facebook`;

  return {
    robots: { index: true, follow: true },
    title: dict.facebook?.seo_title || "페이스북 영상 도구",
    description:
      dict.facebook?.seo_description ||
      "페이스북 영상 콘텐츠 관리 도구입니다.",
    keywords: dict.facebook?.seo_keywords
      ? dict.facebook.seo_keywords.split(", ")
      : ["페이스북 영상 다운로드", "페이스북 콘텐츠 저장"],
    openGraph: {
      title: dict.facebook?.seo_title || "페이스북 영상 도구",
      description:
        dict.facebook?.seo_description ||
        "페이스북 영상 콘텐츠 관리 도구입니다.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/ssdown-facebook-og.png",
          width: 1200,
          height: 630,
          alt: "SSDown - 페이스북 영상 도구",
        },
      ],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.facebook?.title || "페이스북 영상 도구",
      description:
        dict.facebook?.subtitle || "페이스북 영상 콘텐츠 관리 도구입니다.",
      images: ["https://ssdown.app/ssdown-facebook-og.png"],
    },
    alternates: buildAlternates(new URL(canonical).pathname),
  };
}

export default async function FacebookPage() {
  const dict = await getDictionary();

  const pageSchema = {
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
    name: "페이스북 영상 다운로더",
    url: "https://ssdown.app/facebook",
    description:
      dict.facebook?.seo_description ||
      "페이스북 영상 콘텐츠 관리 도구입니다.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "페이스북 영상 다운로더", item: "https://ssdown.app/facebook" },
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
        crumbs={[{ label: "영상 다운로드", href: "/tools" }, { label: "페이스북 다운로드" }]}
      >
        <FacebookClient dict={dict} />
      </PageShell>
    </>
  );
}
