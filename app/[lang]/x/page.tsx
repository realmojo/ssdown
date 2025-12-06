import { i18n, type Locale } from "@/lib/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";
import { XClient } from "@/components/client/x-client";

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
  const canonical = `${baseUrl}/${lang === "en" ? "" : lang + "/"}x`;

  return {
    title: dict.x?.title || "X (Twitter) Video Downloader",
    description: dict.x?.subtitle || "Download X videos and GIFs online.",
    keywords: [
      "twitter video download",
      "x video downloader",
      "twitter download",
      "video downloader",
    ],
    openGraph: {
      title: dict.x?.title || "X (Twitter) Video Downloader",
      description: dict.x?.subtitle || "Download X videos and GIFs online.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/logo.png",
          width: 1200,
          height: 630,
          alt: "SSDown - X Video Downloader",
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
      title: dict.x?.title || "X (Twitter) Video Downloader",
      description: dict.x?.subtitle || "Download X videos and GIFs online.",
      images: ["https://ssdown.app/logo.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function TwitterPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);

  return <XClient dict={dict} />;
}
