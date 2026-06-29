import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Webpack for builds if Turbopack is causing issues in Next 16
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-select",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-accordion",
    ],
  },
  htmlLimitedBots: /GPTBot|ClaudeBot|PerplexityBot|Google-Extended|Bytespider|CCBot/,
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
      {
        protocol: "https",
        hostname: "images.sftcdn.net",
      },
    ],
    unoptimized: false,
  },
  // Turbopack configuration for Next.js 16
  turbopack: {},
  // Optimize bundle sizes
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  async redirects() {
    return [
      // Image tools
      {
        source: "/tools/image-compressor",
        destination: "/image/image-compressor",
        permanent: true,
      },
      {
        source: "/tools/image-converter",
        destination: "/image/image-converter",
        permanent: true,
      },
      {
        source: "/tools/social-image-resizer",
        destination: "/image/social-image-resizer",
        permanent: true,
      },
      {
        source: "/tools/watermark-remover",
        destination: "/image/watermark-remover",
        permanent: true,
      },
      {
        source: "/tools/favicon-generator",
        destination: "/image/favicon-generator",
        permanent: true,
      },
      {
        source: "/tools/color-palette-extractor",
        destination: "/image/color-palette-extractor",
        permanent: true,
      },
      {
        source: "/tools/thumbnail-generator",
        destination: "/image/thumbnail-generator",
        permanent: true,
      },
      {
        source: "/tools/background-remover",
        destination: "/image/background-remover",
        permanent: true,
      },
      {
        source: "/tools/crop-image",
        destination: "/image/crop-image",
        permanent: true,
      },
      {
        source: "/tools/flip-image",
        destination: "/image/flip-image",
        permanent: true,
      },
      {
        source: "/tools/pixelate-image",
        destination: "/image/pixelate-image",
        permanent: true,
      },
      {
        source: "/tools/black-and-white",
        destination: "/image/black-and-white",
        permanent: true,
      },
      {
        source: "/tools/add-text-to-image",
        destination: "/image/add-text-to-image",
        permanent: true,
      },
      {
        source: "/tools/add-border-to-image",
        destination: "/image/add-border-to-image",
        permanent: true,
      },
      {
        source: "/tools/combine-images",
        destination: "/image/combine-images",
        permanent: true,
      },
      {
        source: "/tools/collage-maker",
        destination: "/image/collage-maker",
        permanent: true,
      },
      {
        source: "/tools/round-image-maker",
        destination: "/image/round-image-maker",
        permanent: true,
      },
      {
        source: "/tools/image-metadata-viewer",
        destination: "/image/image-metadata-viewer",
        permanent: true,
      },
      {
        source: "/tools/blur-image",
        destination: "/image/blur-image",
        permanent: true,
      },
      {
        source: "/tools/icon-to-png",
        destination: "/image/icon-to-png",
        permanent: true,
      },
      // Video & Audio tools
      {
        source: "/tools/video-to-mp3",
        destination: "/video-audio/video-to-mp3",
        permanent: true,
      },
      {
        source: "/tools/video-to-gif",
        destination: "/video-audio/video-to-gif",
        permanent: true,
      },
      {
        source: "/tools/video-frame-extractor",
        destination: "/video-audio/video-frame-extractor",
        permanent: true,
      },
      {
        source: "/tools/audio-trimmer",
        destination: "/video-audio/audio-trimmer",
        permanent: true,
      },
      {
        source: "/tools/mute-video",
        destination: "/video-audio/mute-video",
        permanent: true,
      },
      {
        source: "/tools/gif-to-mp4",
        destination: "/video-audio/gif-to-mp4",
        permanent: true,
      },
      {
        source: "/tools/trim-video",
        destination: "/video-audio/trim-video",
        permanent: true,
      },
      // Social & Text tools
      {
        source: "/tools/hashtag-generator",
        destination: "/social-text/hashtag-generator",
        permanent: true,
      },
      {
        source: "/tools/instagram-line-break",
        destination: "/social-text/instagram-line-break",
        permanent: true,
      },
      // Utility tools
      {
        source: "/tools/qr-code-generator",
        destination: "/utility/qr-code-generator",
        permanent: true,
      },
      {
        source: "/tools/aspect-ratio-calculator",
        destination: "/utility/aspect-ratio-calculator",
        permanent: true,
      },
      {
        source: "/tools/word-counter",
        destination: "/utility/word-counter",
        permanent: true,
      },
      // PDF tools
      {
        source: "/tools/merge-pdf",
        destination: "/pdf/merge-pdf",
        permanent: true,
      },
      {
        source: "/tools/rotate-pdf",
        destination: "/pdf/rotate-pdf",
        permanent: true,
      },
      {
        source: "/tools/delete-pdf-pages",
        destination: "/pdf/delete-pdf-pages",
        permanent: true,
      },
      {
        source: "/tools/protect-pdf",
        destination: "/pdf/protect-pdf",
        permanent: true,
      },
      {
        source: "/tools/unlock-pdf",
        destination: "/pdf/unlock-pdf",
        permanent: true,
      },
      {
        source: "/tools/pdf-to-text",
        destination: "/pdf/pdf-to-text",
        permanent: true,
      },
      {
        source: "/tools/split-pdf",
        destination: "/pdf/split-pdf",
        permanent: true,
      },
      {
        source: "/tools/rearrange-pdf",
        destination: "/pdf/rearrange-pdf",
        permanent: true,
      },
      {
        source: "/tools/crop-pdf",
        destination: "/pdf/crop-pdf",
        permanent: true,
      },
      {
        source: "/tools/pdf-page-numbers",
        destination: "/pdf/pdf-page-numbers",
        permanent: true,
      },
      {
        source: "/tools/pdf-watermark",
        destination: "/pdf/pdf-watermark",
        permanent: true,
      },
      {
        source: "/tools/add-text-to-pdf",
        destination: "/pdf/add-text-to-pdf",
        permanent: true,
      },
      {
        source: "/tools/create-pdf",
        destination: "/pdf/create-pdf",
        permanent: true,
      },
      {
        source: "/tools/images-to-pdf",
        destination: "/pdf/images-to-pdf",
        permanent: true,
      },
      {
        source: "/tools/pdf-to-jpg",
        destination: "/pdf/pdf-to-jpg",
        permanent: true,
      },
      {
        source: "/tools/pdf-to-png",
        destination: "/pdf/pdf-to-png",
        permanent: true,
      },
      {
        source: "/tools/pdf-editor",
        destination: "/pdf/pdf-editor",
        permanent: true,
      },
      {
        source: "/tools/esign-pdf",
        destination: "/pdf/esign-pdf",
        permanent: true,
      },
      // File & Data tools
      {
        source: "/tools/json-to-xml",
        destination: "/file/json-to-xml",
        permanent: true,
      },
      {
        source: "/tools/xml-to-json",
        destination: "/file/xml-to-json",
        permanent: true,
      },
      {
        source: "/tools/csv-to-json",
        destination: "/file/csv-to-json",
        permanent: true,
      },
      {
        source: "/tools/csv-to-xml",
        destination: "/file/csv-to-xml",
        permanent: true,
      },
      {
        source: "/tools/xml-to-csv",
        destination: "/file/xml-to-csv",
        permanent: true,
      },
      {
        source: "/tools/csv-to-excel",
        destination: "/file/csv-to-excel",
        permanent: true,
      },
      {
        source: "/tools/excel-to-csv",
        destination: "/file/excel-to-csv",
        permanent: true,
      },
      {
        source: "/tools/xml-to-excel",
        destination: "/file/xml-to-excel",
        permanent: true,
      },
      {
        source: "/tools/excel-to-xml",
        destination: "/file/excel-to-xml",
        permanent: true,
      },
      {
        source: "/tools/split-csv",
        destination: "/file/split-csv",
        permanent: true,
      },
      {
        source: "/tools/split-excel",
        destination: "/file/split-excel",
        permanent: true,
      },
      {
        source: "/tools/excel-to-pdf",
        destination: "/file/excel-to-pdf",
        permanent: true,
      },
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
