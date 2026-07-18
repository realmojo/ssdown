import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { buildAlternates } from "@/lib/seo";
import { TextCaseConverterClient } from "@/components/client/text-case-converter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/text-case-converter`;

  const title = "Text Case Converter - Change Text Case Online | SSDown";
  const description =
    "Free online text case converter. Convert text to uppercase, lowercase, title case, sentence case, camelCase, snake_case, kebab-case and more.";

  return {
    title,
    description,
    alternates: buildAlternates(new URL(canonical).pathname, locale),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
      images: [{ url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["https://ssdown.app/logo.png"] },
  };
}

export default async function TextCaseConverterPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faq = [
    {
      question: "What is a text case converter?",
      answer:
        "A text case converter is a free online tool that instantly transforms your text into different letter cases such as UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case. Just type or paste your text and copy the result you need.",
    },
    {
      question: "Is my text private and secure?",
      answer:
        "Yes. All conversions happen entirely in your browser using JavaScript. Your text is never uploaded to a server or stored anywhere. Close the tab and your text is gone.",
    },
    {
      question: "What is the difference between camelCase, PascalCase, and snake_case?",
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
      { "@type": "ListItem", position: 4, name: "Text Case Converter", item: "https://ssdown.app/utility/text-case-converter" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Text Case Converter",
    url: "https://ssdown.app/utility/text-case-converter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online text case converter tool. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use Text Case Converter Online",
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
              label: "Text Case Converter",
              href: "/utility/text-case-converter",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <TextCaseConverterClient dict={dict} />
    </>
  );
}
