import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { ImageConverterClient } from "@/components/client/image-converter-client";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/image-converter`;

  const title = dict.page_image_converter.meta_title;
  const description = dict.page_image_converter.meta_description;

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

export default async function ImageConverterPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_image_converter.faq.map((item: { question: string; answer: string }) => ({
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
      { "@type": "ListItem", position: 4, name: dict.page_image_converter.breadcrumb_title, item: "https://ssdown.app/image/image-converter" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "이미지 변환기",
    url: "https://ssdown.app/image/image-converter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "PNG, JPG, WebP, GIF, BMP 형식을 온라인에서 무료로 서로 변환합니다.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "이미지 변환기 사용 방법",
    description: "PNG, JPG, WebP, GIF, BMP 형식을 온라인에서 무료로 서로 변환합니다.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "이미지 업로드",
        text: "변환하려는 사진들을 업로드하세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "형식 선택",
        text: "출력할 형식(WebP, PNG, JPG)을 선택하세요.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "변환 및 다운로드",
        text: "버튼을 눌러 즉시 새 파일을 받으세요.",
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
          { label: dict.page_image_converter.breadcrumb_title },
        ]}
      >
        <ImageConverterClient dict={dict} />
      </PageShell>
    </>
  );
}
