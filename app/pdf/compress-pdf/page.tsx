import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { buildAlternates } from "@/lib/seo";
import { CompressPdfClient } from "@/components/client/compress-pdf-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const FALLBACK_FAQ: { question: string; answer: string }[] = [
  {
    question: "How does the PDF compression work?",
    answer:
      "Each page of your PDF is rendered to an image in your browser, re-encoded as a JPEG at the quality level you pick, and rebuilt into a new PDF that keeps the original page dimensions. Lower quality presets use a lower resolution and stronger JPEG compression, so the file gets smaller.",
  },
  {
    question: "Will the text still be selectable after compression?",
    answer:
      "No. Because every page is converted to an image, the resulting pages are pictures — text can no longer be selected, searched, or copied. If you need selectable text, keep the original file or choose the High quality preset for the best visual fidelity.",
  },
  {
    question: "Which quality preset should I choose?",
    answer:
      "Use High (~150 DPI) when you want the smallest size while keeping print-friendly clarity. Medium (~110 DPI) is a good balance for on-screen reading and email. Low (~72 DPI) gives the smallest files for quick web sharing where sharpness matters less.",
  },
  {
    question: "Are my files uploaded to a server?",
    answer:
      "No. All compression happens entirely in your browser using pdf.js and jsPDF. Your PDF never leaves your device and is never uploaded anywhere.",
  },
  {
    question: "Can I compress password-protected PDFs?",
    answer:
      "Encrypted or password-protected PDFs usually cannot be read in the browser and will show an error. Remove the password with your PDF reader first, then compress the unlocked file.",
  },
];

// Dictionary keys for this page are added separately, so read them loosely
// to keep strict typecheck green while English fallbacks render meanwhile.
interface CompressPdfDict {
  meta_title?: string;
  meta_description?: string;
  breadcrumb_title?: string;
  faq?: { question: string; answer: string }[];
}

function getCompressPdfDict(dict: unknown): CompressPdfDict {
  return (
    ((dict as Record<string, unknown>)?.page_compress_pdf as CompressPdfDict) ??
    {}
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const cp = getCompressPdfDict(dict);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/compress-pdf`;

  const title =
    cp.meta_title || "Compress PDF - Reduce PDF File Size Online | SSDown";
  const description =
    cp.meta_description ||
    "Shrink your PDF file size right in your browser. Pick a quality preset, see how much you save, and download. Free, fast, and 100% private.";

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

export default async function CompressPdfPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const cp = getCompressPdfDict(dict);

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const pdfToolsLabel = dict?.breadcrumb?.pdf_tools || "PDF Tools";
  const breadcrumbLabel = cp.breadcrumb_title || "Compress PDF";
  const faqItems: { question: string; answer: string }[] =
    cp.faq || FALLBACK_FAQ;

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
      { "@type": "ListItem", position: 1, name: homeLabel, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: toolsLabel, item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: pdfToolsLabel, item: "https://ssdown.app/tools/pdf" },
      { "@type": "ListItem", position: 4, name: breadcrumbLabel, item: "https://ssdown.app/pdf/compress-pdf" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Compress PDF",
    url: "https://ssdown.app/pdf/compress-pdf",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online PDF compressor. Reduce PDF file size in your browser with adjustable quality presets. Fast, secure, and private.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Compress a PDF Online",
    description:
      "Use our free online PDF compressor to reduce PDF file size securely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Upload your PDF file",
        text: "Select or drag and drop your PDF into the tool area.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Choose a compression quality",
        text: "Pick High, Medium, or Low depending on how much you want to shrink the file.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Compress and download",
        text: "Run the compression, compare the size savings, and download the smaller PDF.",
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
            { label: pdfToolsLabel, href: "/tools/pdf" },
            {
              label: breadcrumbLabel,
              href: "/pdf/compress-pdf",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <CompressPdfClient dict={dict} />
    </>
  );
}
