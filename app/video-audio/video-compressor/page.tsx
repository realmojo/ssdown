import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { VideoCompressorClient } from "@/components/client/video-compressor-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const FALLBACK_FAQ: { question: string; answer: string }[] = [
  {
    question: "How much smaller will my video get?",
    answer:
      "It depends on the source. Videos exported from phones or editors are often over-encoded, so Balanced typically saves 40-70%. The Smallest preset also scales the video down to 1280px wide for the biggest reduction.",
  },
  {
    question: "Will compression hurt the quality?",
    answer:
      "High quality (CRF 23) is visually near-lossless. Balanced (CRF 28) is a great size-to-quality trade-off for sharing. Smallest (CRF 33 + downscale) prioritizes file size and is best for previews or messaging apps.",
  },
  {
    question: "Why is compression slow for big files?",
    answer:
      "All processing runs locally in your browser with FFmpeg compiled to WebAssembly, which is single-threaded. For a smooth experience keep clips under about 100MB — larger videos can take several minutes.",
  },
  {
    question: "Is my video uploaded anywhere?",
    answer:
      "No. Compression happens entirely on your device using WebAssembly. Your video never leaves your browser, so it stays private.",
  },
  {
    question: "What format is the output?",
    answer:
      "The compressed file is always an MP4 using H.264 video and AAC audio — the most widely compatible combination for phones, browsers, and social platforms.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  // Dict keys for this tool are added separately; access defensively.
  const page = (dict as Record<string, any>)?.page_video_compressor;
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/video-compressor`;

  const title =
    page?.meta_title ||
    "Video Compressor - Reduce Video File Size Online | SSDown";
  const description =
    page?.meta_description ||
    "Compress and shrink video files in your browser without losing much quality. Free, fast, and private — no uploads.";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en": canonical,
        "ko": canonical,
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
      images: [{ url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["https://ssdown.app/logo.png"] },
  };
}

export default async function VideoCompressorPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const videoAudioLabel = dict?.breadcrumb?.video_audio || "Video & Audio";
  const page = (dict as Record<string, any>)?.page_video_compressor;
  const breadcrumbLabel = page?.breadcrumb_title || "Video Compressor";
  const faqItems: { question: string; answer: string }[] =
    page?.faq || FALLBACK_FAQ;

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
      { "@type": "ListItem", position: 4, name: breadcrumbLabel, item: "https://ssdown.app/video-audio/video-compressor" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Video Compressor",
    url: "https://ssdown.app/video-audio/video-compressor",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online video compressor. Reduce video file size directly in your browser. Fast, secure, and private.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Compress a Video Online",
    description:
      "Use our free online video compressor to shrink a video's file size securely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Upload your video file",
        text: "Select or drag and drop your MP4, MOV, WebM, AVI, or MKV file into the tool area.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Choose a compression level",
        text: "Pick High quality, Balanced, or Smallest depending on how much you want to reduce the size.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Compress and download",
        text: "Run the compression, compare the sizes, preview the result, and download your smaller file.",
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
              href: "/video-audio/video-compressor",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <VideoCompressorClient dict={dict} />
    </>
  );
}
