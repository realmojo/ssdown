import { YoutubeThumbnailClient } from "@/components/client/youtube-thumbnail-client";
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
  const canonical = `${baseUrl}/tools/youtube-thumbnail/${id}`;

  if (!data) {
    return {
      title: "Video Not Found | SSDown",
      description: "The requested YouTube video could not be found.",
    };
  }

  const thumbnails = data.thumbnail?.thumbnails || [];
  const ogImage =
    thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : "";

  return {
    title: `${data.title} Thumbnail Download | SSDown`,
    description: `Download high-quality thumbnails for ${data.title}. Available in HD, 4K, and 8K.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${data.title} Thumbnail Download`,
      description: `Download high-quality thumbnails for ${data.title}.`,
      url: canonical,
      siteName: "SSDown",
      locale: "en_US",
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

export default async function YoutubeThumbnailIdPage({ params }: Props) {
  const dict = await getDictionary();
  const { id } = await params;
  const data = await fetchVideoDetails(id);

  return <YoutubeThumbnailClient key={id} initialId={id} initialData={data} dict={dict} />;
}
