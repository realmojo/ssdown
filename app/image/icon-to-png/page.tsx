import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { buildAlternates } from "@/lib/seo";
import { IconToPngClient } from "@/components/client/icon-to-png-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/icon-to-png`;

  const title = dict.page_icon_to_png.meta_title;
  const description = dict.page_icon_to_png.meta_description;

  return {
    title,
    description,
    alternates: buildAlternates(new URL(canonical).pathname, locale),
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

export default async function IconToPngPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_icon_to_png.faq.map((item: { question: string; answer: string }) => ({
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
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.image_tools, item: "https://ssdown.app/tools/image" },
      { "@type": "ListItem", position: 4, name: dict.page_icon_to_png.breadcrumb_title, item: "https://ssdown.app/image/icon-to-png" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Icon to PNG Converter",
    url: "https://ssdown.app/image/icon-to-png",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Convert ICO files to high-quality PNG images online.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use Icon to PNG Converter Online",
    description: "Convert ICO files to high-quality PNG images online.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Upload ICO file",
        text: "Select the .ico icon file you want to convert.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Select size",
        text: "Choose from available icon sizes contained in the file.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Download PNG",
        text: "Save the icon as a transparent PNG file.",
      }
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
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: dict.breadcrumb.home, href: "/" },
              { label: dict.breadcrumb.tools, href: "/tools" },
              { label: dict.breadcrumb.image_tools, href: "/tools/image" },
              {
                label: dict.page_icon_to_png.breadcrumb_title,
                href: "/image/icon-to-png",
                isCurrent: true,
              },
            ]}
          />
          <IconToPngClient dict={dict} />
        </div>
      </div>
    </>
  );
}
