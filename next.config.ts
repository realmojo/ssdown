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
      // Video & Audio tools
      { source: "/tools/video-to-mp3", destination: "/video-audio/video-to-mp3", permanent: true },
      { source: "/tools/video-to-gif", destination: "/video-audio/video-to-gif", permanent: true },
      { source: "/tools/video-frame-extractor", destination: "/video-audio/video-frame-extractor", permanent: true },
      { source: "/tools/audio-trimmer", destination: "/video-audio/audio-trimmer", permanent: true },
      // YouTube tools
      { source: "/tools/youtube-thumbnail", destination: "/youtube/youtube-thumbnail", permanent: true },
      { source: "/tools/youtube-thumbnail/:id", destination: "/youtube/youtube-thumbnail/:id", permanent: true },
      { source: "/tools/youtube-preview", destination: "/youtube/youtube-preview", permanent: true },
      { source: "/tools/youtube-preview/:id", destination: "/youtube/youtube-preview/:id", permanent: true },
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
