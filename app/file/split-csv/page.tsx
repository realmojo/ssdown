import { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SplitCsvClient } from "@/components/client/split-csv-client";

export const metadata: Metadata = {
  title: "Split CSV File Online | Free Tool | SSDown",
  description:
    "Split large CSV files into smaller parts. Divide by number of rows or number of files. Free, secure, and processing happens in your browser.",
  openGraph: {
    title: "Split CSV File Online | Free Tool | SSDown",
    description:
      "Split large CSV files into smaller parts. Divide by number of rows or number of files.",
    url: "https://ssdown.app/file/split-csv",
    siteName: "SSDown",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Split CSV File Online | Free Tool",
    description: "Split large CSV files into smaller parts.",
  },
  alternates: {
    canonical: "https://ssdown.app/file/split-csv",
  },
};

export default function SplitCsvPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I split a CSV file?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Upload your CSV file, choose how many rows each part should have (or how many files to create), and click Split.",
        },
      },
      {
        "@type": "Question",
        name: "Do the split files keep the header?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the header row is automatically included in every split file.",
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
        name: "File & Data Tools",
        item: "https://ssdown.app/tools/file",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Split CSV",
        item: "https://ssdown.app/file/split-csv",
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
            { label: "File Tools", href: "/tools/file" },
            {
              label: "Split CSV",
              href: "/file/split-csv",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <SplitCsvClient />
    </>
  );
}
