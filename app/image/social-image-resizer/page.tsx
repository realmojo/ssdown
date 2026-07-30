import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { SocialImageResizerClient } from "@/components/client/social-image-resizer-client";
import { PageShell } from "@/components/portal/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/social-image-resizer`;

  const title = dict.page_social_image_resizer.meta_title;
  const description = dict.page_social_image_resizer.meta_description;

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

export default async function SocialImageResizerPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_social_image_resizer.faq.map((item: { question: string; answer: string }) => ({
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
      { "@type": "ListItem", position: 4, name: dict.page_social_image_resizer.breadcrumb_title, item: "https://ssdown.app/image/social-image-resizer" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "소셜 이미지 리사이저",
    url: "https://ssdown.app/image/social-image-resizer",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "인스타그램, 트위터, 페이스북, 링크드인에 딱 맞게 이미지 크기를 조절합니다.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "소셜 이미지 리사이저 사용 방법",
    description: "인스타그램, 트위터, 페이스북, 링크드인에 딱 맞게 이미지 크기를 조절합니다.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "이미지 업로드",
        text: "크기를 조정하려는 사진을 올리세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "자동 조절",
        text: "각 플랫폼 규격에 맞춘 미리보기가 자동으로 생성됩니다.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "다운로드",
        text: "필요한 규격을 선택해 즉시 저장하세요.",
      }
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PageShell
        sidebar={false}
        crumbs={[
          { label: dict.breadcrumb.tools, href: "/tools" },
          { label: dict.breadcrumb.image_tools, href: "/tools/image" },
          { label: dict.page_social_image_resizer.breadcrumb_title },
        ]}
      >
        <SocialImageResizerClient dict={dict} />
      </PageShell>
    </>
  );
}
