import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { buildAlternates } from "@/lib/seo";
import { ToolHub } from "@/components/portal/tool-hub";

const CANONICAL = "https://ssdown.app/tools/social-text";

/** 사전의 tools 배열과 같은 순서로 유지해야 한다. */
const HREFS = [
  "/social-text/hashtag-generator",
  "/social-text/instagram-line-break",
];

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  const title = dict.page_tools_social_text.meta_title;
  const description = dict.page_tools_social_text.meta_description;

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
    alternates: buildAlternates("/tools/social-text"),
  };
}

export default async function Page() {
  const dict = await getDictionary();
  const section = dict.page_tools_social_text;

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
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.social_text, item: CANONICAL },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <ToolHub
        groupKey="social-text"
        title={section.heading}
        desc={section.subtitle}
        tools={tools}
      />
    </>
  );
}
