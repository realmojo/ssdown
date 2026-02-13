import { Metadata } from "next";
import { AddTextToPdfClient } from "@/components/client/add-text-to-pdf-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/add-text-to-pdf`;
  const title = "Add Text to PDF Online Free | PDF Text Editor | SSDown";
  const description =
    "Add text to your PDF files instantly. Choose page, position, font size, and color. 100% private — processed in your browser, no upload to server.";

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

export default function AddTextToPdfPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to add text to a PDF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this tool is 100% free with no hidden fees or watermarks.",
        },
      },
      {
        "@type": "Question",
        name: "Can I add text to a specific page?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can select which page to add text to using the page selector dropdown.",
        },
      },
      {
        "@type": "Question",
        name: "What fonts are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We use Helvetica, a standard PDF font. This ensures compatibility across all PDF viewers.",
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
        name: "Add Text to PDF",
        item: "https://ssdown.app/pdf/add-text-to-pdf",
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
              label: "Add Text to PDF",
              href: "/pdf/add-text-to-pdf",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <AddTextToPdfClient />
    </>
  );
}
