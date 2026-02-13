import { Metadata } from "next";
import Link from "next/link";
import { QrCode, Calculator, Download, Eye, ArrowRight, Type } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tools/utility`;

  const title = "Free Utility Tools | SSDown";
  const description =
    "Free utility tools for creators. YouTube thumbnail downloader, preview editor, QR codes, and aspect ratio calculator.";

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
    title: "YT Thumbnail Downloader",
    description: "Download YouTube thumbnails in high quality HD, 4K.",
    href: "/utility/youtube-thumbnail",
    icon: Download,
    gradient: "from-red-500 to-orange-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "YT Preview Editor",
    description: "Edit and preview your YouTube video metadata and thumbnails.",
    href: "/utility/youtube-preview",
    icon: Eye,
    gradient: "from-orange-500 to-yellow-500",
    bgLight: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-500",
  },
  {
    title: "QR Code Generator",
    description: "Create custom QR codes for any link in seconds.",
    href: "/utility/qr-code-generator",
    icon: QrCode,
    gradient: "from-blue-600 to-cyan-600",
    bgLight: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
  },
  {
    title: "Aspect Ratio Calculator",
    description: "Calculate aspect ratios and resolutions for video editing.",
    href: "/utility/aspect-ratio-calculator",
    icon: Calculator,
    gradient: "from-violet-500 to-purple-500",
    bgLight: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-500",
  },
  {
    title: "Word Counter",
    description: "Count words, characters, sentences, and paragraphs in real-time.",
    href: "/utility/word-counter",
    icon: Type,
    gradient: "from-emerald-500 to-green-500",
    bgLight: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600",
  },
];

export default function UtilityToolsPage() {
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
        name: "Utility",
        item: "https://ssdown.app/tools/utility",
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
              { label: "Utility", href: "/tools/utility", isCurrent: true },
            ]}
          />

          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Utility Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Essential utility tools for content creators. QR codes,
              calculators, and more.
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
