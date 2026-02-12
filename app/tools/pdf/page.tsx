import { Metadata } from "next";
import Link from "next/link";
import {
  FilePlus2,
  ArrowRight,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tools/pdf`;

  const title = "Free Online PDF Tools | SSDown";
  const description =
    "Free online PDF tools. Merge, combine, and manage PDF files directly in your browser. No upload required — 100% private.";

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
];

export default function PdfToolsPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: "PDF Tools", item: "https://ssdown.app/tools/pdf" },
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
              Free online PDF tools. Merge, combine, and manage PDF files directly in your browser. No upload required.
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
