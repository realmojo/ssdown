import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { i18n, type Locale } from "@/lib/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";
import { ThemeProvider } from "@/components/theme-provider";
import { AdsenseInit } from "@/components/AdsenseInit";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  const baseUrl = "https://ssdown.app";
  const currentUrl = lang === "en" ? baseUrl : `${baseUrl}/${lang}`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: dict.home?.title || "SSDown - Video Downloader",
      template: "%s | SSDown",
    },
    description:
      dict.home?.subtitle ||
      "Download videos from X (Twitter), TikTok, and more instantly.",
    keywords: [
      "video downloader",
      "twitter video download",
      "tiktok downloader",
      "ssdown",
      "free video download",
      "social media downloader",
    ],
    authors: [{ name: "SSDown" }],
    creator: "SSDown",
    publisher: "SSDown",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "google839abe7b75d6c385",
      other: {
        "naver-site-verification": "naver348b51e734d802e0a219b9b4d969303e",
      },
    },
    openGraph: {
      type: "website",
      locale:
        locale === "en"
          ? "en_US"
          : locale === "jp"
          ? "ja_JP"
          : locale === "kr"
          ? "ko_KR"
          : locale === "pt"
          ? "pt_BR"
          : "fr_FR",
      url: currentUrl,
      title: dict.home?.title || "SSDown - Ultimate Video Downloader",
      description:
        dict.home?.subtitle ||
        "Download videos from your favorite platforms easily and quickly.",
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/logo.png",
          width: 1200,
          height: 630,
          alt: "SSDown Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.home?.title || "SSDown - Video Downloader",
      description:
        dict.home?.subtitle || "Download videos from X, TikTok, and more.",
      images: ["https://ssdown.app/logo.png"],
      creator: "@ssdown",
      site: "@ssdown",
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/apple-icon.png",
    },
    alternates: {
      canonical: currentUrl,
      languages: {
        en: "/en",
        ja: "/jp",
        ko: "/kr",
        pt: "/pt",
        fr: "/fr",
      },
    },
    other: {
      "application-name": "SSDown",
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "apple-mobile-web-app-title": "SSDown",
      "format-detection": "telephone=no",
      "google-adsense-account": "ca-pub-9130836798889522",
    },
  };
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const lang = params.lang as Locale;
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* Naver Analytics */}

        <script id="naver-analytics" src="//wcs.naver.net/wcslog.js" />
        <script
          id="naver-analytics-init"
          dangerouslySetInnerHTML={{
            __html:
              'if(!wcs_add) var wcs_add = {}; wcs_add["wa"] = "159353d1b5eedb0"; if(window.wcs) {wcs_do();}',
          }}
        />

        <script
          id="google-tag-manager"
          dangerouslySetInnerHTML={{
            __html:
              '(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!="dataLayer"?"&l="+l:"";j.async=true;j.src="https://www.googletagmanager.com/gtm.js?id="+i+dl;f.parentNode.insertBefore(j,f);})(window,document,"script","dataLayer","GTM-M3V3PSB");',
          }}
        />

        {/* Google Analytics */}
        <script
          src="https://www.googletagmanager.com/gtag/js?id=G-742J9X4BM5"
          async
        />
        <script
          id="google-analytics"
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-742J9X4BM5', {
              page_path: window.location.pathname,
            });
          `,
          }}
        />
        <AdsenseInit />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader dict={dict.nav} lang={lang} />
            <main className="flex-1">{props.children}</main>
            <SiteFooter dict={dict.nav} lang={lang} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
