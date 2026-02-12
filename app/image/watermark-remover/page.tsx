import { WatermarkRemoverClient } from "@/components/client/watermark-remover-client";
import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/watermark-remover`;

  const title = "Watermark Remover - Remove Watermarks from Images Online | SSDown";
  const description =
    "Free online watermark remover. Remove watermarks from images instantly in your browser. Batch processing, before/after preview. 100% private.";

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

export default async function WatermarkRemoverPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: dict?.qna_watermark_remover?.faq_1_q || "Is my image uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: dict?.qna_watermark_remover?.faq_1_a || "No. All processing happens entirely in your browser. Your images never leave your device.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_watermark_remover?.faq_2_q || "What image formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: dict?.qna_watermark_remover?.faq_2_a || "We support PNG, JPG, and WebP image formats.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_watermark_remover?.faq_3_q || "Can I process multiple images at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: dict?.qna_watermark_remover?.faq_3_a || "Yes! You can select multiple images for batch processing. All images are processed sequentially in your browser.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_watermark_remover?.faq_4_q || "What types of watermarks can be removed?",
        acceptedAnswer: {
          "@type": "Answer",
          text: dict?.qna_watermark_remover?.faq_4_a || "This tool is optimized for removing semi-transparent logo watermarks commonly found in the bottom-right corner of images.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_watermark_remover?.faq_5_q || "What is the output format?",
        acceptedAnswer: {
          "@type": "Answer",
          text: dict?.qna_watermark_remover?.faq_5_a || "All processed images are saved as lossless PNG files for the best quality output.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: "Image Tools", item: "https://ssdown.app/tools/image" },
      { "@type": "ListItem", position: 4, name: "Watermark Remover", item: "https://ssdown.app/image/watermark-remover" },
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
      <div className="container max-w-7xl mx-auto px-4 pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "Image Tools", href: "/tools/image" },
            { label: "Watermark Remover", href: "/image/watermark-remover", isCurrent: true },
          ]}
        />
      </div>
      <WatermarkRemoverClient dict={dict} />
    </>
  );
}
