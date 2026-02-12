import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SplitExcelClient } from "@/components/client/split-excel-client";

export const metadata: Metadata = {
  title: "Split Excel File by Sheets | Free Tool | SSDown",
  description:
    "Split Excel files by sheets. Save each worksheet as a separate Excel (.xlsx) file. Free, secure, and processing happens in your browser.",
  openGraph: {
    title: "Split Excel File by Sheets | Free Tool | SSDown",
    description:
      "Split Excel files by sheets. Save each worksheet as a separate Excel (.xlsx) file.",
    url: "https://ssdown.app/file/split-excel",
    siteName: "SSDown",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Split Excel File by Sheets | Free Tool",
    description: "Split Excel files by sheets.",
  },
  alternates: {
    canonical: "https://ssdown.app/file/split-excel",
  },
};

export default function SplitExcelPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does Split Excel work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Upload an Excel workbook containing multiple sheets. The tool separates each sheet into its own individual .xlsx file.",
        },
      },
      {
        "@type": "Question",
        name: "Can I download all files at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, all split Excel files are packaged into a single ZIP file for easy downloading.",
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
        name: "Split Excel",
        item: "https://ssdown.app/file/split-excel",
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
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "File Tools", href: "/tools/file" },
            {
              label: "Split Excel",
              href: "/file/split-excel",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <SplitExcelClient />
    </>
  );
}
