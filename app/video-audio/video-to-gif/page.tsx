import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { VideoToGifClient } from "@/components/client/video-to-gif-client";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/video-to-gif`;

  const title = "Free Video to GIF Converter | SSDown";
  const description =
    "Convert video files to animated GIFs directly in your browser. Fast, free, and private video to GIF converter with no file upload limits.";

  return {
    title,
    description,
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
    alternates: {
      canonical,
    },
  };
}

export default async function VideoToGifPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

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
        name: "Video to GIF",
        item: "https://ssdown.app/video-audio/video-to-gif",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Tools", href: "/tools" },
              { label: "Video & Audio", href: "/tools/video-audio" },
              {
                label: "Video to GIF",
                href: "/video-audio/video-to-gif",
                isCurrent: true,
              },
            ]}
          />

          <VideoToGifClient dict={dict} />
        </div>
      </div>
    </>
  );
}
