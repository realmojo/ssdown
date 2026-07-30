import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { CollageMakerClient } from "@/components/client/collage-maker-client";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/collage-maker`;

  const title = dict.page_collage_maker.meta_title;
  const description = dict.page_collage_maker.meta_description;

  return {
    title,
    description,
    alternates: buildAlternates(new URL(canonical).pathname),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      locale: "ko_KR",
      type: "website",
      images: [{ url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["https://ssdown.app/logo.png"] },
  };
}

export default async function CollageMakerPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_collage_maker.faq.map((item: { question: string; answer: string }) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.breadcrumb.home, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: dict.breadcrumb.tools, item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.image_tools, item: "https://ssdown.app/tools/image" },
      { "@type": "ListItem", position: 4, name: dict.page_collage_maker.breadcrumb_title, item: "https://ssdown.app/image/collage-maker" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "콜라주 만들기",
    url: "https://ssdown.app/image/collage-maker",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "여러 장의 사진으로 멋진 콜라주를 온라인에서 무료로 만들어 보세요.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "콜라주 만들기 사용 방법",
    description: "여러 장의 사진으로 멋진 콜라주를 온라인에서 무료로 만들어 보세요.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "사진 업로드",
        text: "콜라주에 사용할 사진들을 업로드하세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "레이아웃 선택",
        text: "원하는 레이아웃을 선택하고 사진 순서를 변경하세요.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "결과 다운로드",
        text: "'다운로드'를 클릭하여 콜라주를 저장하세요.",
      }
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />
      <PageShell
        sidebar={false}
        crumbs={[
          { label: dict.breadcrumb.tools, href: "/tools" },
          { label: dict.breadcrumb.image_tools, href: "/tools/image" },
          { label: dict.page_collage_maker.breadcrumb_title },
        ]}
      >
        <CollageMakerClient dict={dict} />
      </PageShell>
    </>
  );
}
