import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { AspectRatioCalculatorClient } from "@/components/client/aspect-ratio-calculator-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/aspect-ratio-calculator`;

  const title = "Aspect Ratio Calculator - Video Resolution Tool | SSDown";
  const description =
    "Calculate aspect ratios and resolutions for video editing. Get the perfect dimensions for YouTube, Instagram, TikTok, and more. Free online tool.";

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

export default async function AspectRatioCalculatorPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name:
          dict?.qna_aspect_ratio_calculator?.faq_1_q ||
          "What is an aspect ratio?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_aspect_ratio_calculator?.faq_1_a ||
            "An aspect ratio is the proportional relationship between width and height.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_aspect_ratio_calculator?.faq_2_q ||
          "Which aspect ratio should I use?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_aspect_ratio_calculator?.faq_2_a ||
            "It depends on your platform: 16:9 for YouTube, 1:1 for Instagram feed, 9:16 for Stories/TikTok.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_aspect_ratio_calculator?.faq_3_q ||
          "Does aspect ratio affect video quality?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_aspect_ratio_calculator?.faq_3_a ||
            "No, but using the wrong ratio can cause black bars or cropping.",
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
        name: "Utility",
        item: "https://ssdown.app/tools/utility",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Aspect Ratio Calculator",
        item: "https://ssdown.app/utility/aspect-ratio-calculator",
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
            { label: "Utility", href: "/tools/utility" },
            {
              label: "Aspect Ratio Calculator",
              href: "/utility/aspect-ratio-calculator",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <AspectRatioCalculatorClient dict={dict} />
    </>
  );
}
