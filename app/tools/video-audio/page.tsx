import { Metadata } from "next";
import { Music, ImageIcon, Film, Scissors, ArrowRight, VolumeX, FileVideo } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tools/video-audio`;

  const title = "Free Online Video & Audio Tools | SSDown";
  const description =
    "Free online video and audio tools. Convert video to MP3, GIF, extract frames, and trim audio. All processing in your browser.";

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
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical },
  };
}

const tools = [
  {
    title: "Video to MP3 Converter",
    description: "Convert video files to MP3 audio directly in your browser.",
    href: "/video-audio/video-to-mp3",
    icon: Music,
    gradient: "from-pink-500 to-rose-500",
    bgLight: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-500",
  },
  {
    title: "Video to GIF Converter",
    description: "Convert short video clips to animated GIFs.",
    href: "/video-audio/video-to-gif",
    icon: ImageIcon,
    gradient: "from-pink-500 to-rose-500",
    bgLight: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-rose-500",
  },
  {
    title: "Video Frame Extractor",
    description: "Extract high-quality frames from video files.",
    href: "/video-audio/video-frame-extractor",
    icon: Film,
    gradient: "from-indigo-500 to-purple-500",
    bgLight: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-500",
  },
  {
    title: "Audio Trimmer",
    description: "Cut and trim MP3, WAV, M4A files in your browser.",
    href: "/video-audio/audio-trimmer",
    icon: Scissors,
    gradient: "from-orange-500 to-amber-500",
    bgLight: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-500",
  },
  {
    title: "Mute Video",
    description: "Remove audio from any video file instantly. No re-encoding.",
    href: "/video-audio/mute-video",
    icon: VolumeX,
    gradient: "from-violet-500 to-purple-500",
    bgLight: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-500",
  },
  {
    title: "GIF to MP4 Converter",
    description: "Convert animated GIFs to compact MP4 video files.",
    href: "/video-audio/gif-to-mp4",
    icon: FileVideo,
    gradient: "from-emerald-500 to-green-500",
    bgLight: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-500",
  },
  {
    title: "Trim Video",
    description: "Cut video clips by selecting start and end points.",
    href: "/video-audio/trim-video",
    icon: Scissors,
    gradient: "from-amber-500 to-yellow-500",
    bgLight: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-500",
  },
];

export default function VideoAudioToolsPage() {
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
              {
                label: "Video & Audio",
                href: "/tools/video-audio",
                isCurrent: true,
              },
            ]}
          />

          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Video & Audio Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Free online video and audio tools. Convert, extract, and trim
              media files directly in your browser.
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
                  Try it now <ArrowRight className="w-4 h-4 text-current" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
