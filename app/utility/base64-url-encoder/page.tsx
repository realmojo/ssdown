import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { buildAlternates } from "@/lib/seo";
import { Base64UrlEncoderClient } from "@/components/client/base64-url-encoder-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/base64-url-encoder`;

  const title = "Base64 & URL Encoder / Decoder Online | SSDown";
  const description =
    "Free online Base64 and URL encoder/decoder. Encode or decode text safely in your browser with full UTF-8 support. No data leaves your device.";

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
    question: "Does my text get sent to a server?",
    answer:
      "No. All Base64 and URL encoding or decoding happens entirely in your browser using native JavaScript. Your text never leaves your device and is never uploaded or stored anywhere.",
  },
  {
    question: "Does Base64 encoding support Unicode and emoji?",
    answer:
      "Yes. This tool is fully UTF-8 safe. It correctly encodes and decodes non-ASCII characters, accented letters, and emoji by handling the UTF-8 byte sequence before applying Base64.",
  },
  {
    question: "What is the difference between URL encode and encodeURI?",
    answer:
      "Standard URL encode (encodeURIComponent) escapes every reserved character, making it ideal for encoding a single query parameter value. The 'Encode full URL' option (encodeURI) preserves characters like :/?# so a complete URL stays valid and clickable.",
  },
  {
    question: "Why do I get an 'Invalid Base64 input' error?",
    answer:
      "That error appears when the input is not valid Base64, such as containing spaces, line breaks, or characters outside the Base64 alphabet. Make sure you are decoding a properly encoded Base64 string, or switch the mode to encode first.",
  },
];

export default async function Base64UrlEncoderPage() {
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
      { "@type": "ListItem", position: 4, name: "Base64 / URL Encoder", item: "https://ssdown.app/utility/base64-url-encoder" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Base64 / URL Encoder",
    url: "https://ssdown.app/utility/base64-url-encoder",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online Base64 and URL encoder/decoder. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use Base64 / URL Encoder Online",
    description: "Use our free online Base64 and URL encoder/decoder to convert text securely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Choose a mode",
        text: "Select Base64 or URL depending on the type of conversion you need.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Enter your text",
        text: "Type or paste your text into the input area, then press Encode or Decode.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy the result",
        text: "Copy the converted output to your clipboard instantly.",
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
              label: "Base64 / URL Encoder",
              href: "/utility/base64-url-encoder",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <Base64UrlEncoderClient dict={dict} />
    </>
  );
}
