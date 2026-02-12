import { Metadata } from "next";
import { UnlockPdfClient } from "@/components/client/unlock-pdf-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/unlock-pdf`;

  const title = "Unlock PDF Online Free | Remove PDF Password | SSDown";
  const description =
    "Remove password protection from PDF files instantly. Enter the password to unlock and save a new unprotected copy. 100% private — processed in your browser, no upload to server.";

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

export default function UnlockPdfPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to unlock PDFs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this PDF unlock tool is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of files you can unlock.",
        },
      },
      {
        "@type": "Question",
        name: "Is it secure? Are my files uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your files are completely secure because all processing happens entirely in your browser using pdf-lib. Your PDFs and passwords never leave your device and are never uploaded to any server.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to know the password to unlock a PDF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you must know the original password to unlock the PDF. This tool does not crack or bypass passwords — it decrypts the file using the correct password and saves a new unprotected copy.",
        },
      },
      {
        "@type": "Question",
        name: "What is the file size limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each PDF file can be up to 50MB. The unlocked file will typically be a similar size to the original.",
        },
      },
      {
        "@type": "Question",
        name: "Will the unlocked PDF look the same as the original?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the unlocked PDF preserves all pages, formatting, images, and content from the original. Only the password protection is removed.",
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
        name: "Unlock PDF",
        item: "https://ssdown.app/pdf/unlock-pdf",
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
              label: "Unlock PDF",
              href: "/pdf/unlock-pdf",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <UnlockPdfClient />
    </>
  );
}
