import { i18n, type Locale } from "@/lib/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";
import { TikTokClient } from "@/components/client/tiktok-client";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/${lang === "en" ? "" : lang + "/"}tiktok`;

  return {
    title: dict.tiktok?.seo_title || "TikTok Video Downloader",
    description:
      dict.tiktok?.seo_description || "Download TikTok videos without watermark.",
    keywords: dict.tiktok?.seo_keywords ? dict.tiktok.seo_keywords.split(", ") : ["tiktok downloader", "tiktok no watermark"],
    openGraph: {
      title: dict.tiktok?.seo_title || "TikTok Video Downloader",
      description:
        dict.tiktok?.seo_description || "Download TikTok videos without watermark.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/logo.png",
          width: 1200,
          height: 630,
          alt: "SSDown - TikTok Video Downloader",
        },
      ],
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
    twitter: {
      card: "summary_large_image",
      title: dict.tiktok?.title || "TikTok Video Downloader",
      description:
        dict.tiktok?.subtitle || "Download TikTok videos without watermark.",
      images: ["https://ssdown.app/logo.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function TikTokPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);

  return <TikTokClient dict={dict} />;
}
