import { ContactClient } from "@/components/client/contact-client";
import { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";
import { jsonLd } from "@/lib/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/contact`;

  return {
    title: "SSDown 문의 - 지원 및 도움말",
    description:
      "SSDown 문의하기 support team for any questions, feedback or issues regarding our online tools and services.",
    openGraph: {
      title: "SSDown 문의하기",
      description:
        "SSDown 문의하기 support team for any questions, feedback or issues regarding our online tools and services.",
      url: canonical,
      siteName: "SSDown",
      locale: "ko_KR",
      type: "website",
    },
    alternates: buildAlternates(new URL(canonical).pathname),
  };
}

export default async function ContactPage() {
  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "SSDown 문의하기",
    url: "https://ssdown.app/contact",
    description:
      "SSDown 문의하기 support team for any questions, feedback or issues regarding our online tools and services.",
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
        dangerouslySetInnerHTML={{ __html: jsonLd(contactPageJsonLd) }}
      />
      <ContactClient />
    </>
  );
}
