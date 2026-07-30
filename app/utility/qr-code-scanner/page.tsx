import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { QrCodeScannerClient } from "@/components/client/qr-code-scanner-client";
import { PageShell } from "@/components/portal/page-shell";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/qr-code-scanner`;

  const title = "QR 코드 스캐너 - 온라인 QR 코드 읽기 | SSDown";
  const description =
    "Free online QR code scanner. Decode QR codes from an uploaded image or your live camera directly in the browser. Private and instant.";

  return {
    title,
    description,
    alternates: buildAlternates(new URL(canonical).pathname),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      locale: "ko_KR",
      type: "website",
      images: [{ url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["https://ssdown.app/logo.png"] },
  };
}

const faq = [
  {
    question: "이미지에서 QR 코드를 어떻게 인식하나요?",
    answer:
      "Switch to the 이미지 업로드 tab, then select a photo or drag and drop an image containing a QR code. The tool decodes it instantly in your browser and shows the result.",
  },
  {
    question: "카메라로 QR 코드를 인식할 수 있나요?",
    answer:
      "Yes. Open the Camera tab and click Start camera. Point your device's camera at the QR code and it will be decoded automatically. Your camera feed never leaves your device.",
  },
  {
    question: "제 데이터는 안전한가요?",
    answer:
      "Absolutely. All scanning happens entirely in your browser using the native BarcodeDetector API. No image or camera data is ever uploaded to a server or stored anywhere.",
  },
  {
    question: "어떤 브라우저를 지원하나요?",
    answer:
      "The scanner relies on the built-in BarcodeDetector API, which is available in the latest Chrome and Edge on desktop and Android. If your browser does not support it, you'll see a notice and scanning will be disabled.",
  },
];

export default async function QrCodeScannerPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
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
      { "@type": "ListItem", position: 4, name: "QR 코드 스캐너", item: "https://ssdown.app/utility/qr-code-scanner" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "QR 코드 스캐너",
    url: "https://ssdown.app/utility/qr-code-scanner",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript and the BarcodeDetector API (latest Chrome/Edge).",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online QR code scanner. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use QR 코드 스캐너 Online",
    description: "Use our free online QR code scanner to decode QR codes securely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Choose a source",
        text: "Upload an image containing a QR code, or start your camera to scan live.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Scan the code",
        text: "The tool detects and decodes the QR code instantly in your browser.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Use the result",
        text: "Copy the decoded text or open the link if the QR code contains a URL.",
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
      <PageShell
        sidebar={false}
        crumbs={[
          { label: dict.breadcrumb.tools, href: "/tools" },
          { label: dict.breadcrumb.utility, href: "/tools/utility" },
          { label: "QR 코드 스캐너" },
        ]}
      >
        <QrCodeScannerClient dict={dict} />
      </PageShell>
    </>
  );
}
