import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { QrCodeScannerClient } from "@/components/client/qr-code-scanner-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

interface FaqItem {
  question: string;
  answer: string;
}

const FALLBACK_FAQ: FaqItem[] = [
  {
    question: "Does this work with any type of QR code?",
    answer:
      "Yes. It reads standard QR codes that encode text, URLs, contact details, Wi-Fi credentials, and more. As long as it is a valid QR code, the decoded content will be shown.",
  },
  {
    question: "Is my camera feed uploaded anywhere?",
    answer:
      "No. All decoding happens locally in your browser. Your camera feed and uploaded images are never sent to any server.",
  },
  {
    question: "Why did scanning fail?",
    answer:
      "Scanning can fail if the image is blurry, too dark, or cropped so the QR code is incomplete. It can also fail if the code is not a valid QR code. Try a clearer, well-lit, fully visible image.",
  },
  {
    question: "Does this work on mobile browsers?",
    answer:
      "Yes. Camera scanning works on most modern mobile browsers once you grant camera permission. On iOS and Android, the rear camera is used by default for easy scanning.",
  },
  {
    question: "What image formats are supported for upload?",
    answer:
      "Any format your browser can display as an image works, including JPG, PNG, WebP, GIF, and BMP. The image is decoded entirely on your device.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/qr-code-scanner`;

  const title =
    dict?.page_qr_code_scanner?.meta_title || "QR Code Scanner | SSDown";
  const description =
    dict?.page_qr_code_scanner?.meta_description ||
    "Scan and decode QR codes from an image or your camera, right in your browser. Free, fast, and private.";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: canonical,
        ko: canonical,
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
      images: [
        {
          url: "https://ssdown.app/logo.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://ssdown.app/logo.png"],
    },
  };
}

export default async function QrCodeScannerPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const utilityLabel = dict?.breadcrumb?.utility || "Utility";
  const breadcrumbLabel =
    dict?.page_qr_code_scanner?.breadcrumb_title || "QR Code Scanner";
  const faqItems: FaqItem[] = dict?.page_qr_code_scanner?.faq || FALLBACK_FAQ;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
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
      {
        "@type": "ListItem",
        position: 1,
        name: homeLabel,
        item: "https://ssdown.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: toolsLabel,
        item: "https://ssdown.app/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: utilityLabel,
        item: "https://ssdown.app/tools/utility",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: breadcrumbLabel,
        item: "https://ssdown.app/utility/qr-code-scanner",
      },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "QR Code Scanner",
    url: "https://ssdown.app/utility/qr-code-scanner",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online QR code scanner. Decode QR codes from an image or your camera entirely in your browser.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to scan a QR code online",
    description:
      "Use our free online QR code scanner to decode QR codes securely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Upload an image or start your camera",
        text: "Drop a picture of a QR code or start your device camera to scan a code live.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "The QR code is decoded instantly",
        text: "The QR code is decoded on-device the moment it is detected.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Copy the result or open the link",
        text: "Copy the decoded text or open the link directly if the code contains a URL.",
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
            { label: homeLabel, href: "/" },
            { label: toolsLabel, href: "/tools" },
            { label: utilityLabel, href: "/tools/utility" },
            {
              label: breadcrumbLabel,
              href: "/utility/qr-code-scanner",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <QrCodeScannerClient dict={dict} />
    </>
  );
}
