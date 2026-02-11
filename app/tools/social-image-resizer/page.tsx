import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { SocialImageResizerClient } from "@/components/client/social-image-resizer-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tools/social-image-resizer`;

  const title = "Social Image Resizer - Instagram, YouTube, TikTok | SSDown";
  const description =
    "Resize and crop images for Instagram Story (9:16), Feed (1:1), and YouTube Thumbnail (16:9) instantly. Free online social media image resizer.";

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

export default async function SocialImageResizerPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name:
          dict?.qna_social_image_resizer?.faq_1_q || "Does it crop my image?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_social_image_resizer?.faq_1_a ||
            "Yes, we use smart center-cropping to fit the target aspect ratio.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_social_image_resizer?.faq_2_q ||
          "What platforms are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_social_image_resizer?.faq_2_a ||
            "We support standard sizes for Instagram (Story, Feed), YouTube, TikTok, and Twitter.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_social_image_resizer?.faq_3_q ||
          "Is the quality preserved?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_social_image_resizer?.faq_3_a ||
            "Yes, we assume high-quality output settings to keep your images crisp.",
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
        name: "Social Image Resizer",
        item: "https://ssdown.app/tools/social-image-resizer",
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
            {
              label: "Social Image Resizer",
              href: "/tools/social-image-resizer",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <SocialImageResizerClient dict={dict} />
    </>
  );
}
