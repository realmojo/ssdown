import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { TimestampConverterClient } from "@/components/client/timestamp-converter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/timestamp-converter`;

  const title = "유닉스 타임스탬프 변환기 - 날짜 변환 | SSDown";
  const description =
    "Free online Unix timestamp converter. Convert epoch timestamps to human-readable dates and back, in local time and UTC, with a live clock.";

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

export default async function TimestampConverterPage() {
  const dict = await getDictionary();

  const faq = [
    {
      question: "유닉스 타임스탬프가 무엇인가요?",
      answer:
        "A Unix timestamp (also called epoch time) is the number of seconds that have elapsed since 00:00:00 UTC on January 1, 1970, not counting leap seconds. It is a standard way to represent a point in time across systems and programming languages.",
    },
    {
      question: "초와 밀리초는 무엇이 다른가요?",
      answer:
        "Unix timestamps are commonly stored in seconds (10 digits for current dates), but many systems such as JavaScript use milliseconds (13 digits). Our converter lets you toggle between the two so you can work with either format correctly.",
    },
    {
      question: "이 변환기는 현지 시간대를 쓰나요, UTC를 쓰나요?",
      answer:
        "Both. The tool shows the converted date in your browser's local time zone, in UTC, and in ISO 8601 format, so you can compare them side by side without any manual offset calculation.",
    },
    {
      question: "제 데이터는 안전한가요?",
      answer:
        "Yes. All conversions happen entirely in your browser using JavaScript. No timestamps or dates are ever sent to a server or stored anywhere, so your data stays completely private.",
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
      { "@type": "ListItem", position: 4, name: "타임스탬프 변환기", item: "https://ssdown.app/utility/timestamp-converter" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "타임스탬프 변환기",
    url: "https://ssdown.app/utility/timestamp-converter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online Unix timestamp converter. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use the Unix 타임스탬프 변환기",
    description: "Convert Unix timestamps to human-readable dates and back directly in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Enter a timestamp or date",
        text: "Type a Unix timestamp, or pick a date and time using the date picker.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "View the conversion",
        text: "See the result instantly in local time, UTC, ISO 8601, and Unix seconds and milliseconds.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy the result",
        text: "Click any copy button to copy the value to your clipboard.",
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
              label: "타임스탬프 변환기",
              href: "/utility/timestamp-converter",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <TimestampConverterClient dict={dict} />
    </>
  );
}
