import { i18n, type Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/get-dictionary"
import { HomeClient } from "@/components/client/home-client"

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  const baseUrl = "https://ssdown.app"
  const canonical = lang === 'en' ? baseUrl : `${baseUrl}/${lang}`
  
  return {
    title: dict.home?.title || "Video Downloader",
    description: dict.home?.subtitle || "Download videos from X, TikTok and more.",
    keywords: [
      "video downloader",
      "twitter video download",
      "tiktok downloader",
      "free video download",
    ],
    openGraph: {
      title: dict.home?.title || "SSDown - Video Downloader",
      description: dict.home?.subtitle || "Download videos from X, TikTok and more.",
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
      locale: lang === "en" ? "en_US" : lang === "jp" ? "ja_JP" : lang === "kr" ? "ko_KR" : lang === "pt" ? "pt_BR" : "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.home?.title || "SSDown - Video Downloader",
      description: dict.home?.subtitle || "Download videos from X, TikTok and more.",
      images: ["https://ssdown.app/logo.png"],
    },
    alternates: {
      canonical: canonical,
    },
  }
}

export default async function Home(props: { params: Promise<{ lang: Locale }> }) {
  const params = await props.params;
  const dict = await getDictionary(params.lang)
  
  return <HomeClient dict={dict} lang={params.lang} />
}