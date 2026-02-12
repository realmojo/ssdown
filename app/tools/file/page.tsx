import { Metadata } from "next";
import Link from "next/link";
import {
  FileJson,
  FileCode,
  FileSpreadsheet,
  FileType,
  Split,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Free Online File & Data Tools | SSDown",
  description:
    "Free online file and data tools. Convert JSON, XML, CSV, Excel. Split files and manage data formats directly in your browser. No upload required — 100% private.",
  openGraph: {
    title: "Free Online File & Data Tools | SSDown",
    description:
      "Free online file and data tools. Convert JSON, XML, CSV, Excel. Split files and manage data formats directly in your browser.",
    url: "https://ssdown.app/tools/file",
    siteName: "SSDown",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online File & Data Tools | SSDown",
    description:
      "Free online file and data tools. Convert JSON, XML, CSV, Excel directly in your browser.",
  },
  alternates: {
    canonical: "https://ssdown.app/tools/file",
  },
};

const tools = [
  {
    title: "JSON to XML",
    description: "Convert JSON data to XML format instantly.",
    href: "/file/json-to-xml",
    icon: FileCode,
    gradient: "from-orange-500 to-red-500",
    bgLight: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-500",
  },
  {
    title: "XML to JSON",
    description: "Convert XML data to JSON format instantly.",
    href: "/file/xml-to-json",
    icon: FileJson,
    gradient: "from-blue-500 to-cyan-500",
    bgLight: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-500",
  },
  {
    title: "CSV to JSON",
    description: "Convert CSV files to JSON format.",
    href: "/file/csv-to-json",
    icon: FileJson,
    gradient: "from-green-500 to-emerald-500",
    bgLight: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-500",
  },
  {
    title: "CSV to XML",
    description: "Convert CSV files to XML format.",
    href: "/file/csv-to-xml",
    icon: FileCode,
    gradient: "from-teal-500 to-green-500",
    bgLight: "bg-teal-100 dark:bg-teal-900/30",
    iconColor: "text-teal-500",
  },
  {
    title: "XML to CSV",
    description: "Convert XML data to CSV format.",
    href: "/file/xml-to-csv",
    icon: FileSpreadsheet,
    gradient: "from-indigo-500 to-blue-500",
    bgLight: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-500",
  },
  {
    title: "CSV to Excel",
    description: "Convert CSV files to Excel (.xlsx).",
    href: "/file/csv-to-excel",
    icon: FileSpreadsheet,
    gradient: "from-green-600 to-emerald-600",
    bgLight: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600",
  },
  {
    title: "Excel to CSV",
    description: "Convert Excel (.xlsx) files to CSV.",
    href: "/file/excel-to-csv",
    icon: FileText,
    gradient: "from-emerald-500 to-green-500",
    bgLight: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-500",
  },
  {
    title: "XML to Excel",
    description: "Convert XML data to Excel (.xlsx).",
    href: "/file/xml-to-excel",
    icon: FileSpreadsheet,
    gradient: "from-blue-600 to-indigo-600",
    bgLight: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
  },
  {
    title: "Excel to XML",
    description: "Convert Excel (.xlsx) files to XML.",
    href: "/file/excel-to-xml",
    icon: FileCode,
    gradient: "from-purple-500 to-indigo-500",
    bgLight: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-500",
  },
  {
    title: "Split CSV",
    description: "Split a CSV file into multiple files.",
    href: "/file/split-csv",
    icon: Split,
    gradient: "from-yellow-500 to-orange-500",
    bgLight: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-500",
  },
  {
    title: "Split Excel",
    description: "Split an Excel file by sheets.",
    href: "/file/split-excel",
    icon: Split,
    gradient: "from-lime-500 to-green-500",
    bgLight: "bg-lime-100 dark:bg-lime-900/30",
    iconColor: "text-lime-500",
  },
  {
    title: "Excel to PDF",
    description: "Convert Excel spreadsheets to PDF.",
    href: "/file/excel-to-pdf",
    icon: FileType,
    gradient: "from-red-500 to-pink-500",
    bgLight: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-500",
  },
];

export default function FileToolsPage() {
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
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Tools", href: "/tools" },
              { label: "File Tools", href: "/tools/file", isCurrent: true },
            ]}
          />

          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              File & Data Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Free online file and data tools. Convert JSON, XML, CSV, Excel.
              Split files and manage data formats directly in your browser. No
              upload required.
            </p>
          </header>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group block rounded-2xl border border-gray-200 dark:border-gray-800 p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${tool.bgLight} mb-6`}
                >
                  <tool.icon className={`w-8 h-8 ${tool.iconColor}`} />
                </div>
                <h2 className="text-2xl font-bold mb-3">{tool.title}</h2>
                <p className="text-muted-foreground mb-6">{tool.description}</p>
                <span
                  className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}
                >
                  Try it now <ArrowRight className="w-4 h-4 text-current" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
