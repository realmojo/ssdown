"use client";

import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import {
  // PDF
  FilePlus2, RotateCw, Trash2, Lock, Unlock, FileText, Scissors,
  ArrowUpDown, Crop, Hash, Droplets, Type, FilePlus, Image, ImageIcon,
  FileImage, Edit3, PenTool,
  // Image
  Minimize2, Eraser, Palette, FlipHorizontal, Sparkles, Contrast,
  Frame, Columns, LayoutGrid, Circle, FileSearch, Shapes,
  // Video & Audio
  Music, Film, VolumeX, FileVideo,
  // Social & Text
  AlignLeft,
  // Utility
  QrCode, Calculator, Share2,
  KeyRound, CaseSensitive, Clock, Binary, ScanLine, Braces, Diff, Fingerprint, Pilcrow,
  // File
  FileJson, FileCode, FileSpreadsheet, Split, FileType,
} from "lucide-react";

interface ToolItem {
  href: string;
  icon: LucideIcon;
  key: string;
}

const categoryConfig: Record<string, { tools: ToolItem[]; label: string; dictKey: string; activeColor: string; activeIconColor: string; activeBg: string }> = {
  pdf: {
    label: "PDF 도구",
    dictKey: "page_tools_pdf",
    activeColor: "text-red-700 dark:text-red-300",
    activeIconColor: "text-red-600 dark:text-red-400",
    activeBg: "bg-red-50 dark:bg-red-900/20",
    tools: [
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
    ],
  },
  image: {
    label: "이미지 도구",
    dictKey: "page_tools_image",
    activeColor: "text-green-700 dark:text-green-300",
    activeIconColor: "text-green-600 dark:text-green-400",
    activeBg: "bg-green-50 dark:bg-green-900/20",
    tools: [
      { href: "/image/image-compressor", icon: Minimize2, key: "image_compressor" },
      { href: "/image/image-converter", icon: ImageIcon, key: "image_converter" },
      { href: "/image/social-image-resizer", icon: Crop, key: "social_image_resizer" },
      { href: "/image/watermark-remover", icon: Eraser, key: "watermark_remover" },
      { href: "/image/favicon-generator", icon: FileImage, key: "favicon_generator" },
      { href: "/image/color-palette-extractor", icon: Palette, key: "color_palette_extractor" },
      { href: "/image/thumbnail-generator", icon: ImageIcon, key: "thumbnail_generator" },
      { href: "/image/background-remover", icon: Eraser, key: "background_remover" },
      { href: "/image/crop-image", icon: Crop, key: "crop_image" },
      { href: "/image/flip-image", icon: FlipHorizontal, key: "flip_image" },
      { href: "/image/pixelate-image", icon: Sparkles, key: "pixelate_image" },
      { href: "/image/black-and-white", icon: Contrast, key: "black_and_white" },
      { href: "/image/add-text-to-image", icon: Type, key: "add_text_to_image" },
      { href: "/image/add-border-to-image", icon: Frame, key: "add_border_to_image" },
      { href: "/image/combine-images", icon: Columns, key: "combine_images" },
      { href: "/image/collage-maker", icon: LayoutGrid, key: "collage_maker" },
      { href: "/image/round-image-maker", icon: Circle, key: "round_image_maker" },
      { href: "/image/image-metadata-viewer", icon: FileSearch, key: "image_metadata_viewer" },
      { href: "/image/blur-image", icon: Droplets, key: "blur_image" },
      { href: "/image/icon-to-png", icon: Shapes, key: "icon_to_png" },
    ],
  },
  "video-audio": {
    label: "Video & Audio",
    dictKey: "page_tools_video_audio",
    activeColor: "text-pink-700 dark:text-pink-300",
    activeIconColor: "text-pink-600 dark:text-pink-400",
    activeBg: "bg-pink-50 dark:bg-pink-900/20",
    tools: [
      { href: "/video-audio/video-to-mp3", icon: Music, key: "video_to_mp3" },
      { href: "/video-audio/video-to-gif", icon: ImageIcon, key: "video_to_gif" },
      { href: "/video-audio/video-frame-extractor", icon: Film, key: "video_frame_extractor" },
      { href: "/video-audio/audio-trimmer", icon: Scissors, key: "audio_trimmer" },
      { href: "/video-audio/mute-video", icon: VolumeX, key: "mute_video" },
      { href: "/video-audio/gif-to-mp4", icon: FileVideo, key: "gif_to_mp4" },
      { href: "/video-audio/trim-video", icon: Scissors, key: "trim_video" },
    ],
  },
  "social-text": {
    label: "Social & Text",
    dictKey: "page_tools_social_text",
    activeColor: "text-cyan-700 dark:text-cyan-300",
    activeIconColor: "text-cyan-600 dark:text-cyan-400",
    activeBg: "bg-cyan-50 dark:bg-cyan-900/20",
    tools: [
      { href: "/social-text/hashtag-generator", icon: Hash, key: "hashtag_generator" },
      { href: "/social-text/instagram-line-break", icon: AlignLeft, key: "instagram_line_break" },
    ],
  },
  utility: {
    label: "유틸리티 도구",
    dictKey: "page_tools_utility",
    activeColor: "text-violet-700 dark:text-violet-300",
    activeIconColor: "text-violet-600 dark:text-violet-400",
    activeBg: "bg-violet-50 dark:bg-violet-900/20",
    tools: [
      { href: "/utility/qr-code-generator", icon: QrCode, key: "qr_code_generator" },
      { href: "/utility/aspect-ratio-calculator", icon: Calculator, key: "aspect_ratio_calculator" },
      { href: "/utility/word-counter", icon: Type, key: "word_counter" },
      { href: "/utility/og-debugger", icon: Share2, key: "og_debugger" },
      { href: "/utility/mp3-splitter", icon: Scissors, key: "mp3_splitter" },
      { href: "/utility/password-generator", icon: KeyRound, key: "password_generator" },
      { href: "/utility/color-converter", icon: Palette, key: "color_converter" },
      { href: "/utility/text-case-converter", icon: CaseSensitive, key: "text_case_converter" },
      { href: "/utility/timestamp-converter", icon: Clock, key: "timestamp_converter" },
      { href: "/utility/base64-url-encoder", icon: Binary, key: "base64_url_encoder" },
      { href: "/utility/qr-code-scanner", icon: ScanLine, key: "qr_code_scanner" },
      { href: "/utility/json-formatter", icon: Braces, key: "json_formatter" },
      { href: "/utility/diff-checker", icon: Diff, key: "diff_checker" },
      { href: "/utility/uuid-generator", icon: Fingerprint, key: "uuid_generator" },
      { href: "/utility/lorem-ipsum-generator", icon: Pilcrow, key: "lorem_ipsum_generator" },
    ],
  },
  file: {
    label: "파일 도구",
    dictKey: "page_tools_file",
    activeColor: "text-orange-700 dark:text-orange-300",
    activeIconColor: "text-orange-600 dark:text-orange-400",
    activeBg: "bg-orange-50 dark:bg-orange-900/20",
    tools: [
      { href: "/file/json-to-xml", icon: FileCode, key: "json_to_xml" },
      { href: "/file/xml-to-json", icon: FileJson, key: "xml_to_json" },
      { href: "/file/csv-to-json", icon: FileJson, key: "csv_to_json" },
      { href: "/file/csv-to-xml", icon: FileCode, key: "csv_to_xml" },
      { href: "/file/xml-to-csv", icon: FileSpreadsheet, key: "xml_to_csv" },
      { href: "/file/csv-to-excel", icon: FileSpreadsheet, key: "csv_to_excel" },
      { href: "/file/excel-to-csv", icon: FileText, key: "excel_to_csv" },
      { href: "/file/xml-to-excel", icon: FileSpreadsheet, key: "xml_to_excel" },
      { href: "/file/excel-to-xml", icon: FileCode, key: "excel_to_xml" },
      { href: "/file/split-csv", icon: Split, key: "split_csv" },
      { href: "/file/split-excel", icon: Split, key: "split_excel" },
      { href: "/file/excel-to-pdf", icon: FileType, key: "excel_to_pdf" },
    ],
  },
};

interface ToolsSidebarProps {
  category: keyof typeof categoryConfig;
  dict?: any;
}

export function ToolsSidebar({ category, dict }: ToolsSidebarProps) {
  const pathname = usePathname();
  const config = categoryConfig[category];
  if (!config) return null;

  const toolNames = dict?.[config.dictKey]?.tools;

  return (
    <div className="sticky top-24">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
        {config.label}
      </h3>
      <nav className="space-y-1">
        {config.tools.map((tool, idx) => {
          const Icon = tool.icon;
          const isActive = pathname === tool.href;
          const title = toolNames?.[idx]?.title || tool.key.replace(/_/g, " ");

          return (
            <a
              key={tool.href}
              href={tool.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? `${config.activeBg} ${config.activeColor} font-medium`
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? config.activeIconColor : ""}`} />
              <span className="truncate">{title}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
