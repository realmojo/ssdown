import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { AboutClient } from "@/components/client/about-client";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/about`;

  return {
    title: dict.about?.title || "About SSDown - Social Media Saver",
    description:
      dict.about?.description ||
      "Learn more about SSDown, the best tool for downloading videos from X, TikTok, Instagram, and Facebook.",
    openGraph: {
      title: dict.about?.title || "About SSDown",
      description: dict.about?.description,
      url: canonical,
      siteName: "SSDown",
      locale: "en_US",
      type: "website",
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function AboutPage() {
  return <AboutClient />;
}
