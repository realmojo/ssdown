import { Metadata } from "next";
import { RoundImageClient } from "@/components/client/round-image-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/round-image-maker`;

  const title = "Round Image Maker Online Free | Crop to Circle | SSDown";
  const description =
    "Crop any image into a perfect circle. Free round image maker with custom size and background options. 100% private — processed in your browser.";

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

export default function RoundImageMakerPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this round image maker is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of images you can process.",
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
        name: "How does the circular crop work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The tool first center-crops your image to a square, then applies a circular mask using Canvas arc and clip. The result is a perfectly circular image with optional background color or transparency.",
        },
      },
      {
        "@type": "Question",
        name: "What size should I choose?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Choose 'Original' to preserve maximum quality. For profile pictures, 400×400 works well. For social media avatars, 200×200 is typical. For high-DPI displays or print, use 800×800 or Original.",
        },
      },
      {
        "@type": "Question",
        name: "What image formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can upload PNG, JPG, JPEG, WebP, GIF, and BMP images. The output is always PNG format to preserve transparency. Maximum file size is 20MB.",
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
        name: "Round Image Maker",
        item: "https://ssdown.app/image/round-image-maker",
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
              label: "Round Image Maker",
              href: "/image/round-image-maker",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <RoundImageClient />
    </>
  );
}
