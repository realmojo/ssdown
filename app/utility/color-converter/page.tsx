import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { ColorConverterClient } from "@/components/client/color-converter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/color-converter`;

  const title = "색상 변환기 - HEX, RGB, HSL 변환 | SSDown";
  const description =
    "Free online color converter. Instantly convert between HEX, RGB, and HSL color formats with a live preview and color picker.";

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
    question: "HEX 색상을 RGB로 어떻게 변환하나요?",
    answer:
      "Paste or type your HEX value (for example #ff8800) into the HEX field. The converter instantly updates the RGB and HSL fields, showing the equivalent values and a live preview.",
  },
  {
    question: "HEX, RGB, HSL은 무엇이 다른가요?",
    answer:
      "HEX is a hexadecimal notation for red, green, and blue channels used in CSS. RGB expresses the same channels as decimal numbers from 0 to 255. HSL describes a color by hue, saturation, and lightness, which is often more intuitive for adjusting colors.",
  },
  {
    question: "3자리 축약형 HEX 코드도 지원하나요?",
    answer:
      "Yes. 축약형 HEX values like #f80 are automatically expanded to their full six-digit form (#ff8800) before conversion, so both formats work seamlessly.",
  },
  {
    question: "제 색상 데이터가 서버로 전송되나요?",
    answer:
      "No. All conversions happen entirely in your browser using JavaScript. Nothing is uploaded or stored, so your work stays completely private.",
  },
];

export default async function ColorConverterPage() {
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
      { "@type": "ListItem", position: 4, name: "색상 변환기", item: "https://ssdown.app/utility/color-converter" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "색상 변환기",
    url: "https://ssdown.app/utility/color-converter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "자바스크립트가 필요합니다. 모든 최신 브라우저에서 동작합니다.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online color converter tool. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use 색상 변환기 Online",
    description: "Use our free online color converter to translate colors between HEX, RGB, and HSL in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Pick or enter a color",
        text: "Use the color picker or type a value into the HEX, RGB, or HSL fields.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "See every format",
        text: "All representations update live along with a large color preview.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy the value",
        text: "Click the copy button next to any format to grab the CSS-ready string.",
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
              label: "색상 변환기",
              href: "/utility/color-converter",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <ColorConverterClient dict={dict} />
    </>
  );
}
