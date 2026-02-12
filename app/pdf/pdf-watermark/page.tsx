import { Metadata } from "next";
import { PdfWatermarkClient } from "@/components/client/pdf-watermark-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/pdf-watermark`;
  const title = "Add Watermark to PDF Online Free | PDF Watermark | SSDown";
  const description = "Add text watermarks to your PDF files instantly. Customize opacity, rotation, and position. 100% private — processed in your browser, no upload to server.";

  return {
    title, description, alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: "SSDown", locale: "en_US", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function PdfWatermarkPage() {
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Is it free to add watermarks?", acceptedAnswer: { "@type": "Answer", text: "Yes, this tool is 100% free with no hidden fees or watermarks of its own." } },
      { "@type": "Question", name: "Can I customize the watermark appearance?", acceptedAnswer: { "@type": "Answer", text: "Yes, you can set the text, font size, opacity, rotation angle, and color of the watermark." } },
      { "@type": "Question", name: "Is the watermark applied to all pages?", acceptedAnswer: { "@type": "Answer", text: "Yes, the watermark is applied to every page of the PDF document." } },
      { "@type": "Question", name: "Is my PDF secure?", acceptedAnswer: { "@type": "Answer", text: "All processing happens in your browser. Your files never leave your device." } },
      { "@type": "Question", name: "What is the file size limit?", acceptedAnswer: { "@type": "Answer", text: "Each PDF file can be up to 50MB." } },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: "PDF Tools", item: "https://ssdown.app/tools/pdf" },
      { "@type": "ListItem", position: 4, name: "PDF Watermark", item: "https://ssdown.app/pdf/pdf-watermark" },
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
          { label: "PDF Watermark", href: "/pdf/pdf-watermark", isCurrent: true },
        ]} />
      </div>
      <PdfWatermarkClient />
    </>
  );
}
