import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
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
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tools`;

  const title = dict.page_tools.meta_title;
  const description = dict.page_tools.meta_description;

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
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical,
      languages: {
        "en": canonical,
        "ko": canonical,
        "x-default": canonical,
      },
    },
  };
}

const categoryMeta = [
  {
    href: "/tools/image",
    icon: ImageIcon,
    gradient: "from-pink-500 to-rose-500",
    bgLight: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-500",
    count: 20,
  },
  {
    href: "/tools/video-audio",
    icon: Film,
    gradient: "from-indigo-500 to-purple-500",
    bgLight: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-500",
    count: 7,
  },
  {
    href: "/tools/social-text",
    icon: MessageSquare,
    gradient: "from-cyan-500 to-blue-500",
    bgLight: "bg-cyan-100 dark:bg-cyan-900/30",
    iconColor: "text-cyan-500",
    count: 2,
  },
  {
    href: "/tools/utility",
    icon: Wrench,
    gradient: "from-violet-500 to-purple-500",
    bgLight: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-500",
    count: 4,
  },
  {
    href: "/tools/pdf",
    icon: FileText,
    gradient: "from-red-500 to-rose-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
    count: 18,
  },
  {
    href: "/tools/file",
    icon: FileText,
    gradient: "from-blue-600 to-indigo-600",
    bgLight: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
    count: 12,
  },
];

export default async function ToolsPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const categories = categoryMeta.map((meta, i) => ({
    ...meta,
    title: dict.page_tools.categories[i].title,
    description: dict.page_tools.categories[i].description,
  }));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: dict.breadcrumb.home,
        item: "https://ssdown.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: dict.breadcrumb.tools,
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
              { label: dict.breadcrumb.home, href: "/" },
              { label: dict.breadcrumb.tools, href: "/tools", isCurrent: true },
            ]}
          />

          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {dict.tools.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {dict.tools.subtitle}
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
                    {cat.count} {dict.breadcrumb.tools_count}
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${cat.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}
                  >
                    {dict.breadcrumb.browse}{" "}
                    <ArrowRight className="w-4 h-4 text-current" />
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
