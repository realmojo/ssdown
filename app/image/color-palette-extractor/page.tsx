import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { ColorPaletteExtractorClient } from "@/components/client/color-palette-extractor-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/color-palette-extractor`;

  const title =
    "Color Palette Extractor - Extract Colors from Images Online Free | SSDown";
  const description =
    "Free online color palette extractor. Upload an image to extract dominant colors. Get HEX, RGB, and HSL codes instantly. 100% private.";

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

export default async function ColorPaletteExtractorPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name:
          dict?.qna_color_palette_extractor?.faq_1_q ||
          "How does color extraction work?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_color_palette_extractor?.faq_1_a ||
            "We use k-means clustering algorithm to analyze all pixels in your image and group them into the most dominant colors.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_color_palette_extractor?.faq_2_q ||
          "Is my image uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_color_palette_extractor?.faq_2_a ||
            "No. All color extraction happens entirely in your browser using Canvas API and JavaScript.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_color_palette_extractor?.faq_3_q ||
          "What color formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_color_palette_extractor?.faq_3_a ||
            "We provide three color code formats for each extracted color: HEX, RGB, and HSL.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_color_palette_extractor?.faq_4_q ||
          "How many colors should I extract?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_color_palette_extractor?.faq_4_a ||
            "It depends on your use case. For logo analysis, 3-5 colors usually capture the main palette.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_color_palette_extractor?.faq_5_q ||
          "Can I use the extracted colors commercially?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_color_palette_extractor?.faq_5_a ||
            "Color codes themselves are not copyrightable, but using colors extracted from copyrighted images may infringe on trademark rights.",
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
        name: "Color Palette Extractor",
        item: "https://ssdown.app/image/color-palette-extractor",
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
              label: "Color Palette Extractor",
              href: "/image/color-palette-extractor",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <ColorPaletteExtractorClient dict={dict} />
    </>
  );
}
