import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { JsonFormatterClient } from "@/components/client/json-formatter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const FALLBACK_FAQ = [
  {
    question: "Is my JSON data uploaded to a server?",
    answer:
      "No. All formatting, minifying, and validation happens locally in your browser using JavaScript. Your JSON never leaves your device — it is never uploaded, logged, or stored anywhere.",
  },
  {
    question: "What's the difference between Format and Minify?",
    answer:
      "Format (also called beautify or pretty-print) adds indentation and line breaks to make JSON human-readable. Minify strips all unnecessary whitespace to produce the smallest possible output, which is ideal for transmitting data or reducing file size.",
  },
  {
    question: "How does validation report errors?",
    answer:
      "When your JSON is invalid, the tool shows the parser's error message along with the exact line and column where the problem occurs, so you can jump straight to the issue and fix it.",
  },
  {
    question: "What does the 'sort keys' option do?",
    answer:
      "Sort keys recursively reorders every object's properties alphabetically. This is useful for producing deterministic output, making diffs cleaner, or comparing two JSON documents that contain the same data in a different order.",
  },
  {
    question: "Is there a size limit for JSON?",
    answer:
      "There is no fixed limit. Because everything runs in your browser, you can format very large JSON documents, though extremely large files may be constrained by your device's available memory.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const pageDict = (dict as Record<string, any>)?.page_json_formatter;
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/json-formatter`;

  const title =
    pageDict?.meta_title ||
    "Free JSON Formatter & Validator | SSDown";
  const description =
    pageDict?.meta_description ||
    "Format, beautify, minify, and validate JSON instantly in your browser. Free, secure, and 100% private.";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: canonical,
        ko: canonical,
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

export default async function JsonFormatterPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const pageDict = (dict as Record<string, any>)?.page_json_formatter;

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const utilityLabel = dict?.breadcrumb?.utility || "Utility";
  const breadcrumbLabel = pageDict?.breadcrumb_title || "JSON Formatter";
  const faqItems: { question: string; answer: string }[] =
    pageDict?.faq || FALLBACK_FAQ;

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
        item: "https://ssdown.app/utility/json-formatter",
      },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "JSON Formatter",
    url: "https://ssdown.app/utility/json-formatter",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online JSON formatter and validator. Beautify, minify, and validate JSON locally in your browser.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to format JSON",
    description:
      "Use our free online JSON formatter to beautify, minify, and validate JSON in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Paste your JSON",
        text: "Paste or type your JSON into the input area.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Choose an action",
        text: "Click Format to beautify, Minify to compress, or Validate to check for errors.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy or download",
        text: "Copy the result to your clipboard or download it as a .json file.",
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
