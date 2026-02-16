#!/usr/bin/env node
/**
 * i18n Transformation Script
 *
 * This script automates the process of:
 * 1. Reading each client component file
 * 2. Extracting hardcoded English text from JSX
 * 3. Adding ui sections to en.json and kr.json dictionaries
 * 4. Rewriting components to use dict props
 * 5. Updating page.tsx files to pass dict
 *
 * Run: node scripts/i18n-transform.mjs
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, 'components/client');
const EN_PATH = path.join(ROOT, 'dictionaries/en.json');
const KR_PATH = path.join(ROOT, 'dictionaries/kr.json');

// ==========================================
// STEP 1: Define all tool configurations
// ==========================================

const TOOLS = [
  // Video/Audio Tools (7)
  {
    key: 'page_gif_to_mp4',
    component: 'gif-to-mp4-client.tsx',
    pagePath: 'app/video-audio/gif-to-mp4/page.tsx',
    componentName: 'GifToMp4Client',
  },
  {
    key: 'page_trim_video',
    component: 'trim-video-client.tsx',
    pagePath: 'app/video-audio/trim-video/page.tsx',
    componentName: 'TrimVideoClient',
  },
  {
    key: 'page_video_to_gif',
    component: 'video-to-gif-client.tsx',
    pagePath: 'app/video-audio/video-to-gif/page.tsx',
    componentName: 'VideoToGifClient',
  },
  {
    key: 'page_video_to_mp3',
    component: 'video-to-mp3-client.tsx',
    pagePath: 'app/video-audio/video-to-mp3/page.tsx',
    componentName: 'VideoToMp3Client',
  },
  {
    key: 'page_mute_video',
    component: 'mute-video-client.tsx',
    pagePath: 'app/video-audio/mute-video/page.tsx',
    componentName: 'MuteVideoClient',
  },
  {
    key: 'page_video_frame_extractor',
    component: 'video-frame-extractor-client.tsx',
    pagePath: 'app/video-audio/video-frame-extractor/page.tsx',
    componentName: 'VideoFrameExtractorClient',
  },
  {
    key: 'page_audio_trimmer',
    component: 'audio-trimmer-client.tsx',
    pagePath: 'app/video-audio/audio-trimmer/page.tsx',
    componentName: 'AudioTrimmerClient',
  },
  // Image Tools (20)
  {
    key: 'page_background_remover',
    component: 'background-remover-client.tsx',
    pagePath: 'app/image/background-remover/page.tsx',
    componentName: 'BackgroundRemoverClient',
  },
  {
    key: 'page_image_compressor',
    component: 'image-compressor-client.tsx',
    pagePath: 'app/image/image-compressor/page.tsx',
    componentName: 'ImageCompressorClient',
  },
  {
    key: 'page_image_converter',
    component: 'image-converter-client.tsx',
    pagePath: 'app/image/image-converter/page.tsx',
    componentName: 'ImageConverterClient',
  },
  {
    key: 'page_social_image_resizer',
    component: 'social-image-resizer-client.tsx',
    pagePath: 'app/image/social-image-resizer/page.tsx',
    componentName: 'SocialImageResizerClient',
  },
  {
    key: 'page_watermark_remover',
    component: 'watermark-remover-client.tsx',
    pagePath: 'app/image/watermark-remover/page.tsx',
    componentName: 'WatermarkRemoverClient',
  },
  {
    key: 'page_favicon_generator',
    component: 'favicon-generator-client.tsx',
    pagePath: 'app/image/favicon-generator/page.tsx',
    componentName: 'FaviconGeneratorClient',
  },
  {
    key: 'page_color_palette_extractor',
    component: 'color-palette-extractor-client.tsx',
    pagePath: 'app/image/color-palette-extractor/page.tsx',
    componentName: 'ColorPaletteExtractorClient',
  },
  {
    key: 'page_thumbnail_generator',
    component: 'thumbnail-generator-client.tsx',
    pagePath: 'app/image/thumbnail-generator/page.tsx',
    componentName: 'ThumbnailGeneratorClient',
  },
  {
    key: 'page_crop_image',
    component: 'crop-image-client.tsx',
    pagePath: 'app/image/crop-image/page.tsx',
    componentName: 'CropImageClient',
  },
  {
    key: 'page_flip_image',
    component: 'flip-image-client.tsx',
    pagePath: 'app/image/flip-image/page.tsx',
    componentName: 'FlipImageClient',
  },
  {
    key: 'page_pixelate_image',
    component: 'pixelate-image-client.tsx',
    pagePath: 'app/image/pixelate-image/page.tsx',
    componentName: 'PixelateImageClient',
  },
  {
    key: 'page_black_and_white',
    component: 'black-and-white-client.tsx',
    pagePath: 'app/image/black-and-white/page.tsx',
    componentName: 'BlackAndWhiteClient',
  },
  {
    key: 'page_blur_image',
    component: 'blur-image-client.tsx',
    pagePath: 'app/image/blur-image/page.tsx',
    componentName: 'BlurImageClient',
  },
  {
    key: 'page_add_text_to_image',
    component: 'add-text-to-image-client.tsx',
    pagePath: 'app/image/add-text-to-image/page.tsx',
    componentName: 'AddTextToImageClient',
  },
  {
    key: 'page_add_border_to_image',
    component: 'add-border-to-image-client.tsx',
    pagePath: 'app/image/add-border-to-image/page.tsx',
    componentName: 'AddBorderToImageClient',
  },
  {
    key: 'page_combine_images',
    component: 'combine-images-client.tsx',
    pagePath: 'app/image/combine-images/page.tsx',
    componentName: 'CombineImagesClient',
  },
  {
    key: 'page_collage_maker',
    component: 'collage-maker-client.tsx',
    pagePath: 'app/image/collage-maker/page.tsx',
    componentName: 'CollageMakerClient',
  },
  {
    key: 'page_round_image_maker',
    component: 'round-image-client.tsx',
    pagePath: 'app/image/round-image-maker/page.tsx',
    componentName: 'RoundImageClient',
  },
  {
    key: 'page_image_metadata_viewer',
    component: 'image-metadata-viewer-client.tsx',
    pagePath: 'app/image/image-metadata-viewer/page.tsx',
    componentName: 'ImageMetadataViewerClient',
  },
  {
    key: 'page_icon_to_png',
    component: 'icon-to-png-client.tsx',
    pagePath: 'app/image/icon-to-png/page.tsx',
    componentName: 'IconToPngClient',
  },
  // PDF Tools (18)
  {
    key: 'page_merge_pdf',
    component: 'merge-pdf-client.tsx',
    pagePath: 'app/pdf/merge-pdf/page.tsx',
    componentName: 'MergePdfClient',
  },
  {
    key: 'page_split_pdf',
    component: 'split-pdf-client.tsx',
    pagePath: 'app/pdf/split-pdf/page.tsx',
    componentName: 'SplitPdfClient',
  },
  {
    key: 'page_rotate_pdf',
    component: 'rotate-pdf-client.tsx',
    pagePath: 'app/pdf/rotate-pdf/page.tsx',
    componentName: 'RotatePdfClient',
  },
  {
    key: 'page_pdf_to_jpg',
    component: 'pdf-to-jpg-client.tsx',
    pagePath: 'app/pdf/pdf-to-jpg/page.tsx',
    componentName: 'PdfToJpgClient',
  },
  {
    key: 'page_pdf_to_png',
    component: 'pdf-to-png-client.tsx',
    pagePath: 'app/pdf/pdf-to-png/page.tsx',
    componentName: 'PdfToPngClient',
  },
  {
    key: 'page_pdf_to_text',
    component: 'pdf-to-text-client.tsx',
    pagePath: 'app/pdf/pdf-to-text/page.tsx',
    componentName: 'PdfToTextClient',
  },
  {
    key: 'page_unlock_pdf',
    component: 'unlock-pdf-client.tsx',
    pagePath: 'app/pdf/unlock-pdf/page.tsx',
    componentName: 'UnlockPdfClient',
  },
  {
    key: 'page_protect_pdf',
    component: 'protect-pdf-client.tsx',
    pagePath: 'app/pdf/protect-pdf/page.tsx',
    componentName: 'ProtectPdfClient',
  },
  {
    key: 'page_pdf_page_numbers',
    component: 'pdf-page-numbers-client.tsx',
    pagePath: 'app/pdf/pdf-page-numbers/page.tsx',
    componentName: 'PdfPageNumbersClient',
  },
  {
    key: 'page_rearrange_pdf',
    component: 'rearrange-pdf-client.tsx',
    pagePath: 'app/pdf/rearrange-pdf/page.tsx',
    componentName: 'RearrangePdfClient',
  },
  {
    key: 'page_pdf_editor',
    component: 'pdf-editor-client.tsx',
    pagePath: 'app/pdf/pdf-editor/page.tsx',
    componentName: 'PdfEditorClient',
  },
  {
    key: 'page_images_to_pdf',
    component: 'images-to-pdf-client.tsx',
    pagePath: 'app/pdf/images-to-pdf/page.tsx',
    componentName: 'ImagesToPdfClient',
  },
  {
    key: 'page_delete_pdf_pages',
    component: 'delete-pdf-pages-client.tsx',
    pagePath: 'app/pdf/delete-pdf-pages/page.tsx',
    componentName: 'DeletePdfPagesClient',
  },
  {
    key: 'page_crop_pdf',
    component: 'crop-pdf-client.tsx',
    pagePath: 'app/pdf/crop-pdf/page.tsx',
    componentName: 'CropPdfClient',
  },
  {
    key: 'page_add_text_to_pdf',
    component: 'add-text-to-pdf-client.tsx',
    pagePath: 'app/pdf/add-text-to-pdf/page.tsx',
    componentName: 'AddTextToPdfClient',
  },
  {
    key: 'page_create_pdf',
    component: 'create-pdf-client.tsx',
    pagePath: 'app/pdf/create-pdf/page.tsx',
    componentName: 'CreatePdfClient',
  },
  {
    key: 'page_esign_pdf',
    component: 'esign-pdf-client.tsx',
    pagePath: 'app/pdf/esign-pdf/page.tsx',
    componentName: 'EsignPdfClient',
  },
  {
    key: 'page_pdf_watermark',
    component: 'pdf-watermark-client.tsx',
    pagePath: 'app/pdf/pdf-watermark/page.tsx',
    componentName: 'PdfWatermarkClient',
  },
  // File Tools (12)
  {
    key: 'page_csv_to_excel',
    component: 'csv-to-excel-client.tsx',
    pagePath: 'app/file/csv-to-excel/page.tsx',
    componentName: 'CsvToExcelClient',
  },
  {
    key: 'page_csv_to_json',
    component: 'csv-to-json-client.tsx',
    pagePath: 'app/file/csv-to-json/page.tsx',
    componentName: 'CsvToJsonClient',
  },
  {
    key: 'page_csv_to_xml',
    component: 'csv-to-xml-client.tsx',
    pagePath: 'app/file/csv-to-xml/page.tsx',
    componentName: 'CsvToXmlClient',
  },
  {
    key: 'page_excel_to_csv',
    component: 'excel-to-csv-client.tsx',
    pagePath: 'app/file/excel-to-csv/page.tsx',
    componentName: 'ExcelToCsvClient',
  },
  {
    key: 'page_excel_to_pdf',
    component: 'excel-to-pdf-client.tsx',
    pagePath: 'app/file/excel-to-pdf/page.tsx',
    componentName: 'ExcelToPdfClient',
  },
  {
    key: 'page_excel_to_xml',
    component: 'excel-to-xml-client.tsx',
    pagePath: 'app/file/excel-to-xml/page.tsx',
    componentName: 'ExcelToXmlClient',
  },
  {
    key: 'page_json_to_xml',
    component: 'json-to-xml-client.tsx',
    pagePath: 'app/file/json-to-xml/page.tsx',
    componentName: 'JsonToXmlClient',
  },
  {
    key: 'page_split_csv',
    component: 'split-csv-client.tsx',
    pagePath: 'app/file/split-csv/page.tsx',
    componentName: 'SplitCsvClient',
  },
  {
    key: 'page_split_excel',
    component: 'split-excel-client.tsx',
    pagePath: 'app/file/split-excel/page.tsx',
    componentName: 'SplitExcelClient',
  },
  {
    key: 'page_xml_to_csv',
    component: 'xml-to-csv-client.tsx',
    pagePath: 'app/file/xml-to-csv/page.tsx',
    componentName: 'XmlToCsvClient',
  },
  {
    key: 'page_xml_to_excel',
    component: 'xml-to-excel-client.tsx',
    pagePath: 'app/file/xml-to-excel/page.tsx',
    componentName: 'XmlToExcelClient',
  },
  {
    key: 'page_xml_to_json',
    component: 'xml-to-json-client.tsx',
    pagePath: 'app/file/xml-to-json/page.tsx',
    componentName: 'XmlToJsonClient',
  },
  // Social/Text Tools (2)
  {
    key: 'page_hashtag_generator',
    component: 'hashtag-generator-client.tsx',
    pagePath: 'app/social-text/hashtag-generator/page.tsx',
    componentName: 'HashtagGeneratorClient',
  },
  {
    key: 'page_instagram_line_break',
    component: 'instagram-line-break-client.tsx',
    pagePath: 'app/social-text/instagram-line-break/page.tsx',
    componentName: 'InstagramLineBreakClient',
  },
  // Utility Tools (5)
  {
    key: 'page_qr_code_generator',
    component: 'qr-code-generator-client.tsx',
    pagePath: 'app/utility/qr-code-generator/page.tsx',
    componentName: 'QRCodeGeneratorClient',
  },
  {
    key: 'page_word_counter',
    component: 'word-counter-client.tsx',
    pagePath: 'app/utility/word-counter/page.tsx',
    componentName: 'WordCounterClient',
  },
  {
    key: 'page_youtube_thumbnail',
    component: 'youtube-thumbnail-client.tsx',
    pagePath: 'app/utility/youtube-thumbnail/page.tsx',
    componentName: 'YoutubeThumbnailClient',
  },
  {
    key: 'page_youtube_preview',
    component: 'youtube-preview-client.tsx',
    pagePath: 'app/utility/youtube-preview/page.tsx',
    componentName: 'YoutubePreviewClient',
  },
  {
    key: 'page_aspect_ratio_calculator',
    component: 'aspect-ratio-calculator-client.tsx',
    pagePath: 'app/utility/aspect-ratio-calculator/page.tsx',
    componentName: 'AspectRatioCalculatorClient',
  },
];

// ==========================================
// STEP 2: Extract strings from each component
// ==========================================

function extractStringsFromComponent(content) {
  const strings = {};
  let counter = 0;

  // Extract h1 text
  const h1Match = content.match(/<h1[^>]*>\s*\n?\s*([^<{]+?)\s*\n?\s*<\/h1>/);
  if (h1Match) strings.title = h1Match[1].trim();

  // Extract description (first p after h1)
  const descMatch = content.match(/<h1[^>]*>[\s\S]*?<\/h1>\s*\n?\s*<p[^>]*>\s*\n?\s*([^<{]+?)\s*\n?\s*<\/p>/);
  if (descMatch) strings.description = descMatch[1].trim();

  // Extract drag & drop text
  const dragMatch = content.match(/Drag & drop[^<]*/);
  if (dragMatch) strings.drag_drop = dragMatch[0].trim();

  // Extract "Supported:" text
  const supportedMatch = content.match(/Supported:[^<]*/);
  if (supportedMatch) strings.supported = supportedMatch[0].trim();

  // Extract max file size text
  const maxSizeMatch = content.match(/Recommended max file size:[^<]*/);
  if (maxSizeMatch) strings.max_file_size = maxSizeMatch[0].trim();

  return strings;
}

