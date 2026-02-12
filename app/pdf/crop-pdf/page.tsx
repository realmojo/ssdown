import { Metadata } from "next";
import { CropPdfClient } from "@/components/client/crop-pdf-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/crop-pdf`;

  const title = "Crop PDF Online Free | Trim PDF Margins | SSDown";
  const description =
    "Crop PDF pages by adjusting margins instantly. Free online PDF cropper with custom margin controls. 100% private — processed in your browser, no upload to server.";

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

export default function CropPdfPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to crop PDFs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this PDF crop tool is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of pages you can crop.",
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
        name: "What units are used for margins?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can specify margins in either points (pt) or percentage (%). Points are absolute units where 72 points equals 1 inch. Percentage is relative to the page dimensions.",
        },
      },
      {
        "@type": "Question",
        name: "Can I crop individual pages differently?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Currently the crop margins are applied uniformly to all pages. Use the 'Apply to all pages' option to crop every page with the same margin values.",
        },
      },
      {
        "@type": "Question",
        name: "Will cropping affect text or images on my pages?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Cropping adjusts the visible area of each page. Content outside the cropped area will be hidden but not permanently deleted from the PDF data. Some PDF viewers may still show the hidden content.",
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
        name: "Crop PDF",
        item: "https://ssdown.app/pdf/crop-pdf",
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
              label: "Crop PDF",
              href: "/pdf/crop-pdf",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <CropPdfClient />
    </>
  );
}
