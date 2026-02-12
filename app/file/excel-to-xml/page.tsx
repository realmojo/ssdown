import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ExcelToXmlClient } from "@/components/client/excel-to-xml-client";

export const metadata: Metadata = {
  title: "Excel to XML Converter | Free Online Tool | SSDown",
  description:
    "Convert Excel (XLSX, XLS) to XML format instantly. Free online tool to extract data from spreadsheets. 100% browser-based.",
  openGraph: {
    title: "Excel to XML Converter | Free Online Tool | SSDown",
    description:
      "Convert Excel (XLSX, XLS) to XML format instantly. Free online tool to extract data from spreadsheets.",
    url: "https://ssdown.app/file/excel-to-xml",
    siteName: "SSDown",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Excel to XML Converter | Free Online Tool",
    description: "Convert Excel to XML format instantly.",
  },
  alternates: {
    canonical: "https://ssdown.app/file/excel-to-xml",
  },
};

export default function ExcelToXmlPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does Excel to XML conversion work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool reads your Excel file using SheetJS, converts rows to JavaScript objects, and then transforms each object into an XML element inside a root tag.",
        },
      },
      {
        "@type": "Question",
        name: "What structure will the XML have?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The default structure is <root> containing multiple <row> elements. Each column header becomes a child tag of the row.",
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
        name: "Excel to XML",
        item: "https://ssdown.app/file/excel-to-xml",
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
              label: "Excel to XML",
              href: "/file/excel-to-xml",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <ExcelToXmlClient />
    </>
  );
}
