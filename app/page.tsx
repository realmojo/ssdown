export const runtime = "edge";

import { getDictionary } from "@/lib/get-dictionary";
import { HomeClient } from "@/components/client/home-client";

import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  const baseUrl = "https://ssdown.app";
  const canonical = baseUrl;

  return {
    title: dict.home?.seo_title || "SSDown - Ultimate Video Downloader",
    description:
      dict.home?.seo_description || "Download videos from X, TikTok and more.",
    keywords: dict.home?.seo_keywords
      ? dict.home.seo_keywords.split(", ")
      : ["video downloader", "twitter video download", "tiktok downloader"],
    openGraph: {
      title: dict.home?.seo_title || "SSDown - Video Downloader",
      description:
        dict.home?.seo_description ||
        "Download videos from X, TikTok and more.",
      url: canonical,
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
      title: dict.home?.title || "SSDown - Video Downloader",
      description:
        dict.home?.subtitle || "Download videos from X, TikTok and more.",
      images: ["https://ssdown.app/logo.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function Home() {
  const dict = await getDictionary();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SSDown",
    url: "https://ssdown.app",
    description:
      dict.home?.subtitle ||
      "Download videos from X, TikTok, Instagram, and more.",
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
      <HomeClient dict={dict} />
    </>
  );
}
