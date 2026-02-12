# Code Quality Guard - Agent Memory

## Common Lint Patterns

### Unused Imports
- **Pattern**: Components importing icons from `lucide-react` that are never used
- **Files affected**: Client components in `/components/client/`
- **Fix**: Remove unused imports from the import statement

### Unused Dictionary Import
- **Pattern**: Category pages importing `getDictionary()` but not using the `dict` variable
- **Files affected**: Category pages in `/app/tools/{category}/page.tsx`
- **Fix**: Remove both the `getDictionary` import and `const dict = await getDictionary()` line, also change component from `async function` to regular `function`
- **Example**: Fixed in image, video-audio, youtube, social-text, utility category pages (2026-02-12 route restructure)

### Lambda Function Parameters
- **Pattern**: AWS Lambda handlers with unused `_context` parameter (required by signature)
- **Files**: `/lambda/*/index.mjs` files
- **Fix**: Add `// eslint-disable-next-line @typescript-eslint/no-unused-vars` comment above handler
- **Rationale**: The `_context` parameter is part of the AWS Lambda streamifyResponse signature and cannot be removed

### Unused Variables
- **Pattern**: Destructured variables like `const { data, error }` where `data` is never used
- **Fix**: Remove unused destructured variable: `const { error }`

## Build Issues

### Missing Dependencies
- **Issue**: `@ffmpeg/ffmpeg` and `@ffmpeg/util` packages may not be installed
- **Solution**: Run `npm install --legacy-peer-deps` to install all dependencies
- **Note**: Standard `npm install` can hang - use `--legacy-peer-deps` flag if issues occur

### Missing Module Files
- **Pattern**: Import statements referencing non-existent TypeScript files in `/scripts/` and `/lib/posts/`
- **Common files**: `restored-posts-part2.ts`, `digital-archiving-ethics-2025.ts`
- **Fix**: Remove imports and references to missing files from seed scripts

## Project-Specific Conventions

### File Locations
- **Client components**: `/components/client/`
- **Lambda functions**: `/lambda/{platform}/index.mjs`
- **Blog posts**: `/lib/posts/*.ts`
- **Seed scripts**: `/scripts/`

### Build Process
- Lint command: `npm run lint` (ESLint)
- Build command: `npm run build` (Next.js production build with TypeScript strict mode)
- Next.js version: 16.1.6 with Turbopack
- TypeScript: Strict mode enabled

## Recurring Issues to Watch

1. **New icon imports** - Check for unused icon imports when reviewing client components
2. **Lambda handler signature** - Context parameter warnings will appear for any new Lambda handlers
3. **Seed script imports** - Verify all imported post files exist before running build
4. **FFmpeg dependencies** - May need reinstall if node_modules is cleared
5. **useEffect dependencies** - When useEffect hooks call functions defined with useCallback, ensure those callbacks are in the dependency array

## Recent Quality Checks

### Image Metadata Viewer Tool (2026-02-12)
- **Files**: `/components/client/image-metadata-viewer-client.tsx`, `/app/image/image-metadata-viewer/page.tsx`
- **Status**: ✅ PASS (no lint or build errors)
- **Notes**: New EXIF metadata viewer tool using `exifr` library. Displays camera info (Make, Model, Software), shooting settings (ISO, aperture, shutter speed, focal length, flash, white balance, exposure mode), date/time, GPS coordinates with Google Maps link, and all raw metadata. Includes drag-and-drop, sample image loading, copy-to-clipboard, and responsive two-column layout. Route successfully registered at `/image/image-metadata-viewer`. All imports properly used, no TypeScript errors. Includes FAQ schema, breadcrumbs, and comprehensive how-to section. Strict mode passed. Build time: 9.9s compile + 1.5s static generation.

### Pixelate Image Tool (2026-02-12)
- **Files**: `/components/client/pixelate-image-client.tsx`, `/app/image/pixelate-image/page.tsx`
- **Status**: ✅ PASS (no lint or build errors)
- **Notes**: New image pixelation tool using canvas API with adjustable pixel size (5-50px). All imports properly used, no TypeScript errors. Route successfully registered at `/image/pixelate-image`. Includes FAQ schema, breadcrumbs, and comprehensive how-to section.

### Flip Image Tool (2026-02-12)
- **Files**: `/components/client/flip-image-client.tsx`, `/app/image/flip-image/page.tsx`
- **Status**: ✅ PASS (no lint or build errors)
- **Notes**: New image manipulation tool using canvas API. All imports properly used, no TypeScript errors. Route successfully registered at `/image/flip-image`.

### Collage Maker Tool (2026-02-12)
- **Files**: `/components/client/collage-maker-client.tsx`, `/app/image/collage-maker/page.tsx`
- **Status**: ✅ PASS (one unused ref fixed)
- **Issues found**: Unused `previewCanvasRef` variable declaration
- **Fix applied**: Removed unused ref - only `canvasRef` and `fileInputRef` are needed
- **Notes**: Complex tool with 2-12 slot grid layouts, drag-and-drop, canvas-based collage generation. Route successfully registered at `/image/collage-maker`. Build compiles successfully with all TypeScript strict checks.

### Round Image Maker Tool (2026-02-12)
- **Files**: `/components/client/round-image-client.tsx`, `/app/image/round-image-maker/page.tsx`
- **Status**: ✅ PASS (no lint or build errors)
- **Notes**: New image tool for creating circular/rounded images with canvas API. Adjustable border radius (0-50% for rounded corners, 50% for perfect circle), optional background color for transparency, inline canvas logic in useEffect with NO useCallback (React Compiler handles optimization). All imports properly used, no TypeScript errors. Route successfully registered at `/image/round-image-maker`. Modified files include category pages and sitemap.

### Icon to PNG Tool (2026-02-12)
- **Files**: `/components/client/icon-to-png-client.tsx`, `/app/image/icon-to-png/page.tsx`
- **Status**: ✅ PASS (no lint or build errors)
- **Issues found**: None
- **Notes**: New icon conversion tool (~580 lines) with support for ICO, ICNS, and SVG formats. Converts to PNG with adjustable size (16-1024px) using canvas API. Handles multi-icon ICO files (shows all sizes), ICNS parsing with multiple image types, and SVG rendering. Includes inline canvas logic in useEffect (NO useCallback per React Compiler pattern). All imports properly used, no TypeScript strict mode errors. Route successfully registered at `/image/icon-to-png`. Modified files: tool category page (count 19→20), sitemap, header navigation, and added redirect in next.config.ts. Build time: 5.3s compile + 517.8ms static generation (69 pages total).

## Last Updated
2026-02-12
