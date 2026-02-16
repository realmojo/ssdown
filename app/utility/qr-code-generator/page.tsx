import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { QRCodeGeneratorClient } from "@/components/client/qr-code-generator-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/qr-code-generator`;

  const title = "QR Code Generator - Free, Custom, Instant Download | SSDown";
  const description =
    "Create custom QR codes for any link in seconds. No sign-up required. Free, instant high-quality PNG download.";

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function QRCodeGeneratorPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: dict?.qna_qr_code_generator?.faq_1_q || "Is it free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_qr_code_generator?.faq_1_a ||
            "Yes, our QR code generator is 100% free with no limits.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_qr_code_generator?.faq_2_q || "Do the QR codes expire?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_qr_code_generator?.faq_2_a ||
            "No, standard static QR codes like these never expire as long as the link works.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_qr_code_generator?.faq_3_q ||
          "Can I use it for commercial purposes?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_qr_code_generator?.faq_3_a ||
            "Yes, you can use the generated QR codes for any purpose, including commercial use.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://ssdown.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: "https://ssdown.app/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Utility",
        item: "https://ssdown.app/tools/utility",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "QR Code Generator",
        item: "https://ssdown.app/utility/qr-code-generator",
      },
    ],
  };

  return (
    <>
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
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "Utility", href: "/tools/utility" },
            {
              label: "QR Code Generator",
              href: "/utility/qr-code-generator",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <QRCodeGeneratorClient dict={dict} />
    </>
  );
}
