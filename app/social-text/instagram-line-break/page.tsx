import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { InstagramLineBreakClient } from "@/components/client/instagram-line-break-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/social-text/instagram-line-break`;

  const title = "Instagram Line Break Generator - Clean Captions | SSDown";
  const description =
    "Add invisible line breaks to your Instagram captions. Create clean, spaced-out text for better engagement. Free online caption formatter.";

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

export default async function InstagramLineBreakPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: dict?.qna_instagram_line_break?.faq_1_q || "How does it work?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_instagram_line_break?.faq_1_a ||
            "We insert an invisible 'zero-width space' or special blank character that forces Instagram to respect the line break.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_instagram_line_break?.faq_2_q ||
          "Does this work on comments?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_instagram_line_break?.faq_2_a ||
            "Yes, you can use this for bio, comments, and captions.",
        },
      },
      {
        "@type": "Question",
        name:
          dict?.qna_instagram_line_break?.faq_3_q ||
          "Is it allowed by Instagram?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            dict?.qna_instagram_line_break?.faq_3_a ||
            "Yes, it uses standard Unicode characters that are fully compatible.",
        },
      },
    ],
  };

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
      {
        "@type": "ListItem",
        position: 4,
        name: "Instagram Line Break",
        item: "https://ssdown.app/social-text/instagram-line-break",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "Social & Text", href: "/tools/social-text" },
            {
              label: "Instagram Line Break",
              href: "/social-text/instagram-line-break",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <InstagramLineBreakClient dict={dict} />
    </>
  );
}
