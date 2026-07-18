import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { buildAlternates } from "@/lib/seo";
import { SilenceRemoverClient } from "@/components/client/silence-remover-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const FALLBACK_FAQ: { question: string; answer: string }[] = [
  {
    question: "How does silence detection work?",
    answer:
      "FFmpeg analyzes your audio's volume level against the sensitivity threshold you choose and removes any gaps that stay quieter than that threshold for longer than your minimum silence length.",
  },
  {
    question: "Will it accidentally cut off quiet speech?",
    answer:
      "It can if the threshold is too aggressive. If quiet words get clipped, raise the sensitivity value (make it less negative, e.g. from -35 to -30) and use Try Again to re-process with the new setting.",
  },
  {
    question: "What audio formats are supported?",
    answer:
      "MP3, WAV, OGG, and M4A are all supported — the same formats as our Audio Trimmer. The processed result is always exported as a high-quality MP3.",
  },
  {
    question: "Is my file uploaded to a server?",
    answer:
      "No. All processing happens locally in your browser using WebAssembly (FFmpeg compiled to WASM). Your audio never leaves your device.",
  },
  {
    question: "Can I re-process with different settings?",
    answer:
      "Yes. After processing, use the Try Again button to tweak the sensitivity and minimum silence length and re-run on the same file — no need to re-upload.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/silence-remover`;

  const title =
    dict?.page_silence_remover?.meta_title ||
    "Silence Remover - Remove Silence from Audio | SSDown";
  const description =
    dict?.page_silence_remover?.meta_description ||
    "Automatically detect and remove silence from your audio files, right in your browser. Free, fast, and private.";

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

export default async function SilenceRemoverPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const videoAudioLabel = dict?.breadcrumb?.video_audio || "Video & Audio";
  const breadcrumbLabel =
    dict?.page_silence_remover?.breadcrumb_title || "Silence Remover";
  const faqItems: { question: string; answer: string }[] =
    dict?.page_silence_remover?.faq || FALLBACK_FAQ;

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
      { "@type": "ListItem", position: 3, name: videoAudioLabel, item: "https://ssdown.app/tools/video-audio" },
      { "@type": "ListItem", position: 4, name: breadcrumbLabel, item: "https://ssdown.app/video-audio/silence-remover" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Silence Remover",
    url: "https://ssdown.app/video-audio/silence-remover",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online silence remover. Detect and cut silent gaps from audio in your browser. Fast, secure, and private.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Remove Silence from Audio Online",
    description:
      "Use our free online silence remover to strip silent gaps from your audio securely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Upload your audio file",
        text: "Select or drag and drop your audio file into the tool area.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Adjust sensitivity and minimum silence length",
        text: "Set how aggressively silence is detected and how long a gap must be to get removed.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Remove silence and download",
        text: "Process the file, preview the result, and download your trimmed audio instantly.",
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
            { label: videoAudioLabel, href: "/tools/video-audio" },
            {
              label: breadcrumbLabel,
              href: "/video-audio/silence-remover",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <SilenceRemoverClient dict={dict} />
    </>
  );
}
