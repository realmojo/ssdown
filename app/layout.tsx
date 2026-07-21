import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { buildAlternates } from "@/lib/seo";
import { ThemeProvider } from "@/components/theme-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { LocaleLinkInterceptor } from "@/components/locale-link-interceptor";
import { Toaster } from "sonner";

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
        dict.home?.title || "SSDown - Free Online Tools for Everyday Tasks",
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
    alternates: buildAlternates("", locale, {
      types: {
        "application/rss+xml": `${baseUrl}/rss.xml`,
      },
    }),
    other: {
      "application-name": "SSDown",
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "apple-mobile-web-app-title": "SSDown",
      "format-detection": "telephone=no",
      // "google-adsense-account": "ca-pub-9130836798889522",
    },
  };
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <html lang={locale === "kr" ? "ko" : "en"} suppressHydrationWarning>
      <head>
        {/* Warm up connections to third-party origins to cut LCP latency */}
        <link
          rel="preconnect"
          href="https://pagead2.googlesyndication.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://wcs.naver.net" />

        <Script
          strategy="lazyOnload"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9130836798889522"
        />

        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-742J9X4BM5"
        />
        <Script
          id="google-tag-manager-script"
          strategy="afterInteractive"
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
        {/* Naver analytics is non-critical — defer to idle so it doesn't block
            first render/interactivity (was beforeInteractive). Loaded via an
            inline string script so no function prop is passed from this Server
            Component. */}
        <Script
          id="naver-analytics"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=document.createElement('script');s.src='https://wcs.naver.net/wcslog.js';s.async=true;s.onload=function(){if(!window.wcs_add)window.wcs_add={};window.wcs_add['wa']='159353d1b5eedb0';if(window.wcs)wcs_do();};document.head.appendChild(s);})();`,
          }}
        />
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
            <LocaleLinkInterceptor />
          </div>
          <Toaster position="bottom-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
