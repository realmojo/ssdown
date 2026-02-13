import { TrimVideoClient } from "@/components/client/trim-video-client";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/trim-video`;

  const title = "Trim Video Online - Cut Video Clips Free | SSDown";
  const description =
    "Trim and cut video files by selecting start and end points. Free browser-based video trimmer with preview. Supports MP4, WebM, MKV formats.";

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

export default async function TrimVideoPage() {
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
          text: "We support the most common video formats: MP4, WebM, and MKV. The output file maintains the same format and quality as the original since we use stream copying.",
        },
      },
      {
        "@type": "Question",
        name: "Does trimming affect video quality?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. We use stream copying (-c copy) which copies the video and audio streams directly without re-encoding. This means zero quality loss and very fast processing.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a file size limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "There is no hard limit, but we recommend files under 500MB for the best experience. Larger files may cause your browser to slow down or run out of memory, especially on mobile devices.",
        },
      },
      {
        "@type": "Question",
        name: "Why might the trim be slightly inaccurate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Since we use stream copying for instant processing and zero quality loss, the actual cut points may snap to the nearest keyframe. For most videos, this is within 1-2 seconds of the selected point. Re-encoding would give exact cuts but takes much longer.",
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
        name: "Trim Video",
        item: "https://ssdown.app/video-audio/trim-video",
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
              label: "Trim Video",
              href: "/video-audio/trim-video",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <TrimVideoClient />
    </>
  );
}
