import { YoutubePreviewClient } from "@/components/client/youtube-preview-client";
import { fetchVideoDetails } from "@/lib/youtube";
import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchVideoDetails(id);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/youtube-preview/${id}`;

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
    title: `${data.title} Preview Editor | SSDown`,
    description: `Preview and edit video metadata for ${data.title}. Check how it looks on YouTube.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${data.title} Preview Editor`,
      description: `Preview and edit video metadata for ${data.title}.`,
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

export default async function YoutubePreviewIdPage({ params }: Props) {
  await getDictionary(await getLocale());
  const { id } = await params;
  const data = await fetchVideoDetails(id);

  return <YoutubePreviewClient key={id} initialId={id} initialData={data} />;
}
