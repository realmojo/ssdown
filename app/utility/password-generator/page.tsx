import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { buildAlternates } from "@/lib/seo";
import { PasswordGeneratorClient } from "@/components/client/password-generator-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const META_TITLE = "Password Generator - Create Strong Secure Passwords | SSDown";
const META_DESCRIPTION =
  "Free online password generator. Create strong, random, secure passwords with custom length and character sets. Runs 100% in your browser.";
const BREADCRUMB_TITLE = "Password Generator";
const CANONICAL = "https://ssdown.app/utility/password-generator";

const faq = [
  {
    question: "Are the generated passwords secure?",
    answer:
      "Yes. Passwords are generated using your browser's cryptographically secure random number generator (crypto.getRandomValues). They are never sent to any server, logged, or stored anywhere.",
  },
  {
    question: "How long should my password be?",
    answer:
      "For most accounts, use at least 16 characters with a mix of uppercase, lowercase, numbers, and symbols. Longer passwords are exponentially harder to crack, so use the longest length a service allows.",
  },
  {
    question: "What does 'exclude ambiguous characters' do?",
    answer:
      "It removes visually similar characters such as 0, O, 1, l, and I from the pool. This makes passwords easier to read and type manually without reducing security in a meaningful way.",
  },
  {
    question: "Is my password sent to a server?",
    answer:
      "No. Everything happens entirely in your browser. No password is transmitted, saved, or shared. Close the tab and the generated passwords are gone forever.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const title = META_TITLE;
  const description = META_DESCRIPTION;

  return {
    title,
    description,
    alternates: buildAlternates(new URL(CANONICAL).pathname, locale),
    openGraph: {
      title,
      description,
      url: CANONICAL,
      siteName: "SSDown",
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
      images: [{ url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["https://ssdown.app/logo.png"] },
  };
}

export default async function PasswordGeneratorPage() {
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
      { "@type": "ListItem", position: 4, name: BREADCRUMB_TITLE, item: CANONICAL },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Password Generator",
    url: CANONICAL,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online password generator. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use Password Generator Online",
    description: "Create strong, random, secure passwords entirely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Choose your options",
        text: "Set the password length and pick which character sets to include.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Generate a password",
        text: "A secure password is created instantly using your browser's cryptographic randomness.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy and use",
        text: "Copy the password with one click and paste it wherever you need it.",
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
              label: BREADCRUMB_TITLE,
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
