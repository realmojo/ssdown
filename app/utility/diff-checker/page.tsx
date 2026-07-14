import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { DiffCheckerClient } from "@/components/client/diff-checker-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/diff-checker`;

  const title = "Diff Checker - Compare Text & Find Differences | SSDown";
  const description =
    "Free online diff checker. Compare two blocks of text and highlight added, removed, and changed lines. Private, browser-based, and instant.";

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

export default async function DiffCheckerPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faq = [
    {
      question: "How does the diff checker work?",
      answer:
        "Paste your original text on the left and the changed text on the right, then click Compare. The tool aligns the two texts line by line using a longest-common-subsequence algorithm and highlights every added, removed, and unchanged line.",
    },
    {
      question: "Is my text private and secure?",
      answer:
        "Yes. All comparison happens entirely in your browser. Your text is never uploaded to any server or stored anywhere. Close the tab and your data is gone.",
    },
    {
      question: "What do the colors mean?",
      answer:
        "Green lines with a plus sign were added in the changed text, red lines with a minus sign were removed from the original, and neutral lines are unchanged between the two versions.",
    },
    {
      question: "Can I ignore whitespace or letter case?",
      answer:
        "Yes. Enable the 'Ignore whitespace' option to treat lines that differ only in spacing as identical, and enable 'Ignore case' to treat uppercase and lowercase letters as the same when comparing.",
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
      { "@type": "ListItem", position: 4, name: "Diff Checker", item: "https://ssdown.app/utility/diff-checker" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Diff Checker",
    url: "https://ssdown.app/utility/diff-checker",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online diff checker tool. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use Diff Checker Online",
    description: "Use our free online diff checker to compare two texts securely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Paste your texts",
        text: "Enter the original text on the left and the changed text on the right.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Compare",
        text: "Click Compare to align both texts line by line and highlight the differences.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Review the result",
        text: "See added lines in green, removed lines in red, and a summary of the changes.",
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
              label: "Diff Checker",
              href: "/utility/diff-checker",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <DiffCheckerClient dict={dict} />
    </>
  );
}
