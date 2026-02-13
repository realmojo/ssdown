import { Metadata } from "next";
import { CreatePdfClient } from "@/components/client/create-pdf-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/create-pdf`;
  const title = "Create PDF Online Free | Generate PDF from Text | SSDown";
  const description =
    "Create PDF documents from scratch. Add text, choose page size, and generate professional PDFs. 100% private — processed in your browser, no upload to server.";

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

export default function CreatePdfPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to create PDFs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this tool is 100% free with no hidden fees or watermarks.",
        },
      },
      {
        "@type": "Question",
        name: "What page sizes are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can choose from A4, Letter, and Legal page sizes.",
        },
      },
      {
        "@type": "Question",
        name: "Can I create multi-page PDFs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can add as many pages as you need using the 'Add Page' button.",
        },
      },
      {
        "@type": "Question",
        name: "What fonts are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We use Helvetica, a standard PDF font that works in all PDF viewers.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "All processing happens in your browser. Your text never leaves your device.",
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
        name: "Create PDF",
        item: "https://ssdown.app/pdf/create-pdf",
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
            { label: "Create PDF", href: "/pdf/create-pdf", isCurrent: true },
          ]}
        />
      </div>
      <CreatePdfClient />
    </>
  );
}
