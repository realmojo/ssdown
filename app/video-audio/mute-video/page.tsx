import { Metadata } from "next";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { buildAlternates } from "@/lib/seo";
import { MuteVideoClient } from "@/components/client/mute-video-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/video-audio/mute-video`;

  const title = dict.page_mute_video.meta_title;
  const description = dict.page_mute_video.meta_description;

  return {
    title,
    description,
    alternates: buildAlternates(new URL(canonical).pathname, locale),
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
  };
}

export default async function MuteVideoPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.page_mute_video.faq.map((item: { question: string; answer: string }) => ({
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
      { "@type": "ListItem", position: 3, name: dict.breadcrumb.video_audio, item: "https://ssdown.app/tools/video-audio" },
      { "@type": "ListItem", position: 4, name: dict.page_mute_video.breadcrumb_title, item: "https://ssdown.app/video-audio/mute-video" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Mute Video",
    url: "https://ssdown.app/video-audio/mute-video",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Works in all modern browsers.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online mute video tool. Fast, secure, and browser-based.",
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use Mute Video Online",
    description: "Use our free online mute video tool to process your files securely in your browser.",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Upload your file",
        text: "Select or drag and drop your file into the tool area.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Process your file",
        text: "Follow the on-screen instructions to process or convert your file.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Download result",
        text: "Save the processed file to your device instantly.",
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
            { label: dict.breadcrumb.video_audio, href: "/tools/video-audio" },
            {
              label: dict.page_mute_video.breadcrumb_title,
              href: "/video-audio/mute-video",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <MuteVideoClient dict={dict} />
    </>
  );
}
