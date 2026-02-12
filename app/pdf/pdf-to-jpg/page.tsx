import { Metadata } from "next";
import { PdfToJpgClient } from "@/components/client/pdf-to-jpg-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/pdf-to-jpg`;
  const title = "PDF to JPG Online Free | Convert PDF to Images | SSDown";
  const description = "Convert PDF pages to JPG images instantly. Choose quality and scale. 100% private — processed in your browser, no upload to server.";

  return {
    title, description, alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: "SSDown", locale: "en_US", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function PdfToJpgPage() {
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Is it free to convert PDF to JPG?", acceptedAnswer: { "@type": "Answer", text: "Yes, this tool is 100% free with no hidden fees or watermarks." } },
      { "@type": "Question", name: "What quality options are available?", acceptedAnswer: { "@type": "Answer", text: "You can choose 1x (standard), 2x (high), or 3x (ultra) scale factor for image quality." } },
      { "@type": "Question", name: "Can I download all images at once?", acceptedAnswer: { "@type": "Answer", text: "Yes, you can download each image individually or use the Download All button." } },
      { "@type": "Question", name: "Is my PDF secure?", acceptedAnswer: { "@type": "Answer", text: "All processing happens in your browser using pdf.js. Your files never leave your device." } },
      { "@type": "Question", name: "What is the file size limit?", acceptedAnswer: { "@type": "Answer", text: "Each PDF file can be up to 50MB." } },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: "PDF Tools", item: "https://ssdown.app/tools/pdf" },
      { "@type": "ListItem", position: 4, name: "PDF to JPG", item: "https://ssdown.app/pdf/pdf-to-jpg" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs items={[
          { label: "Home", href: "/" }, { label: "Tools", href: "/tools" },
          { label: "PDF Tools", href: "/tools/pdf" },
          { label: "PDF to JPG", href: "/pdf/pdf-to-jpg", isCurrent: true },
        ]} />
      </div>
      <PdfToJpgClient />
    </>
  );
}
