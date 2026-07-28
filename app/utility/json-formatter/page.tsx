import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { JsonFormatterClient } from "@/components/client/json-formatter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/json-formatter`;

  const title = "JSON 포매터 - 정렬, 압축, 검사 | SSDown";
  const description =
    "무료 온라인 JSON 포매터·검사기. 오류를 짚어 주면서 JSON을 정렬하고 압축하고 검사합니다. 전적으로 브라우저에서 실행됩니다.";

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

const faq = [
  {
    question: "JSON을 어떻게 정렬하나요?",
    answer:
      "입력창에 JSON을 붙여넣고 들여쓰기 크기(공백 2칸, 4칸, 탭)를 고른 뒤 정렬을 누르세요. JSON을 해석해 읽기 쉽도록 일관된 들여쓰기로 다시 출력해 줍니다.",
  },
  {
    question: "JSON을 어떻게 압축하나요?",
    answer:
      "압축 버튼을 누르면 불필요한 공백과 줄바꿈이 모두 제거됩니다. 유효한 JSON 중 가장 작은 형태가 되어 API 응답이나 설정 파일의 용량을 줄이는 데 적합합니다.",
  },
  {
    question: "JSON이 올바르지 않으면 어떻게 되나요?",
    answer:
      "입력을 해석할 수 없으면 무엇이 잘못됐는지 설명하는 빨간 오류 메시지가 표시됩니다. 가능한 경우 문제가 있는 줄과 열까지 알려 주어 문법 오류를 빠르게 찾아 고칠 수 있습니다.",
  },
  {
    question: "제 JSON 데이터는 안전한가요?",
    answer:
      "네. 해석, 정렬, 검사가 모두 자바스크립트로 전적으로 브라우저 안에서 이뤄집니다. JSON이 서버로 업로드되거나 저장되지 않습니다. 탭을 닫으면 데이터는 사라집니다.",
  },
];

export default async function JsonFormatterPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
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
      { "@type": "ListItem", position: 4, name: "JSON 포매터", item: "https://ssdown.app/utility/json-formatter" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "JSON 포매터",
    url: "https://ssdown.app/utility/json-formatter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "무료 온라인 JSON 포매터·검사기입니다. 빠르고 안전하며 브라우저에서 바로 실행됩니다.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use JSON 포매터 Online",
    description: "무료 온라인 JSON 포매터로 브라우저에서 안전하게 JSON을 정렬하고 압축하고 검사하세요.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "JSON 붙여넣기",
        text: "입력창에 JSON을 입력하거나 붙여넣으세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "작업 선택",
        text: "들여쓰기 크기를 고른 뒤 정렬, 압축, 검사 중 하나를 누르세요.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "복사 또는 다운로드",
        text: "결과를 클립보드에 복사하거나 .json 파일로 내려받으세요.",
      },
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
            { label: dict.breadcrumb.utility, href: "/tools/utility" },
            {
              label: "JSON 포매터",
              href: "/utility/json-formatter",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <JsonFormatterClient dict={dict} />
    </>
  );
}
