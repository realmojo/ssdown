import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { Base64UrlEncoderClient } from "@/components/client/base64-url-encoder-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const FALLBACK_FAQ = [
  {
    question: "What is Base64 encoding used for?",
    answer:
      "Base64 encoding converts binary data into an ASCII text string. It's commonly used to embed small images as data URIs, attach files in emails, or safely transmit binary data through channels that only reliably handle text.",
  },
  {
    question: "Is Base64 the same as encryption?",
    answer:
      "No. Base64 is a reversible encoding, not encryption. Anyone can decode a Base64 string instantly, so it provides no security. Never use it to hide passwords, tokens, or other sensitive data.",
  },
  {
    question: "What is URL encoding (percent-encoding) used for?",
    answer:
      "URL encoding converts special characters (spaces, &, =, ?, and non-ASCII characters) into a percent-encoded format so they can be safely included in a URL or query string without breaking its structure.",
  },
  {
    question: "Does this tool support Korean and other Unicode text?",
    answer:
      "Yes. Both the Base64 and URL modes are fully UTF-8 safe, so Korean, Japanese, emoji, and any other Unicode characters are encoded and decoded correctly without corruption.",
  },
  {
    question: "Is my text sent to any server?",
    answer:
      "No. All encoding and decoding happens entirely in your browser using JavaScript. Your text never leaves your device and is never uploaded or stored anywhere.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/base64-url-encoder`;

  const title =
    dict?.page_base64_url_encoder?.meta_title ||
    "Base64 & URL Encoder/Decoder | SSDown";
  const description =
    dict?.page_base64_url_encoder?.meta_description ||
    "Encode or decode Base64 and URL-encoded text instantly in your browser. Free, fast, and fully private.";

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
        {
          url: "https://ssdown.app/logo.png",
          width: 1200,
          height: 630,
          alt: title,
        },
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

export default async function Base64UrlEncoderPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const breadcrumbLabel =
    dict?.page_base64_url_encoder?.breadcrumb_title || "Base64 / URL Encoder";
  const faqItems = dict?.page_base64_url_encoder?.faq || FALLBACK_FAQ;

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const utilityLabel = dict?.breadcrumb?.utility || "Utility";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(
      (item: { question: string; answer: string }) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      }),
    ),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeLabel,
        item: "https://ssdown.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: toolsLabel,
        item: "https://ssdown.app/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: utilityLabel,
        item: "https://ssdown.app/tools/utility",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: breadcrumbLabel,
        item: "https://ssdown.app/utility/base64-url-encoder",
      },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Base64 & URL Encoder/Decoder",
    url: "https://ssdown.app/utility/base64-url-encoder",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online Base64 and URL encoder/decoder. Fast, secure, and fully browser-based. UTF-8 safe.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use the Base64 & URL Encoder/Decoder",
    description:
      "Encode or decode Base64 and URL-encoded text instantly in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Choose a mode",
        text: "Select Base64 Encode, Base64 Decode, URL Encode, or URL Decode.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Paste your text",
        text: "Type or paste your text into the input area. The result is generated instantly.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy the result",
        text: "Copy the converted output to your clipboard with a single click.",
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
