#!/usr/bin/env node
/**
 * Full i18n Transformation Script
 *
 * Reads each client component, extracts ALL hardcoded English text,
 * generates dictionary entries for en.json and kr.json,
 * and modifies the component to use dict?.xxx?.key || "fallback" pattern.
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, 'components/client');
const EN_PATH = path.join(ROOT, 'dictionaries/en.json');
const KR_PATH = path.join(ROOT, 'dictionaries/kr.json');

// ==========================================
// Tools that need full i18n
// ==========================================
const TOOLS_NEEDING_I18N = [
  // Video/Audio
  { slug: 'gif-to-mp4', dictKey: 'gif_to_mp4' },
  { slug: 'trim-video', dictKey: 'trim_video' },
  { slug: 'mute-video', dictKey: 'mute_video' },
  // Image
  { slug: 'crop-image', dictKey: 'crop_image' },
  { slug: 'flip-image', dictKey: 'flip_image' },
  { slug: 'pixelate-image', dictKey: 'pixelate_image' },
  { slug: 'black-and-white', dictKey: 'black_and_white' },
  { slug: 'blur-image', dictKey: 'blur_image' },
  { slug: 'add-text-to-image', dictKey: 'add_text_to_image' },
  { slug: 'add-border-to-image', dictKey: 'add_border_to_image' },
  { slug: 'combine-images', dictKey: 'combine_images' },
  { slug: 'collage-maker', dictKey: 'collage_maker' },
  { slug: 'round-image', dictKey: 'round_image' },
  { slug: 'image-metadata-viewer', dictKey: 'image_metadata_viewer' },
  // PDF
  { slug: 'merge-pdf', dictKey: 'merge_pdf' },
  { slug: 'split-pdf', dictKey: 'split_pdf' },
  { slug: 'rotate-pdf', dictKey: 'rotate_pdf' },
  { slug: 'pdf-to-jpg', dictKey: 'pdf_to_jpg' },
  { slug: 'pdf-to-png', dictKey: 'pdf_to_png' },
  { slug: 'pdf-to-text', dictKey: 'pdf_to_text' },
  { slug: 'unlock-pdf', dictKey: 'unlock_pdf' },
  { slug: 'protect-pdf', dictKey: 'protect_pdf' },
  { slug: 'pdf-page-numbers', dictKey: 'pdf_page_numbers' },
  { slug: 'rearrange-pdf', dictKey: 'rearrange_pdf' },
  { slug: 'pdf-editor', dictKey: 'pdf_editor' },
  { slug: 'images-to-pdf', dictKey: 'images_to_pdf' },
  { slug: 'delete-pdf-pages', dictKey: 'delete_pdf_pages' },
  { slug: 'crop-pdf', dictKey: 'crop_pdf' },
  { slug: 'add-text-to-pdf', dictKey: 'add_text_to_pdf' },
  { slug: 'create-pdf', dictKey: 'create_pdf' },
  { slug: 'esign-pdf', dictKey: 'esign_pdf' },
  { slug: 'pdf-watermark', dictKey: 'pdf_watermark' },
  // File
  { slug: 'csv-to-excel', dictKey: 'csv_to_excel' },
  { slug: 'csv-to-json', dictKey: 'csv_to_json' },
  { slug: 'csv-to-xml', dictKey: 'csv_to_xml' },
  { slug: 'excel-to-csv', dictKey: 'excel_to_csv' },
  { slug: 'excel-to-pdf', dictKey: 'excel_to_pdf' },
  { slug: 'excel-to-xml', dictKey: 'excel_to_xml' },
  { slug: 'json-to-xml', dictKey: 'json_to_xml' },
  { slug: 'split-csv', dictKey: 'split_csv' },
  { slug: 'split-excel', dictKey: 'split_excel' },
  { slug: 'xml-to-csv', dictKey: 'xml_to_csv' },
  { slug: 'xml-to-excel', dictKey: 'xml_to_excel' },
  { slug: 'xml-to-json', dictKey: 'xml_to_json' },
];

// Also handle the 3 partially i18n'd ones that need dict entries
const TOOLS_NEEDING_DICT_ONLY = [
  { slug: 'background-remover', dictKey: 'background_remover' },
  { slug: 'icon-to-png', dictKey: 'icon_to_png' },
  { slug: 'word-counter', dictKey: 'word_counter' },
];

// ==========================================
// String extraction from component
// ==========================================

function extractStrings(content) {
  const strings = {};

  // Extract h1 - could be plain text or already dict pattern
  let h1Match = content.match(/<h1[^>]*>\s*\n?\s*([^<{]+?)\s*\n?\s*<\/h1>/);
  if (h1Match) strings.title = h1Match[1].trim();

  // Extract subtitle/description (first p after h1)
  let descMatch = content.match(/<\/h1>\s*\n?\s*<p[^>]*>\s*\n?\s*([^<{]+?)\s*\n?\s*<\/p>/);
  if (descMatch) strings.subtitle = descMatch[1].trim();

  // Extract drop zone text
  let dragMatch = content.match(/(Drag & drop[^"<]*)/);
  if (dragMatch) strings.drop_zone = dragMatch[1].trim();

  // Alternative drop zone patterns
  if (!strings.drop_zone) {
    let altDrag = content.match(/(Drag and drop[^"<]*)/);
    if (altDrag) strings.drop_zone = altDrag[1].trim();
  }

  // Supported formats
  let supportedMatch = content.match(/(Supported:[^"<]*)/);
  if (supportedMatch) strings.supported = supportedMatch[1].trim();

  // Max file size
  let maxSizeMatch = content.match(/(Recommended max file size:[^"<]*)/);
  if (maxSizeMatch) strings.max_file_size = maxSizeMatch[1].trim();
  if (!strings.max_file_size) {
    let altMax = content.match(/(Max file size:[^"<]*)/);
    if (altMax) strings.max_file_size = altMax[1].trim();
  }

  // Loading engine text
  let loadingMatch = content.match(/(Loading (?:converter|processing) engine[^"<]*)/);
  if (loadingMatch) strings.loading_engine = loadingMatch[1].trim();

  // Converting/Processing text
  let convertingMatch = content.match(/(Converting\.\.\.|Processing\.\.\.|Removing audio\.\.\.|Trimming\.\.\.|Merging\.\.\.|Splitting\.\.\.)/);
  if (convertingMatch) strings.processing = convertingMatch[1].trim();

  // Convert/Process button text
  let convertBtnMatch = content.match(/(Convert to \w+|Remove Audio|Trim Video|Merge PDFs?|Split PDF|Rotate PDF|Convert PDF|Unlock PDF|Protect PDF|Add Page Numbers|Rearrange Pages|Edit PDF|Create PDF|Sign PDF|Add Watermark|Convert to \w+|Extract Frames?|Trim Audio|Mute Video|Remove Background|Compress|Generate|Extract)/);
  if (convertBtnMatch) strings.action_btn = convertBtnMatch[1].trim();

  // Success message
  let successMatch = content.match(/(Conversion Complete!|Audio Removed Successfully!|Processing Complete!|Merge Complete!|Split Complete!|Rotation Complete!|Conversion Complete|Unlock[a-z ]+ Complete|Protection Complete|Done|Complete!?)/);
  if (successMatch) strings.success_msg = successMatch[1].trim();

  // Download button
  let downloadMatch = content.match(/(Download \w[\w\s]*?)(?:\s*<|")/);
  if (downloadMatch) strings.download_btn = downloadMatch[1].trim();

  // "Do Another" button
  let anotherMatch = content.match(/(Convert Another|Mute Another|Trim Another|Merge Another|Process Another|Try Another|Upload Another|Start Over|Reset)/);
  if (anotherMatch) strings.another_btn = anotherMatch[1].trim();

  // How-to section title
  let howToTitleMatch = content.match(/(How to [^"<]*?)(?:\s*\n|\s*<)/);
  if (howToTitleMatch) strings.guide_title = howToTitleMatch[1].trim();

  // How-to description
  let howToDescMatch = content.match(/How to[\s\S]*?<\/h2>\s*\n?\s*<p[^>]*>\s*\n?\s*([^<{]+?)\s*\n?\s*<\/p>/);
  if (howToDescMatch) strings.guide_desc = howToDescMatch[1].trim();

  // Step titles and descriptions (from the array pattern)
  const stepPattern = /step:\s*(\d+),\s*\n?\s*title:\s*"([^"]+)",\s*\n?\s*desc:\s*"([^"]+)"/g;
  let stepMatch;
  while ((stepMatch = stepPattern.exec(content)) !== null) {
    const stepNum = stepMatch[1];
    strings[`step${stepNum}_title`] = stepMatch[2];
    strings[`step${stepNum}_desc`] = stepMatch[3];
  }

  // Tips section title
  let tipsTitleMatch = content.match(/(?:Tips|Best Practices)[^"<]*?(?=\s*\n|\s*<\/h2)/);
  // Broader match
  let tipsSectionMatch = content.match(/<h2[^>]*>\s*\n?\s*([^<]*(?:Tips|Best Practices)[^<]*?)\s*\n?\s*<\/h2>/);
  if (tipsSectionMatch) strings.tips_title = tipsSectionMatch[1].trim();

  // Tips description
  let tipsDescMatch = content.match(/(?:Tips|Best Practices)[\s\S]*?<\/h2>\s*\n?\s*<p[^>]*>\s*\n?\s*([^<{]+?)\s*\n?\s*<\/p>/);
  if (tipsDescMatch) strings.tips_desc = tipsDescMatch[1].trim();

  // Tip items (from array pattern)
  const tipPattern = /title:\s*"([^"]+)",\s*\n?\s*desc:\s*"([^"]+)",\s*\n?\s*icon:/g;
  let tipMatch;
  let tipIdx = 1;
  // Reset lastIndex since we're reusing content
  while ((tipMatch = tipPattern.exec(content)) !== null) {
    // Skip step items (already captured)
    if (strings[`step${tipIdx}_title`] === tipMatch[1]) continue;
    strings[`tip${tipIdx}_title`] = tipMatch[1];
    strings[`tip${tipIdx}_desc`] = tipMatch[2];
    tipIdx++;
  }

  // FAQ section title
  let faqTitleMatch = content.match(/<h2[^>]*>\s*\n?\s*([^<]*FAQ[^<]*?)\s*\n?\s*<\/h2>/);
  if (faqTitleMatch) strings.faq_title = faqTitleMatch[1].trim();

  // FAQ description
  let faqDescMatch = content.match(/FAQ[\s\S]*?<\/h2>\s*\n?\s*<p[^>]*>\s*\n?\s*([^<{]+?)\s*\n?\s*<\/p>/);
  if (faqDescMatch) strings.faq_desc = faqDescMatch[1].trim();

  // FAQ items
  const faqQPattern = /<AccordionTrigger[^>]*>\s*\n?\s*([^<{]+?)\s*\n?\s*<\/AccordionTrigger>/g;
  const faqAPattern = /<AccordionContent[^>]*>\s*\n?\s*([^<{]+?)\s*\n?\s*<\/AccordionContent>/g;
  let faqQ, faqA;
  let faqIdx = 1;
  while ((faqQ = faqQPattern.exec(content)) !== null) {
    strings[`faq_${faqIdx}_q`] = faqQ[1].trim();
    faqIdx++;
  }
  faqIdx = 1;
  while ((faqA = faqAPattern.exec(content)) !== null) {
    strings[`faq_${faqIdx}_a`] = faqA[1].trim();
    faqIdx++;
  }

  // Progress text pattern
  let progressMatch = content.match(/(\d+)% complete/);
  if (progressMatch) strings.has_progress = true;

  return strings;
}

// ==========================================
// Main
// ==========================================

const en = JSON.parse(fs.readFileSync(EN_PATH, 'utf8'));
const kr = JSON.parse(fs.readFileSync(KR_PATH, 'utf8'));

let totalStrings = 0;

for (const tool of TOOLS_NEEDING_I18N) {
  const filePath = path.join(COMPONENTS_DIR, tool.slug + '-client.tsx');
  const content = fs.readFileSync(filePath, 'utf8');
  const strings = extractStrings(content);

  console.log(`\n=== ${tool.slug} (${tool.dictKey}) ===`);
  const keyCount = Object.keys(strings).filter(k => k !== 'has_progress').length;
  totalStrings += keyCount;
  console.log(`  Extracted ${keyCount} strings`);

  for (const [key, value] of Object.entries(strings)) {
    if (key !== 'has_progress') {
      console.log(`  ${key}: ${String(value).substring(0, 60)}`);
    }
  }
}

console.log(`\n\nTotal strings extracted: ${totalStrings}`);
