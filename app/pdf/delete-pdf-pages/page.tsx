import { Metadata } from "next";
import { DeletePdfPagesClient } from "@/components/client/delete-pdf-pages-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/delete-pdf-pages`;
  const title = "Delete PDF Pages Online Free | Remove PDF Pages | SSDown";
  const description =
    "Delete specific pages from your PDF files instantly. Select and remove unwanted pages with ease. 100% private — processed in your browser, no upload to server.";

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

export default function DeletePdfPagesPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to delete pages from a PDF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this PDF page deletion tool is 100% free. There are no hidden fees, watermarks, or usage limits.",
        },
      },
      {
        "@type": "Question",
        name: "Is my PDF secure when deleting pages?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. All processing happens entirely in your browser using pdf-lib. Your PDF files never leave your device.",
        },
      },
      {
        "@type": "Question",
        name: "Can I delete multiple pages at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can select multiple pages to delete at once using the checkboxes.",
        },
      },
      {
        "@type": "Question",
        name: "Will deleting pages affect remaining content?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No, deleting pages only removes the selected pages. All remaining pages are preserved exactly as they were.",
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
        name: "Delete PDF Pages",
        item: "https://ssdown.app/pdf/delete-pdf-pages",
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
              label: "Delete PDF Pages",
              href: "/pdf/delete-pdf-pages",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <DeletePdfPagesClient />
    </>
  );
}
