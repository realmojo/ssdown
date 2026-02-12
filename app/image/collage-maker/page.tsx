import { Metadata } from "next";
import { CollageMakerClient } from "@/components/client/collage-maker-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/collage-maker`;

  const title = "Collage Maker Online Free - Create Photo Collages | SSDown";
  const description =
    "Create beautiful photo collages with 8 customizable templates. Upload images, choose a layout, customize gap, background, and corner radius. Free collage maker — 100% private, processed in your browser.";

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

export default function CollageMakerPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this collage maker is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of collages you can create.",
        },
      },
      {
        "@type": "Question",
        name: "Is it secure? Where are my images stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your images are completely secure because all processing happens entirely in your browser using Canvas API. Your images never leave your device and are never uploaded to any server.",
        },
      },
      {
        "@type": "Question",
        name: "What templates are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We offer 8 templates: Single (1x1), Side by Side (2x1), Stacked (1x2), Grid (2x2), Trio Horizontal (3x1), Trio Vertical (1x3), Big Left (1+2 layout), and Big Top (2+1 layout).",
        },
      },
      {
        "@type": "Question",
        name: "How do I assign images to slots?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Click a slot in the preview area, then click an image from your uploaded images. The image will be assigned to that slot. To change it, click the slot again and select a different image.",
        },
      },
      {
        "@type": "Question",
        name: "What format is the output?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The collage is always saved as PNG (1000x1000px) to ensure maximum quality. You can convert it to other formats using our Image Converter tool if needed.",
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
        name: "Image Tools",
        item: "https://ssdown.app/tools/image",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Collage Maker",
        item: "https://ssdown.app/image/collage-maker",
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
            { label: "Image Tools", href: "/tools/image" },
            {
              label: "Collage Maker",
              href: "/image/collage-maker",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <CollageMakerClient />
    </>
  );
}
