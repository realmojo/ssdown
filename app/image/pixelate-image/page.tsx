import { Metadata } from "next";
import { PixelateImageClient } from "@/components/client/pixelate-image-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/pixelate-image`;

  const title = "Pixelate Image Online Free - Privacy Blur Effect | SSDown";
  const description =
    "Free online image pixelator. Apply pixelation effect for privacy or artistic style. Adjust pixel size freely. 100% private — processed in your browser.";

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

export default function PixelateImagePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this image pixelator is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of images you can pixelate.",
        },
      },
      {
        "@type": "Question",
        name: "Is it secure? Where are my images stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your images are completely secure because all processing happens entirely in your browser using Canvas API. Your images never leave your device and are never uploaded to any server. This ensures 100% privacy.",
        },
      },
      {
        "@type": "Question",
        name: "What is pixelation used for?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pixelation is commonly used for privacy protection (hiding faces, license plates, sensitive text), censoring content, creating artistic retro effects, and preparing images for social media where certain details need to be obscured.",
        },
      },
      {
        "@type": "Question",
        name: "Does pixelation reduce image quality?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pixelation changes the visual appearance of your image by reducing detail, but it maintains the original resolution. The effect is reversible only if you keep the original file — once pixelated and saved, the lost detail cannot be recovered.",
        },
      },
      {
        "@type": "Question",
        name: "What image formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can pixelate PNG, JPG, JPEG, WebP, GIF, and BMP images. The pixelated image will be saved in the same format as the original. Maximum file size is 20MB.",
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
        name: "Pixelate Image",
        item: "https://ssdown.app/image/pixelate-image",
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
              label: "Pixelate Image",
              href: "/image/pixelate-image",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <PixelateImageClient />
    </>
  );
}
