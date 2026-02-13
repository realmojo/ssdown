import { Metadata } from "next";
import { PdfToPngClient } from "@/components/client/pdf-to-png-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/pdf-to-png`;
  const title = "PDF to PNG Online Free | Convert PDF to PNG Images | SSDown";
  const description =
    "Convert PDF pages to PNG images instantly. Lossless quality with transparency support. 100% private — processed in your browser, no upload to server.";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      locale: "en_US",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function PdfToPngPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to convert PDF to PNG?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this tool is 100% free with no hidden fees or watermarks.",
        },
      },
      {
        "@type": "Question",
        name: "Why choose PNG over JPG?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PNG offers lossless compression, meaning no quality loss. It also supports transparency, making it ideal for documents with transparent backgrounds.",
        },
      },
      {
        "@type": "Question",
        name: "Can I download all images at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can download each image individually or use the Download All button.",
        },
      },
      {
        "@type": "Question",
        name: "Is my PDF secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "All processing happens in your browser using pdf.js. Your files never leave your device.",
        },
      },
      {
        "@type": "Question",
        name: "What is the file size limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each PDF file can be up to 50MB.",
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
        name: "PDF Tools",
        item: "https://ssdown.app/tools/pdf",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "PDF to PNG",
        item: "https://ssdown.app/pdf/pdf-to-png",
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
            { label: "PDF Tools", href: "/tools/pdf" },
            { label: "PDF to PNG", href: "/pdf/pdf-to-png", isCurrent: true },
          ]}
        />
      </div>
      <PdfToPngClient />
    </>
  );
}
