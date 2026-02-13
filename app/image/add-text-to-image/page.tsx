import { Metadata } from "next";
import { AddTextToImageClient } from "@/components/client/add-text-to-image-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/add-text-to-image`;

  const title = "Add Text to Image Online Free - Photo Text Editor | SSDown";
  const description =
    "Add custom text overlays to your images online. Choose font, size, color, position, and outline. Free photo text editor — 100% private, processed in your browser.";

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

export default function AddTextToImagePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this tool is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of images you can edit.",
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
        name: "Can I use custom fonts?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Currently we offer 7 web-safe fonts including Arial, Georgia, Impact, and more. These fonts are available on all devices and browsers without any download required.",
        },
      },
      {
        "@type": "Question",
        name: "How do I make text readable on dark images?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Enable the Outline option and use a contrasting outline color. For example, use white text with a black outline — this combination is readable on virtually any background.",
        },
      },
      {
        "@type": "Question",
        name: "What image formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can add text to PNG, JPG, JPEG, WebP, GIF, and BMP images. The result will be saved in the same format as the original. Maximum file size is 20MB.",
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
        name: "Add Text to Image",
        item: "https://ssdown.app/image/add-text-to-image",
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
              label: "Add Text to Image",
              href: "/image/add-text-to-image",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <AddTextToImageClient />
    </>
  );
}
