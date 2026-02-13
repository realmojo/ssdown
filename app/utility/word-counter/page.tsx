import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { WordCounterClient } from "@/components/client/word-counter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/word-counter`;

  const title = "Word Counter - Count Words, Characters & More | SSDown";
  const description =
    "Free online word counter. Count words, characters, sentences, and paragraphs in real-time. No signup required.";

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

export default async function WordCounterPage() {
  const dict = await getDictionary();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does the word counter work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Simply type or paste your text into the text area. The tool instantly analyzes your text and displays word count, character count (with and without spaces), sentence count, paragraph count, estimated reading time, and average word length.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a character or word limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No, there is no limit. You can paste text of any length and the counter will analyze it in real-time. The tool processes everything locally in your browser.",
        },
      },
      {
        "@type": "Question",
        name: "How is reading time calculated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Reading time is estimated based on the average adult reading speed of 200 words per minute. The minimum displayed reading time is 1 minute.",
        },
      },
      {
        "@type": "Question",
        name: "How are sentences counted?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sentences are counted by detecting sentence-ending punctuation marks such as periods (.), exclamation marks (!), and question marks (?). Multiple consecutive punctuation marks (e.g., '...') are treated as a single sentence boundary.",
        },
      },
      {
        "@type": "Question",
        name: "Is my text data private and secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, absolutely. All text analysis happens entirely in your browser. Your text is never sent to any server or stored anywhere. Close the tab and your text is gone.",
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
        name: "Utility",
        item: "https://ssdown.app/tools/utility",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Word Counter",
        item: "https://ssdown.app/utility/word-counter",
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
            { label: "Utility", href: "/tools/utility" },
            {
              label: "Word Counter",
              href: "/utility/word-counter",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <WordCounterClient dict={dict} />
    </>
  );
}
