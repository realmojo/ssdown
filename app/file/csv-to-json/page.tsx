import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CsvToJsonClient } from "@/components/client/csv-to-json-client";

export const metadata: Metadata = {
  title: "CSV to JSON Converter | Free Online Tool | SSDown",
  description:
    "Convert CSV to JSON format instantly. Free online tool to parse CSV files and export JSON arrays. 100% browser-based, no upload required.",
  openGraph: {
    title: "CSV to JSON Converter | Free Online Tool | SSDown",
    description:
      "Convert CSV to JSON format instantly. Free online tool to parse CSV files and export JSON arrays.",
    url: "https://ssdown.app/file/csv-to-json",
    siteName: "SSDown",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSV to JSON Converter | Free Online Tool",
    description: "Convert CSV to JSON format instantly.",
  },
  alternates: {
    canonical: "https://ssdown.app/file/csv-to-json",
  },
};

export default function CsvToJsonPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does CSV to JSON conversion work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool parses the CSV text, treating the first row as headers, and converts each subsequent row into a JSON object using those headers as keys.",
        },
      },
      {
        "@type": "Question",
        name: "Does it support delimiters other than comma?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Currently, it assumes standard comma separation, but handles quoted values correctly.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://ssdown.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: "https://ssdown.app/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "File & Data Tools",
        item: "https://ssdown.app/tools/file",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "CSV to JSON",
        item: "https://ssdown.app/file/csv-to-json",
      },
    ],
  };

  return (
    <>
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
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "File Tools", href: "/tools/file" },
            {
              label: "CSV to JSON",
              href: "/file/csv-to-json",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <CsvToJsonClient />
    </>
  );
}
