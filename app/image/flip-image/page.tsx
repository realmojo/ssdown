import { Metadata } from "next";
import { FlipImageClient } from "@/components/client/flip-image-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/flip-image`;

  const title =
    "Flip Image Online Free - Mirror Horizontally & Vertically | SSDown";
  const description =
    "Free online image flipper. Mirror or flip images horizontally and vertically instantly. 100% private — processed in your browser.";

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

export default function FlipImagePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this image flipper is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of images you can flip.",
        },
      },
      {
        "@type": "Question",
        name: "Is it secure? Where are my images stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your images are completely secure because all processing happens entirely in your browser. Your images never leave your device and are never uploaded to any server. This ensures 100% privacy.",
        },
      },
      {
        "@type": "Question",
        name: "What's the difference between horizontal and vertical flip?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Horizontal flip mirrors your image left-to-right, like looking in a mirror. Vertical flip turns your image upside down (top becomes bottom). Both maintain the original image quality.",
        },
      },
      {
        "@type": "Question",
        name: "Does flipping reduce image quality?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The canvas-based flip process preserves your original image quality and resolution. There is no re-compression or quality loss.",
        },
      },
      {
        "@type": "Question",
        name: "What image formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can flip PNG, JPG, JPEG, WebP, GIF, and BMP images. The flipped image will be saved in the same format as the original. PNG transparency is preserved.",
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
        name: "Flip Image",
        item: "https://ssdown.app/image/flip-image",
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
              label: "Flip Image",
              href: "/image/flip-image",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <FlipImageClient />
    </>
  );
}
