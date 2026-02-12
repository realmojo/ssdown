import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CsvToXmlClient } from "@/components/client/csv-to-xml-client";

export const metadata: Metadata = {
  title: "CSV to XML Converter | Free Online Tool | SSDown",
  description:
    "Convert CSV to XML format instantly. Free online tool to parse CSV files and export XML data. 100% browser-based, no upload required.",
  openGraph: {
    title: "CSV to XML Converter | Free Online Tool | SSDown",
    description:
      "Convert CSV to XML format instantly. Free online tool to parse CSV files and export XML data.",
    url: "https://ssdown.app/file/csv-to-xml",
    siteName: "SSDown",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSV to XML Converter | Free Online Tool",
    description: "Convert CSV to XML format instantly.",
  },
  alternates: {
    canonical: "https://ssdown.app/file/csv-to-xml",
  },
};

export default function CsvToXmlPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does CSV to XML conversion work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool converts each row of your CSV file into an XML element (e.g., <row>), with child elements corresponding to the column headers.",
        },
      },
      {
        "@type": "Question",
        name: "Can I customize the root element name?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "By default, we use <root> and <row>, but the structure is standardized for easy parsing.",
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
        name: "CSV to XML",
        item: "https://ssdown.app/file/csv-to-xml",
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
              label: "CSV to XML",
              href: "/file/csv-to-xml",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <CsvToXmlClient />
    </>
  );
}
