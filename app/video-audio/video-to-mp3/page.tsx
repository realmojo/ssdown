import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { VideoToMp3Client } from "@/components/client/video-to-mp3-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/video-to-mp3`;

  const title = dict.page_video_to_mp3.meta_title;
  const description = dict.page_video_to_mp3.meta_description;

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

export default async function VideoToMp3Page() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_video_to_mp3.faq.map((item: { question: string; answer: string }) => ({
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
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.video_audio, item: "https://ssdown.app/tools/video-audio" },
      { "@type": "ListItem", position: 4, name: dict.page_video_to_mp3.breadcrumb_title, item: "https://ssdown.app/video-audio/video-to-mp3" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Video to MP3 Converter",
    url: "https://ssdown.app/video-audio/video-to-mp3",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free online video to MP3 converter. Extract audio from MP4, WebM, AVI and other video formats. Fast, private, no upload required.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Convert Video to MP3 Online",
    description:
      "Extract audio from any video file and save it as MP3 using SSDown, free and browser-based.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Upload your video",
        text: "Click the upload area or drag and drop your video file (MP4, WebM, AVI, MOV, etc.).",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Wait for processing",
        text: "The tool extracts the audio track directly in your browser. No upload to a server is needed.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Download the MP3",
        text: "Click Download to save the extracted MP3 audio file to your device.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: dict.breadcrumb.home, href: "/" },
            { label: dict.breadcrumb.tools, href: "/tools" },
            { label: dict.breadcrumb.video_audio, href: "/tools/video-audio" },
            {
              label: dict.page_video_to_mp3.breadcrumb_title,
              href: "/video-audio/video-to-mp3",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <VideoToMp3Client dict={dict} />
    </>
  );
}
