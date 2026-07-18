import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { buildAlternates } from "@/lib/seo";
import { AudioConverterClient } from "@/components/client/audio-converter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const FALLBACK_FAQ: { question: string; answer: string }[] = [
  {
    question: "Which audio formats can I convert between?",
    answer:
      "You can convert to MP3, WAV, OGG, M4A (AAC), and FLAC. As input you can use any of those formats plus WebM audio — and you can even drop in a video file (MP4, MOV, WebM) and we'll extract just the audio track.",
  },
  {
    question: "Can I convert multiple files at once?",
    answer:
      "Yes. Add as many files as you like to the queue and click Convert All. Each file is processed one after another, and if one file fails the rest keep going.",
  },
  {
    question: "What do the MP3 bitrate options mean?",
    answer:
      "Bitrate controls the trade-off between file size and quality. 128 kbps is compact and fine for speech, 192 kbps is a good all-round default, and 320 kbps is the highest MP3 quality with the largest file size.",
  },
  {
    question: "Is my audio uploaded to a server?",
    answer:
      "No. All conversion happens locally in your browser using WebAssembly (FFmpeg compiled to WASM). Your files never leave your device, so the process is completely private.",
  },
  {
    question: "How do I download everything at once?",
    answer:
      "After conversion you can download each file individually, or click Download All to get every converted file bundled into a single ZIP archive.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/audio-converter`;

  // Dictionary keys for this tool are provisioned separately; access loosely.
  const d = dict as Record<string, any>;
  const title =
    d?.page_audio_converter?.meta_title ||
    "Audio Converter - Convert MP3, WAV, OGG, M4A, FLAC | SSDown";
  const description =
    d?.page_audio_converter?.meta_description ||
    "Free online audio converter. Convert between MP3, WAV, OGG, M4A, and FLAC, or extract audio from video — all in your browser. Batch conversion, fast, and private.";

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

export default async function AudioConverterPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  // Dictionary keys for this tool are provisioned separately; access loosely.
  const d = dict as Record<string, any>;
  const homeLabel = d?.breadcrumb?.home || "Home";
  const toolsLabel = d?.breadcrumb?.tools || "Tools";
  const videoAudioLabel = d?.breadcrumb?.video_audio || "Video & Audio";
  const breadcrumbLabel =
    d?.page_audio_converter?.breadcrumb_title || "Audio Converter";
  const faqItems: { question: string; answer: string }[] =
    d?.page_audio_converter?.faq || FALLBACK_FAQ;

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
      { "@type": "ListItem", position: 4, name: breadcrumbLabel, item: "https://ssdown.app/video-audio/audio-converter" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Audio Converter",
    url: "https://ssdown.app/video-audio/audio-converter",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online audio converter. Convert between MP3, WAV, OGG, M4A, and FLAC, or extract audio from video in your browser. Fast, secure, and private.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Convert Audio Files Online",
    description:
      "Use our free online audio converter to change audio formats securely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Add your audio or video files",
        text: "Select or drag and drop one or more files into the tool area.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Choose an output format",
        text: "Pick MP3, WAV, OGG, M4A, or FLAC, and set the bitrate for MP3.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Convert and download",
        text: "Convert all files, then download each one or grab them all as a ZIP.",
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
              href: "/video-audio/audio-converter",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <AudioConverterClient dict={dict} />
    </>
  );
}
