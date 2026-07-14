import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { TimestampConverterClient } from "@/components/client/timestamp-converter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/timestamp-converter`;

  const title = "Unix Timestamp Converter - Epoch to Date | SSDown";
  const description =
    "Free online Unix timestamp converter. Convert epoch timestamps to human-readable dates and back, in local time and UTC, with a live clock.";

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

export default async function TimestampConverterPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faq = [
    {
      question: "What is a Unix timestamp?",
      answer:
        "A Unix timestamp (also called epoch time) is the number of seconds that have elapsed since 00:00:00 UTC on January 1, 1970, not counting leap seconds. It is a standard way to represent a point in time across systems and programming languages.",
    },
    {
      question: "What is the difference between seconds and milliseconds?",
      answer:
        "Unix timestamps are commonly stored in seconds (10 digits for current dates), but many systems such as JavaScript use milliseconds (13 digits). Our converter lets you toggle between the two so you can work with either format correctly.",
    },
    {
      question: "Does this converter use my local time zone or UTC?",
      answer:
        "Both. The tool shows the converted date in your browser's local time zone, in UTC, and in ISO 8601 format, so you can compare them side by side without any manual offset calculation.",
    },
    {
      question: "Is my data private and secure?",
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
      { "@type": "ListItem", position: 4, name: "Timestamp Converter", item: "https://ssdown.app/utility/timestamp-converter" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Timestamp Converter",
    url: "https://ssdown.app/utility/timestamp-converter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online Unix timestamp converter. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use the Unix Timestamp Converter",
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
              label: "Timestamp Converter",
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
