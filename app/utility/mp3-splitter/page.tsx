import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { Mp3SplitterClient } from "@/components/client/mp3-splitter-client";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

const meta_title = "MP3 분할기 - 온라인 무료 MP3 자르기 | SSDown";
const meta_description =
  "무료 온라인 MP3 분할기. MP3를 균등 분할하거나 정해진 길이로 나누거나 원하는 시점에서 자를 수 있으며 전적으로 브라우저에서 처리됩니다. 업로드도 가입도 필요 없습니다.";
const breadcrumb_title = "MP3 Splitter";

const faq = [
  {
    question: "MP3 분할기는 어떻게 동작하나요?",
    answer:
      "MP3 파일을 올리고 분할 방식(균등 분할, 길이 기준, 지정 시점)을 고른 뒤 분할을 누르세요. 모든 처리가 웹어셈블리로 브라우저 안에서 이뤄지므로 파일이 기기를 벗어나지 않습니다.",
  },
  {
    question: "제 오디오 파일이 서버에 업로드되나요?",
    answer:
      "아니요. 모든 처리가 브라우저 안에서 이뤄집니다. MP3가 업로드되거나 저장되거나 서버로 전송되지 않아 파일이 완전히 비공개로 유지됩니다.",
  },
  {
    question: "분할하면 음질이 떨어지나요?",
    answer:
      "아니요. 스트림 복사 방식으로 재인코딩 없이 잘라내므로, 각 구간이 원본 MP3와 완전히 같은 비트레이트와 음질을 유지합니다.",
  },
  {
    question: "나뉜 파일을 한 번에 받을 수 있나요?",
    answer:
      "네. 분할 후 각 파일을 하나씩 받거나, 전체 다운로드(ZIP) 버튼으로 모든 구간을 ZIP 파일 하나로 묶어 받을 수 있습니다.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/mp3-splitter`;

  const title = meta_title;
  const description = meta_description;

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
      images: [
        {
          url: "https://ssdown.app/logo.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://ssdown.app/logo.png"],
    },
  };
}

export default async function Mp3SplitterPage() {
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
      { "@type": "ListItem", position: 4, name: breadcrumb_title, item: "https://ssdown.app/utility/mp3-splitter" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MP3 Splitter",
    url: "https://ssdown.app/utility/mp3-splitter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "무료 온라인 MP3 분할기입니다. 빠르고 안전하며 브라우저에서 바로 실행됩니다.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "MP3 분할기 사용 방법",
    description: "무료 온라인 MP3 분할기로 브라우저에서 안전하게 오디오 파일을 나누세요.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "MP3 올리기",
        text: "MP3 파일을 선택하거나 도구 영역으로 끌어다 놓으세요.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "분할 방식 선택",
        text: "균등 분할, 정해진 길이, 지정 시점 중에서 고르세요.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "분할 파일 다운로드",
        text: "각 파일을 하나씩 받거나 전체를 ZIP으로 받으세요.",
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
          { label: "MP3 Splitter" },
        ]}
      >
        <Mp3SplitterClient dict={dict} />
      </PageShell>
    </>
  );
}
