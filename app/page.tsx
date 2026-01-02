import { type Locale } from "@/lib/i18n-config";
export const runtime = "edge";
import { getDictionary } from "@/lib/get-dictionary";
import { HomeClient } from "@/components/client/home-client";
import { Metadata } from "next";
import { i18n } from "@/lib/i18n-config";

export async function generateMetadata(): Promise<Metadata> {
  const lang = i18n.defaultLocale as Locale;
  const dict = await getDictionary(lang);

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

export default async function RootPage() {
  const lang = i18n.defaultLocale as Locale;
  const dict = await getDictionary(lang);

  return <HomeClient dict={dict} lang={lang} />;
}

