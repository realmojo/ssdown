import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { TextCaseConverterClient } from "@/components/client/text-case-converter-client";
import { PageShell } from "@/components/portal/page-shell";
import { jsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/text-case-converter`;

  const title = "대소문자 변환기 - 온라인 텍스트 케이스 변경 | SSDown";
  const description =
    "Free online text case converter. Convert text to uppercase, lowercase, title case, sentence case, camelCase, snake_case, kebab-case and more.";

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

export default async function TextCaseConverterPage() {
  const dict = await getDictionary();

  const faq = [
    {
      question: "대소문자 변환기가 무엇인가요?",
      answer:
        "A text case converter is a free online tool that instantly transforms your text into different letter cases such as UPPERCASE, lowercase, 단어 첫 글자 대문자, 문장 첫 글자 대문자, camelCase, snake_case, and kebab-case. Just type or paste your text and copy the result you need.",
    },
    {
      question: "제 텍스트는 안전한가요?",
      answer:
        "Yes. All conversions happen entirely in your browser using JavaScript. Your text is never uploaded to a server or stored anywhere. Close the tab and your text is gone.",
    },
    {
      question: "camelCase, PascalCase, snake_case는 무엇이 다른가요?",
      answer:
        "camelCase joins words with the first word lowercase and each following word capitalized (myVariableName). PascalCase capitalizes every word (MyVariableName). snake_case joins words with underscores in lowercase (my_variable_name). These are commonly used naming conventions in programming.",
    },
    {
      question: "Is there a character limit?",
      answer:
        "No. There is no limit. You can paste text of any length and every conversion updates in real-time as you type, all processed locally in your browser.",
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
      { "@type": "ListItem", position: 4, name: "대소문자 변환기", item: "https://ssdown.app/utility/text-case-converter" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "대소문자 변환기",
    url: "https://ssdown.app/utility/text-case-converter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online text case converter tool. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use 대소문자 변환기 Online",
    description: "Convert text between different letter cases instantly in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Enter your text",
        text: "Type or paste your text into the input area.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Choose a case",
        text: "See every converted case update live as you type.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy the result",
        text: "Click the copy button next to the case you need.",
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
          { label: "대소문자 변환기" },
        ]}
      >
        <TextCaseConverterClient dict={dict} />
      </PageShell>
    </>
  );
}
