import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { ImageConverterClient } from "@/components/client/image-converter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/image-converter`;

  const title =
    "Image Converter - WebP, PNG, JPG, AVIF, GIF, SVG, HEIC Online Free | SSDown";
  const description =
    "Free online image converter. Convert WebP, PNG, JPG, AVIF, and GIF images instantly. Support for SVG, HEIC/HEIF. Bulk conversion, high quality, and 100% private.";

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
  const locale = await getLocale();
  const dict = await getDictionary(locale);

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
      {
        "@type": "Question",
        name: "What is AVIF and which browsers support it?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AVIF (AV1 Image File Format) is a next-generation image format based on the AV1 video codec. It offers up to 50% better compression than JPEG and 20% better than WebP. AVIF is supported in Chrome 85+, Firefox 93+, and Safari 16+.",
        },
      },
      {
        "@type": "Question",
        name: "How do I convert SVG to PNG?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Simply upload your SVG file and select PNG as the output format. The converter renders the SVG at its native resolution onto a canvas and exports it as a high-quality PNG, preserving all vector details as rasterized pixels.",
        },
      },
      {
        "@type": "Question",
        name: "Can I convert GIF to JPG?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, our converter extracts the first frame from your GIF animation and converts it into a static JPG image. This is useful when you need a still image preview of an animated GIF for thumbnails or social media posts.",
        },
      },
      {
        "@type": "Question",
        name: "How do I convert JPG or PNG to GIF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Upload your JPG or PNG image and select GIF as the output format. The converter creates a single-frame GIF from your static image. This is helpful when a platform or application specifically requires GIF format.",
        },
      },
      {
        "@type": "Question",
        name: "Can I convert HEIC photos from iPhone?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, our converter fully supports HEIC and HEIF formats used by iPhones and iPads. Upload your HEIC photos and convert them to JPG, PNG, or WebP for universal compatibility. All conversion happens in your browser, so your photos stay private.",
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
      <div className="container max-w-7xl mx-auto px-4 py-8">
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
