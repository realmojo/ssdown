import { Metadata } from "next";
import { ProtectPdfClient } from "@/components/client/protect-pdf-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/protect-pdf`;
  const title = "Protect PDF Online Free | Add Password to PDF | SSDown";
  const description = "Add password protection to your PDF files instantly. Secure your documents with encryption. 100% private — processed in your browser, no upload to server.";

  return {
    title, description, alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: "SSDown", locale: "en_US", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function ProtectPdfPage() {
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Is it free to password-protect a PDF?", acceptedAnswer: { "@type": "Answer", text: "Yes, this tool is 100% free. There are no hidden fees, watermarks, or usage limits." } },
      { "@type": "Question", name: "Is it secure? Are my files uploaded?", acceptedAnswer: { "@type": "Answer", text: "Your files are completely secure. All processing happens in your browser. Your PDFs and passwords never leave your device." } },
      { "@type": "Question", name: "What type of encryption is used?", acceptedAnswer: { "@type": "Answer", text: "We use pdf-lib's built-in encryption which applies password protection compatible with most PDF readers." } },
      { "@type": "Question", name: "Can I set different user and owner passwords?", acceptedAnswer: { "@type": "Answer", text: "The password you set serves as the user password required to open the PDF. An owner password is also set internally." } },
      { "@type": "Question", name: "What is the file size limit?", acceptedAnswer: { "@type": "Answer", text: "Each PDF file can be up to 50MB." } },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ssdown.app" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://ssdown.app/tools" },
      { "@type": "ListItem", position: 3, name: "PDF Tools", item: "https://ssdown.app/tools/pdf" },
      { "@type": "ListItem", position: 4, name: "Protect PDF", item: "https://ssdown.app/pdf/protect-pdf" },
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
          { label: "Protect PDF", href: "/pdf/protect-pdf", isCurrent: true },
        ]} />
      </div>
      <ProtectPdfClient />
    </>
  );
}
