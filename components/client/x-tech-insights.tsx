import { Shield } from "lucide-react";

export function XTechInsights() {
  const insights = [
    {
      icon: NetworkIcon,
      title: "HLS Streaming Architecture",
      content:
        "Unlike traditional direct file downloads, X (formerly Twitter) utilizes HTTP Live Streaming (HLS) technology. This adaptive bitrate streaming protocol breaks video content into small sequence files (.ts) managed by a manifest file (.m3u8). This architecture allows the player to switch quality streams dynamically based on the user's bandwidth, but it complicates the saving process for archival purposes since there is no single source file to simply 'save'.",
    },
    {
      icon: CodecIcon,
      title: "Video Compression & Codecs",
      content:
        "X primarily utilizes the H.264/MPEG-4 AVC video compression standard to ensure compatibility across billions of devices. When videos are uploaded, they are re-encoded to optimize bitrate for mobile data consumption. This process, known as transcoding, often results in different quality tiers (720x1280, 480x854, 320x568) generated from a single master file to serve various network conditions.",
    },
    {
      icon: GifIcon,
      title: "The 'GIF' Illusion",
      content:
        "What appears to be a GIF on X is rarely an actual GIF format file. X converts uploaded GIFs into looping MP4 videos (often without an audio track). This conversion significantly reduces file size—often by 95%—compared to the inefficient GIF89a format. This technical optimization saves immense bandwidth but requires specialized tools to revert or save as a video file properly.",
    },
    {
      icon: SecurityIcon,
      title: "Secure Content Delivery",
      content:
        "Content on X is delivered via a global Content Delivery Network (CDN) using signed URLs with time-limited tokens for private content. While public content is generally accessible, the platform employs strict rate-limiting and anti-scraping measures to protect server integrity. Understanding these mechanisms is crucial for distinguishing between temporary service interruptions and content unavailability.",
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-sm font-semibold mb-4">
            Technical Deep Dive
          </span>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Under the Hood: X Video Technology
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Understanding the technical infrastructure behind X's video delivery
            system explains why specialized tools are necessary for efficient
            content management.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-5 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-indigo-600 dark:text-indigo-400">
                  <item.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                  {item.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Educational Note */}
        <div className="mt-12 p-6 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-200">
                Why This Matters for Content Safety
              </h4>
              <p className="text-sm text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
                Understanding these technical formats is essential for proper
                digital archiving. Saving a screen recording often results in
                re-compression artifacts (generation loss). Accessing the source
                stream via tools like SSDown allows for bit-perfect preservation
                of the original content quality as served by the platform's CDN,
                ensuring the integrity of your personal digital archive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NetworkIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="16" y="16" width="6" height="6" rx="1" />
      <rect x="2" y="16" width="6" height="6" rx="1" />
      <rect x="9" y="2" width="6" height="6" rx="1" />
      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
      <path d="M12 12V8" />
    </svg>
  );
}

function CodecIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m10 10-2 2v2c0 1.1.9 2 2 2h6a2 2 0 0 0 2-2v-2l-2-2" />
      <path d="M18 4h3" />
      <path d="M18 20h3" />
      <path d="M4 20h3" />
      <path d="M4 4h3" />
      <rect x="8" y="2" width="8" height="20" rx="2" />
    </svg>
  );
}

function GifIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 18V8a2 2 0 0 1 2-2h4" />
      <path d="M6 14h4" />
      <path d="M10 16v2" />
      <path d="M13 18h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2v8Z" />
      <path d="M21 8h-3v8h3" />
      <path d="M21 12h-2" />
    </svg>
  );
}

function SecurityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
