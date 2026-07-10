import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { ColorConverterClient } from "@/components/client/color-converter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const FALLBACK_FAQ = [
  {
    question: "What's the difference between HEX, RGB, and HSL?",
    answer:
      "They are three ways to describe the same color. HEX (e.g. #3B82F6) is a compact hexadecimal notation popular in CSS and design tools. RGB (e.g. rgb(59, 130, 246)) describes a color by its red, green, and blue channel intensities, which is convenient for canvas and JavaScript color math. HSL (e.g. hsl(217, 91%, 60%)) describes a color by hue, saturation, and lightness, which makes it easy to adjust brightness or create variants.",
  },
  {
    question: "Is this color converter free and private?",
    answer:
      "Yes. The tool is completely free to use and all conversion happens locally in your browser. No color values are ever uploaded to a server, so your work stays private.",
  },
  {
    question: "Does it support alpha or transparency?",
    answer:
      "Not in this version. The converter works with opaque colors only (HEX, RGB, and HSL without an alpha channel). Support for RGBA/HSLA transparency may be added later.",
  },
  {
    question: "What is the eyedropper tool and which browsers support it?",
    answer:
      "The eyedropper (Pick from Screen) lets you sample any color from your screen using the native browser EyeDropper API. It is available in Chromium-based browsers such as Chrome and Edge. If your browser does not support it, the button is hidden automatically.",
  },
  {
    question: "Is there a limit on how many colors I can convert?",
    answer:
      "No. You can convert as many colors as you like, as often as you like. There are no limits, accounts, or sign-ups required.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/color-converter`;

  const title =
    dict?.page_color_converter?.meta_title ||
    "Color Converter - HEX, RGB, HSL | SSDown";
  const description =
    dict?.page_color_converter?.meta_description ||
    "Convert colors between HEX, RGB, and HSL formats instantly in your browser. Free, fast, and private.";

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
      images: [
        { url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://ssdown.app/logo.png"],
    },
  };
}

export default async function ColorConverterPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const utilityLabel = dict?.breadcrumb?.utility || "Utility";
  const breadcrumbLabel =
    dict?.page_color_converter?.breadcrumb_title || "Color Converter";

  const faqItems: { question: string; answer: string }[] =
    dict?.page_color_converter?.faq || FALLBACK_FAQ;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
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
      { "@type": "ListItem", position: 1, name: homeLabel, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: toolsLabel, item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: utilityLabel, item: "https://ssdown.app/tools/utility" },
      {
        "@type": "ListItem",
        position: 4,
        name: breadcrumbLabel,
        item: "https://ssdown.app/utility/color-converter",
      },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Color Converter",
    url: "https://ssdown.app/utility/color-converter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online color converter. Convert between HEX, RGB, and HSL instantly. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to convert colors between HEX, RGB, and HSL",
    description:
      "Use our free online color converter to translate a color between HEX, RGB, and HSL formats in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Enter a color",
        text: "Type a color in any format, use the color picker, or sample one from your screen.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "See it converted",
        text: "The color is instantly converted to the other two formats and shown in a live preview.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy the value",
        text: "Click the copy button next to the format you need and paste it into your project.",
      },
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
            { label: homeLabel, href: "/" },
            { label: toolsLabel, href: "/tools" },
            { label: utilityLabel, href: "/tools/utility" },
            {
              label: breadcrumbLabel,
              href: "/utility/color-converter",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <ColorConverterClient dict={dict} />
    </>
  );
}
