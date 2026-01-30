export const runtime = "edge";

import { YoutubePreviewClient } from "@/components/client/youtube-preview-client";
import { fetchVideoDetails } from "@/lib/youtube";
import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchVideoDetails(id);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/yt/preview/${id}`;

  if (!data) {
    return {
      title: "Video Not Found | SSDown",
      description: "The requested YouTube video could not be found.",
    };
  }

  // Use the highest resolution thumbnail for the OG image if available
  const thumbnails = data.thumbnail?.thumbnails || [];
  const ogImage =
    thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : "";

  return {
    title: `${data.title} Preview Editor | SSDown`,
    description: `Preview and edit video metadata for ${data.title}. Check how it looks on YouTube.`,
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: `${data.title} Preview Editor`,
      description: `Preview and edit video metadata for ${data.title}.`,
      url: canonical,
      siteName: "SSDown",
      images: [
        {
          url: ogImage || "",
          width: 1280,
          height: 720,
          alt: `${data.title} Thumbnail`,
        },
      ],
      type: "website",
    },
  };
}

export default async function YoutubePreviewIdPage({ params }: Props) {
  await getDictionary();
  const { id } = await params;
  const data = await fetchVideoDetails(id);

  return <YoutubePreviewClient key={id} initialId={id} initialData={data} />;
}
