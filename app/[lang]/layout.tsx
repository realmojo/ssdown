import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "영상 다운로더",
  description: "영상을 간편하게 다운로드하세요",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

import { i18n, type Locale } from "@/lib/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";

// ... imports

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);

  return (
    <html lang={params.lang} suppressHydrationWarning>
      <head>
        <Script
          id="naver-analytics-script"
          type="text/javascript"
          src="//wcs.pstatic.net/wcslog.js"
          strategy="lazyOnload"
        />
        <Script
          id="naver-analytics"
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              if(!wcs_add) var wcs_add = {};
              wcs_add["wa"] = "159353d1b5eedb0";
              if(window.wcs) {
                wcs_do();
              }
            `,
          }}
          strategy="lazyOnload"
        />
        <Script
          id="google-analytics-tagmanager"
          src="https://www.googletagmanager.com/gtag/js?id=G-4009JNVXBL"
          strategy="lazyOnload"
        />
        <Script
          id="google-analytics"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
              page_path: window.location.pathname,
            });
          `,
          }}
        />
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
            <SiteHeader dict={dict.nav} lang={params.lang} />
            <div className="flex-1">{props.children}</div>
            <SiteFooter dict={dict.nav} lang={params.lang} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
