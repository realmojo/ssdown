import { Metadata } from "next";
import { Hash, AlignLeft, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/tools/social-text`;

  const title = "Free Social Media & Text Tools | SSDown";
  const description =
    "Free social media tools. Generate trending hashtags for TikTok, Instagram, YouTube. Create clean Instagram captions with line breaks.";

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
    title: "Hashtag Generator",
    description: "Find trending hashtags for TikTok, Instagram, and YouTube.",
    href: "/social-text/hashtag-generator",
    icon: Hash,
    gradient: "from-cyan-500 to-blue-500",
    bgLight: "bg-cyan-100 dark:bg-cyan-900/30",
    iconColor: "text-cyan-500",
  },
  {
    title: "Instagram Line Break",
    description: "Create clean Instagram captions with perfect line breaks.",
    href: "/social-text/instagram-line-break",
    icon: AlignLeft,
    gradient: "from-purple-500 to-pink-500",
    bgLight: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-500",
  },
];

export default function SocialTextToolsPage() {
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
        name: "Social & Text",
        item: "https://ssdown.app/tools/social-text",
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
                label: "Social & Text",
                href: "/tools/social-text",
                isCurrent: true,
              },
            ]}
          />

          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Social & Text Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Free social media tools for content creators. Generate hashtags
              and format captions.
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
