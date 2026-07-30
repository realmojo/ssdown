import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { OgDebuggerClient } from "@/components/client/og-debugger-client";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/og-debugger`;

  const title = dict.page_og_debugger.meta_title;
  const description = dict.page_og_debugger.meta_description;

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

export default async function OgDebuggerPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_og_debugger.faq.map((item: { question: string; answer: string }) => ({
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
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.utility, item: "https://ssdown.app/tools/utility" },
      { "@type": "ListItem", position: 4, name: dict.page_og_debugger.breadcrumb_title, item: "https://ssdown.app/utility/og-debugger" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "오픈그래프 디버거",
    url: "https://ssdown.app/utility/og-debugger",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online Open Graph debugger tool. Preview and validate social share cards instantly.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "오픈그래프 디버거 사용 방법",
    description: "Paste a URL to inspect its Open Graph and Twitter Card tags and preview how it looks when shared.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "URL 입력",
        text: "확인하고 싶은 공개 페이지의 URL을 입력하세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "서버에서 가져오기",
        text: "Facebook이나 X와 동일한 소셜 크롤러 User-Agent로 페이지를 요청합니다.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "결과 확인",
        text: "링크 미리보기가 어떻게 렌더링되는지, 감지된 전체 메타 태그와 경고 목록을 확인하세요.",
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
          { label: dict.breadcrumb.utility, href: "/tools/utility" },
          { label: dict.page_og_debugger.breadcrumb_title },
        ]}
      >
        <OgDebuggerClient dict={dict} />
      </PageShell>
    </>
  );
}
