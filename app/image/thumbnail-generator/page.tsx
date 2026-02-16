import { ThumbnailGeneratorClient } from "@/components/client/thumbnail-generator-client";
import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/thumbnail-generator`;

  const title = "Thumbnail Maker - Create Custom Thumbnails Online | SSDown";
  const description =
    "Free online thumbnail generator. Create YouTube thumbnails with text, stickers, and templates. Export as PNG or JPG instantly.";

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

export default async function ThumbnailGeneratorPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name:
          dict?.qna_thumbnail_generator?.faq_1_q || "What sizes can I create?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_thumbnail_generator?.faq_1_a ||
            "We offer preset templates for YouTube (1280x720), Instagram Post (1080x1080), and Twitter Header (1500x500). These are the optimal sizes recommended by each platform.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_thumbnail_generator?.faq_2_q ||
          "Can I upload my own background image?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_thumbnail_generator?.faq_2_a ||
            "Yes! You can upload any image as a background. It will be automatically scaled to fit the selected template size. For best results, use images that match or exceed the template dimensions.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_thumbnail_generator?.faq_3_q || "Is this tool free?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_thumbnail_generator?.faq_3_a ||
            "Yes, the thumbnail generator is completely free with no watermarks, no sign-up required, and unlimited exports.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_thumbnail_generator?.faq_4_q || "What fonts are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_thumbnail_generator?.faq_4_a ||
            "We provide web-safe fonts including Arial, Verdana, Georgia, Times New Roman, Courier New, and Impact. These fonts are available across all devices and browsers.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_thumbnail_generator?.faq_5_q ||
          "Does my image get uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_thumbnail_generator?.faq_5_a ||
            "No. All processing happens in your browser using the Canvas API. Your images never leave your device.",
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
        name: "Thumbnail Generator",
        item: "https://ssdown.app/image/thumbnail-generator",
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
              label: "Thumbnail Generator",
              href: "/image/thumbnail-generator",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <ThumbnailGeneratorClient dict={dict} />
    </>
  );
}
