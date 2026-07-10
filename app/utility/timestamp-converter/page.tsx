import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { TimestampConverterClient } from "@/components/client/timestamp-converter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const FALLBACK_FAQ = [
  {
    question: "What is a Unix timestamp?",
    answer:
      "A Unix timestamp is the number of seconds that have elapsed since the Unix epoch, which is 00:00:00 UTC on January 1, 1970. It is a compact, timezone-independent way to represent a specific point in time and is used extensively across programming languages, databases, and APIs.",
  },
  {
    question:
      "Why does JavaScript use milliseconds while Unix and most systems use seconds?",
    answer:
      "JavaScript's Date.now() and getTime() return the number of milliseconds since the epoch for higher precision, whereas most Unix tools, databases, and APIs (like the standard time() call) use seconds. This 1000x difference is a common source of bugs, so always confirm which unit an API expects.",
  },
  {
    question: "How do I convert between seconds and milliseconds?",
    answer:
      "To convert seconds to milliseconds, multiply by 1000. To convert milliseconds to seconds, divide by 1000 (and typically floor the result to drop the fractional part). This tool auto-detects the unit based on digit count, treating values with 13 or more digits as milliseconds.",
  },
  {
    question: "What timezone does this tool use for local time?",
    answer:
      "Local time is displayed using your browser's own system timezone, which is detected automatically. The tool also shows the detected timezone name alongside the UTC and ISO 8601 representations so you can compare them directly.",
  },
  {
    question: "Is this tool accurate and private?",
    answer:
      "Yes. All conversions happen locally in your browser using the native JavaScript Date object. Nothing is sent to a server, so your data stays private and results are instant with no network round-trip.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/timestamp-converter`;

  const title =
    dict?.page_timestamp_converter?.meta_title ||
    "Unix Timestamp Converter | SSDown";
  const description =
    dict?.page_timestamp_converter?.meta_description ||
    "Convert between Unix timestamps and human-readable dates instantly. See the current timestamp live, updated every second.";

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
        { url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title },
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

export default async function TimestampConverterPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const breadcrumbLabel =
    dict?.page_timestamp_converter?.breadcrumb_title || "Timestamp Converter";
  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const utilityLabel = dict?.breadcrumb?.utility || "Utility";

  const faqItems: { question: string; answer: string }[] =
    dict?.page_timestamp_converter?.faq || FALLBACK_FAQ;

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
      { "@type": "ListItem", position: 1, name: homeLabel, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: toolsLabel, item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: utilityLabel, item: "https://ssdown.app/tools/utility" },
      {
        "@type": "ListItem",
        position: 4,
        name: breadcrumbLabel,
        item: "https://ssdown.app/utility/timestamp-converter",
      },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Unix Timestamp Converter",
    url: "https://ssdown.app/utility/timestamp-converter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online Unix timestamp converter. Convert timestamps to dates and back, instantly in your browser.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to convert Unix timestamps online",
    description:
      "Use our free online timestamp converter to translate between Unix timestamps and human-readable dates entirely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "See the live timestamp",
        text: "View the current Unix timestamp updating every second in seconds and milliseconds.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Timestamp to date",
        text: "Paste a Unix timestamp to convert it into local, UTC, and ISO 8601 dates.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Date to timestamp",
        text: "Pick a date and time to get its Unix timestamp in seconds and milliseconds.",
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
