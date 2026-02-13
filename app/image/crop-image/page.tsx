import { Metadata } from "next";
import { CropImageClient } from "@/components/client/crop-image-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/crop-image`;

  const title = "Crop Image Online Free - Resize & Crop Any Image | SSDown";
  const description =
    "Free online image cropper. Crop images to any size with preset aspect ratios. Supports PNG, JPG, WebP. 100% private — no upload to server.";

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

export default function CropImagePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is my image uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All image processing happens entirely in your browser using the Canvas API. Your images never leave your device and are never sent to any server.",
        },
      },
      {
        "@type": "Question",
        name: "What image formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can crop PNG, JPG, JPEG, WebP, GIF, and BMP images. The cropped image will be saved in the same format as the original.",
        },
      },
      {
        "@type": "Question",
        name: "Will cropping reduce image quality?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The crop tool extracts the selected region at full original resolution. There is no re-compression or quality loss during the cropping process.",
        },
      },
      {
        "@type": "Question",
        name: "Can I crop to a specific aspect ratio?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Choose from preset aspect ratios like 1:1 (square), 16:9 (widescreen), 9:16 (portrait), 4:3, 3:2, and 2:3. You can also crop freely without any ratio constraint.",
        },
      },
      {
        "@type": "Question",
        name: "What is the maximum file size?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The maximum file size is 20MB. Since all processing happens in your browser, larger files may take a moment to load depending on your device.",
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
        name: "Crop Image",
        item: "https://ssdown.app/image/crop-image",
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
              label: "Crop Image",
              href: "/image/crop-image",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <CropImageClient />
    </>
  );
}
