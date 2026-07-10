import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { TextCaseConverterClient } from "@/components/client/text-case-converter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

interface FaqItem {
  question: string;
  answer: string;
}

const FALLBACK_FAQ: FaqItem[] = [
  {
    question: "What is camelCase used for?",
    answer:
      "camelCase is the standard naming convention for variables, functions, and object properties in JavaScript and TypeScript. It joins words together without spaces, lowercasing the first word and capitalizing every subsequent word (e.g. myVariableName).",
  },
  {
    question: "What's the difference between snake_case and kebab-case?",
    answer:
      "Both join words in lowercase, but snake_case uses underscores (my_variable_name) while kebab-case uses hyphens (my-variable-name). snake_case is common in Python and database columns, whereas kebab-case is used for URLs, file names, and CSS class names.",
  },
  {
    question: "Is my text stored anywhere?",
    answer:
      "No. All conversion happens locally in your browser using JavaScript. Your text is never uploaded to a server or stored anywhere, so it stays completely private.",
  },
  {
    question: "Does it support non-English or Unicode text?",
    answer:
      "Partially. Case conversion works reliably for Latin-based scripts. Scripts without a concept of letter casing, such as Korean, Chinese, or Japanese, will pass through unchanged for upper/lowercase transforms, and word-splitting formats may not produce meaningful results for them.",
  },
  {
    question: "Is there a text length limit?",
    answer:
      "No. You can paste text of any length and it will be converted instantly. Because everything runs in your browser, there are no upload limits or server-side restrictions.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/text-case-converter`;

  const title =
    dict?.page_text_case_converter?.meta_title ||
    "Text Case Converter | SSDown";
  const description =
    dict?.page_text_case_converter?.meta_description ||
    "Convert text between uppercase, lowercase, Title Case, camelCase, snake_case, and more — instantly in your browser.";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en": canonical,
        "ko": canonical,
        "x-default": canonical,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      locale: locale === "kr" ? "ko_KR" : "en_US",
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

export default async function TextCaseConverterPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const utilityLabel = dict?.breadcrumb?.utility || "Utility";
  const breadcrumbLabel =
    dict?.page_text_case_converter?.breadcrumb_title || "Text Case Converter";

  const faqItems: FaqItem[] =
    dict?.page_text_case_converter?.faq || FALLBACK_FAQ;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
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
      {
        "@type": "ListItem",
        position: 1,
        name: homeLabel,
        item: "https://ssdown.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: toolsLabel,
        item: "https://ssdown.app/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: utilityLabel,
        item: "https://ssdown.app/tools/utility",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: breadcrumbLabel,
        item: "https://ssdown.app/utility/text-case-converter",
      },
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
    description:
      "Free online text case converter. Convert between uppercase, lowercase, Title Case, camelCase, snake_case, kebab-case, and more. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use the Text Case Converter",
    description:
      "Convert text between different letter cases instantly in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Paste or type your text",
        text: "Enter your text into the input box on the left.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Choose a case format",
        text: "Click a case format such as UPPERCASE, camelCase, or snake_case to transform your text.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy the result",
        text: "Click Copy Result to copy the converted text to your clipboard.",
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
            { label: homeLabel, href: "/" },
            { label: toolsLabel, href: "/tools" },
            { label: utilityLabel, href: "/tools/utility" },
            {
              label: breadcrumbLabel,
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
