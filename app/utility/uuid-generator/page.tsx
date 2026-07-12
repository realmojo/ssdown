import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { UuidGeneratorClient } from "@/components/client/uuid-generator-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const FALLBACK_FAQ = [
  {
    question: "Are these UUIDs generated privately?",
    answer:
      "Yes. Every UUID is generated locally in your browser using the cryptographically secure Web Crypto API. Nothing is sent to a server, logged, or stored — the values exist only on your device.",
  },
  {
    question: "What is the difference between UUID v4 and UUID v7?",
    answer:
      "UUID v4 is fully random, which makes each value unpredictable but unordered. UUID v7 embeds a Unix millisecond timestamp in its most significant bits, so v7 values are time-ordered and sort chronologically — a big advantage as database primary keys and indexes.",
  },
  {
    question: "Are these UUIDs guaranteed to be unique?",
    answer:
      "For all practical purposes, yes. A version 4 UUID has 122 random bits, giving roughly 5.3 x 10^36 possible values, so the chance of a collision is negligible. Version 7 adds a timestamp on top of random bits, making collisions even less likely.",
  },
  {
    question: "Can I generate UUIDs in bulk?",
    answer:
      "Yes. You can generate between 1 and 1000 UUIDs at once, copy them all with a single click, or download the entire list as a .txt file.",
  },
  {
    question: "What are the uppercase and no-hyphens options for?",
    answer:
      "Some systems expect UUIDs without hyphens (a plain 32-character hex string) or in uppercase. These formatting options let you match the exact format your database, API, or application requires.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const pageDict = (dict as Record<string, any>)?.page_uuid_generator;
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/uuid-generator`;

  const title = pageDict?.meta_title || "Free UUID Generator | SSDown";
  const description =
    pageDict?.meta_description ||
    "Generate random UUID v4 and time-ordered UUID v7 identifiers instantly in your browser. Free, secure, and 100% private.";

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

export default async function UuidGeneratorPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const pageDict = (dict as Record<string, any>)?.page_uuid_generator;

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const utilityLabel = dict?.breadcrumb?.utility || "Utility";
  const breadcrumbLabel = pageDict?.breadcrumb_title || "UUID Generator";
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
        item: "https://ssdown.app/utility/uuid-generator",
      },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "UUID Generator",
    url: "https://ssdown.app/utility/uuid-generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online UUID generator. Create random v4 and time-ordered v7 UUIDs locally in your browser.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to generate a UUID",
    description:
      "Use our free online UUID generator to create v4 and v7 unique identifiers in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Pick a version",
        text: "Choose UUID v4 for random identifiers or v7 for time-ordered ones.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Set the quantity and format",
        text: "Choose how many to generate and optional uppercase or no-hyphen formatting.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy or download",
        text: "Copy a single UUID, copy them all, or download the list as a .txt file.",
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
