import { i18n, type Locale } from "@/lib/i18n-config";
export const runtime = "edge";
import { getDictionary } from "@/lib/get-dictionary";
import { AboutClient } from "@/components/client/about-client";
import { Metadata } from "next";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/${lang === "en" ? "" : lang + "/"}about`;

  return {
    title: dict.about?.title || "About SSDown - Social Media Video Downloader",
    description: dict.about?.description || "Learn more about SSDown, the best tool for downloading videos from X, TikTok, Instagram, and Facebook.",
    openGraph: {
      title: dict.about?.title || "About SSDown",
      description: dict.about?.description,
      url: canonical,
      siteName: "SSDown",
      locale:
        lang === "en"
          ? "en_US"
          : lang === "jp"
          ? "ja_JP"
          : lang === "kr"
          ? "ko_KR"
          : lang === "pt"
          ? "pt_BR"
          : "fr_FR",
      type: "website",
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function AboutPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);

  return <AboutClient dict={dict} />;
}
