import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { PageShell } from "@/components/portal/page-shell";
import { SplitExcelClient } from "@/components/client/split-excel-client";
import { jsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/file/split-excel`;

  const title = dict.page_split_excel.meta_title;
  const description = dict.page_split_excel.meta_description;

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

export default async function SplitExcelPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_split_excel.faq.map((item: { question: string; answer: string }) => ({
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
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.file_data_tools, item: "https://ssdown.app/tools/file" },
      { "@type": "ListItem", position: 4, name: dict.page_split_excel.breadcrumb_title, item: "https://ssdown.app/file/split-excel" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Excel 분할",
    url: "https://ssdown.app/file/split-excel",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "무료 온라인 Excel 분할 도구입니다. 빠르고 안전하며 브라우저에서 바로 실행됩니다.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Excel 분할 사용 방법",
    description: "무료 온라인 Excel 분할 도구로 브라우저에서 안전하게 파일을 처리하세요.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "파일 올리기",
        text: "파일을 선택하거나 도구 영역으로 끌어다 놓으세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "파일 처리하기",
        text: "화면 안내에 따라 파일을 처리하거나 변환하세요.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "결과 내려받기",
        text: "처리된 파일을 기기에 바로 저장하세요.",
      },
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
          { label: dict.breadcrumb.file_tools, href: "/tools/file" },
          { label: dict.page_split_excel.breadcrumb_title },
        ]}
      >
        <SplitExcelClient dict={dict} />
      </PageShell>
    </>
  );
}
