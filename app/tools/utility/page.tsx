import { QrCode, Calculator, ArrowRight, Type, Share2, AudioLines, KeyRound, Pipette, CaseSensitive, Clock, Binary, ScanLine, Braces, GitCompare, Fingerprint, AlignLeft } from "lucide-react";
import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tools/utility`;

  const title = dict.page_tools_utility.meta_title;
  const description = dict.page_tools_utility.meta_description;

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
      images: [{ url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["https://ssdown.app/logo.png"] },
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

const toolMeta = [
  { href: "/utility/qr-code-generator", icon: QrCode, gradient: "from-blue-600 to-cyan-600", bgLight: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600" },
  { href: "/utility/aspect-ratio-calculator", icon: Calculator, gradient: "from-violet-500 to-purple-500", bgLight: "bg-violet-100 dark:bg-violet-900/30", iconColor: "text-violet-500" },
  { href: "/utility/word-counter", icon: Type, gradient: "from-emerald-500 to-green-500", bgLight: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600" },
  { href: "/utility/share-debugger", icon: Share2, gradient: "from-sky-500 to-blue-500", bgLight: "bg-sky-100 dark:bg-sky-900/30", iconColor: "text-sky-600" },
  { href: "/utility/mp3-splitter", icon: AudioLines, gradient: "from-teal-500 to-cyan-500", bgLight: "bg-teal-100 dark:bg-teal-900/30", iconColor: "text-teal-600" },
  { href: "/utility/password-generator", icon: KeyRound, gradient: "from-rose-500 to-red-500", bgLight: "bg-rose-100 dark:bg-rose-900/30", iconColor: "text-rose-600" },
  { href: "/utility/color-converter", icon: Pipette, gradient: "from-fuchsia-500 to-pink-500", bgLight: "bg-fuchsia-100 dark:bg-fuchsia-900/30", iconColor: "text-fuchsia-600" },
  { href: "/utility/text-case-converter", icon: CaseSensitive, gradient: "from-indigo-500 to-blue-500", bgLight: "bg-indigo-100 dark:bg-indigo-900/30", iconColor: "text-indigo-600" },
  { href: "/utility/timestamp-converter", icon: Clock, gradient: "from-orange-500 to-amber-500", bgLight: "bg-orange-100 dark:bg-orange-900/30", iconColor: "text-orange-600" },
  { href: "/utility/base64-url-encoder", icon: Binary, gradient: "from-cyan-500 to-sky-500", bgLight: "bg-cyan-100 dark:bg-cyan-900/30", iconColor: "text-cyan-600" },
  { href: "/utility/qr-code-scanner", icon: ScanLine, gradient: "from-purple-500 to-violet-500", bgLight: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600" },
  { href: "/utility/json-formatter", icon: Braces, gradient: "from-amber-500 to-yellow-500", bgLight: "bg-amber-100 dark:bg-amber-900/30", iconColor: "text-amber-600" },
  { href: "/utility/diff-checker", icon: GitCompare, gradient: "from-green-500 to-emerald-500", bgLight: "bg-green-100 dark:bg-green-900/30", iconColor: "text-green-600" },
  { href: "/utility/uuid-generator", icon: Fingerprint, gradient: "from-blue-500 to-indigo-500", bgLight: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600" },
  { href: "/utility/lorem-ipsum-generator", icon: AlignLeft, gradient: "from-pink-500 to-rose-500", bgLight: "bg-pink-100 dark:bg-pink-900/30", iconColor: "text-pink-600" },
];

export default async function UtilityToolsPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const tools = toolMeta.map((meta, i) => ({
    ...meta,
    title: dict.page_tools_utility.tools[i].title,
    description: dict.page_tools_utility.tools[i].description,
  }));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.breadcrumb.home, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: dict.breadcrumb.tools, item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.utility, item: "https://ssdown.app/tools/utility" },
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
            name: dict.page_tools_utility.heading,
            url: "https://ssdown.app/tools/utility",
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
                label: dict.breadcrumb.utility,
                href: "/tools/utility",
                isCurrent: true,
              },
            ]}
          />

          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {dict.page_tools_utility.heading}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {dict.page_tools_utility.subtitle}
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
