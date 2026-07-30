import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { ToolHub } from "@/components/portal/tool-hub";
import { jsonLd } from "@/lib/json-ld";

const CANONICAL = "https://ssdown.app/tools/utility";

/** 사전의 tools 배열과 같은 순서로 유지해야 한다. */
const HREFS = [
  "/utility/qr-code-generator",
  "/utility/aspect-ratio-calculator",
  "/utility/word-counter",
  "/utility/og-debugger",
  "/utility/mp3-splitter",
  "/utility/password-generator",
  "/utility/color-converter",
  "/utility/text-case-converter",
  "/utility/timestamp-converter",
  "/utility/base64-url-encoder",
  "/utility/qr-code-scanner",
  "/utility/json-formatter",
  "/utility/diff-checker",
  "/utility/uuid-generator",
  "/utility/lorem-ipsum-generator",
];

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const title = dict.page_tools_utility.meta_title;
  const description = dict.page_tools_utility.meta_description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: CANONICAL,
      siteName: "SSDown",
      locale: "ko_KR",
      type: "website",
      images: [{ url: "https://ssdown.app/logo.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://ssdown.app/logo.png"],
    },
    alternates: buildAlternates("/tools/utility"),
  };
}

export default async function Page() {
  const dict = await getDictionary();
  const section = dict.page_tools_utility;

  const tools = HREFS.map((href, i) => ({
    href,
    title: section.tools[i].title,
    description: section.tools[i].description,
  }));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.breadcrumb.home, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: dict.breadcrumb.tools, item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.utility, item: CANONICAL },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: section.heading,
    url: CANONICAL,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.title,
      url: `https://ssdown.app${tool.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }}
      />
      <ToolHub
        groupKey="utility"
        title={section.heading}
        desc={section.subtitle}
        tools={tools}
      />
    </>
  );
}
