import { Metadata } from "next";
import { RearrangePdfClient } from "@/components/client/rearrange-pdf-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/rearrange-pdf`;

  const title = "Rearrange PDF Pages Online Free | Reorder PDF | SSDown";
  const description =
    "Rearrange and reorder PDF pages instantly. Free online PDF page organizer. 100% private — processed in your browser, no upload to server.";

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

export default function RearrangePdfPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to rearrange PDF pages?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this PDF rearrange tool is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of pages you can reorder.",
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
        name: "How do I reorder pages?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Upload your PDF and you'll see a list of all pages with their page numbers. Use the up and down arrow buttons to move pages to your desired position, then click 'Apply & Download' to save.",
        },
      },
      {
        "@type": "Question",
        name: "What is the file size limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each PDF file can be up to 50MB. The number of pages you can rearrange is limited only by your browser's memory capacity.",
        },
      },
      {
        "@type": "Question",
        name: "Will rearranging affect the content of my pages?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No, rearranging only changes the order of pages. All page content, formatting, images, and links remain exactly the same.",
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
        name: "Rearrange PDF",
        item: "https://ssdown.app/pdf/rearrange-pdf",
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
            { label: "PDF Tools", href: "/tools/pdf" },
            {
              label: "Rearrange PDF",
              href: "/pdf/rearrange-pdf",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <RearrangePdfClient />
    </>
  );
}
