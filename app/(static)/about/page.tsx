import { AboutClient } from "@/components/client/about-client";
import { Metadata } from "next";
import { getLocale } from "@/lib/get-locale";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/about`;
  const locale = await getLocale();

  return {
    title: "About SSDown - Free Online Tools Platform",
    description:
      "Learn about SSDown's mission to provide free, secure, and browser-based tools for image editing, PDF management, and video conversion. Our story and commitment to privacy.",
    openGraph: {
      title: "About SSDown - Free Online Tools Platform",
      description: "Learn about SSDown's mission to provide free, secure, and browser-based tools for image editing, PDF management, and video conversion.",
      url: canonical,
      siteName: "SSDown",
      locale: "en_US",
      type: "website",
    },
    alternates: buildAlternates(new URL(canonical).pathname, locale),
  };
}

export default async function AboutPage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SSDown",
    url: "https://ssdown.app",
    logo: "https://ssdown.app/logo.png",
    description: "Free online tools for image editing, PDF management, video conversion, and file transformation. Fast, secure, and browser-based.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "",
      contactType: "customer support",
      email: "support@ssdown.app",
      url: "https://ssdown.app/contact"
    },
    sameAs: ["https://twitter.com/ssdown"]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <AboutClient />
    </>
  );
}
