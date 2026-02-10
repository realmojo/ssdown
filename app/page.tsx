import { Metadata } from "next";
import { HomeClient } from "@/components/client/home-client";

export const metadata: Metadata = {
  title: "SSDown - Video Technology & Digital Archiving Education Hub",
  description:
    "Learn about video codecs, streaming protocols, and responsible digital content management. Comprehensive educational resources for understanding modern video technology.",
  keywords: [
    "video technology",
    "codec education",
    "digital archiving",
    "HLS streaming",
    "HEVC H264",
    "content preservation",
    "video analysis",
  ],
  openGraph: {
    title: "SSDown - Video Technology Education Hub",
    description:
      "Comprehensive guides on video codecs, streaming technology, and ethical digital content management.",
    url: "https://ssdown.app",
    siteName: "SSDown",
    images: [
      {
        url: "https://ssdown.app/logo.png",
        width: 1200,
        height: 630,
        alt: "SSDown - Video Technology Hub",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SSDown - Video Technology Hub",
    description:
      "Educational platform for video technology, codecs, and digital archiving best practices.",
    images: ["https://ssdown.app/logo.png"],
  },
  alternates: {
    canonical: "https://ssdown.app",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SSDown - Video Technology Education Hub",
    url: "https://ssdown.app",
    description:
      "Educational platform dedicated to teaching video technology, codec standards, digital archiving ethics, and responsible content management.",
    about: {
      "@type": "Thing",
      name: "Video Technology Education",
      description:
        "Comprehensive information about video codecs (H.264, HEVC, AV1), streaming protocols (HLS, DASH), and digital content management best practices.",
    },
    audience: {
      "@type": "Audience",
      audienceType:
        "Digital Archivists, Tech Enthusiasts, Content Creators, Media Students",
    },
    keywords:
      "video technology, codec education, digital archiving, HLS streaming, HEVC, H264, AV1, content preservation",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
