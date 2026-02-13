import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonToXmlClient } from "@/components/client/json-to-xml-client";

export const metadata: Metadata = {
  title: "JSON to XML Converter | Free Online Tool | SSDown",
  description:
    "Convert JSON to XML format instantly. Free online tool to parse JSON and export XML data. 100% browser-based, no upload required.",
  openGraph: {
    title: "JSON to XML Converter | Free Online Tool | SSDown",
    description:
      "Convert JSON to XML format instantly. Free online tool to parse JSON and export XML data.",
    url: "https://ssdown.app/file/json-to-xml",
    siteName: "SSDown",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to XML Converter | Free Online Tool",
    description: "Convert JSON to XML format instantly.",
  },
  alternates: {
    canonical: "https://ssdown.app/file/json-to-xml",
  },
};

export default function JsonToXmlPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does JSON to XML conversion work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool parses your valid JSON string and recursively transforms key-value pairs into XML tags.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The conversion happens entirely in your browser using JavaScript. Your data is never sent to any server.",
        },
      },
      {
        "@type": "Question",
        name: "Can I convert complex nested JSON?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the tool supports nested objects and arrays locally.",
        },
      },
      {
        "@type": "Question",
        name: "How do I handle arrays?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Arrays are typically converted to repeated XML tags either using the parent key or a predefined item tag.",
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
        name: "JSON to XML",
        item: "https://ssdown.app/file/json-to-xml",
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
              label: "JSON to XML",
              href: "/file/json-to-xml",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <JsonToXmlClient />
    </>
  );
}
