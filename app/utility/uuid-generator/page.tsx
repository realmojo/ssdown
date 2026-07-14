import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { UuidGeneratorClient } from "@/components/client/uuid-generator-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/uuid-generator`;

  const title = "UUID Generator - Generate UUID v4 & v7 Online | SSDown";
  const description =
    "Free online UUID generator. Create random UUID v4 and time-ordered UUID v7 identifiers in bulk, with uppercase and no-hyphen options.";

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
    question: "What is the difference between UUID v4 and UUID v7?",
    answer:
      "UUID v4 is fully random, offering strong uniqueness with no ordering. UUID v7 embeds a Unix millisecond timestamp in its leading bits, so identifiers are time-ordered while still random enough to avoid collisions. Use v4 for opaque keys and v7 when you want database-friendly, sortable primary keys.",
  },
  {
    question: "Are these UUIDs safe to use as database primary keys?",
    answer:
      "Yes. Both versions are 128-bit identifiers with an extremely low collision probability. UUID v7 is especially recommended for primary keys because its time-ordered layout reduces index fragmentation and improves insert performance compared to random v4 values.",
  },
  {
    question: "Is my data private when generating UUIDs here?",
    answer:
      "Absolutely. Every UUID is generated entirely in your browser using the built-in Web Crypto API. Nothing is sent to a server, logged, or stored. Close the tab and the generated values are gone.",
  },
  {
    question: "How many UUIDs can I generate at once?",
    answer:
      "You can generate between 1 and 100 UUIDs per batch. Adjust the count field, choose your version and formatting options, then click Generate to produce the full list, which you can copy individually or all at once.",
  },
];

export default async function UuidGeneratorPage() {
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
      { "@type": "ListItem", position: 4, name: "UUID Generator", item: "https://ssdown.app/utility/uuid-generator" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "UUID Generator",
    url: "https://ssdown.app/utility/uuid-generator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online UUID generator. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to generate UUIDs online",
    description: "Use our free online UUID generator to create v4 and v7 identifiers securely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Choose a version",
        text: "Select UUID v4 for fully random values or UUID v7 for time-ordered identifiers.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Set count and options",
        text: "Pick how many UUIDs to generate and toggle uppercase or hyphen-free formatting.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Generate and copy",
        text: "Click Generate, then copy any single UUID or the whole list with one click.",
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
              label: "UUID Generator",
              href: "/utility/uuid-generator",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <UuidGeneratorClient dict={dict} />
    </>
  );
}
