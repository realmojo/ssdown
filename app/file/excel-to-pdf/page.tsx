import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ExcelToPdfClient } from "@/components/client/excel-to-pdf-client";

export const metadata: Metadata = {
  title: "Excel to PDF Converter | Free Online Tool | SSDown",
  description:
    "Convert Excel files to PDF documents online. Free tool to transform spreadsheets into printable PDF format. Secure and browser-based.",
  openGraph: {
    title: "Excel to PDF Converter | Free Online Tool | SSDown",
    description:
      "Convert Excel files to PDF documents online. Free tool to transform spreadsheets into printable PDF format.",
    url: "https://ssdown.app/file/excel-to-pdf",
    siteName: "SSDown",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Excel to PDF Converter | Free Online Tool",
    description: "Convert Excel files to PDF documents online.",
  },
  alternates: {
    canonical: "https://ssdown.app/file/excel-to-pdf",
  },
};

export default function ExcelToPdfPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does Excel to PDF conversion work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool reads your Excel file data using SheetJS and then generates a PDF document using the jsPDF library, creating a simple table layout of your data.",
        },
      },
      {
        "@type": "Question",
        name: "Does it keep the formatting?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool extracts the data and presents it in a clean, standardized table format. Complex Excel styling, colors, and formulas are not preserved in the visual layout.",
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
        name: "Excel to PDF",
        item: "https://ssdown.app/file/excel-to-pdf",
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
              label: "Excel to PDF",
              href: "/file/excel-to-pdf",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <ExcelToPdfClient />
    </>
  );
}
