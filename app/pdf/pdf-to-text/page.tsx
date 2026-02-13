import { Metadata } from "next";
import { PdfToTextClient } from "@/components/client/pdf-to-text-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/pdf-to-text`;
  const title = "PDF to Text Online Free | Extract Text from PDF | SSDown";
  const description =
    "Extract all text from PDF files instantly. Copy to clipboard or download as TXT file. 100% private — processed in your browser, no upload to server.";

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

export default function PdfToTextPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to extract text from PDF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this tool is 100% free with no hidden fees or usage limits.",
        },
      },
      {
        "@type": "Question",
        name: "Can it extract text from scanned PDFs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "This tool extracts embedded text from PDFs. Scanned documents (image-based PDFs) may not contain extractable text and would require OCR.",
        },
      },
      {
        "@type": "Question",
        name: "Can I copy the extracted text?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can copy all extracted text to your clipboard with one click or download it as a .txt file.",
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
        name: "PDF to Text",
        item: "https://ssdown.app/pdf/pdf-to-text",
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
            { label: "PDF to Text", href: "/pdf/pdf-to-text", isCurrent: true },
          ]}
        />
      </div>
      <PdfToTextClient />
    </>
  );
}
