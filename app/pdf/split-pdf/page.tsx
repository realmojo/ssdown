import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { SplitPdfClient } from "@/components/client/split-pdf-client";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/split-pdf`;

  const title = dict.page_split_pdf.meta_title;
  const description = dict.page_split_pdf.meta_description;

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

export default async function SplitPdfPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_split_pdf.faq.map((item: { question: string; answer: string }) => ({
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
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.pdf_tools, item: "https://ssdown.app/tools/pdf" },
      { "@type": "ListItem", position: 4, name: dict.page_split_pdf.breadcrumb_title, item: "https://ssdown.app/pdf/split-pdf" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PDF 나누기",
    url: "https://ssdown.app/pdf/split-pdf",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "원하는 페이지만 뽑아내거나 PDF를 여러 개의 작은 파일로 나눕니다.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "PDF 나누기 사용 방법",
    description: "원하는 페이지만 뽑아내거나 PDF를 여러 개의 작은 파일로 나눕니다.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "PDF 업로드",
        text: "분할할 PDF 파일을 드래그 앤 드롭하거나 선택하세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "페이지 범위 선택",
        text: "분할할 페이지 범위를 지정하거나 개별 페이지를 선택하세요.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "분할 및 다운로드",
        text: "'PDF 분할'을 클릭하고 결과를 다운로드하세요.",
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
          { label: dict.breadcrumb.pdf_tools, href: "/tools/pdf" },
          { label: dict.page_split_pdf.breadcrumb_title },
        ]}
      >
        <SplitPdfClient dict={dict} />
      </PageShell>
    </>
  );
}
