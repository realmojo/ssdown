import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { buildAlternates } from "@/lib/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { XmlToCsvClient } from "@/components/client/xml-to-csv-client";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/file/xml-to-csv`;

  const title = dict.page_xml_to_csv.meta_title;
  const description = dict.page_xml_to_csv.meta_description;

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

export default async function XmlToCsvPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_xml_to_csv.faq.map((item: { question: string; answer: string }) => ({
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
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.file_data_tools, item: "https://ssdown.app/tools/file" },
      { "@type": "ListItem", position: 4, name: dict.page_xml_to_csv.breadcrumb_title, item: "https://ssdown.app/file/xml-to-csv" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Xml To Csv",
    url: "https://ssdown.app/file/xml-to-csv",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online xml to csv tool. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use Xml To Csv Online",
    description: "Use our free online xml to csv tool to process your files securely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Upload your file",
        text: "Select or drag and drop your file into the tool area.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Process your file",
        text: "Follow the on-screen instructions to process or convert your file.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Download result",
        text: "Save the processed file to your device instantly.",
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
            { label: dict.breadcrumb.file_tools, href: "/tools/file" },
            {
              label: dict.page_xml_to_csv.breadcrumb_title,
              href: "/file/xml-to-csv",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <XmlToCsvClient dict={dict} />
    </>
  );
}
