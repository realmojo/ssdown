import { Metadata } from "next";
import { RotatePdfClient } from "@/components/client/rotate-pdf-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/rotate-pdf`;

  const title = "Rotate PDF Online Free | Rotate PDF Pages | SSDown";
  const description =
    "Rotate PDF pages instantly. Rotate all pages or individual pages by 90°, 180°, or 270°. 100% private — processed in your browser, no upload to server.";

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

export default function RotatePdfPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to rotate PDF pages?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this PDF rotation tool is 100% free. There are no hidden fees, watermarks, or usage limits.",
        },
      },
      {
        "@type": "Question",
        name: "Is my PDF secure when rotating pages?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. All processing happens entirely in your browser using pdf-lib. Your PDF files never leave your device and are never uploaded to any server.",
        },
      },
      {
        "@type": "Question",
        name: "Can I rotate individual pages instead of all pages?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can choose to rotate all pages at once or rotate each page individually. Each page has its own rotation controls for full flexibility.",
        },
      },
      {
        "@type": "Question",
        name: "What rotation angles are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can rotate pages by 90° clockwise, 180°, or 90° counter-clockwise (270°). These options cover all common rotation needs.",
        },
      },
      {
        "@type": "Question",
        name: "What is the file size limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The maximum file size is 50MB. Larger files may cause performance issues depending on your browser and device capabilities.",
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
        name: "Rotate PDF",
        item: "https://ssdown.app/pdf/rotate-pdf",
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
              label: "Rotate PDF",
              href: "/pdf/rotate-pdf",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <RotatePdfClient />
    </>
  );
}
