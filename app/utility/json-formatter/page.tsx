import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { JsonFormatterClient } from "@/components/client/json-formatter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/json-formatter`;

  const title = "JSON Formatter - Beautify, Minify & Validate JSON | SSDown";
  const description =
    "Free online JSON formatter and validator. Beautify, minify, and validate JSON with error highlighting. Runs entirely in your browser.";

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
      images: [{ url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["https://ssdown.app/logo.png"] },
  };
}

const faq = [
  {
    question: "How do I format or beautify JSON?",
    answer:
      "Paste your JSON into the input area, choose an indentation size (2 spaces, 4 spaces, or Tab), and click Beautify. The tool parses your JSON and re-prints it with clean, consistent indentation so it is easy to read.",
  },
  {
    question: "How do I minify JSON?",
    answer:
      "Click the Minify button to remove all unnecessary whitespace and line breaks. This produces the smallest valid representation of your JSON, which is ideal for reducing payload size in APIs and config files.",
  },
  {
    question: "What happens when my JSON is invalid?",
    answer:
      "If the input cannot be parsed, the tool shows a red error message describing what went wrong. When possible, it also points to the line and column of the problem so you can locate and fix the syntax error quickly.",
  },
  {
    question: "Is my JSON data private and secure?",
    answer:
      "Yes. All parsing, formatting, and validation happen entirely in your browser using JavaScript. Your JSON is never uploaded to any server or stored anywhere. Close the tab and your data is gone.",
  },
];

export default async function JsonFormatterPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

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
      { "@type": "ListItem", position: 4, name: "JSON Formatter", item: "https://ssdown.app/utility/json-formatter" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "JSON Formatter",
    url: "https://ssdown.app/utility/json-formatter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online JSON formatter and validator. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use JSON Formatter Online",
    description: "Use our free online JSON formatter to beautify, minify, and validate JSON securely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Paste your JSON",
        text: "Type or paste your JSON into the input area.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Choose an action",
        text: "Select an indentation size, then click Beautify, Minify, or Validate.",
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
            { label: dict.breadcrumb.home, href: "/" },
            { label: dict.breadcrumb.tools, href: "/tools" },
            { label: dict.breadcrumb.utility, href: "/tools/utility" },
            {
              label: "JSON Formatter",
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