// ==========================================
// STEP 3: Update page.tsx files to pass dict
// ==========================================

function updatePageTsx(tool) {
  const pagePath = path.join(ROOT, tool.pagePath);
  if (!fs.existsSync(pagePath)) {
    console.log(`  SKIP: ${tool.pagePath} not found`);
    return false;
  }

  let content = fs.readFileSync(pagePath, 'utf8');

  // Check if dict is already passed to client component
  const componentRegex = new RegExp(`<${tool.componentName}\\s*/?>|<${tool.componentName}\\s+[^>]*/>`);
  const withoutDict = new RegExp(`<${tool.componentName}\\s*/>`);
  const withDict = new RegExp(`<${tool.componentName}\\s+dict=`);

  if (withDict.test(content)) {
    console.log(`  SKIP page: ${tool.pagePath} - dict already passed`);
    return false;
  }

  if (withoutDict.test(content)) {
    content = content.replace(
      new RegExp(`<${tool.componentName}\\s*/>`),
      `<${tool.componentName} dict={dict} />`
    );
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log(`  UPDATED page: ${tool.pagePath}`);
    return true;
  }

  // Try format without self-closing: <Component></Component> or <Component>
  const openTagRegex = new RegExp(`<${tool.componentName}>`);
  if (openTagRegex.test(content)) {
    content = content.replace(
      openTagRegex,
      `<${tool.componentName} dict={dict}>`
    );
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log(`  UPDATED page: ${tool.pagePath}`);
    return true;
  }

  console.log(`  WARNING: Could not find component tag in ${tool.pagePath}`);
  return false;
}

