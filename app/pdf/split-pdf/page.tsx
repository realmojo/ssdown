import { Metadata } from "next";
import { SplitPdfClient } from "@/components/client/split-pdf-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/split-pdf`;

  const title = "Split PDF Online Free | Separate PDF Pages | SSDown";
  const description =
    "Split PDF files into individual pages or custom ranges instantly. Free online PDF splitter. 100% private — processed in your browser, no upload to server.";

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function SplitPdfPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to split PDFs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this PDF split tool is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of pages you can split.",
        },
      },
      {
        "@type": "Question",
        name: "Is it secure? Where are my files stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your files are completely secure because all processing happens entirely in your browser using pdf-lib. Your PDFs never leave your device and are never uploaded to any server.",
        },
      },
      {
        "@type": "Question",
        name: "Can I split a PDF into custom page ranges?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can choose to split every page into individual PDFs or define custom ranges like '1-3, 4-6, 7-10' to create specific groups of pages.",
        },
      },
      {
        "@type": "Question",
        name: "What is the file size limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each PDF file can be up to 50MB. The number of pages you can split is limited only by your browser's memory capacity.",
        },
      },
      {
        "@type": "Question",
        name: "Can I split password-protected PDFs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We attempt to read password-protected PDFs, but some encrypted files may not be supported. If a file cannot be read, you'll see an error message.",
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
        name: "Split PDF",
        item: "https://ssdown.app/pdf/split-pdf",
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
              label: "Split PDF",
              href: "/pdf/split-pdf",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <SplitPdfClient />
    </>
  );
}
