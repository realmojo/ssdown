import { FilePlus2, RotateCw, Trash2, Lock, Unlock, FileText, Scissors, ArrowUpDown, Crop, Hash, Droplets, Type, FilePlus, Image, ImageIcon, FileImage, Edit3, PenTool, ArrowRight } from "lucide-react";
import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tools/pdf`;

  const title = dict.page_tools_pdf.meta_title;
  const description = dict.page_tools_pdf.meta_description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical },
  };
}

const toolMeta = [
  { href: "/pdf/merge-pdf", icon: FilePlus2, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/rotate-pdf", icon: RotateCw, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/delete-pdf-pages", icon: Trash2, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/protect-pdf", icon: Lock, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/unlock-pdf", icon: Unlock, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/pdf-to-text", icon: FileText, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/split-pdf", icon: Scissors, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/rearrange-pdf", icon: ArrowUpDown, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/crop-pdf", icon: Crop, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/pdf-page-numbers", icon: Hash, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/pdf-watermark", icon: Droplets, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/add-text-to-pdf", icon: Type, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/create-pdf", icon: FilePlus, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/images-to-pdf", icon: Image, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/pdf-to-jpg", icon: ImageIcon, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/pdf-to-png", icon: FileImage, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/pdf-editor", icon: Edit3, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
  { href: "/pdf/esign-pdf", icon: PenTool, gradient: "from-red-500 to-rose-500", bgLight: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500" },
];

export default async function PdfToolsPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const tools = toolMeta.map((meta, i) => ({
    ...meta,
    title: dict.page_tools_pdf.tools[i].title,
    description: dict.page_tools_pdf.tools[i].description,
  }));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.breadcrumb.home, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: dict.breadcrumb.tools, item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.pdf_tools, item: "https://ssdown.app/tools/pdf" },
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
              { label: dict.breadcrumb.home, href: "/" },
              { label: dict.breadcrumb.tools, href: "/tools" },
              {
                label: dict.breadcrumb.pdf_tools,
                href: "/tools/pdf",
                isCurrent: true,
              },
            ]}
          />

          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {dict.page_tools_pdf.heading}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {dict.page_tools_pdf.subtitle}
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
