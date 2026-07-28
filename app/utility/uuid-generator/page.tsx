import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { UuidGeneratorClient } from "@/components/client/uuid-generator-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/uuid-generator`;

  const title = "UUID 생성기 - UUID v4 · v7 온라인 생성 | SSDown";
  const description =
    "무료 온라인 UUID 생성기. 무작위 UUID v4와 시간순 UUID v7 식별자를 한 번에 여러 개 만들 수 있고, 대문자와 하이픈 제거 옵션도 제공합니다.";

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
    question: "UUID v4와 v7은 무엇이 다른가요?",
    answer:
      "UUID v4는 완전히 무작위라 고유성은 뛰어나지만 순서가 없습니다. UUID v7은 앞부분에 유닉스 밀리초 타임스탬프를 담아 시간순으로 정렬되면서도 충돌을 피할 만큼 무작위성을 유지합니다. 외부에 노출되는 키에는 v4를, 데이터베이스에서 정렬 가능한 기본 키가 필요하면 v7을 사용하세요.",
  },
  {
    question: "이 UUID를 데이터베이스 기본 키로 써도 되나요?",
    answer:
      "네. 두 버전 모두 128비트 식별자로 충돌 확률이 극히 낮습니다. 특히 UUID v7은 시간순 구조 덕분에 인덱스 단편화가 줄고 무작위인 v4보다 삽입 성능이 좋아 기본 키로 권장됩니다.",
  },
  {
    question: "여기서 UUID를 만들 때 제 데이터는 안전한가요?",
    answer:
      "물론입니다. 모든 UUID는 브라우저에 내장된 Web Crypto API로 전적으로 브라우저 안에서 만들어집니다. 서버로 전송되거나 기록되거나 저장되지 않습니다. 탭을 닫으면 생성된 값은 사라집니다.",
  },
  {
    question: "한 번에 몇 개까지 만들 수 있나요?",
    answer:
      "한 번에 1개부터 100개까지 만들 수 있습니다. 개수를 조정하고 버전과 형식 옵션을 고른 뒤 생성을 누르면 전체 목록이 만들어지며, 하나씩 또는 전체를 한 번에 복사할 수 있습니다.",
  },
];

export default async function UuidGeneratorPage() {
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
      { "@type": "ListItem", position: 4, name: "UUID 생성기", item: "https://ssdown.app/utility/uuid-generator" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "UUID 생성기",
    url: "https://ssdown.app/utility/uuid-generator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "무료 온라인 UUID 생성기입니다. 빠르고 안전하며 브라우저에서 바로 실행됩니다.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "UUID 생성 방법",
    description: "무료 온라인 UUID 생성기로 브라우저에서 안전하게 v4·v7 식별자를 만드세요.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Choose a version",
        text: "완전 무작위 값이 필요하면 UUID v4를, 시간순 식별자가 필요하면 UUID v7을 고르세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "개수와 옵션 설정",
        text: "만들 개수를 정하고 대문자 표기나 하이픈 제거 옵션을 켜고 끄세요.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "생성하고 복사",
        text: "생성을 누른 뒤 UUID 하나 또는 전체 목록을 한 번의 클릭으로 복사하세요.",
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
              label: "UUID 생성기",
              href: "/utility/uuid-generator",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <UuidGeneratorClient dict={dict} />
    </>
  );
}
