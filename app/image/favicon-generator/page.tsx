import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { FaviconGeneratorClient } from "@/components/client/favicon-generator-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/favicon-generator`;

  const title = "Favicon Generator - Create ICO from Images Online Free | SSDown";
  const description =
    "Free online favicon generator. Convert any image to ICO format with multiple sizes (16x16 to 256x256). 100% private, client-side processing.";

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

export default async function FaviconGeneratorPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name:
          dict?.qna_favicon_generator?.faq_1_q ||
          "What sizes are included in the ICO file?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_favicon_generator?.faq_1_a ||
            "The ICO file contains 6 standard favicon sizes: 16x16, 32x32, 48x48, 64x64, 128x128, and 256x256 pixels.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_favicon_generator?.faq_2_q ||
          "Is my image uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_favicon_generator?.faq_2_a ||
            "No. All favicon generation happens entirely in your browser using Canvas API. Your image never leaves your device.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_favicon_generator?.faq_3_q ||
          "What if my image isn't square?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_favicon_generator?.faq_3_a ||
            "Non-square images are automatically center-cropped to create a square favicon.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_favicon_generator?.faq_4_q ||
          "How do I add the favicon to my website?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_favicon_generator?.faq_4_a ||
            "Upload the favicon.ico file to your website's root directory, then add HTML to your page's head section.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_favicon_generator?.faq_5_q ||
          "Can I download individual PNG sizes?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_favicon_generator?.faq_5_a ||
            "Yes! You can download each size as a separate PNG file, or download all PNGs together as a ZIP file.",
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
        name: "Favicon Generator",
        item: "https://ssdown.app/image/favicon-generator",
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
              label: "Favicon Generator",
              href: "/image/favicon-generator",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <FaviconGeneratorClient dict={dict} />
    </>
  );
}
