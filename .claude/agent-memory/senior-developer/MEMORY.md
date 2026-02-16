# SSDown Project Memory

## Project Architecture

### Tech Stack
- Next.js 16 with App Router
- React 19, TypeScript (strict mode)
- Tailwind CSS v4
- Supabase for backend
- Path alias: `@/*` maps to project root

### Key Patterns

#### Tool Implementation Pattern
When adding new tools to `/tools/*`, follow this sequence:
1. Update `dictionaries/en.json` with tool-specific sections
2. Create client component in `components/client/[tool-name]-client.tsx`
3. Create page in `app/tools/[tool-name]/page.tsx` with metadata & Schema.org
4. Add tool card to `app/tools/page.tsx` tools array
5. Add sitemap entry to `app/sitemap.ts`

#### Client Component Structure (Browser-based Tools)
- Use `"use client"` directive
- Multi-file support with drag & drop
- State management: idle | processing | done | error
- Canvas API for image/video processing
- JSZip for batch downloads
- Radix UI for accessible components (Accordion, Slider, Select)
- Lucide icons throughout
- Responsive + dark mode support

#### Page Component Structure (Server Components)
- `generateMetadata()` for SEO
- FAQ Schema.org structured data
- Breadcrumb Schema.org structured data
- Breadcrumbs component rendering
- Client component with dictionary prop

### File Size Limits
- Image tools: 10MB recommended max
- Video tools: 500MB recommended max (browser memory constraints)

### i18n / Dictionary Pattern (Updated Feb 2026)
- **Locale type**: `"en" | "kr"` in `/lib/i18n-utils.ts` (no server-only, Edge-compatible)
- **Detection flow**: Middleware reads `ssdown-locale` cookie -> IP headers (CF-IPCountry) -> sets `x-user-locale` header + cookie (1yr)
- **Server-side**: `getLocale()` from `/lib/get-locale.ts` reads header
- **Loading**: `getDictionary(locale)` with deep-merge fallback (kr.json over en.json)
- **Client switching**: `LanguageSwitcher` component sets cookie + reloads
- **Pattern**: All pages call `const locale = await getLocale()` then `getDictionary(locale)`
- **kr.json**: Main sections translated; tool pages fallback to en automatically
- Fallback text in components for missing keys: `dict?.section?.key || "Fallback"`

### Common Components
- `components/ui/button`, `card`, `accordion`, `slider`, `select`
- `components/breadcrumbs` for navigation
- Utility: `lib/utils.ts` exports `cn()` for className merging

### SSR & Browser APIs
- Always wrap `document` or `window` access in `useEffect` to avoid SSR errors
- Use dynamic imports for large libraries (heic2any, gifshot) to reduce bundle size
- Create `.d.ts` files in `/types` for untyped npm packages

## Recent Implementations

### Image Converter Extended (2026-02-12)
- Location: `/image/image-converter`
- Added 5 new format conversions:
  1. **AVIF support**: Canvas toBlob with browser detection & warning UI
  2. **SVG → PNG**: Canvas drawImage after SVG loaded as Image
  3. **GIF → JPG**: First frame extraction with white background
  4. **→ GIF**: gifshot library (dynamic import)
  5. **HEIC → JPG/PNG**: heic2any library (dynamic import)
- Type declaration: `/types/gifshot.d.ts` for untyped library
- Format support: PNG, JPG, WebP, AVIF, GIF (+ input: SVG, HEIC)
- AVIF browser detection with yellow warning card if unsupported
- Helper functions for each conversion type with error handling
- All existing functionality preserved (batch, ZIP download)

### Color Palette Extractor (2026-02-12)
- Location: `/tools/color-palette-extractor`
- k-means clustering algorithm for color extraction (implemented in-component)
- Image resized to 200x200 for performance before pixel analysis
- Color count slider: 3-12 colors
- Outputs: HEX, RGB, HSL codes with copy-to-clipboard
- Shows color percentage (dominance in image)
- Download palette as PNG image feature
- No external ML libraries - pure JavaScript k-means implementation
- k-means++ initialization for better centroid selection
- Max 20 iterations with early convergence detection

### Image Compressor (2026-02-12)
- Location: `/tools/image-compressor`
- Canvas API compression with quality slider (1-100)
- Batch processing with individual/ZIP download
- Format support: PNG, JPEG, WebP
- Note: PNG compression is lossless (quality param has minimal effect)
- Before/after file size comparison with savings percentage

### PDF Tools Suite (2026-02-12)
- 7 total PDF tools: merge, rotate, create, images-to-pdf, pdf-to-jpg, pdf-to-png, pdf-editor
- All use red-600 color scheme, consistent UI pattern
- `pdf-lib` for creation/editing, `pdfjs-dist` for rendering pages to canvas
- WebP images require canvas conversion before pdf-lib embedding (only PNG/JPG native)
- pdfjs-dist worker loaded via CDN: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`
- PDF editor uses tab UI (Pages | Add Text | Add Image) with coordinate-based positioning
- File size limit: 50MB for PDF files, 20MB for images (images-to-pdf), 10MB (editor images)
