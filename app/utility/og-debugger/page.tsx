import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { OgDebuggerClient } from "@/components/client/og-debugger-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/og-debugger`;

  const title = dict.page_og_debugger.meta_title;
  const description = dict.page_og_debugger.meta_description;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en": canonical,
        "ko": canonical,
        "x-default": canonical,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
      images: [{ url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["https://ssdown.app/logo.png"] },
  };
}

export default async function OgDebuggerPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_og_debugger.faq.map((item: { question: string; answer: string }) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.breadcrumb.home, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: dict.breadcrumb.tools, item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.utility, item: "https://ssdown.app/tools/utility" },
      { "@type": "ListItem", position: 4, name: dict.page_og_debugger.breadcrumb_title, item: "https://ssdown.app/utility/og-debugger" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Open Graph Debugger",
    url: "https://ssdown.app/utility/og-debugger",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online Open Graph debugger tool. Preview and validate social share cards instantly.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use Open Graph Debugger Online",
    description: "Paste a URL to inspect its Open Graph and Twitter Card tags and preview how it looks when shared.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Paste a URL",
        text: "Enter any public page URL you want to check.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Analyze",
        text: "We fetch the page using a social-crawler user agent and parse its meta tags.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Review results",
        text: "See share previews for Facebook, X, LinkedIn, KakaoTalk, plus a full tag list and warnings.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: dict.breadcrumb.home, href: "/" },
            { label: dict.breadcrumb.tools, href: "/tools" },
            { label: dict.breadcrumb.utility, href: "/tools/utility" },
            {
              label: dict.page_og_debugger.breadcrumb_title,
              href: "/utility/og-debugger",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <OgDebuggerClient dict={dict} />
    </>
  );
}
