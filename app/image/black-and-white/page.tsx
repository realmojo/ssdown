import { Metadata } from "next";
import { BlackAndWhiteClient } from "@/components/client/black-and-white-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/black-and-white`;

  const title = "Black & White Image Converter Online Free | SSDown";
  const description =
    "Convert images to black & white instantly. Free online grayscale converter using luminance-preserving formula. 100% private — processed in your browser.";

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

export default function BlackAndWhitePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this black & white converter is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of images you can convert.",
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
        name: "How does the grayscale conversion work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We use the ITU-R BT.601 luminance formula: Gray = 0.299 x Red + 0.587 x Green + 0.114 x Blue. This weighted average produces natural-looking grayscale that matches how human eyes perceive brightness.",
        },
      },
      {
        "@type": "Question",
        name: "Does it reduce image quality?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The conversion maintains the original resolution and file quality. Only the color information is removed — the image dimensions, sharpness, and detail are fully preserved.",
        },
      },
      {
        "@type": "Question",
        name: "What image formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can convert PNG, JPG, JPEG, WebP, GIF, and BMP images to black & white. The converted image will be saved in the same format as the original. Maximum file size is 20MB.",
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
        name: "Black & White",
        item: "https://ssdown.app/image/black-and-white",
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
              label: "Black & White",
              href: "/image/black-and-white",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <BlackAndWhiteClient />
    </>
  );
}
