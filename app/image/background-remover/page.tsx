import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { BackgroundRemoverClient } from "@/components/client/background-remover-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/background-remover`;

  const title =
    "Background Remover - Remove Image Background Free with AI | SSDown";
  const description =
    "Remove image backgrounds instantly with AI. Free online background remover — no upload to server, 100% private. Works with PNG, JPG, WebP. Powered by WebAssembly.";

  return {
    title,
    description,
    keywords: [
      "background remover",
      "remove background",
      "background eraser",
      "image background remover",
      "remove bg",
      "transparent background",
      "AI background removal",
      "free background remover",
      "online background remover",
      "no upload background remover",
    ],
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

export default async function BackgroundRemoverPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is my image uploaded to any server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All processing happens 100% in your browser using WebAssembly. Your images never leave your device.",
        },
      },
      {
        "@type": "Question",
        name: "What image formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We support PNG, JPG/JPEG, and WebP formats. The output is always PNG with transparency.",
        },
      },
      {
        "@type": "Question",
        name: "How long does it take?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The first time may take 10-30 seconds to download the AI model (~40MB). After that, most images process in 3-10 seconds.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a file size limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the maximum file size is 20MB. For best results, use images under 4000x4000 pixels.",
        },
      },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SSDown Background Remover",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free AI-powered background remover that works entirely in your browser. No upload required.",
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
        name: "Image Tools",
        item: "https://ssdown.app/tools/image",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Background Remover",
        item: "https://ssdown.app/image/background-remover",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "Image Tools", href: "/tools/image" },
            {
              label: "Background Remover",
              href: "/image/background-remover",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <BackgroundRemoverClient dict={dict} />
    </>
  );
}
