import { Metadata } from "next";
import { MergePdfClient } from "@/components/client/merge-pdf-client";
import { Breadcrumbs } from "@/components/breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/pdf/merge-pdf`;

  const title = "Merge PDF Online Free | Combine PDF Files | SSDown";
  const description =
    "Merge multiple PDF files into one instantly. Free online PDF merger with file reordering. 100% private — processed in your browser, no upload to server.";

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

export default function MergePdfPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, this PDF merge tool is 100% free to use. There are no hidden fees, watermarks, or limitations on the number of files you can merge.",
        },
      },
      {
        "@type": "Question",
        name: "Is it secure? Where are my files stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your files are completely secure because all processing happens entirely in your browser using pdf-lib. Your PDFs never leave your device and are never uploaded to any server.",
        },
      },
      {
        "@type": "Question",
        name: "What is the file size limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each individual PDF file can be up to 50MB. There is no limit on the number of files you can merge.",
        },
      },
      {
        "@type": "Question",
        name: "Can I merge password-protected PDFs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We attempt to read password-protected PDFs, but some encrypted files may not be supported. If a file cannot be read, you'll see an error message.",
        },
      },
      {
        "@type": "Question",
        name: "Can I change the order of pages?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can reorder entire PDF files using the up/down buttons before merging. The pages within each PDF will maintain their original order.",
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
        name: "PDF Tools",
        item: "https://ssdown.app/tools/pdf",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Merge PDF",
        item: "https://ssdown.app/pdf/merge-pdf",
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
            { label: "PDF Tools", href: "/tools/pdf" },
            {
              label: "Merge PDF",
              href: "/pdf/merge-pdf",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <MergePdfClient />
    </>
  );
}
