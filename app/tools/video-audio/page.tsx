import { Music, ImageIcon, Film, Scissors, ArrowRight, VolumeX, FileVideo, Waves, RefreshCw, Minimize2, AudioLines } from "lucide-react";
import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tools/video-audio`;

  const title = dict.page_tools_video_audio.meta_title;
  const description = dict.page_tools_video_audio.meta_description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      locale: "ko_KR",
      type: "website",
      images: [{ url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["https://ssdown.app/logo.png"] },
    alternates: buildAlternates(new URL(canonical).pathname),
  };
}

const toolMeta = [
  { href: "/video-audio/video-to-mp3", icon: Music, gradient: "from-pink-500 to-rose-500", bgLight: "bg-pink-100 dark:bg-pink-900/30", iconColor: "text-pink-500" },
  { href: "/video-audio/video-to-gif", icon: ImageIcon, gradient: "from-pink-500 to-rose-500", bgLight: "bg-pink-100 dark:bg-pink-900/30", iconColor: "text-rose-500" },
  { href: "/video-audio/video-frame-extractor", icon: Film, gradient: "from-indigo-500 to-purple-500", bgLight: "bg-indigo-100 dark:bg-indigo-900/30", iconColor: "text-indigo-500" },
  { href: "/video-audio/audio-trimmer", icon: Scissors, gradient: "from-orange-500 to-amber-500", bgLight: "bg-orange-100 dark:bg-orange-900/30", iconColor: "text-orange-500" },
  { href: "/video-audio/mute-video", icon: VolumeX, gradient: "from-violet-500 to-purple-500", bgLight: "bg-violet-100 dark:bg-violet-900/30", iconColor: "text-violet-500" },
  { href: "/video-audio/gif-to-mp4", icon: FileVideo, gradient: "from-emerald-500 to-green-500", bgLight: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-500" },
  { href: "/video-audio/trim-video", icon: Scissors, gradient: "from-amber-500 to-yellow-500", bgLight: "bg-amber-100 dark:bg-amber-900/30", iconColor: "text-amber-500" },
  { href: "/video-audio/silence-remover", icon: Waves, gradient: "from-lime-500 to-green-500", bgLight: "bg-lime-100 dark:bg-lime-900/30", iconColor: "text-lime-600" },
  { href: "/video-audio/video-converter", icon: RefreshCw, gradient: "from-blue-500 to-cyan-500", bgLight: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-500" },
  { href: "/video-audio/video-compressor", icon: Minimize2, gradient: "from-teal-500 to-emerald-500", bgLight: "bg-teal-100 dark:bg-teal-900/30", iconColor: "text-teal-500" },
  { href: "/video-audio/audio-converter", icon: AudioLines, gradient: "from-fuchsia-500 to-pink-500", bgLight: "bg-fuchsia-100 dark:bg-fuchsia-900/30", iconColor: "text-fuchsia-500" },
];

export default async function VideoAudioToolsPage() {
  const dict = await getDictionary();

  const tools = toolMeta.map((meta, i) => ({
    ...meta,
    title: dict.page_tools_video_audio.tools[i].title,
    description: dict.page_tools_video_audio.tools[i].description,
  }));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.breadcrumb.home, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: dict.breadcrumb.tools, item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.video_audio, item: "https://ssdown.app/tools/video-audio" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: dict.page_tools_video_audio.heading,
            url: "https://ssdown.app/tools/video-audio",
            numberOfItems: tools.length,
            itemListElement: tools.map((tool, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: tool.title,
              url: `https://ssdown.app${tool.href}`,
            })),
          }),
        }}
      />
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: dict.breadcrumb.home, href: "/" },
              { label: dict.breadcrumb.tools, href: "/tools" },
              {
                label: dict.breadcrumb.video_audio,
                href: "/tools/video-audio",
                isCurrent: true,
              },
            ]}
          />

          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {dict.page_tools_video_audio.heading}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {dict.page_tools_video_audio.subtitle}
            </p>
          </header>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {tools.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                className="group block rounded-2xl border border-gray-200 dark:border-gray-800 p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${tool.bgLight} mb-6`}
                >
                  <tool.icon className={`w-8 h-8 ${tool.iconColor}`} />
                </div>
                <h2 className="text-2xl font-bold mb-3">{tool.title}</h2>
                <p className="text-muted-foreground mb-6">{tool.description}</p>
                <span
                  className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}
                >
                  {dict.breadcrumb.try_it_now} <ArrowRight className="w-4 h-4 text-current" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
