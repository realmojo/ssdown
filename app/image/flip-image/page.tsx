import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { FlipImageClient } from "@/components/client/flip-image-client";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/flip-image`;

  const title = dict.page_flip_image.meta_title;
  const description = dict.page_flip_image.meta_description;

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

export default async function FlipImagePage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_flip_image.faq.map((item: { question: string; answer: string }) => ({
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
      { "@type": "ListItem", position: 4, name: dict.page_flip_image.breadcrumb_title, item: "https://ssdown.app/image/flip-image" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "이미지 뒤집기",
    url: "https://ssdown.app/image/flip-image",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "온라인에서 이미지를 좌우 또는 상하로 뒤집습니다.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "이미지 뒤집기 사용 방법",
    description: "온라인에서 이미지를 좌우 또는 상하로 뒤집습니다.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "이미지 업로드",
        text: "기기에서 PNG, JPG, WebP, GIF 또는 BMP 이미지를 업로드하세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "뒤집기 방향 선택",
        text: "'가로 뒤집기'로 좌우 반전 또는 '세로 뒤집기'로 상하 반전할 수 있습니다.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "결과 다운로드",
        text: "'다운로드'를 클릭하여 뒤집힌 이미지를 기기에 저장하세요.",
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
          { label: dict.page_flip_image.breadcrumb_title },
        ]}
      >
        <FlipImageClient dict={dict} />
      </PageShell>
    </>
  );
}
