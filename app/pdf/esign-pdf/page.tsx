import { Metadata } from "next";
import { EsignPdfClient } from "@/components/client/esign-pdf-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/esign-pdf`;
  const title = "eSign PDF Online Free | Electronic Signature for PDF | SSDown";
  const description = "Add your electronic signature to PDF files instantly. Draw your signature and place it on any page. 100% private — processed in your browser, no upload to server.";

  return {
    title, description, alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: "SSDown", locale: "en_US", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function EsignPdfPage() {
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Is it free to eSign a PDF?", acceptedAnswer: { "@type": "Answer", text: "Yes, this eSign tool is 100% free with no hidden fees or watermarks." } },
      { "@type": "Question", name: "Is an electronic signature legally valid?", acceptedAnswer: { "@type": "Answer", text: "Electronic signatures are legally recognized in many jurisdictions. However, this tool creates a visual signature overlay, not a cryptographic digital signature." } },
      { "@type": "Question", name: "Is my PDF and signature secure?", acceptedAnswer: { "@type": "Answer", text: "All processing happens in your browser. Your PDF and signature never leave your device." } },
      { "@type": "Question", name: "Can I sign on mobile devices?", acceptedAnswer: { "@type": "Answer", text: "Yes, the signature pad supports both mouse and touch input, making it work on mobile devices and tablets." } },
      { "@type": "Question", name: "What is the file size limit?", acceptedAnswer: { "@type": "Answer", text: "Each PDF file can be up to 50MB." } },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: "PDF Tools", item: "https://ssdown.app/tools/pdf" },
      { "@type": "ListItem", position: 4, name: "eSign PDF", item: "https://ssdown.app/pdf/esign-pdf" },
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
          { label: "eSign PDF", href: "/pdf/esign-pdf", isCurrent: true },
        ]} />
      </div>
      <EsignPdfClient />
    </>
  );
}
