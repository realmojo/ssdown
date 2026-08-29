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
      {
        protocol: "https",
        hostname: "t1.kakaocdn.net",
      },
      {
        protocol: "https",
        hostname: "www.line.me",
      },
      {
        protocol: "https",
        hostname: "shared-whale.pstatic.net",
      },
      {
        protocol: "https",
        hostname: "ssl.pstatic.net",
      },
      {
        protocol: "https",
        hostname: "www.estsecurity.com",
      },
      {
        protocol: "https",
        hostname: "image.ahnlab.com",
      },
      {
        protocol: "https",
        hostname: "xdn.altools.co.kr",
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
      /*
        소프트웨어 상세 페이지가 `/software/{플랫폼}/{슬러그}` 에서 루트
        1depth `/{슬러그}` 로 내려왔다. 색인된 주소가 2만 건이 넘으므로 전부
        301 로 넘긴다. 목록 페이지(`/software`, `/software/windows`)는 세그먼트
        수가 달라 여기 걸리지 않으므로 그대로 남는다.

        먼저, 사이트의 기존 최상위 라우트와 이름이 겹쳐 루트로 올릴 수 없던
        앱들. DB 에서 슬러그를 바꿨으므로 옛 주소를 새 슬러그로 보낸다.
        아래 포괄 규칙보다 앞에 둬야 한다(먼저 걸리는 규칙이 이긴다).
      */
      {
        source: "/software/:category/ai",
        destination: "/ai-drawing-diary",
        permanent: true,
      },
      {
        source: "/software/:category/blog",
        destination: "/naver-blog",
        permanent: true,
      },
      {
        source: "/software/:category/dailymotion",
        destination: "/dailymotion-app",
        permanent: true,
      },
      {
        source: "/software/:category/douyin",
        destination: "/douyin-mac",
        permanent: true,
      },
      {
        source: "/software/:category/education",
        destination: "/learn-python-codelab",
        permanent: true,
      },
      {
        source: "/software/:category/facebook",
        destination: "/facebook-lite",
        permanent: true,
      },
      {
        source: "/software/:category/iphone",
        destination: "/iphone-for-windows",
        permanent: true,
      },
      {
        source: "/software/:category/lifestyle",
        destination: "/my-oneapp",
        permanent: true,
      },
      {
        source: "/software/:category/pdf",
        destination: "/pdf-reader-all-files",
        permanent: true,
      },
      {
        source: "/software/:category/privacy",
        destination: "/mega-cloud-storage",
        permanent: true,
      },
      {
        source: "/software/:category/search",
        destination: "/naver",
        permanent: true,
      },
      {
        source: "/software/:category/security",
        destination: "/touch-lock-screen",
        permanent: true,
      },
      {
        source: "/software/:category/social",
        destination: "/ziigo",
        permanent: true,
      },
      {
        source: "/software/:category/tiktok",
        destination: "/tiktok-lite-rewards",
        permanent: true,
      },
      {
        source: "/software/:category/travel",
        destination: "/travel-town",
        permanent: true,
      },
      // 나머지 상세 페이지 — 카테고리/플랫폼 조각을 떼고 슬러그만 남긴다.
      {
        source: "/software/:category/:slug/download",
        destination: "/:slug/download",
        permanent: true,
      },
      {
        source: "/software/:category/:slug",
        destination: "/:slug",
        permanent: true,
      },
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
