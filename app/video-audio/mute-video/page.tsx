import { MuteVideoClient } from "@/components/client/mute-video-client";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/mute-video`;

  const title = "Mute Video - Remove Audio from Video Online | SSDown";
  const description =
    "Remove audio from any video file instantly in your browser. Free, private, and no upload required. Supports MP4, WebM, MKV, AVI formats.";

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

export default async function MuteVideoPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is my video uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All processing happens entirely in your browser using WebAssembly technology. Your video file never leaves your device, making it 100% private and secure.",
        },
      },
      {
        "@type": "Question",
        name: "What video formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We support the most common video formats: MP4, WebM, MKV, and AVI. The output file maintains the same format and video quality as the original.",
        },
      },
      {
        "@type": "Question",
        name: "Does muting affect video quality?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The video stream is copied directly without re-encoding, so the video quality remains identical to the original. Only the audio track is removed.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a file size limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "There's no hard limit, but we recommend files under 500MB for the best experience. Larger files may cause your browser to slow down or run out of memory, especially on mobile devices.",
        },
      },
      {
        "@type": "Question",
        name: "How long does the process take?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Since we copy the video stream without re-encoding, the process is very fast — typically just a few seconds regardless of video length. The main time is spent reading and writing the file.",
        },
      },
    ],
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
        name: "Video & Audio",
        item: "https://ssdown.app/tools/video-audio",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Mute Video",
        item: "https://ssdown.app/video-audio/mute-video",
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
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "Video & Audio", href: "/tools/video-audio" },
            {
              label: "Mute Video",
              href: "/video-audio/mute-video",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <MuteVideoClient />
    </>
  );
}
