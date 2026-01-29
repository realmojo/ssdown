export const runtime = "edge";

import { YoutubePreviewClient } from "@/components/client/youtube-preview-client";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/youtube/preview`;

  return {
    title: "Youtube Preview Editor | SSDown",
    description: "Edit and preview your Youtube video metadata and thumbnails.",
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: "Youtube Preview Editor | SSDown",
      description:
        "Edit and preview your Youtube video metadata and thumbnails.",
      url: canonical,
      siteName: "SSDown",
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function YoutubePreviewPage() {
  return <YoutubePreviewClient />;
}
