import { Metadata } from "next";
import { AddBorderToImageClient } from "@/components/client/add-border-to-image-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/add-border-to-image`;

  const title = "Add Border to Image Online Free - Photo Frame Tool | SSDown";
  const description =
    "Add borders and frames to your images online. Choose border style, width, color, and corner radius. Free photo border tool — 100% private, processed in your browser.";

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

export default function AddBorderToImagePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this border tool is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of images you can edit.",
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
        name: "Does adding a border change the image resolution?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The output image will be slightly larger than the original because the border adds extra pixels around the edges. For example, a 20px border adds 40px to both width and height. The original image quality is fully preserved.",
        },
      },
      {
        "@type": "Question",
        name: "What border styles are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We offer 4 border styles: Solid (clean flat border), Double (layered frame effect), Rounded (with adjustable corner radius), and Shadow (floating card effect with drop shadow).",
        },
      },
      {
        "@type": "Question",
        name: "What image formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can add borders to PNG, JPG, JPEG, WebP, GIF, and BMP images. The result will be saved in the same format as the original. Maximum file size is 20MB.",
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
        name: "Add Border to Image",
        item: "https://ssdown.app/image/add-border-to-image",
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
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "Image Tools", href: "/tools/image" },
            {
              label: "Add Border to Image",
              href: "/image/add-border-to-image",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <AddBorderToImageClient />
    </>
  );
}
