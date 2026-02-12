import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { VideoFrameExtractorClient } from "@/components/client/video-frame-extractor-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/video-frame-extractor`;

  const title =
    "Video Frame Extractor - Extract Images from Video Online | SSDown";
  const description =
    "Free online video frame extractor. Capture and download high-quality images from your videos frame by frame. 100% private, client-side processing.";

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

export default async function VideoFrameExtractorPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name:
          dict?.qna_video_frame_extractor?.faq_1_q || "Is my video uploaded?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_video_frame_extractor?.faq_1_a ||
            "No. All processing happens 100% on your device using your browser.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_video_frame_extractor?.faq_2_q ||
          "Can I extract every single frame?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_video_frame_extractor?.faq_2_a ||
            "Yes, set the interval to a very low number (e.g., 0.04s for 25fps video). Be careful as this generates many images!",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_video_frame_extractor?.faq_3_q ||
          "How do I save the images?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_video_frame_extractor?.faq_3_a ||
            "You can download individual frames or get them all in a single ZIP file.",
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
        name: "Video Frame Extractor",
        item: "https://ssdown.app/video-audio/video-frame-extractor",
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
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "Video & Audio", href: "/tools/video-audio" },
            {
              label: "Video Frame Extractor",
              href: "/video-audio/video-frame-extractor",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <VideoFrameExtractorClient dict={dict} />
    </>
  );
}
