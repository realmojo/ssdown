# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SSDown (ssdown.app) is a Next.js 16 web application for downloading videos from social media platforms (X/Twitter, TikTok, Instagram, Facebook, Dailymotion, 9GAG) and YouTube tools (preview, thumbnail). It also has a blog/content system backed by Supabase.

## Commands

- `npm run dev` — Start dev server (sources ~/.bashrc first)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run migrate:posts` — Migrate blog posts to Supabase (`tsx scripts/migrate-posts-to-supabase.ts`)

## Tech Stack

- **Next.js 16** with App Router, React 19, TypeScript (strict mode)
- **Tailwind CSS v4** with `@tailwindcss/typography`
- **Supabase** for blog posts (`ssdown_blogs` table) and contact form (`ssdown_contacts` table)
- **Radix UI** for accessible components (accordion, select, dropdown-menu, etc.)
- **Turbopack** enabled for dev
- Path alias: `@/*` maps to project root

## Architecture

### API Routes (Edge Runtime)

All video downloader API routes use `export const runtime = "edge"`. Each platform has two routes:
- `app/api/{platform}/route.ts` — Fetches video metadata (accepts `?url=` query param, returns normalized `VideoResponse`)
- `app/api/{platform}/download/route.ts` — Proxies the actual video download

Platforms: `x`, `tiktok`, `instagram`, `facebook`, `dailymotion`, `9gag`. YouTube has `info`, `preview`, and `thumbnail` sub-routes instead.

### Shared Video Downloader UI

`components/client/video-downloader-client.tsx` is the **reusable downloader component** used by all platform pages. Each platform page (e.g., `components/client/x-client.tsx`) wraps it with platform-specific config: theme colors, API endpoints, stats layout, and FAQ section. The `VideoDownloaderClient` accepts a `ThemeConfig` for visual customization per platform.

### Page Structure

- Server components (`app/{platform}/page.tsx`) handle metadata/SEO and render client components
- Client components (`components/client/{platform}-client.tsx`) contain interactive UI
- Static pages under `app/(static)/` for about, contact, privacy, terms

### i18n

Dictionary-based: `dictionaries/en.json` loaded via `lib/get-dictionary.ts` (server-only). Blog posts store `title`, `excerpt`, and `content` as `Record<string, string>` (keyed by language code). Only `en` and `kr` are supported; other languages fall back to `en`.

### Blog System

Posts are stored in Supabase (`ssdown_blogs` table) and queried via `lib/blog-utils.ts`. Static post definitions exist in `lib/posts/*.ts` for migration purposes. Blog content is rendered as markdown via `react-markdown`.

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side, used for elevated Supabase access)

## Key Patterns

- API responses follow a normalized shape: `{ type, id, user, content, thumbnail, videoItems[], stats, createdAt }`
- `lib/utils.ts` exports `cn()` (clsx + tailwind-merge) and `getQualityForBitrate()` for X/Twitter video quality labels
- Production builds strip `console.log`/`console.info` (keeps `error` and `warn`) via `next.config.ts` compiler settings
- `htmlLimitedBots` is set to match all user agents in `next.config.ts`
