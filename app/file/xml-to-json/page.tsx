import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { XmlToJsonClient } from "@/components/client/xml-to-json-client";

export const metadata: Metadata = {
  title: "XML to JSON Converter | Free Online Tool | SSDown",
  description:
    "Convert XML to JSON format instantly. Free online tool to parse XML and export JSON data. 100% browser-based, no upload required.",
  openGraph: {
    title: "XML to JSON Converter | Free Online Tool | SSDown",
    description:
      "Convert XML to JSON format instantly. Free online tool to parse XML and export JSON data.",
    url: "https://ssdown.app/file/xml-to-json",
    siteName: "SSDown",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XML to JSON Converter | Free Online Tool",
    description: "Convert XML to JSON format instantly.",
  },
  alternates: {
    canonical: "https://ssdown.app/file/xml-to-json",
  },
};

export default function XmlToJsonPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does XML to JSON conversion work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool uses the browser's DOMParser to parse the XML string and recursively transforms the DOM nodes into a JavaScript object (JSON).",
        },
      },
      {
        "@type": "Question",
        name: "Is my data secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The conversion happens entirely in your browser. Your data is never sent to any server.",
        },
      },
      {
        "@type": "Question",
        name: "Can I convert complex nested XML?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the tool supports nested tags and attributes. Attributes are typically prefixed with '@' or stored in a specific property.",
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
        name: "XML to JSON",
        item: "https://ssdown.app/file/xml-to-json",
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
              label: "XML to JSON",
              href: "/file/xml-to-json",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <XmlToJsonClient />
    </>
  );
}
