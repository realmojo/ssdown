import { Metadata } from "next";

const BASE_URL = "https://ssdown.app";

export const SITE_SAME_AS = ["https://twitter.com/ssdown"];

export function buildHreflangAlternates(canonicalPath: string): NonNullable<Metadata["alternates"]> {
  const url = `${BASE_URL}${canonicalPath}`;
  return {
    canonical: url,
    languages: {
      "en": url,
      "ko": url,
      "x-default": url,
    },
  };
}

export function buildOgImage(alt: string) {
  return [{ url: `${BASE_URL}/logo.png`, width: 1200, height: 630, alt }];
}

export function buildSoftwareApplicationSchema(name: string, url: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    url,
    description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
