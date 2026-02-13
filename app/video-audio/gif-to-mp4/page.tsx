import { GifToMp4Client } from "@/components/client/gif-to-mp4-client";
import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/gif-to-mp4`;

  const title = "GIF to MP4 Converter - Convert GIF to Video Online | SSDown";
  const description =
    "Convert animated GIF files to MP4 video format. Adjust FPS and quality settings. Free, browser-based conversion with no upload required.";

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

export default async function GifToMp4Page() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Why convert GIF to MP4?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MP4 files are significantly smaller than GIFs while maintaining the same visual quality. An MP4 can be 80-90% smaller than its GIF equivalent, making it ideal for web use, social media, and faster page loading.",
        },
      },
      {
        "@type": "Question",
        name: "Is my GIF uploaded to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The conversion happens entirely in your browser using WebAssembly technology. Your GIF file never leaves your device, making it 100% private and secure.",
        },
      },
      {
        "@type": "Question",
        name: "What quality settings should I choose?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For most use cases, Medium quality (CRF 23) offers the best balance between file size and visual quality. Use High quality (CRF 18) for professional content where quality is critical, and Low quality (CRF 28) for maximum file size reduction.",
        },
      },
      {
        "@type": "Question",
        name: "What FPS should I select?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most GIFs play at around 10-15 FPS. Choosing a higher FPS like 24 or 30 can make the animation smoother but will increase file size. Match the original GIF's frame rate for the most accurate conversion.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a file size limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "There is no hard limit, but we recommend GIF files under 100MB for the best experience. Very large GIFs may cause your browser to slow down or run out of memory.",
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
        name: "GIF to MP4",
        item: "https://ssdown.app/video-audio/gif-to-mp4",
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
              label: "GIF to MP4",
              href: "/video-audio/gif-to-mp4",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <GifToMp4Client />
    </>
  );
}
