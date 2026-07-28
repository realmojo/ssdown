import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { ThumbnailGeneratorClient } from "@/components/client/thumbnail-generator-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/thumbnail-generator`;

  const title = dict.page_thumbnail_generator.meta_title;
  const description = dict.page_thumbnail_generator.meta_description;

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

export default async function ThumbnailGeneratorPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_thumbnail_generator.faq.map((item: { question: string; answer: string }) => ({
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
      { "@type": "ListItem", position: 4, name: dict.page_thumbnail_generator.breadcrumb_title, item: "https://ssdown.app/image/thumbnail-generator" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "썸네일 생성기",
    url: "https://ssdown.app/image/thumbnail-generator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "유튜브, 블로그, 소셜 미디어용 썸네일을 전문가 수준으로 만들어 줍니다.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "썸네일 생성기 사용 방법",
    description: "유튜브, 블로그, 소셜 미디어용 썸네일을 전문가 수준으로 만들어 줍니다.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "템플릿 선택",
        text: "YouTube (1280x720), Instagram (1080x1080), Twitter (1500x500) 등 규격을 선택하세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "디자인 맞춤화",
        text: "배경 이미지를 업로드하고, 텍스트와 폰트, 색상을 조절한 뒤 스티커를 배치하세요.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "내보내기 및 다운로드",
        text: "미리보기 후 고화질 PNG 또는 JPG 이미지로 다운로드하세요.",
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
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: dict.breadcrumb.home, href: "/" },
            { label: dict.breadcrumb.tools, href: "/tools" },
            { label: dict.breadcrumb.image_tools, href: "/tools/image" },
            {
              label: dict.page_thumbnail_generator.breadcrumb_title,
              href: "/image/thumbnail-generator",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <ThumbnailGeneratorClient dict={dict} />
    </>
  );
}
