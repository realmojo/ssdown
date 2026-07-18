import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { buildAlternates } from "@/lib/seo";
import { VideoConverterClient } from "@/components/client/video-converter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const FALLBACK_FAQ: { question: string; answer: string }[] = [
  {
    question: "Which video formats can I convert between?",
    answer:
      "You can convert MP4, MOV, WebM, AVI, and MKV inputs into MP4 (H.264), WebM (VP8), MOV, or AVI. MP4 is the most widely compatible choice for phones, browsers, and social media.",
  },
  {
    question: "Why is conversion slow for big files?",
    answer:
      "Everything runs locally in your browser using FFmpeg compiled to WebAssembly, which is single-threaded. For a smooth experience keep clips under about 100MB — larger or longer videos can take several minutes.",
  },
  {
    question: "Is my video uploaded to a server?",
    answer:
      "No. All processing happens on your device using WebAssembly. Your video never leaves your browser, so it stays completely private.",
  },
  {
    question: "Why is MOV to MP4 almost instant sometimes?",
    answer:
      "When the source already uses compatible codecs (H.264 video and AAC audio), we simply repackage the file into the new container without re-encoding. If the codecs are incompatible, we automatically fall back to a full re-encode.",
  },
  {
    question: "What is the difference between MP4 and WebM?",
    answer:
      "MP4 (H.264 + AAC) plays virtually everywhere. WebM (VP8) is an open, royalty-free format optimized for the web. Choose MP4 for maximum compatibility and WebM when you specifically need an open format.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  // Dict keys for this tool are added separately; access defensively.
  const page = (dict as Record<string, any>)?.page_video_converter;
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/video-converter`;

  const title =
    page?.meta_title ||
    "Video Converter - Convert MP4, WebM, MOV, AVI Online | SSDown";
  const description =
    page?.meta_description ||
    "Convert videos between MP4, WebM, MOV, and AVI right in your browser. Free, fast, and private — no uploads.";

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

export default async function VideoConverterPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const homeLabel = dict?.breadcrumb?.home || "Home";
  const toolsLabel = dict?.breadcrumb?.tools || "Tools";
  const videoAudioLabel = dict?.breadcrumb?.video_audio || "Video & Audio";
  const page = (dict as Record<string, any>)?.page_video_converter;
  const breadcrumbLabel = page?.breadcrumb_title || "Video Converter";
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
      { "@type": "ListItem", position: 4, name: breadcrumbLabel, item: "https://ssdown.app/video-audio/video-converter" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Video Converter",
    url: "https://ssdown.app/video-audio/video-converter",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online video converter. Convert between MP4, WebM, MOV, and AVI directly in your browser. Fast, secure, and private.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Convert a Video Online",
    description:
      "Use our free online video converter to change a video's format securely in your browser.",
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
        name: "Choose an output format",
        text: "Pick MP4, WebM, MOV, or AVI as your target format.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Convert and download",
        text: "Run the conversion, preview the result, and download your new file instantly.",
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
              href: "/video-audio/video-converter",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <VideoConverterClient dict={dict} />
    </>
  );
}
