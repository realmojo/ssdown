import { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/get-dictionary";
import {
  Music,
  ImageIcon,
  Hash,
  ArrowRight,
  Download,
  Eye,
  Eraser,
  Film,
  Crop,
  AlignLeft,
  QrCode,
  Calculator,
  Minimize2,
  Palette,
  FileImage,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tools`;

  const title = "Free Online Creator Tools | SSDown";
  const description =
    "Free online creator tools by SSDown. Convert video to MP3, generate thumbnails, and find trending hashtags for TikTok, Instagram, and YouTube.";

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

const tools = [
  {
    title: "YT Thumbnail Downloader",
    descKey: "youtube_thumbnail_desc",
    fallbackDesc:
      "Download YouTube thumbnails in high quality HD, 4K. Free and fast.",
    href: "/tools/youtube-thumbnail",
    icon: Download,
    gradient: "from-red-500 to-orange-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "YT Preview Editor",
    descKey: "youtube_preview_desc",
    fallbackDesc:
      "Edit and preview your YouTube video metadata and thumbnails before publishing.",
    href: "/tools/youtube-preview",
    icon: Eye,
    gradient: "from-orange-500 to-yellow-500",
    bgLight: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-500",
  },
  {
    title: "Video to MP3 Converter",
    descKey: "video_to_mp3_desc",
    fallbackDesc:
      "Convert video files to MP3 audio directly in your browser. 100% private.",
    href: "/tools/video-to-mp3",
    icon: Music,
    gradient: "from-pink-500 to-rose-500",
    bgLight: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-500",
  },
  {
    title: "Video to GIF Converter",
    descKey: "video_to_gif_desc",
    fallbackDesc:
      "Convert short video clips to animated GIFs directly in your browser. Fast and free.",
    href: "/tools/video-to-gif",
    icon: ImageIcon,
    gradient: "from-pink-500 to-rose-500",
    bgLight: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-rose-500",
  },
  {
    title: "Video Frame Extractor",
    descKey: "video_frame_extractor_desc",
    fallbackDesc:
      "Convert video to image sequence. Extract high-quality frames instantly.",
    href: "/tools/video-frame-extractor",
    icon: Film,
    gradient: "from-indigo-500 to-purple-500",
    bgLight: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-500",
  },
  {
    title: "Thumbnail Generator",
    descKey: "thumbnail_desc",
    fallbackDesc:
      "Create custom thumbnails for YouTube, Instagram, and Twitter with text and stickers.",
    href: "/tools/thumbnail-generator",
    icon: ImageIcon,
    gradient: "from-purple-500 to-indigo-500",
    bgLight: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-500",
  },
  {
    title: "Hashtag Generator",
    descKey: "hashtag_desc",
    fallbackDesc:
      "Find trending hashtags for TikTok, Instagram, and YouTube to boost your reach.",
    href: "/tools/hashtag-generator",
    icon: Hash,
    gradient: "from-cyan-500 to-blue-500",
    bgLight: "bg-cyan-100 dark:bg-cyan-900/30",
    iconColor: "text-cyan-500",
  },
  {
    title: "Watermark Remover",
    descKey: "watermark_remover_desc",
    fallbackDesc:
      "Remove watermarks from images instantly in your browser. Batch processing supported.",
    href: "/tools/watermark-remover",
    icon: Eraser,
    gradient: "from-emerald-500 to-teal-500",
    bgLight: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-500",
  },
  {
    title: "Image Converter",
    descKey: "image_converter_desc",
    fallbackDesc:
      "Convert images between WebP, PNG, and JPG formats. Batch processing supported.",
    href: "/tools/image-converter",
    icon: ImageIcon,
    gradient: "from-blue-500 to-cyan-500",
    bgLight: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-500",
  },
  {
    title: "Image Compressor",
    descKey: "image_compressor_desc",
    fallbackDesc:
      "Compress images to reduce file size without losing quality. Batch processing supported.",
    href: "/tools/image-compressor",
    icon: Minimize2,
    gradient: "from-green-500 to-emerald-500",
    bgLight: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-500",
  },
  {
    title: "Color Palette Extractor",
    descKey: "color_palette_extractor_desc",
    fallbackDesc:
      "Extract dominant colors from images with HEX, RGB, and HSL codes. AI-powered palette generation.",
    href: "/tools/color-palette-extractor",
    icon: Palette,
    gradient: "from-pink-500 to-purple-500",
    bgLight: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-500",
  },
  {
    title: "Favicon Generator",
    descKey: "favicon_generator_desc",
    fallbackDesc:
      "Convert any image to favicon (ICO) with multiple sizes. 100% client-side processing.",
    href: "/tools/favicon-generator",
    icon: FileImage,
    gradient: "from-indigo-500 to-blue-500",
    bgLight: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-500",
  },
  {
    title: "Social Image Resizer",
    descKey: "social_image_resizer_desc",
    fallbackDesc:
      "Resize and crop images for Instagram, YouTube, and TikTok. Perfect dimensions, instantly.",
    href: "/tools/social-image-resizer",
    icon: Crop,
    gradient: "from-pink-500 to-orange-500",
    bgLight: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-500",
  },
  {
    title: "Instagram Line Break",
    descKey: "instagram_line_break_desc",
    fallbackDesc:
      "Create clean Instagram captions with perfect line breaks. No more dots.",
    href: "/tools/instagram-line-break",
    icon: AlignLeft,
    gradient: "from-purple-500 to-pink-500",
    bgLight: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-500",
  },
  {
    title: "QR Code Generator",
    descKey: "qr_code_generator_desc",
    fallbackDesc:
      "Create custom QR codes for any link in seconds. Free, instant download.",
    href: "/tools/qr-code-generator",
    icon: QrCode,
    gradient: "from-blue-600 to-cyan-600",
    bgLight: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
  },
  {
    title: "Aspect Ratio Calculator",
    descKey: "aspect_ratio_calculator_desc",
    fallbackDesc:
      "Calculate aspect ratios and resolutions for video editing. Perfect for content creators.",
    href: "/tools/aspect-ratio-calculator",
    icon: Calculator,
    gradient: "from-violet-500 to-purple-500",
    bgLight: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-500",
  },
];

export default async function ToolsPage() {
  const dict = await getDictionary();

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
              { label: "Tools", href: "/tools", isCurrent: true },
            ]}
          />

          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {dict?.tools?.title || "Free Online Creator Tools"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {dict?.tools?.subtitle ||
                "Powerful browser-based tools to help you create, convert, and optimize content. No sign-up required."}
            </p>
          </header>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {tools.map((tool) => (
              <Link
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
                <p className="text-muted-foreground mb-6">
                  {(dict?.tools as any)?.[tool.descKey] || tool.fallbackDesc}
                </p>
                <span
                  className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}
                >
                  Try it now <ArrowRight className="w-4 h-4 text-current" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
