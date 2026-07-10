import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { PasswordGeneratorClient } from "@/components/client/password-generator-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const FALLBACK_FAQ = [
  {
    question: "Is this password generator secure and private?",
    answer:
      "Yes. Every password is generated locally in your browser using the cryptographically secure crypto.getRandomValues API. Nothing is ever sent to a server, logged, or stored — close the tab and the password is gone.",
  },
  {
    question: "What makes a strong password?",
    answer:
      "A strong password is long (16+ characters), unpredictable, and mixes uppercase letters, lowercase letters, numbers, and symbols. Randomly generated passwords are far stronger than anything a person invents because they contain no guessable patterns or personal information.",
  },
  {
    question: "How long should a password be?",
    answer:
      "Aim for at least 12 characters, and 16 or more for important accounts. Length is the single biggest factor in resisting brute-force attacks — each extra character multiplies the number of possible combinations dramatically.",
  },
  {
    question: 'What does "exclude ambiguous characters" do?',
    answer:
      "When enabled, it removes characters that are easy to confuse when read or typed manually — such as the letter l, capital I, the number 1, capital O, and the number 0. This makes passwords easier to transcribe correctly without meaningfully reducing their strength.",
  },
  {
    question: "Can I trust a browser-based password generator?",
    answer:
      "Yes, when it runs entirely client-side like this one. Because generation happens in your own browser with the Web Crypto API and no network requests are made, there is no server that could ever see your password. You can even disconnect from the internet and it will still work.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/password-generator`;

  const title =
    dict?.page_password_generator?.meta_title ||
    "Free Password Generator | SSDown";
  const description =
    dict?.page_password_generator?.meta_description ||
    "Generate strong, random passwords instantly in your browser. Free, secure, and 100% private.";

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

export default async function PasswordGeneratorPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const utilityLabel = dict?.breadcrumb?.utility || "Utility";
  const breadcrumbLabel =
    dict?.page_password_generator?.breadcrumb_title || "Password Generator";
  const faqItems: { question: string; answer: string }[] =
    dict?.page_password_generator?.faq || FALLBACK_FAQ;

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
        item: "https://ssdown.app/utility/password-generator",
      },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Password Generator",
    url: "https://ssdown.app/utility/password-generator",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online password generator. Create strong, random, secure passwords locally in your browser.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to generate a strong password",
    description:
      "Use our free online password generator to create secure, random passwords in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Choose your options",
        text: "Set the password length and pick which character types to include.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Generate instantly",
        text: "A strong random password is created immediately in your browser.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy and use it",
        text: "Copy the password to your clipboard — nothing is ever sent to a server.",
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
              href: "/utility/password-generator",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <PasswordGeneratorClient dict={dict} />
    </>
  );
}
