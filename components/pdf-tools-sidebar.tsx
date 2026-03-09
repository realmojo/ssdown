"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FilePlus2,
  RotateCw,
  Trash2,
  Lock,
  Unlock,
  FileText,
  Scissors,
  ArrowUpDown,
  Crop,
  Hash,
  Droplets,
  Type,
  FilePlus,
  Image,
  ImageIcon,
  FileImage,
  Edit3,
  PenTool,
} from "lucide-react";

const pdfTools = [
  { href: "/pdf/merge-pdf", icon: FilePlus2, key: "merge_pdf" },
  { href: "/pdf/rotate-pdf", icon: RotateCw, key: "rotate_pdf" },
  { href: "/pdf/delete-pdf-pages", icon: Trash2, key: "delete_pdf_pages" },
  { href: "/pdf/protect-pdf", icon: Lock, key: "protect_pdf" },
  { href: "/pdf/unlock-pdf", icon: Unlock, key: "unlock_pdf" },
  { href: "/pdf/pdf-to-text", icon: FileText, key: "pdf_to_text" },
  { href: "/pdf/split-pdf", icon: Scissors, key: "split_pdf" },
  { href: "/pdf/rearrange-pdf", icon: ArrowUpDown, key: "rearrange_pdf" },
  { href: "/pdf/crop-pdf", icon: Crop, key: "crop_pdf" },
  { href: "/pdf/pdf-page-numbers", icon: Hash, key: "pdf_page_numbers" },
  { href: "/pdf/pdf-watermark", icon: Droplets, key: "pdf_watermark" },
  { href: "/pdf/add-text-to-pdf", icon: Type, key: "add_text_to_pdf" },
  { href: "/pdf/create-pdf", icon: FilePlus, key: "create_pdf" },
  { href: "/pdf/images-to-pdf", icon: Image, key: "images_to_pdf" },
  { href: "/pdf/pdf-to-jpg", icon: ImageIcon, key: "pdf_to_jpg" },
  { href: "/pdf/pdf-to-png", icon: FileImage, key: "pdf_to_png" },
  { href: "/pdf/pdf-editor", icon: Edit3, key: "pdf_editor" },
  { href: "/pdf/esign-pdf", icon: PenTool, key: "esign_pdf" },
];

interface PdfToolsSidebarProps {
  dict?: any;
}

export function PdfToolsSidebar({ dict }: PdfToolsSidebarProps) {
  const pathname = usePathname();

  const toolNames = dict?.page_tools_pdf?.tools;

  return (
    <div className="sticky top-24">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
        PDF Tools
      </h3>
      <nav className="space-y-1">
        {pdfTools.map((tool, idx) => {
          const Icon = tool.icon;
          const isActive = pathname === tool.href;
          const title = toolNames?.[idx]?.title || tool.key.replace(/_/g, " ");

          return (
            <Link
              key={tool.href}
              href={tool.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-red-600 dark:text-red-400" : ""}`} />
              <span className="truncate">{title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
