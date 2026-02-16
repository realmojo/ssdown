import { Metadata } from "next";
import { IconToPngClient } from "@/components/client/icon-to-png-client";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/get-locale";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/icon-to-png`;

  const title = "Free Icon to PNG Converter | Font Awesome Icons | SSDown";
  const description =
    "Convert Font Awesome icons to PNG images for free. Choose from 150+ icons, customize size, color, and background. Download high-quality PNG icons instantly.";

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

export default async function IconToPngPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Icon to PNG Converter?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Icon to PNG Converter is a free online tool that converts Font Awesome icons into PNG image files. You can customize the size, color, background, and padding before downloading.",
        },
      },
      {
        "@type": "Question",
        name: "How many icons are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We offer over 150 popular Font Awesome icons including UI elements, social media logos, and common symbols. All icons are available in solid, regular, or brands styles.",
        },
      },
      {
        "@type": "Question",
        name: "What sizes can I export icons in?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can export icons in 5 preset sizes: 64px, 128px, 256px, 512px, and 1024px. Choose based on your use case - smaller for favicons, larger for high-resolution displays.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use transparent backgrounds?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! You can choose between transparent or solid color backgrounds. Transparent backgrounds are ideal for versatile icons that work on any background.",
        },
      },
      {
        "@type": "Question",
        name: "Is this tool free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Icon to PNG Converter is completely free. Convert unlimited icons without any registration or watermarks.",
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
        name: "Image Tools",
        item: "https://ssdown.app/tools/image",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Icon to PNG",
        item: "https://ssdown.app/image/icon-to-png",
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
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Tools", href: "/tools" },
              { label: "Image Tools", href: "/tools/image" },
              {
                label: "Icon to PNG",
                href: "/image/icon-to-png",
                isCurrent: true,
              },
            ]}
          />
          <IconToPngClient dict={dict} />
        </div>
      </div>
    </>
  );
}
