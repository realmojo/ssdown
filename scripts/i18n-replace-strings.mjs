#!/usr/bin/env node
/**
 * Replace hardcoded English strings in client components with dict?.xxx?.key || "fallback" pattern.
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, 'components/client');

const TOOLS = [
  { slug: 'gif-to-mp4', dictKey: 'gif_to_mp4' },
  { slug: 'trim-video', dictKey: 'trim_video' },
  { slug: 'mute-video', dictKey: 'mute_video' },
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

// Load dictionaries to get the English text for each key
const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'dictionaries/en.json'), 'utf8'));

function replaceStrings(slug, dictKey) {
  const filePath = path.join(COMPONENTS_DIR, slug + '-client.tsx');
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  const dictData = en[dictKey];
  if (!dictData) {
    console.log(`  SKIP ${slug}: no dict data for ${dictKey}`);
    return 0;
  }

  const d = `dict?.${dictKey}`;
  let replacements = 0;

  // Helper: replace a JSX text node wrapped in element tags
  // Pattern: >WHITESPACE text WHITESPACE<
  function replaceJSXText(text, key) {
    // Escape special regex characters in text
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Replace text between tags: >  text  <
    const regex = new RegExp(`(>\\s*\\n?\\s*)${escaped}(\\s*\\n?\\s*<)`, 'g');
    const before = content;
    content = content.replace(regex, `$1{${d}?.${key} || "${text}"}$2`);
    if (content !== before) {
      replacements++;
      return true;
    }
    return false;
  }

  // Helper: replace text in an object literal property: title: "text"
  function replaceObjProp(propName, text, key) {
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${propName}:\\s*)"${escaped}"`, 'g');
    const before = content;
    content = content.replace(regex, `$1${d}?.${key} || "${text}"`);
    if (content !== before) {
      replacements++;
      return true;
    }
    return false;
  }

  // === Replace h1 title ===
  if (dictData.title) {
    replaceJSXText(dictData.title, 'title');
  }

  // === Replace subtitle/description ===
  if (dictData.subtitle) {
    replaceJSXText(dictData.subtitle, 'subtitle');
  }

  // === Replace drop zone text ===
  if (dictData.drop_zone) {
    replaceJSXText(dictData.drop_zone, 'drop_zone');
  }

  // === Replace supported formats ===
  if (dictData.supported) {
    replaceJSXText(dictData.supported, 'supported');
  }

  // === Replace max file size ===
  if (dictData.max_file_size) {
    replaceJSXText(dictData.max_file_size, 'max_file_size');
  }

  // === Replace loading engine text ===
  if (dictData.loading_engine) {
    replaceJSXText(dictData.loading_engine, 'loading_engine');
  }

  // === Replace processing text ===
  if (dictData.processing) {
    replaceJSXText(dictData.processing, 'processing');
  }

  // === Replace action button text ===
  if (dictData.action_btn) {
    replaceJSXText(dictData.action_btn, 'action_btn');
  }

  // === Replace success message ===
  if (dictData.success_msg) {
    replaceJSXText(dictData.success_msg, 'success_msg');
  }

  // === Replace download button text ===
  if (dictData.download_btn) {
    replaceJSXText(dictData.download_btn, 'download_btn');
  }

  // === Replace "another" button text ===
  if (dictData.another_btn) {
    replaceJSXText(dictData.another_btn, 'another_btn');
  }

  // === Replace guide title ===
  if (dictData.guide_title) {
    replaceJSXText(dictData.guide_title, 'guide_title');
  }

  // === Replace guide description ===
  if (dictData.guide_desc) {
    replaceJSXText(dictData.guide_desc, 'guide_desc');
  }

  // === Replace step titles and descriptions ===
  for (let i = 1; i <= 3; i++) {
    if (dictData[`step${i}_title`]) {
      replaceObjProp('title', dictData[`step${i}_title`], `step${i}_title`);
    }
    if (dictData[`step${i}_desc`]) {
      replaceObjProp('desc', dictData[`step${i}_desc`], `step${i}_desc`);
    }
  }

  // === Replace tips title ===
  if (dictData.tips_title) {
    replaceJSXText(dictData.tips_title, 'tips_title');
  }

  // === Replace tips description ===
  if (dictData.tips_desc) {
    replaceJSXText(dictData.tips_desc, 'tips_desc');
  }

  // === Replace tip titles and descriptions ===
  for (let i = 1; i <= 6; i++) {
    if (dictData[`tip${i}_title`]) {
      replaceObjProp('title', dictData[`tip${i}_title`], `tip${i}_title`);
    }
    if (dictData[`tip${i}_desc`]) {
      replaceObjProp('desc', dictData[`tip${i}_desc`], `tip${i}_desc`);
    }
  }

  // === Replace FAQ title ===
  if (dictData.faq_title) {
    replaceJSXText(dictData.faq_title, 'faq_title');
  }

  // === Replace FAQ description ===
  if (dictData.faq_desc) {
    replaceJSXText(dictData.faq_desc, 'faq_desc');
  }

  // === Replace FAQ Q&A items ===
  for (let i = 1; i <= 10; i++) {
    if (dictData[`faq_${i}_q`]) {
      replaceJSXText(dictData[`faq_${i}_q`], `faq_${i}_q`);
    }
    if (dictData[`faq_${i}_a`]) {
      replaceJSXText(dictData[`faq_${i}_a`], `faq_${i}_a`);
    }
  }

  // === Replace "X% complete" pattern ===
  const completePattern = /(\{progress\}% )complete/g;
  if (completePattern.test(content)) {
    content = content.replace(completePattern, `$1{${d}?.complete || "complete"}`);
    replacements++;
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return replacements;
}

console.log('=== Replacing hardcoded strings in client components ===\n');

let totalReplacements = 0;
for (const tool of TOOLS) {
  const count = replaceStrings(tool.slug, tool.dictKey);
  console.log(`${tool.slug}: ${count} replacements`);
  totalReplacements += count;
}

console.log(`\nTotal replacements: ${totalReplacements}`);
