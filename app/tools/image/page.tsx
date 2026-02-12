import { Metadata } from "next";
import Link from "next/link";
import {
  Minimize2,
  ImageIcon,
  Crop,
  Eraser,
  FileImage,
  Palette,
  ArrowRight,
  FlipHorizontal,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tools/image`;

  const title = "Free Online Image Tools | SSDown";
  const description =
    "Free online image tools. Compress, convert, resize images. Remove backgrounds, extract colors, generate favicons. All processing in your browser.";

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
    title: "Image Compressor",
    description: "Compress images to reduce file size without losing quality.",
    href: "/image/image-compressor",
    icon: Minimize2,
    gradient: "from-green-500 to-emerald-500",
    bgLight: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-500",
  },
  {
    title: "Image Converter",
    description: "Convert images between WebP, PNG, and JPG formats.",
    href: "/image/image-converter",
    icon: ImageIcon,
    gradient: "from-blue-500 to-cyan-500",
    bgLight: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-500",
  },
  {
    title: "Social Image Resizer",
    description: "Resize and crop images for Instagram, YouTube, and TikTok.",
    href: "/image/social-image-resizer",
    icon: Crop,
    gradient: "from-pink-500 to-orange-500",
    bgLight: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-500",
  },
  {
    title: "Watermark Remover",
    description: "Remove watermarks from images instantly in your browser.",
    href: "/image/watermark-remover",
    icon: Eraser,
    gradient: "from-emerald-500 to-teal-500",
    bgLight: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-500",
  },
  {
    title: "Favicon Generator",
    description: "Convert any image to favicon (ICO) with multiple sizes.",
    href: "/image/favicon-generator",
    icon: FileImage,
    gradient: "from-indigo-500 to-blue-500",
    bgLight: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-500",
  },
  {
    title: "Color Palette Extractor",
    description: "Extract dominant colors from images with HEX, RGB, and HSL.",
    href: "/image/color-palette-extractor",
    icon: Palette,
    gradient: "from-pink-500 to-purple-500",
    bgLight: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-500",
  },
  {
    title: "Thumbnail Generator",
    description: "Create custom thumbnails for YouTube, Instagram, and Twitter.",
    href: "/image/thumbnail-generator",
    icon: ImageIcon,
    gradient: "from-purple-500 to-indigo-500",
    bgLight: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-500",
  },
  {
    title: "Background Remover",
    description: "Remove image backgrounds with AI, 100% in your browser.",
    href: "/image/background-remover",
    icon: Eraser,
    gradient: "from-teal-500 to-cyan-500",
    bgLight: "bg-teal-100 dark:bg-teal-900/30",
    iconColor: "text-teal-500",
  },
  {
    title: "Crop Image",
    description: "Crop your image to any size with preset aspect ratios.",
    href: "/image/crop-image",
    icon: Crop,
    gradient: "from-orange-500 to-amber-500",
    bgLight: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-500",
  },
  {
    title: "Flip Image",
    description: "Flip or mirror your image horizontally or vertically.",
    href: "/image/flip-image",
    icon: FlipHorizontal,
    gradient: "from-sky-500 to-teal-500",
    bgLight: "bg-sky-100 dark:bg-sky-900/30",
    iconColor: "text-sky-500",
  },
];

export default function ImageToolsPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: "Image Tools", item: "https://ssdown.app/tools/image" },
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
              { label: "Image Tools", href: "/tools/image", isCurrent: true },
            ]}
          />

          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Image Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Free online image tools. Compress, convert, resize, and edit images directly in your browser. No upload required.
            </p>
          </header>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group block rounded-2xl border border-gray-200 dark:border-gray-800 p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${tool.bgLight} mb-6`}>
                  <tool.icon className={`w-8 h-8 ${tool.iconColor}`} />
                </div>
                <h2 className="text-2xl font-bold mb-3">{tool.title}</h2>
                <p className="text-muted-foreground mb-6">{tool.description}</p>
                <span className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
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
