import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ImageMetadataViewerClient } from "@/components/client/image-metadata-viewer-client";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/image/image-metadata-viewer`;

  const title = "Image Metadata Viewer | View EXIF Data Online | SSDown";
  const description =
    "Free online image metadata viewer. View EXIF data including camera settings, GPS location, date taken, and more. Extract metadata from JPG, PNG, HEIC images. 100% browser-based.";

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
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical,
    },
  };
}

export default function ImageMetadataViewerPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: "Image Tools", item: "https://ssdown.app/tools/image" },
      { "@type": "ListItem", position: 4, name: "Image Metadata Viewer", item: "https://ssdown.app/image/image-metadata-viewer" },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is EXIF metadata?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "EXIF (Exchangeable Image File Format) is a standard that stores metadata in image files. It includes information like camera settings (ISO, aperture, shutter speed), date/time, GPS coordinates, camera model, and more. Most digital cameras and smartphones automatically embed this data when taking photos.",
        },
      },
      {
        "@type": "Question",
        name: "Is it safe to view metadata online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! All metadata extraction happens entirely in your browser using JavaScript. Your images are never uploaded to any server. The metadata is read locally on your device and displayed instantly. Your photos and their metadata remain completely private.",
        },
      },
      {
        "@type": "Question",
        name: "Why doesn't my image have metadata?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Several reasons: (1) Screenshots and digitally-created images don't contain EXIF data, (2) Many social media platforms strip metadata when you upload photos for privacy, (3) Some photo editing software removes EXIF data when saving, (4) The image may have been exported without preserving metadata.",
        },
      },
      {
        "@type": "Question",
        name: "Can I see GPS coordinates?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, if the photo was taken with a GPS-enabled device (like a smartphone with location services enabled) and the GPS data wasn't removed, you'll see the exact coordinates. We provide a direct link to view the location on Google Maps. Be aware that sharing photos with GPS data can reveal your location.",
        },
      },
      {
        "@type": "Question",
        name: "What image formats are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We support all common image formats including JPG, JPEG, PNG, WebP, GIF, BMP, TIFF, HEIC, and HEIF. JPG images from cameras typically contain the most complete EXIF data. Maximum file size is 20MB.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Tools", href: "/tools" },
              { label: "Image Tools", href: "/tools/image" },
              { label: "Image Metadata Viewer", href: "/image/image-metadata-viewer", isCurrent: true },
            ]}
          />
          <ImageMetadataViewerClient />
        </div>
      </div>
    </>
  );
}
