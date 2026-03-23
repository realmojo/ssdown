import { Metadata } from "next";
import { HomeClient } from "@/components/client/home-client";

export const metadata: Metadata = {
  title: "SSDown - Free Online Tools for Everyday Tasks",
  description:
    "Free online tools for image editing, PDF management, video conversion, and file transformation. Fast, secure, and browser-based.",
  keywords: [
    "free online tools",
    "image compressor",
    "PDF tools",
    "video converter",
    "file converter",
    "browser-based tools",
    "online image editor",
  ],
  openGraph: {
    title: "SSDown - Free Online Tools",
    description:
      "Free online tools for image editing, PDF management, video conversion, and file transformation. Fast, secure, and browser-based.",
    url: "https://ssdown.app",
    siteName: "SSDown",
    images: [
      {
        url: "https://ssdown.app/logo.png",
        width: 1200,
        height: 630,
        alt: "SSDown - Free Online Tools",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SSDown - Free Online Tools",
    description:
      "Free online tools for image editing, PDF management, video conversion, and file transformation.",
    images: ["https://ssdown.app/logo.png"],
  },
  alternates: {
    canonical: "https://ssdown.app",
  },
};

export default function Home() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SSDown - Free Online Tools",
    url: "https://ssdown.app",
    description:
      "Free online tools for image editing, PDF management, video conversion, and file transformation. Fast, secure, and browser-based.",
    about: {
      "@type": "Thing",
      name: "Online Tools Platform",
      description:
        "A comprehensive suite of free browser-based tools for image editing, PDF management, video and audio conversion, and file format transformation.",
    },
    audience: {
      "@type": "Audience",
      audienceType:
        "Content Creators, Designers, Developers, Students, Professionals",
    },
    keywords:
      "free online tools, image compressor, PDF tools, video converter, file converter, browser-based tools",
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SSDown",
    url: "https://ssdown.app",
    logo: "https://ssdown.app/logo.png",
    description:
      "Free online tools for image editing, PDF management, video conversion, and file transformation. Fast, secure, and browser-based.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: "https://ssdown.app/contact",
    },
    sameAs: ["https://twitter.com/ssdown"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
