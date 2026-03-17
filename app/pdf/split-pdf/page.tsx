import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { SplitPdfClient } from "@/components/client/split-pdf-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/split-pdf`;

  const title = dict.page_split_pdf.meta_title;
  const description = dict.page_split_pdf.meta_description;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SplitPdfPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_split_pdf.faq.map((item: { question: string; answer: string }) => ({
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
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.pdf_tools, item: "https://ssdown.app/tools/pdf" },
      { "@type": "ListItem", position: 4, name: dict.page_split_pdf.breadcrumb_title, item: "https://ssdown.app/pdf/split-pdf" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Split PDF",
    url: "https://ssdown.app/pdf/split-pdf",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Extract specific pages or split a PDF into multiple small files.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use Split PDF Online",
    description: "Extract specific pages or split a PDF into multiple small files.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Upload PDF",
        text: "Select the PDF document you want to split.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Select pages",
        text: "Specify page ranges or individual pages to extract.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Download files",
        text: "Save the extracted pages as new PDF files.",
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
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: dict.breadcrumb.home, href: "/" },
            { label: dict.breadcrumb.tools, href: "/tools" },
            { label: dict.breadcrumb.pdf_tools, href: "/tools/pdf" },
            {
              label: dict.page_split_pdf.breadcrumb_title,
              href: "/pdf/split-pdf",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <SplitPdfClient dict={dict} />
    </>
  );
}
