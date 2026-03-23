import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { ColorPaletteExtractorClient } from "@/components/client/color-palette-extractor-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/color-palette-extractor`;

  const title = dict.page_color_palette_extractor.meta_title;
  const description = dict.page_color_palette_extractor.meta_description;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en": canonical,
        "ko": canonical,
        "x-default": canonical,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
      images: [{ url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["https://ssdown.app/logo.png"] },
  };
}

export default async function ColorPaletteExtractorPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_color_palette_extractor.faq.map((item: { question: string; answer: string }) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.breadcrumb.home, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: dict.breadcrumb.tools, item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.image_tools, item: "https://ssdown.app/tools/image" },
      { "@type": "ListItem", position: 4, name: dict.page_color_palette_extractor.breadcrumb_title, item: "https://ssdown.app/image/color-palette-extractor" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Color Palette Extractor",
    url: "https://ssdown.app/image/color-palette-extractor",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Extract dominant colors and create a beautiful palette from any image.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use Color Palette Extractor Online",
    description: "Extract dominant colors and create a beautiful palette from any image.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Upload an image",
        text: "Choose an image you want to extract colors from.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Analyze colors",
        text: "Wait a second while we analyze the dominant colors and hex codes.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy hex codes",
        text: "Copy the color codes or download the palette as an image.",
      }
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
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
            { label: dict.breadcrumb.home, href: "/" },
            { label: dict.breadcrumb.tools, href: "/tools" },
            { label: dict.breadcrumb.image_tools, href: "/tools/image" },
            {
              label: dict.page_color_palette_extractor.breadcrumb_title,
              href: "/image/color-palette-extractor",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <ColorPaletteExtractorClient dict={dict} />

      {/* Mood Palette 관련 도구 배너 */}
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <a
          href="https://moodpalette.ssdown.app"
          target="_blank"
          rel="noopener"
          className="flex items-center justify-between gap-4 bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-950/30 dark:to-pink-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl p-5 hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-1">Try Also</p>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-violet-600 transition-colors">
              Mood Palette — AI Color Palette Generator
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Generate beautiful color palettes from mood, keywords, or images. Free online tool.
            </p>
          </div>
          <span className="shrink-0 text-2xl">🎨</span>
        </a>
      </div>
    </>
  );
}
