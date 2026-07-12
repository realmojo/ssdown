import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { DiffCheckerClient } from "@/components/client/diff-checker-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const FALLBACK_FAQ = [
  {
    question: "Is my text uploaded anywhere when I compare it?",
    answer:
      "No. The comparison runs entirely in your browser using JavaScript. Neither the original nor the changed text ever leaves your device, so your data stays completely private.",
  },
  {
    question: "What's the difference between side-by-side and unified view?",
    answer:
      "Side-by-side view shows the original and changed text in two parallel columns, making it easy to scan line-by-line. Unified view stacks the changes in a single column with added and removed lines interleaved, similar to a Git diff.",
  },
  {
    question: "What does 'ignore whitespace' do?",
    answer:
      "When enabled, lines that differ only by leading, trailing, or repeated spaces and tabs are treated as identical. This is helpful when indentation or formatting changed but the actual content did not.",
  },
  {
    question: "How is the diff calculated?",
    answer:
      "The tool uses a line-based longest common subsequence (LCS) algorithm to find the smallest set of additions and removals that turn the original text into the changed text — the same core approach used by tools like Git and diff.",
  },
  {
    question: "Can I compare code, JSON, or logs?",
    answer:
      "Yes. The diff checker is line-based and content-agnostic, so it works well for source code, configuration files, JSON, CSV, logs, or any plain text you paste in.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const pageDict = (dict as Record<string, any>)?.page_diff_checker;
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/diff-checker`;

  const title = pageDict?.meta_title || "Free Diff Checker | SSDown";
  const description =
    pageDict?.meta_description ||
    "Compare two texts and highlight the differences instantly in your browser. Free, secure, and 100% private.";

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

export default async function DiffCheckerPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const pageDict = (dict as Record<string, any>)?.page_diff_checker;

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const utilityLabel = dict?.breadcrumb?.utility || "Utility";
  const breadcrumbLabel = pageDict?.breadcrumb_title || "Diff Checker";
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
        item: "https://ssdown.app/utility/diff-checker",
      },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Diff Checker",
    url: "https://ssdown.app/utility/diff-checker",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online diff checker. Compare two texts and highlight added and removed lines locally in your browser.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to compare two texts",
    description:
      "Use our free online diff checker to compare two texts and highlight the differences in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Paste the original text",
        text: "Paste or type the original version into the left input.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Paste the changed text",
        text: "Paste or type the updated version into the right input.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Review the differences",
        text: "Added and removed lines are highlighted instantly in side-by-side or unified view.",
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
