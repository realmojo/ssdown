import { Metadata } from "next";
import { ImagesToPdfClient } from "@/components/client/images-to-pdf-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/images-to-pdf`;
  const title = "Images to PDF Online Free | Convert JPG PNG to PDF | SSDown";
  const description =
    "Convert images to PDF instantly. Support JPG, PNG, and WEBP formats. Reorder images and choose page size. 100% private — processed in your browser.";

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

export default function ImagesToPdfPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to convert images to PDF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this tool is 100% free with no hidden fees or watermarks.",
        },
      },
      {
        "@type": "Question",
        name: "What image formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We support JPG/JPEG, PNG, and WEBP image formats.",
        },
      },
      {
        "@type": "Question",
        name: "Can I reorder images before converting?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can reorder images using the up/down buttons before converting to PDF.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "All processing happens in your browser. Your images never leave your device.",
        },
      },
      {
        "@type": "Question",
        name: "What page size options are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can choose 'Fit to image' which matches page size to each image, or 'A4' which centers images on standard A4 pages.",
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
        name: "Images to PDF",
        item: "https://ssdown.app/pdf/images-to-pdf",
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
              label: "Images to PDF",
              href: "/pdf/images-to-pdf",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <ImagesToPdfClient />
    </>
  );
}
