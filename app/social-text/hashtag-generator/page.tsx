import { HashtagGeneratorClient } from "@/components/client/hashtag-generator-client";
import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/social-text/hashtag-generator`;

  const title = "Hashtag Generator for TikTok, Instagram & YouTube | SSDown";
  const description =
    "Free hashtag generator. Find trending hashtags for TikTok, Instagram, and YouTube. Copy with one click to boost your content reach.";

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

export default async function HashtagGeneratorPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: dict?.qna_hashtag_generator?.faq_1_q || "How many hashtags should I use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: dict?.qna_hashtag_generator?.faq_1_a || "For Instagram, 20-30 hashtags is optimal. For TikTok, 3-5 focused hashtags work best due to the 300-character caption limit. For YouTube, include relevant hashtags in your description (3-5 above the fold).",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_hashtag_generator?.faq_2_q || "Are these hashtags up to date?",
        acceptedAnswer: {
          "@type": "Answer",
          text: dict?.qna_hashtag_generator?.faq_2_a || "We regularly update our hashtag database to include trending and popular hashtags. However, trends change quickly, so we recommend mixing our suggestions with current trending tags on your platform.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_hashtag_generator?.faq_3_q || "Can banned hashtags hurt my account?",
        acceptedAnswer: {
          "@type": "Answer",
          text: dict?.qna_hashtag_generator?.faq_3_a || "Yes, using banned or shadowbanned hashtags can reduce your reach. Our curated lists avoid known banned hashtags, but platform policies change frequently. Always check if a hashtag is currently active before using it.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_hashtag_generator?.faq_4_q || "Should I use the same hashtags on every post?",
        acceptedAnswer: {
          "@type": "Answer",
          text: dict?.qna_hashtag_generator?.faq_4_a || "No. Reusing the exact same set of hashtags on every post can be flagged as spam by platform algorithms. Rotate your hashtags and mix different combinations for each post.",
        },
      },
      {
        "@type": "Question",
        name: dict?.qna_hashtag_generator?.faq_5_q || "Do hashtags work on YouTube?",
        acceptedAnswer: {
          "@type": "Answer",
          text: dict?.qna_hashtag_generator?.faq_5_a || "Yes! YouTube supports hashtags in titles and descriptions. Videos with hashtags can appear in hashtag search results. Use 3-5 relevant hashtags for best results.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: "Social & Text", item: "https://ssdown.app/tools/social-text" },
      { "@type": "ListItem", position: 4, name: "Hashtag Generator", item: "https://ssdown.app/social-text/hashtag-generator" },
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
      <div className="container max-w-7xl mx-auto px-4 pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "Social & Text", href: "/tools/social-text" },
            { label: "Hashtag Generator", href: "/social-text/hashtag-generator", isCurrent: true },
          ]}
        />
      </div>
      <HashtagGeneratorClient dict={dict} />
    </>
  );
}
