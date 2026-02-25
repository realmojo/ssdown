import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { ThemeProvider } from "@/components/theme-provider";
import { AdsenseInit } from "@/components/AdsenseInit";
import { CookieConsent } from "@/components/cookie-consent";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const baseUrl = "https://ssdown.app";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default:
        dict.home?.title || "SSDown - Free Online Tools for Everyday Tasks",
      template: "%s | SSDown",
    },
    description:
      dict.home?.subtitle ||
      "Free online tools for image editing, PDF management, video conversion, and file transformation. Fast, secure, and browser-based.",
    keywords: [
      "free online tools",
      "image compressor",
      "PDF tools",
      "video converter",
      "file converter",
      "browser-based tools",
      "online image editor",
      "free PDF editor",
      "ssdown",
    ],
    authors: [{ name: "SSDown Tech Team" }],
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
      locale: locale === "kr" ? "ko_KR" : "en_US",
      url: baseUrl,
      title:
        dict.home?.title ||
        "SSDown - Free Online Tools for Everyday Tasks",
      description:
        dict.home?.subtitle ||
        "Free online tools for image editing, PDF management, video conversion, and file transformation. Fast, secure, and browser-based.",
      siteName: "SSDown",
      images: [
        {
          url: "https://ssdown.app/logo.png",
          width: 1200,
          height: 630,
          alt: "SSDown - Free Online Tools",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.home?.title || "SSDown - Free Online Tools",
      description:
        dict.home?.subtitle ||
        "Free online tools for image editing, PDF management, video conversion, and file transformation.",
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
      canonical: baseUrl,
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

export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <html lang={locale === "kr" ? "ko" : "en"} suppressHydrationWarning>
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
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader dict={dict.nav} locale={locale} />
            <main className="flex-1">{props.children}</main>
            <SiteFooter dict={dict.nav} />
            <CookieConsent />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
