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

### Flip Image Tool (2026-02-12)
- **Files**: `/components/client/flip-image-client.tsx`, `/app/image/flip-image/page.tsx`
- **Status**: ✅ PASS (no lint or build errors)
- **Notes**: New image manipulation tool using canvas API. All imports properly used, no TypeScript errors. Route successfully registered at `/image/flip-image`.

## Last Updated
2026-02-12
