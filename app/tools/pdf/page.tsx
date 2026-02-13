import { Metadata } from "next";
import Link from "next/link";
import {
  FilePlus2,
  RotateCw,
  Trash2,
  Lock,
  Unlock,
  FileText,
  Scissors,
  ArrowUpDown,
  Crop,
  Hash,
  Droplets,
  Type,
  FilePlus,
  Image,
  ImageIcon,
  FileImage,
  Edit3,
  PenTool,
  ArrowRight,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tools/pdf`;

  const title = "Free Online PDF Tools | SSDown";
  const description =
    "Free online PDF tools. Merge, split, rotate, compress, convert, and manage PDF files directly in your browser. No upload required — 100% private.";

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
    title: "Merge PDF",
    description: "Combine multiple PDF files into one with easy reordering.",
    href: "/pdf/merge-pdf",
    icon: FilePlus2,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "Rotate PDF",
    description:
      "Rotate PDF pages 90°, 180°, or 270° individually or all at once.",
    href: "/pdf/rotate-pdf",
    icon: RotateCw,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "Delete PDF Pages",
    description: "Remove unwanted pages from your PDF files quickly.",
    href: "/pdf/delete-pdf-pages",
    icon: Trash2,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "Protect PDF",
    description: "Add password protection and encryption to your PDF files.",
    href: "/pdf/protect-pdf",
    icon: Lock,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "Unlock PDF",
    description:
      "Remove password protection from PDF files with the correct password.",
    href: "/pdf/unlock-pdf",
    icon: Unlock,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "PDF to Text",
    description: "Extract all text content from PDF files instantly.",
    href: "/pdf/pdf-to-text",
    icon: FileText,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "Split PDF",
    description: "Split a PDF into multiple files by page ranges.",
    href: "/pdf/split-pdf",
    icon: Scissors,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "Rearrange PDF",
    description: "Reorder PDF pages with drag and drop simplicity.",
    href: "/pdf/rearrange-pdf",
    icon: ArrowUpDown,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "Crop PDF",
    description: "Crop PDF pages to remove unwanted margins or areas.",
    href: "/pdf/crop-pdf",
    icon: Crop,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "PDF Page Numbers",
    description: "Add page numbers to your PDF with custom position and style.",
    href: "/pdf/pdf-page-numbers",
    icon: Hash,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "PDF Watermark",
    description: "Add text watermarks to every page of your PDF.",
    href: "/pdf/pdf-watermark",
    icon: Droplets,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "Add Text to PDF",
    description: "Add custom text annotations to specific pages of your PDF.",
    href: "/pdf/add-text-to-pdf",
    icon: Type,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "Create PDF",
    description: "Create PDF documents from scratch with text content.",
    href: "/pdf/create-pdf",
    icon: FilePlus,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "Images to PDF",
    description: "Convert JPG, PNG, and WEBP images to a single PDF file.",
    href: "/pdf/images-to-pdf",
    icon: Image,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "PDF to JPG",
    description: "Convert PDF pages to high-quality JPG images.",
    href: "/pdf/pdf-to-jpg",
    icon: ImageIcon,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "PDF to PNG",
    description: "Convert PDF pages to lossless PNG images with transparency.",
    href: "/pdf/pdf-to-png",
    icon: FileImage,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "PDF Editor",
    description: "Edit PDF files with text, images, and annotations.",
    href: "/pdf/pdf-editor",
    icon: Edit3,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
  {
    title: "eSign PDF",
    description: "Add electronic signatures to your PDF documents.",
    href: "/pdf/esign-pdf",
    icon: PenTool,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
];

export default function PdfToolsPage() {
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
        name: "PDF Tools",
        item: "https://ssdown.app/tools/pdf",
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
              { label: "PDF Tools", href: "/tools/pdf", isCurrent: true },
            ]}
          />

          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              PDF Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Free online PDF tools. Merge, split, rotate, compress, convert,
              and manage PDF files directly in your browser. No upload required.
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
