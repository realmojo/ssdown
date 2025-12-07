import { i18n, type Locale } from "@/lib/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";
import { InstagramClient } from "@/components/client/instagram-client";
import { Metadata } from "next";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/${lang === "en" ? "" : lang + "/"}instagram`;

  return {
    title: dict.instagram?.title || "Instagram Video Downloader - SSDown",
    description:
      dict.instagram?.subtitle ||
      "Download Instagram Reels, Videos, Photos and Stories anonymously.",
    keywords: [
      "instagram downloader",
      "instagram video download",
      "reels downloader",
      "instagram story saver",
      "ssdown",
    ],
    openGraph: {
      title: dict.instagram?.title || "Instagram Video Downloader - SSDown",
      description:
        dict.instagram?.subtitle ||
        "Download Instagram Reels, Videos, Photos and Stories anonymously.",
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/logo.png",
          width: 1200,
          height: 630,
          alt: "SSDown - Instagram Downloader",
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
      title: dict.instagram?.title || "Instagram Video Downloader",
      description:
        dict.instagram?.subtitle || "Download Instagram content instantly.",
      images: ["https://ssdown.app/logo.png"],
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function InstagramPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);

  return <InstagramClient dict={dict} />;
}
