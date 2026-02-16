import { YoutubePreviewClient } from "@/components/client/youtube-preview-client";
import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/youtube-preview`;

  const title = "Youtube Preview Editor | SSDown";
  const description =
    "Edit and preview your Youtube video metadata and thumbnails.";

  return {
    title,
    description,
    alternates: {
      canonical,
    },
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
  };
}

export default async function YoutubePreviewPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

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
      {
        "@type": "ListItem",
        position: 4,
        name: "YouTube Preview Editor",
        item: "https://ssdown.app/utility/youtube-preview",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "Utility", href: "/tools/utility" },
            {
              label: "YouTube Preview",
              href: "/utility/youtube-preview",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <YoutubePreviewClient dict={dict} />
    </>
  );
}
