import { Metadata } from "next";
import { CombineImagesClient } from "@/components/client/combine-images-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/combine-images`;

  const title =
    "Combine Images Online Free - Merge Photos Side by Side | SSDown";
  const description =
    "Combine multiple images side by side or stacked vertically. Adjust gap, background color, and layout. Free image merger — 100% private, processed in your browser.";

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

export default function CombineImagesPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this tool is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of images you can combine.",
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
        name: "How many images can I combine at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can combine as many images as you want. Simply upload multiple images at once or add more images one by one. You can also reorder and remove images before combining.",
        },
      },
      {
        "@type": "Question",
        name: "What layout options are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can arrange images horizontally (side by side) or vertically (stacked). Images are automatically scaled to match the tallest (horizontal) or widest (vertical) image for a clean result.",
        },
      },
      {
        "@type": "Question",
        name: "What image formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can combine PNG, JPG, JPEG, WebP, GIF, and BMP images. The combined result is always saved as a high-quality PNG file. Maximum file size per image is 20MB.",
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
        name: "Combine Images",
        item: "https://ssdown.app/image/combine-images",
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
            { label: "Image Tools", href: "/tools/image" },
            {
              label: "Combine Images",
              href: "/image/combine-images",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <CombineImagesClient />
    </>
  );
}
