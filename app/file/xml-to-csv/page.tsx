import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { XmlToCsvClient } from "@/components/client/xml-to-csv-client";

export const metadata: Metadata = {
  title: "XML to CSV Converter | Free Online Tool | SSDown",
  description:
    "Convert XML to CSV format instantly. Free online tool to parse XML data and export as CSV spreadsheet. 100% browser-based, no upload required.",
  openGraph: {
    title: "XML to CSV Converter | Free Online Tool | SSDown",
    description:
      "Convert XML to CSV format instantly. Free online tool to parse XML data and export as CSV spreadsheet.",
    url: "https://ssdown.app/file/xml-to-csv",
    siteName: "SSDown",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XML to CSV Converter | Free Online Tool",
    description: "Convert XML to CSV format instantly.",
  },
  alternates: {
    canonical: "https://ssdown.app/file/xml-to-csv",
  },
};

export default function XmlToCsvPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does XML to CSV conversion work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool identifies repeated elements within your XML (e.g., <item> inside <root>) and treats them as rows. Child tags become columns.",
        },
      },
      {
        "@type": "Question",
        name: "What happens to nested data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Currently, this tool uses a flat structure assumption. Deeply nested data may be stringified or ignored. It works best for list-based XML.",
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
        name: "XML to CSV",
        item: "https://ssdown.app/file/xml-to-csv",
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
              label: "XML to CSV",
              href: "/file/xml-to-csv",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <XmlToCsvClient />
    </>
  );
}
