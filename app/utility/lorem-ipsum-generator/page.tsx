import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { LoremIpsumGeneratorClient } from "@/components/client/lorem-ipsum-generator-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const FALLBACK_FAQ = [
  {
    question: "What is Lorem Ipsum?",
    answer:
      "Lorem Ipsum is placeholder text derived from a passage of classical Latin literature. Designers and developers use it to fill layouts with realistic-looking text so they can focus on visual design without being distracted by readable content.",
  },
  {
    question: "Why use placeholder text instead of real content?",
    answer:
      "Placeholder text lets you evaluate typography, spacing, and layout before the final copy is ready. Because Lorem Ipsum has a natural distribution of word lengths, it looks like real prose without drawing the reader's attention to the words themselves.",
  },
  {
    question: "Is the generated text private?",
    answer:
      "Yes. Everything is generated locally in your browser using JavaScript. No text is sent to a server, and nothing you generate is logged or stored anywhere.",
  },
  {
    question: "Can I generate words, sentences, or paragraphs?",
    answer:
      "Yes. You can choose to generate a specific number of words, sentences, or paragraphs, and optionally wrap paragraphs in HTML <p> tags for pasting directly into markup.",
  },
  {
    question: 'What does "start with Lorem ipsum dolor sit amet" do?',
    answer:
      "When enabled, the output begins with the traditional opening phrase 'Lorem ipsum dolor sit amet' before continuing with randomized words, matching the classic placeholder text convention.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const pageDict = (dict as Record<string, any>)?.page_lorem_ipsum_generator;
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/lorem-ipsum-generator`;

  const title =
    pageDict?.meta_title || "Free Lorem Ipsum Generator | SSDown";
  const description =
    pageDict?.meta_description ||
    "Generate Lorem Ipsum placeholder text by words, sentences, or paragraphs instantly in your browser. Free, secure, and 100% private.";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: canonical,
        ko: canonical,
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

export default async function LoremIpsumGeneratorPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const pageDict = (dict as Record<string, any>)?.page_lorem_ipsum_generator;

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const utilityLabel = dict?.breadcrumb?.utility || "Utility";
  const breadcrumbLabel =
    pageDict?.breadcrumb_title || "Lorem Ipsum Generator";
  const faqItems: { question: string; answer: string }[] =
    pageDict?.faq || FALLBACK_FAQ;

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
        item: "https://ssdown.app/utility/lorem-ipsum-generator",
      },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Lorem Ipsum Generator",
    url: "https://ssdown.app/utility/lorem-ipsum-generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online Lorem Ipsum generator. Create placeholder text by words, sentences, or paragraphs in your browser.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to generate Lorem Ipsum",
    description:
      "Use our free online Lorem Ipsum generator to create placeholder text in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Choose the type",
        text: "Select whether to generate paragraphs, sentences, or words.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Set the amount",
        text: "Enter how many paragraphs, sentences, or words you need.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy the text",
        text: "Copy the generated placeholder text, optionally wrapped in HTML paragraph tags.",
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
