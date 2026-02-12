import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { XmlToExcelClient } from "@/components/client/xml-to-excel-client";

export const metadata: Metadata = {
  title: "XML to Excel Converter | Free Online Tool | SSDown",
  description:
    "Convert XML to Excel (XLSX) format instantly. Free online tool to parse XML data and export as Excel spreadsheet. 100% browser-based.",
  openGraph: {
    title: "XML to Excel Converter | Free Online Tool | SSDown",
    description:
      "Convert XML to Excel (XLSX) format instantly. Free online tool to parse XML data and export as Excel spreadsheet.",
    url: "https://ssdown.app/file/xml-to-excel",
    siteName: "SSDown",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XML to Excel Converter | Free Online Tool",
    description: "Convert XML to Excel format instantly.",
  },
  alternates: {
    canonical: "https://ssdown.app/file/xml-to-excel",
  },
};

export default function XmlToExcelPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does XML to Excel conversion work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool parses the XML structure to identify list items and converts their child elements into Excel columns using the SheetJS library.",
        },
      },
      {
        "@type": "Question",
        name: "Can I open the file in Google Sheets?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the generated .xlsx file is fully compatible with Google Sheets, Microsoft Excel, and other spreadsheet software.",
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
        name: "XML to Excel",
        item: "https://ssdown.app/file/xml-to-excel",
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
              label: "XML to Excel",
              href: "/file/xml-to-excel",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <XmlToExcelClient />
    </>
  );
}
