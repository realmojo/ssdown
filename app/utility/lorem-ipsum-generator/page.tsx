import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { LoremIpsumGeneratorClient } from "@/components/client/lorem-ipsum-generator-client";
import { PageShell } from "@/components/portal/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/lorem-ipsum-generator`;

  const title = "로렘 입숨 생성기 - 더미 텍스트 만들기 | SSDown";
  const description =
    "Free online Lorem Ipsum generator. Create placeholder paragraphs, sentences, or words for your designs, mockups, and layouts.";

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

export default async function LoremIpsumGeneratorPage() {
  const dict = await getDictionary();

  const faq = [
    {
      question: "로렘 입숨이 무엇인가요?",
      answer:
        "Lorem Ipsum is placeholder text derived from a Latin passage by Cicero. It has been the industry-standard dummy text since the 1500s, used to fill layouts and mockups so designers can focus on visual structure without the distraction of readable content.",
    },
    {
      question: "이 로렘 입숨 생성기는 어떻게 쓰나요?",
      answer:
        "Choose whether you want paragraphs, sentences, or words, set how many you need, then click Generate. Toggle the options to start with the classic 'Lorem ipsum dolor sit amet' opening or to wrap each paragraph in HTML <p> tags, and copy the result with one click.",
    },
    {
      question: "이 로렘 입숨 생성기는 무료이고 안전한가요?",
      answer:
        "Yes. The tool is completely free with no signup required, and all text is generated locally in your browser. Nothing you generate is ever sent to a server or stored anywhere.",
    },
    {
      question: "HTML에 바로 쓸 수 있는 더미 텍스트도 만들 수 있나요?",
      answer:
        "Absolutely. Enable the 'Wrap paragraphs in <p> 태그 옵션을 켜면 각 문단이 다음 태그로 감싸집니다: <p> element, ready to paste straight into your HTML markup or CMS.",
    },
  ];

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
      { "@type": "ListItem", position: 4, name: "로렘 입숨 생성기", item: "https://ssdown.app/utility/lorem-ipsum-generator" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "로렘 입숨 생성기",
    url: "https://ssdown.app/utility/lorem-ipsum-generator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online Lorem Ipsum generator. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use 로렘 입숨 생성기 Online",
    description: "Use our free online Lorem Ipsum generator to create placeholder text securely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Choose your options",
        text: "Select paragraphs, sentences, or words and set how many you need.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Generate placeholder text",
        text: "Click Generate to instantly create Lorem Ipsum in your browser.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy the result",
        text: "Copy the generated text and paste it into your design or layout.",
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
      <PageShell
        sidebar={false}
        crumbs={[
          { label: dict.breadcrumb.tools, href: "/tools" },
          { label: dict.breadcrumb.utility, href: "/tools/utility" },
          { label: "로렘 입숨 생성기" },
        ]}
      >
        <LoremIpsumGeneratorClient dict={dict} />
      </PageShell>
    </>
  );
}
