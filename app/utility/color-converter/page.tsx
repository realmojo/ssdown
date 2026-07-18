import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { buildAlternates } from "@/lib/seo";
import { ColorConverterClient } from "@/components/client/color-converter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/color-converter`;

  const title = "Color Converter - HEX, RGB, HSL Converter | SSDown";
  const description =
    "Free online color converter. Instantly convert between HEX, RGB, and HSL color formats with a live preview and color picker.";

  return {
    title,
    description,
    alternates: buildAlternates(new URL(canonical).pathname, locale),
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

const faq = [
  {
    question: "How do I convert a HEX color to RGB?",
    answer:
      "Paste or type your HEX value (for example #ff8800) into the HEX field. The converter instantly updates the RGB and HSL fields, showing the equivalent values and a live preview.",
  },
  {
    question: "What is the difference between HEX, RGB, and HSL?",
    answer:
      "HEX is a hexadecimal notation for red, green, and blue channels used in CSS. RGB expresses the same channels as decimal numbers from 0 to 255. HSL describes a color by hue, saturation, and lightness, which is often more intuitive for adjusting colors.",
  },
  {
    question: "Does this tool support 3-digit shorthand HEX codes?",
    answer:
      "Yes. Shorthand HEX values like #f80 are automatically expanded to their full six-digit form (#ff8800) before conversion, so both formats work seamlessly.",
  },
  {
    question: "Is my color data sent to a server?",
    answer:
      "No. All conversions happen entirely in your browser using JavaScript. Nothing is uploaded or stored, so your work stays completely private.",
  },
];

export default async function ColorConverterPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
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
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.utility, item: "https://ssdown.app/tools/utility" },
      { "@type": "ListItem", position: 4, name: "Color Converter", item: "https://ssdown.app/utility/color-converter" },
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
    description: "Free online color converter tool. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use Color Converter Online",
    description: "Use our free online color converter to translate colors between HEX, RGB, and HSL in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Pick or enter a color",
        text: "Use the color picker or type a value into the HEX, RGB, or HSL fields.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "See every format",
        text: "All representations update live along with a large color preview.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy the value",
        text: "Click the copy button next to any format to grab the CSS-ready string.",
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
            { label: dict.breadcrumb.home, href: "/" },
            { label: dict.breadcrumb.tools, href: "/tools" },
            { label: dict.breadcrumb.utility, href: "/tools/utility" },
            {
              label: "Color Converter",
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
