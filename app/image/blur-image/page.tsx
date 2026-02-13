import { Metadata } from "next";
import { BlurImageClient } from "@/components/client/blur-image-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/blur-image`;

  const title = "Blur Image Online Free | Gaussian Blur Tool | SSDown";
  const description =
    "Apply gaussian blur to images instantly. Free online blur tool with adjustable intensity slider (0-20px). 100% private — processed in your browser.";

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

export default function BlurImagePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this blur image tool is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of images you can blur.",
        },
      },
      {
        "@type": "Question",
        name: "Is it secure? Where are my images stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your images are completely secure because all processing happens entirely in your browser using Canvas API. Your images never leave your device and are never uploaded to any server.",
        },
      },
      {
        "@type": "Question",
        name: "What is gaussian blur?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Gaussian blur is a widely-used image blur effect that applies a mathematical blur algorithm. It creates a smooth, natural-looking blur by averaging pixel colors based on a gaussian distribution, producing professional results.",
        },
      },
      {
        "@type": "Question",
        name: "Does it reduce image quality?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The blur effect itself does not reduce image quality beyond the intended blur. The original resolution and file quality are maintained. Only the sharpness is reduced by the blur filter.",
        },
      },
      {
        "@type": "Question",
        name: "What image formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can blur PNG, JPG, JPEG, WebP, GIF, and BMP images. The blurred image will be saved in the same format as the original. Maximum file size is 20MB.",
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
        name: "Blur Image",
        item: "https://ssdown.app/image/blur-image",
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
            { label: "Image Tools", href: "/tools/image" },
            {
              label: "Blur Image",
              href: "/image/blur-image",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <BlurImageClient />
    </>
  );
}
