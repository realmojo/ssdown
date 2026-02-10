import { YoutubeThumbnailClient } from "@/components/client/youtube-thumbnail-client";
import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tools/youtube-thumbnail`;

  const title = "Youtube Thumbnail Downloader | SSDown";
  const description =
    "Download Youtube thumbnails in high quality HD, 4K. Free and fast.";

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

export default async function YoutubeThumbnailPage() {
  const dict = await getDictionary();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: "YouTube Thumbnail Downloader", item: "https://ssdown.app/tools/youtube-thumbnail" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="container max-w-7xl mx-auto px-4 pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "YouTube Thumbnail", href: "/tools/youtube-thumbnail", isCurrent: true },
          ]}
        />
      </div>
      <YoutubeThumbnailClient dict={dict} />
    </>
  );
}
