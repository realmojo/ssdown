import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { DiffCheckerClient } from "@/components/client/diff-checker-client";
import { PageShell } from "@/components/portal/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/diff-checker`;

  const title = "텍스트 비교기 - 두 글의 차이 찾기 | SSDown";
  const description =
    "Free online diff checker. Compare two blocks of text and highlight added, removed, and changed lines. Private, browser-based, and instant.";

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

export default async function DiffCheckerPage() {
  const dict = await getDictionary();

  const faq = [
    {
      question: "텍스트 비교기는 어떻게 동작하나요?",
      answer:
        "Paste your original text on the left and the changed text on the right, then click Compare. The tool aligns the two texts line by line using a longest-common-subsequence algorithm and highlights every added, removed, and unchanged line.",
    },
    {
      question: "제 텍스트는 안전한가요?",
      answer:
        "Yes. All comparison happens entirely in your browser. Your text is never uploaded to any server or stored anywhere. Close the tab and your data is gone.",
    },
    {
      question: "색상은 무엇을 뜻하나요?",
      answer:
        "Green lines with a plus sign were added in the changed text, red lines with a minus sign were removed from the original, and neutral lines are unchanged between the two versions.",
    },
    {
      question: "공백이나 대소문자를 무시할 수 있나요?",
      answer:
        "Yes. Enable the 'Ignore whitespace' option to treat lines that differ only in spacing as identical, and enable 'Ignore case' to treat uppercase and lowercase letters as the same when comparing.",
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
      { "@type": "ListItem", position: 4, name: "텍스트 비교기", item: "https://ssdown.app/utility/diff-checker" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "텍스트 비교기",
    url: "https://ssdown.app/utility/diff-checker",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online diff checker tool. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use 텍스트 비교기 Online",
    description: "Use our free online diff checker to compare two texts securely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Paste your texts",
        text: "Enter the original text on the left and the changed text on the right.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Compare",
        text: "Click Compare to align both texts line by line and highlight the differences.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Review the result",
        text: "See added lines in green, removed lines in red, and a summary of the changes.",
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
          { label: "텍스트 비교기" },
        ]}
      >
        <DiffCheckerClient dict={dict} />
      </PageShell>
    </>
  );
}
