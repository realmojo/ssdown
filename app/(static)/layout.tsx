import type { Metadata } from "next";
import "../globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getDictionary } from "@/lib/get-dictionary";
import { ThemeProvider } from "@/components/theme-provider";
import { AdsenseInit } from "@/components/AdsenseInit";
import { CookieConsent } from "@/components/cookie-consent";

export const metadata: Metadata = {
  title: "SSDown - Video Downloader",
  description: "Download videos from X (Twitter), TikTok, and more instantly.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default async function StaticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = "en"; // Default to English for static pages
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
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader dict={dict.nav} lang={lang} />
            <main className="flex-1">{children}</main>
            <SiteFooter dict={dict.nav} lang={lang} />
            <CookieConsent />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
