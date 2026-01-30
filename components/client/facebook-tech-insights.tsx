import { Share2, Lock, MonitorPlay, Wifi } from "lucide-react";

export function FacebookTechInsights() {
  const insights = [
    {
      icon: MonitorPlay,
      title: "DASH Streaming Protocol",
      content:
        "Facebook utilizes DASH (Dynamic Adaptive Streaming over HTTP) for most HD content. This protocol splits video and audio into separate tracks to adapt to fluctuating network speeds. Simple 'right-click save' methods fail because the browser only sees the manifests, not the full file. SSDown's engine identifies and merges these separate tracks into a unified MP4 container for offline playback.",
    },
    {
      icon: Wifi,
      title: "Bitrate Cap & HD Delivery",
      content:
        "To serve billions of users, Facebook caps the bitrate of standard videos. 'HD' on Facebook typically refers to 720p resolution, with 1080p reserved for specific 'Watch' content or gaming streams. Our tool analyzes the manifest file to extract the absolute highest bitrate stream available, ensuring you get the best possible quality that the source server offers.",
    },
    {
      icon: Share2,
      title: "Public Graph Data Access",
      content:
        "Our system interacts strictly with the public Open Graph interface. When a video is shared with 'Public' privacy settings, its metadata and CDN URLs are accessible via standard HTML parsing. This creates a clear distinction between hacking (unauthorized access) and archiving (preserving publicly accessible data), ensuring our operations remain ethical and legal.",
    },
    {
      icon: Lock,
      title: "Private Group Security",
      content:
        "Content within private Facebook Groups or personal profiles is protected by session-based authentication tokens that are tied to a specific user's login cookies. SSDown does not support bypassing these security measures. We believe that privacy settings should be respected, and therefore, we do not build tools to scrape or download non-public content.",
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-semibold mb-4">
            Under the Hood
          </span>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Facebook Video Technology Explained
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Understanding the DASH protocol and how Facebook manages massive
            scale video delivery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-5 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-900 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-blue-600 dark:text-blue-400">
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
        <div className="mt-12 p-6 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-start gap-4">
            <Share2 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200">
                Archiving for Research
              </h4>
              <p className="text-sm text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                Social media content is transient. A video available today might
                be deleted tomorrow due to platform policy changes or account
                suspensions. Digital archivists use tools like SSDown to
                preserve culturally significant content, news footage, or
                personal memories from the volatility of cloud platforms,
                ensuring that history is not lost to a 404 error.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
