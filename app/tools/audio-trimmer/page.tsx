import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { AudioTrimmerClient } from "@/components/client/audio-trimmer-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tools/audio-trimmer`;

  const title = "Audio Trimmer - Cut MP3 Online Free | SSDown";
  const description =
    "Free online audio trimmer. Cut and trim MP3, WAV, M4A files directly in your browser. No upload required, fast and private.";

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

export default async function AudioTrimmerPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: dict?.qna_audio_trimmer?.faq_1_q || "Is my audio uploaded?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_audio_trimmer?.faq_1_a ||
            "No. All processing happens 100% on your device using your browser.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_audio_trimmer?.faq_2_q || "What formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_audio_trimmer?.faq_2_a ||
            "We support MP3, WAV, OGG, and M4A. The output will be MP3.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_audio_trimmer?.faq_3_q || "Can I merge audio files?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_audio_trimmer?.faq_3_a ||
            "Currently, this tool is only for trimming/cutting a single file.",
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
        name: "Audio Trimmer",
        item: "https://ssdown.app/tools/audio-trimmer",
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
            {
              label: "Audio Trimmer",
              href: "/tools/audio-trimmer",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <AudioTrimmerClient dict={dict} />
    </>
  );
}
