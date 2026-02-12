import { VideoToMp3Client } from "@/components/client/video-to-mp3-client";
import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/video-to-mp3`;

  const title = "Video to MP3 Converter - Convert Video to Audio Online | SSDown";
  const description =
    "Free online video to MP3 converter. Convert MP4, WebM, MKV to MP3 audio in your browser. No upload required, 100% private.";

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

export default async function VideoToMp3Page() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: dict?.qna_video_to_mp3?.faq_1_q || "Is my video uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: dict?.qna_video_to_mp3?.faq_1_a || "No. The conversion happens entirely in your browser using WebAssembly technology. Your video file never leaves your device, making it 100% private and secure.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_video_to_mp3?.faq_2_q || "What video formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: dict?.qna_video_to_mp3?.faq_2_a || "We support the most common video formats: MP4, WebM, MKV, AVI, and MOV. If your format isn't listed, try converting it to MP4 first.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_video_to_mp3?.faq_3_q || "Is there a file size limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: dict?.qna_video_to_mp3?.faq_3_a || "There's no hard limit, but we recommend files under 500MB for the best experience. Larger files may cause your browser to slow down or run out of memory, especially on mobile devices.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_video_to_mp3?.faq_4_q || "How long does conversion take?",
        acceptedAnswer: {
          "@type": "Answer",
          text: dict?.qna_video_to_mp3?.faq_4_a || "Conversion time depends on the video file size and your device's processing power. A typical 5-minute video takes about 10-30 seconds. Larger files will take proportionally longer.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_video_to_mp3?.faq_5_q || "Does this work on mobile devices?",
        acceptedAnswer: {
          "@type": "Answer",
          text: dict?.qna_video_to_mp3?.faq_5_a || "Yes, it works on most modern mobile browsers. However, due to memory limitations on mobile devices, we recommend using files under 200MB on phones and tablets.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: "Video & Audio", item: "https://ssdown.app/tools/video-audio" },
      { "@type": "ListItem", position: 4, name: "Video to MP3 Converter", item: "https://ssdown.app/video-audio/video-to-mp3" },
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
      <div className="container max-w-7xl mx-auto px-4 pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "Video & Audio", href: "/tools/video-audio" },
            { label: "Video to MP3", href: "/video-audio/video-to-mp3", isCurrent: true },
          ]}
        />
      </div>
      <VideoToMp3Client dict={dict} />
    </>
  );
}
