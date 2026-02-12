# Plan Architect Memory

## Project Structure Patterns

### Tool Implementation Pattern
SSDown 도구들은 일관된 4-level 구조를 따름:
- 경로: `/app/[category]/[tool-name]/page.tsx` (server) + `/components/client/[tool-name]-client.tsx` (client)
- Breadcrumbs: Home > Tools > [Category] > [Tool Name]
- 각 도구는 SEO (metadata), Schema.org (FAQ + Breadcrumb), 독립된 client 컴포넌트 구성

### Client Component Structure (image tools)
1. 상태: imageSrc, fileName, isDragging, 결과 URL, 파일 input ref
2. 드래그&드롭 + 클릭 업로드 (20MB 제한)
3. Canvas API 처리 (useCallback hooks)
4. 다운로드 (link.download)
5. Sample image 버튼 (`/test-image.jpg`)
6. 3-section layout: How-to (3 steps), Tips (4 items), FAQ (5 items)
7. Card, Button, Accordion은 `@/components/ui/`에서 import

### 파일 등록 체크리스트
- `app/[category]/[tool]/page.tsx`: Server component with metadata + schemas
- `components/client/[tool]-client.tsx`: Client component
- `app/tools/[category]/page.tsx`: 카테고리 페이지에 카드 추가 (tools 배열)
- `app/tools/page.tsx`: 카테고리 count 증가
- `app/sitemap.ts`: URL 추가 (lastModified: "2026-02-12")
- `next.config.ts`: 301 redirect 추가 (`/tools/[name]` → `/[category]/[name]`)
- `components/site-header.tsx`: 네비게이션 드롭다운에 추가

### 기술 스택 및 규칙
- Next.js 16 (App Router, React 19, TypeScript strict)
- `"use client"` 지시문 필요 (client components)
- `@next/next/no-img-element` 비활성화됨 (img 태그 사용 가능)
- lucide-react icons
- Canvas API for image processing
- React hooks (useState, useRef, useCallback)

### 색상 패턴 (카테고리별)
- Flip Image: sky-600/teal-600 (FlipHorizontal icon)
- Crop Image: orange-600 (Crop icon)
- Pixelate Image: 보라색 계열 추천 (적절한 icon 선택)
