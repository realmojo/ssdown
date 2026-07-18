import { ContactClient } from "@/components/client/contact-client";
import { Metadata } from "next";
import { getLocale } from "@/lib/get-locale";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/contact`;
  const locale = await getLocale();

  return {
    title: "Contact SSDown - Support & Help",
    description:
      "Contact SSDown support team for any questions, feedback or issues regarding our online tools and services.",
    openGraph: {
      title: "Contact SSDown",
      description:
        "Contact SSDown support team for any questions, feedback or issues regarding our online tools and services.",
      url: canonical,
      siteName: "SSDown",
      locale: "en_US",
      type: "website",
    },
    alternates: buildAlternates(new URL(canonical).pathname, locale),
  };
}

export default async function ContactPage() {
  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact SSDown",
    url: "https://ssdown.app/contact",
    description:
      "Contact SSDown support team for any questions, feedback or issues regarding our online tools and services.",
    mainEntity: {
      "@type": "Organization",
      name: "SSDown",
      url: "https://ssdown.app",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: "https://ssdown.app/contact",
        availableLanguage: ["English", "Korean"],
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />
      <ContactClient />
    </>
  );
}
