import { Metadata } from "next";
import { PdfPageNumbersClient } from "@/components/client/pdf-page-numbers-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/pdf-page-numbers`;
  const title =
    "Add Page Numbers to PDF Online Free | PDF Page Numbers | SSDown";
  const description =
    "Add page numbers to your PDF files instantly. Choose position, font size, and starting number. 100% private — processed in your browser, no upload to server.";

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

export default function PdfPageNumbersPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to add page numbers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this tool is 100% free with no hidden fees or watermarks.",
        },
      },
      {
        "@type": "Question",
        name: "Where can I place page numbers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can place page numbers at top-left, top-center, top-right, bottom-left, bottom-center, or bottom-right of each page.",
        },
      },
      {
        "@type": "Question",
        name: "Can I customize the starting number?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can set any starting page number. This is useful when numbering sections of a larger document.",
        },
      },
      {
        "@type": "Question",
        name: "Is my PDF secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "All processing happens in your browser. Your files never leave your device.",
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
        name: "PDF Page Numbers",
        item: "https://ssdown.app/pdf/pdf-page-numbers",
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
            {
              label: "PDF Page Numbers",
              href: "/pdf/pdf-page-numbers",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <PdfPageNumbersClient />
    </>
  );
}
