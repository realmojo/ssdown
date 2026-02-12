import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-select",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-accordion",
    ],
  },
  htmlLimitedBots: /.*/, // This regex matches all user agents
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "**.instagram.com",
      },
      {
        protocol: "https",
        hostname: "scontent-*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.hdslb.com",
      },
    ],
    unoptimized: false,
  },
  // Optimize bundle sizes
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  // Turbopack configuration for Next.js 16
  turbopack: {},
  async redirects() {
    return [
      // Image tools
      { source: "/tools/image-compressor", destination: "/image/image-compressor", permanent: true },
      { source: "/tools/image-converter", destination: "/image/image-converter", permanent: true },
      { source: "/tools/social-image-resizer", destination: "/image/social-image-resizer", permanent: true },
      { source: "/tools/watermark-remover", destination: "/image/watermark-remover", permanent: true },
      { source: "/tools/favicon-generator", destination: "/image/favicon-generator", permanent: true },
      { source: "/tools/color-palette-extractor", destination: "/image/color-palette-extractor", permanent: true },
      { source: "/tools/thumbnail-generator", destination: "/image/thumbnail-generator", permanent: true },
      { source: "/tools/background-remover", destination: "/image/background-remover", permanent: true },
      { source: "/tools/crop-image", destination: "/image/crop-image", permanent: true },
      { source: "/tools/flip-image", destination: "/image/flip-image", permanent: true },
      { source: "/tools/pixelate-image", destination: "/image/pixelate-image", permanent: true },
      { source: "/tools/black-and-white", destination: "/image/black-and-white", permanent: true },
      { source: "/tools/add-text-to-image", destination: "/image/add-text-to-image", permanent: true },
      { source: "/tools/add-border-to-image", destination: "/image/add-border-to-image", permanent: true },
      { source: "/tools/combine-images", destination: "/image/combine-images", permanent: true },
      { source: "/tools/collage-maker", destination: "/image/collage-maker", permanent: true },
      { source: "/tools/round-image-maker", destination: "/image/round-image-maker", permanent: true },
      { source: "/tools/image-metadata-viewer", destination: "/image/image-metadata-viewer", permanent: true },
      { source: "/tools/blur-image", destination: "/image/blur-image", permanent: true },
      { source: "/tools/icon-to-png", destination: "/image/icon-to-png", permanent: true },
      // Video & Audio tools
      { source: "/tools/video-to-mp3", destination: "/video-audio/video-to-mp3", permanent: true },
      { source: "/tools/video-to-gif", destination: "/video-audio/video-to-gif", permanent: true },
      { source: "/tools/video-frame-extractor", destination: "/video-audio/video-frame-extractor", permanent: true },
      { source: "/tools/audio-trimmer", destination: "/video-audio/audio-trimmer", permanent: true },
      // YouTube tools (moved to utility)
      { source: "/tools/youtube-thumbnail", destination: "/utility/youtube-thumbnail", permanent: true },
      { source: "/tools/youtube-thumbnail/:id", destination: "/utility/youtube-thumbnail/:id", permanent: true },
      { source: "/tools/youtube-preview", destination: "/utility/youtube-preview", permanent: true },
      { source: "/tools/youtube-preview/:id", destination: "/utility/youtube-preview/:id", permanent: true },
      { source: "/youtube/youtube-thumbnail", destination: "/utility/youtube-thumbnail", permanent: true },
      { source: "/youtube/youtube-thumbnail/:id", destination: "/utility/youtube-thumbnail/:id", permanent: true },
      { source: "/youtube/youtube-preview", destination: "/utility/youtube-preview", permanent: true },
      { source: "/youtube/youtube-preview/:id", destination: "/utility/youtube-preview/:id", permanent: true },
      { source: "/tools/youtube", destination: "/tools/utility", permanent: true },
      // Social & Text tools
      { source: "/tools/hashtag-generator", destination: "/social-text/hashtag-generator", permanent: true },
      { source: "/tools/instagram-line-break", destination: "/social-text/instagram-line-break", permanent: true },
      // Utility tools
      { source: "/tools/qr-code-generator", destination: "/utility/qr-code-generator", permanent: true },
      { source: "/tools/aspect-ratio-calculator", destination: "/utility/aspect-ratio-calculator", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/video-audio/video-to-mp3",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
      {
        source: "/image/background-remover",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
  devIndicators: false,
};

export default nextConfig;