// ==========================================
// STEP 4: Update component to accept dict
// ==========================================

function updateComponentSignature(tool) {
  const componentPath = path.join(COMPONENTS_DIR, tool.component);
  if (!fs.existsSync(componentPath)) {
    console.log(`  SKIP: ${tool.component} not found`);
    return false;
  }

  let content = fs.readFileSync(componentPath, 'utf8');

  // Check if already has dict prop
  const hasDictProp = content.includes('{ dict }') || content.includes('{ dict?') || content.includes('{dict}') || content.includes('{ dict:');

  if (!hasDictProp) {
    // Add dict prop to function signature
    // Pattern: export function ComponentName() {
    const funcRegex = new RegExp(`export function ${tool.componentName}\\(\\)`);
    if (funcRegex.test(content)) {
      content = content.replace(
        funcRegex,
        `export function ${tool.componentName}({ dict }: { dict?: any })`
      );
    }
  }

  // Update optional dict prop to required
  if (content.includes('{ dict?: any }') || content.includes('dict?: any')) {
    // Keep as optional for now - it's fine
  }

  fs.writeFileSync(componentPath, content, 'utf8');
  return true;
}

// ==========================================
// Main execution
// ==========================================

console.log('=== i18n Transformation Script ===');
console.log(`Processing ${TOOLS.length} tools...\n`);

let pagesUpdated = 0;
let componentsUpdated = 0;

for (const tool of TOOLS) {
  console.log(`\n--- ${tool.key} ---`);

  // Step 1: Update page.tsx to pass dict
  if (updatePageTsx(tool)) pagesUpdated++;

  // Step 2: Update component signature to accept dict
  if (updateComponentSignature(tool)) componentsUpdated++;
}

console.log(`\n=== Summary ===`);
console.log(`Pages updated: ${pagesUpdated}`);
console.log(`Components updated: ${componentsUpdated}`);
console.log('\nDone! Now run the dict insertion script.');
