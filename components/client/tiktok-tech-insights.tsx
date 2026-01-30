import { Layers, Smartphone, Music, Shield } from "lucide-react";

export function TikTokTechInsights() {
  const insights = [
    {
      icon: Layers,
      title: "Watermark Layering Architecture",
      content:
        "TikTok's 'watermark' is not permanently baked into the original video file on their servers. Instead, it is applied as a dynamic overlay layer during playback or when using the official 'Save Video' function. SSDown accesses the underlying source stream (the 'clean' version) before this overlay process occurs, allowing for the retrieval of the pristine, watermark-free video file directly from the Content Delivery Network (CDN).",
    },
    {
      icon: Smartphone,
      title: "Vertical Video & HEVC Optimization",
      content:
        "TikTok heavily relies on the H.265 (HEVC) codec for newer devices to maintain high quality (1080p) at lower bitrates, specifically optimized for vertical (9:16 aspect ratio) mobile viewing. While this codec saves data, it can cause compatibility issues on older desktop players. Our service ensures the retrieved MP4 container is compatible with standard playback software while preserving the original high-efficiency encoding.",
    },
    {
      icon: Music,
      title: "Audio Track Separation",
      content:
        "Validation of audio integrity is a complex part of the TikTok ecosystem. Often, a video's visual track and audio track are streamed separately and synchronized by the client app. This separation allows for 'Sound Removals' due to copyright strikes without deleting the video. SSDown's extraction engine merges these separate streams back into a single cohesive MP4 file, ensuring audio-visual synchronization.",
    },
    {
      icon: Shield,
      title: "Algorithmic ID Tracking",
      content:
        "Every video downloaded through the official app contains metadata tags and an unseen algorithmic ID that creates a digital footprint of its source. This is part of TikTok's recommendation engine tracking. When downloading for archival or offline viewing via third-party tools, this metadata is typically stripped or altered, decoupling the file from the algorithmic feed integration.",
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 text-sm font-semibold mb-4">
            Technical Analysis
          </span>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Inside TikTok's Video Infrastructure
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A deeper look into how TikTok manages video delivery, watermarking,
            and audio streams, explaining the technology behind clean downloads.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-5 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-pink-100 dark:hover:border-pink-900 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-pink-500">
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
        <div className="mt-12 p-6 rounded-xl bg-pink-50/50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/30">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-pink-600 mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-semibold text-pink-900 dark:text-pink-200">
                A Note on Copyright & Usage
              </h4>
              <p className="text-sm text-pink-800/80 dark:text-pink-300/80 leading-relaxed">
                While technology allows for the removal of visual watermarks, it
                does not remove the{" "}
                <strong>Intellectual Property Rights</strong> of the original
                creator. A "clean" video is intended for personal archiving or
                creative repurposing where permitted (e.g., Fair Use
                commentary). Redistributing someone else's work as your own
                without credit is a violation of copyright law and platform
                terms. Always request permission before reposting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
