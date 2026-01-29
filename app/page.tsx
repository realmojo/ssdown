import { Metadata } from "next";
import { HomeClient } from "@/components/client/home-client";

export const metadata: Metadata = {
  title: "SSDown - Ultimate Video Downloader",
  description: "Download videos from X, TikTok and more.",
  keywords: ["video downloader", "twitter video download", "tiktok downloader"],
  openGraph: {
    title: "SSDown - Video Downloader",
    description: "Download videos from X, TikTok and more.",
    url: "https://ssdown.app",
    siteName: "SSDown",
    images: [
      {
        url: "https://ssdown.app/logo.png",
        width: 1200,
        height: 630,
        alt: "SSDown Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SSDown - Video Downloader",
    description: "Download videos from X, TikTok and more.",
    images: ["https://ssdown.app/logo.png"],
  },
  alternates: {
    canonical: "https://ssdown.app",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SSDown",
    url: "https://ssdown.app",
    description: "Download videos from X, TikTok, Instagram, and more.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "X (Twitter) Video Downloader",
      "TikTok Video Downloader (No Watermark)",
      "Instagram Reels Saver",
      "Facebook Video Downloader",
    ],
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
