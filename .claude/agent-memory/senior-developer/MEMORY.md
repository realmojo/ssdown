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

### Dictionary Pattern
- Server-only via `lib/get-dictionary.ts`
- Fallback text in components for missing keys
- Nested structure: `dict?.section?.key || "Fallback"`

### Common Components
- `components/ui/button`, `card`, `accordion`, `slider`, `select`
- `components/breadcrumbs` for navigation
- Utility: `lib/utils.ts` exports `cn()` for className merging

## Recent Implementations

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
