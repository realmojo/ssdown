import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { LoremIpsumGeneratorClient } from "@/components/client/lorem-ipsum-generator-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/lorem-ipsum-generator`;

  const title = "Lorem Ipsum Generator - Placeholder Text | SSDown";
  const description =
    "Free online Lorem Ipsum generator. Create placeholder paragraphs, sentences, or words for your designs, mockups, and layouts.";

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

export default async function LoremIpsumGeneratorPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faq = [
    {
      question: "What is Lorem Ipsum?",
      answer:
        "Lorem Ipsum is placeholder text derived from a Latin passage by Cicero. It has been the industry-standard dummy text since the 1500s, used to fill layouts and mockups so designers can focus on visual structure without the distraction of readable content.",
    },
    {
      question: "How do I use this Lorem Ipsum generator?",
      answer:
        "Choose whether you want paragraphs, sentences, or words, set how many you need, then click Generate. Toggle the options to start with the classic 'Lorem ipsum dolor sit amet' opening or to wrap each paragraph in HTML <p> tags, and copy the result with one click.",
    },
    {
      question: "Is this Lorem Ipsum generator free and private?",
      answer:
        "Yes. The tool is completely free with no signup required, and all text is generated locally in your browser. Nothing you generate is ever sent to a server or stored anywhere.",
    },
    {
      question: "Can I generate HTML-ready placeholder text?",
      answer:
        "Absolutely. Enable the 'Wrap paragraphs in <p> tags' option and each paragraph will be wrapped in a <p> element, ready to paste straight into your HTML markup or CMS.",
    },
  ];

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
      { "@type": "ListItem", position: 4, name: "Lorem Ipsum Generator", item: "https://ssdown.app/utility/lorem-ipsum-generator" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Lorem Ipsum Generator",
    url: "https://ssdown.app/utility/lorem-ipsum-generator",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online Lorem Ipsum generator. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use Lorem Ipsum Generator Online",
    description: "Use our free online Lorem Ipsum generator to create placeholder text securely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Choose your options",
        text: "Select paragraphs, sentences, or words and set how many you need.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Generate placeholder text",
        text: "Click Generate to instantly create Lorem Ipsum in your browser.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy the result",
        text: "Copy the generated text and paste it into your design or layout.",
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
              label: "Lorem Ipsum Generator",
              href: "/utility/lorem-ipsum-generator",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <LoremIpsumGeneratorClient dict={dict} />
    </>
  );
}
