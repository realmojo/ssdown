import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { ToolHub } from "@/components/portal/tool-hub";
import { jsonLd } from "@/lib/json-ld";

const CANONICAL = "https://ssdown.app/tools/video-audio";

/** 사전의 tools 배열과 같은 순서로 유지해야 한다. */
const HREFS = [
  "/video-audio/video-to-mp3",
  "/video-audio/video-to-gif",
  "/video-audio/video-frame-extractor",
  "/video-audio/audio-trimmer",
  "/video-audio/mute-video",
  "/video-audio/gif-to-mp4",
  "/video-audio/trim-video",
  "/video-audio/silence-remover",
  "/video-audio/video-converter",
  "/video-audio/video-compressor",
  "/video-audio/audio-converter",
];

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const title = dict.page_tools_video_audio.meta_title;
  const description = dict.page_tools_video_audio.meta_description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: CANONICAL,
      siteName: "SSDown",
      locale: "ko_KR",
      type: "website",
      images: [{ url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://ssdown.app/logo.png"],
    },
    alternates: buildAlternates("/tools/video-audio"),
  };
}

export default async function Page() {
  const dict = await getDictionary();
  const section = dict.page_tools_video_audio;

  const tools = HREFS.map((href, i) => ({
    href,
    title: section.tools[i].title,
    description: section.tools[i].description,
  }));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.breadcrumb.home, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: dict.breadcrumb.tools, item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.video_audio, item: CANONICAL },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: section.heading,
    url: CANONICAL,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.title,
      url: `https://ssdown.app${tool.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }}
      />
      <ToolHub
        groupKey="video-audio"
        title={section.heading}
        desc={section.subtitle}
        tools={tools}
      />
    </>
  );
}
