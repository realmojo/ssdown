import { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/get-dictionary";
import {
  ImageIcon,
  Film,
  MessageSquare,
  Wrench,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tools`;

  const title = "Free Online Creator Tools | SSDown";
  const description =
    "Free online creator tools by SSDown. Image editing, video conversion, YouTube tools, and more. All tools run in your browser — no upload required.";

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

const categories = [
  {
    title: "Image Tools",
    description:
      "Compress, convert, resize, and edit images. Remove backgrounds, extract colors, generate favicons, and more.",
    href: "/tools/image",
    icon: ImageIcon,
    gradient: "from-pink-500 to-rose-500",
    bgLight: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-500",
    count: 20,
  },
  {
    title: "Video & Audio",
    description:
      "Convert video to MP3, GIF, or extract frames. Trim audio files directly in your browser.",
    href: "/tools/video-audio",
    icon: Film,
    gradient: "from-indigo-500 to-purple-500",
    bgLight: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-500",
    count: 7,
  },
  {
    title: "Social & Text",
    description:
      "Generate trending hashtags for TikTok, Instagram, YouTube. Create clean Instagram captions.",
    href: "/tools/social-text",
    icon: MessageSquare,
    gradient: "from-cyan-500 to-blue-500",
    bgLight: "bg-cyan-100 dark:bg-cyan-900/30",
    iconColor: "text-cyan-500",
    count: 2,
  },
  {
    title: "Utility",
    description:
      "YouTube tools, QR codes, aspect ratio calculator, and more essential tools for creators.",
    href: "/tools/utility",
    icon: Wrench,
    gradient: "from-violet-500 to-purple-500",
    bgLight: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-500",
    count: 4,
  },
  {
    title: "PDF Tools",
    description:
      "Merge, split, rotate, convert, protect, and manage PDF files. All processing happens in your browser — no upload required.",
    href: "/tools/pdf",
    icon: FileText,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
    count: 18,
  },
  {
    title: "File & Data Tools",
    description:
      "Convert, split, and manage JSON, XML, CSV, and Excel files. 100% browser-based.",
    href: "/tools/file",
    icon: FileText,
    gradient: "from-blue-600 to-indigo-600",
    bgLight: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
    count: 12,
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
            {categories.map((cat) => (
              <a
                key={cat.href}
                href={cat.href}
                className="group block rounded-2xl border border-gray-200 dark:border-gray-800 p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${cat.bgLight} mb-6`}
                >
                  <cat.icon className={`w-8 h-8 ${cat.iconColor}`} />
                </div>
                <h2 className="text-2xl font-bold mb-3">{cat.title}</h2>
                <p className="text-muted-foreground mb-4">{cat.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {cat.count} tools
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${cat.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}
                  >
                    Browse <ArrowRight className="w-4 h-4 text-current" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
