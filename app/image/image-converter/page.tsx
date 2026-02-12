import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { ImageConverterClient } from "@/components/client/image-converter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/image-converter`;

  const title = "Image Converter - WebP, PNG, JPG Online Free | SSDown";
  const description =
    "Free online image converter. Convert WebP, PNG, and JPG images instantly. Bulk conversion, high quality, and 100% private.";

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

export default async function ImageConverterPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: dict?.qna_image_converter?.faq_1_q || "Is it free?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_image_converter?.faq_1_a ||
            "Yes, our image converter is 100% free to use.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_image_converter?.faq_2_q || "Is it secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_image_converter?.faq_2_a ||
            "Absolutely. All conversions happen in your browser.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_image_converter?.faq_3_q || "What is WebP?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_image_converter?.faq_3_a ||
            "WebP is a modern image format that provides superior compression for images on the web.",
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
        name: "Image Converter",
        item: "https://ssdown.app/image/image-converter",
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
              label: "Image Converter",
              href: "/image/image-converter",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <ImageConverterClient dict={dict} />
    </>
  );
}
