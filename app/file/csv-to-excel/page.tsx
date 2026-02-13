import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CsvToExcelClient } from "@/components/client/csv-to-excel-client";

export const metadata: Metadata = {
  title: "CSV to Excel Converter | Free Online Tool | SSDown",
  description:
    "Convert CSV to Excel (XLSX) format instantly. Free online tool to convert comma-separated values to Excel spreadsheets. 100% browser-based.",
  openGraph: {
    title: "CSV to Excel Converter | Free Online Tool | SSDown",
    description:
      "Convert CSV to Excel (XLSX) format instantly. Free online tool to convert comma-separated values to Excel spreadsheets.",
    url: "https://ssdown.app/file/csv-to-excel",
    siteName: "SSDown",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSV to Excel Converter | Free Online Tool",
    description: "Convert CSV to Excel (XLSX) format instantly.",
  },
  alternates: {
    canonical: "https://ssdown.app/file/csv-to-excel",
  },
};

export default function CsvToExcelPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does CSV to Excel conversion work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool uses the SheetJS library to parse your CSV text and generate a valid Excel (.xlsx) file in your browser.",
        },
      },
      {
        "@type": "Question",
        name: "Are formatting and formulas preserved?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "CSV files only contain raw data. This tool converts that raw data into an Excel sheet. No formulas or styling are present in the source CSV.",
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
        name: "CSV to Excel",
        item: "https://ssdown.app/file/csv-to-excel",
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
              label: "CSV to Excel",
              href: "/file/csv-to-excel",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <CsvToExcelClient />
    </>
  );
}
