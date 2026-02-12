import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { ImageCompressorClient } from "@/components/client/image-compressor-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/image-compressor`;

  const title = "Image Compressor - Reduce File Size Online Free | SSDown";
  const description =
    "Free online image compressor. Compress PNG, JPG, and WebP images to reduce file size. Adjust quality, batch processing, and 100% private.";

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

export default async function ImageCompressorPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name:
          dict?.qna_image_compressor?.faq_1_q ||
          "How does image compression work?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_image_compressor?.faq_1_a ||
            "Image compression reduces file size by re-encoding the image at a lower quality setting.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_image_compressor?.faq_2_q ||
          "Will I lose image quality?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_image_compressor?.faq_2_a ||
            "It depends on the quality setting you choose. Quality 80-90 provides excellent visual quality with significant file size reduction.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_image_compressor?.faq_3_q ||
          "What's the difference between formats?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_image_compressor?.faq_3_a ||
            "JPEG and WebP support quality-based compression (lossy), which can dramatically reduce file size. PNG uses lossless compression.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_image_compressor?.faq_4_q ||
          "Is my image uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_image_compressor?.faq_4_a ||
            "No. All compression happens entirely in your browser using Canvas API. Your images never leave your device.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_image_compressor?.faq_5_q ||
          "Can I compress multiple images at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_image_compressor?.faq_5_a ||
            "Yes! You can select multiple images for batch compression. All images are processed in your browser.",
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
        name: "Image Compressor",
        item: "https://ssdown.app/image/image-compressor",
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
              label: "Image Compressor",
              href: "/image/image-compressor",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <ImageCompressorClient dict={dict} />
    </>
  );
}
