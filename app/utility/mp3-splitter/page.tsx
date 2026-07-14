import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { Mp3SplitterClient } from "@/components/client/mp3-splitter-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

const meta_title = "MP3 Splitter - Split MP3 Files Online Free | SSDown";
const meta_description =
  "Free online MP3 splitter. Cut an MP3 into equal parts, fixed-length segments, or at custom timestamps entirely in your browser. No upload, no signup.";
const breadcrumb_title = "MP3 Splitter";

const faq = [
  {
    question: "How does the MP3 splitter work?",
    answer:
      "Upload an MP3 file, choose how you want to split it (equal parts, by duration, or at custom timestamps), and click Split. Everything runs inside your browser using WebAssembly, so your file never leaves your device.",
  },
  {
    question: "Is my audio file uploaded to a server?",
    answer:
      "No. All processing happens locally in your browser. Your MP3 is never uploaded, stored, or sent to any server, which keeps your files completely private.",
  },
  {
    question: "Will splitting reduce the audio quality?",
    answer:
      "No. The splitter uses stream copy, which cuts the file without re-encoding. Each segment keeps the exact same bitrate and quality as the original MP3.",
  },
  {
    question: "Can I download all the segments at once?",
    answer:
      "Yes. After splitting, you can download each part individually or use the Download all (ZIP) button to bundle every segment into a single ZIP archive.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/utility/mp3-splitter`;

  const title = meta_title;
  const description = meta_description;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en": canonical,
        "ko": canonical,
        "x-default": canonical,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SSDown",
      locale: locale === "kr" ? "ko_KR" : "en_US",
      type: "website",
      images: [
        {
          url: "https://ssdown.app/logo.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://ssdown.app/logo.png"],
    },
  };
}

export default async function Mp3SplitterPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.breadcrumb.home, item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: dict.breadcrumb.tools, item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.utility, item: "https://ssdown.app/tools/utility" },
      { "@type": "ListItem", position: 4, name: breadcrumb_title, item: "https://ssdown.app/utility/mp3-splitter" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MP3 Splitter",
    url: "https://ssdown.app/utility/mp3-splitter",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online MP3 splitter. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use MP3 Splitter Online",
    description: "Use our free online MP3 splitter to cut your audio file securely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Upload your MP3",
        text: "Select or drag and drop your MP3 file into the tool area.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Choose a split mode",
        text: "Split into equal parts, by fixed duration, or at custom timestamps.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Download segments",
        text: "Download each part individually or all of them as a ZIP.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
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
            { label: dict.breadcrumb.home, href: "/" },
            { label: dict.breadcrumb.tools, href: "/tools" },
            { label: dict.breadcrumb.utility, href: "/tools/utility" },
            {
              label: "MP3 Splitter",
              href: "/utility/mp3-splitter",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <Mp3SplitterClient dict={dict} />
    </>
  );
}
