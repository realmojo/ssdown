import { Metadata } from "next";
import { PdfEditorClient } from "@/components/client/pdf-editor-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/pdf-editor`;
  const title = "PDF Editor Online Free | Edit PDF Files | SSDown";
  const description = "Edit PDF files online for free. Add text, images, rotate, delete, and rearrange pages. 100% private — processed in your browser, no upload to server.";

  return {
    title, description, alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: "SSDown", locale: "en_US", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function PdfEditorPage() {
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Is this PDF editor free?", acceptedAnswer: { "@type": "Answer", text: "Yes, this PDF editor is 100% free with no hidden fees or watermarks." } },
      { "@type": "Question", name: "What can I edit in a PDF?", acceptedAnswer: { "@type": "Answer", text: "You can add text, add images, rotate pages, delete pages, and rearrange page order." } },
      { "@type": "Question", name: "Is my PDF secure?", acceptedAnswer: { "@type": "Answer", text: "All processing happens in your browser using pdf-lib. Your files never leave your device." } },
      { "@type": "Question", name: "Can I add images to a PDF?", acceptedAnswer: { "@type": "Answer", text: "Yes, you can upload JPG or PNG images and place them on any page at a position you specify." } },
      { "@type": "Question", name: "What is the file size limit?", acceptedAnswer: { "@type": "Answer", text: "Each PDF file can be up to 50MB." } },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: "PDF Tools", item: "https://ssdown.app/tools/pdf" },
      { "@type": "ListItem", position: 4, name: "PDF Editor", item: "https://ssdown.app/pdf/pdf-editor" },
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
          { label: "PDF Editor", href: "/pdf/pdf-editor", isCurrent: true },
        ]} />
      </div>
      <PdfEditorClient />
    </>
  );
}
