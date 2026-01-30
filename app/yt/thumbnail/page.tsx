export const runtime = "edge";

import { YoutubeThumbnailClient } from "@/components/client/youtube-thumbnail-client";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/yt/thumbnail`;

  return {
    title: "Youtube Thumbnail Analysis | SSDown",
    description:
      "Download Youtube thumbnails in high quality HD, 4K. Free and fast.",
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: "Youtube Thumbnail Analysis | SSDown",
      description:
        "Download Youtube thumbnails in high quality HD, 4K. Free and fast.",
      url: canonical,
      siteName: "SSDown",
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function YoutubeThumbnailPage() {
  return <YoutubeThumbnailClient />;
}
