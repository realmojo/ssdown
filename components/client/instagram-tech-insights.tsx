import { Image, Lock, Clock, Globe } from "lucide-react";

export function InstagramTechInsights() {
  const insights = [
    {
      icon: Image,
      title: "Cdn Image Optimization",
      content:
        "Instagram aggressively compresses media to reduce bandwidth. Most images are served as progressive JPEGs or WebP formats, depending on the client. Our extraction tool identifies the highest resolution candidate (often labeled as 'original' in the Graph API response) to ensure you archive the best possible version before the platform apply its aggressive compression for mobile delivery.",
    },
    {
      icon: Clock,
      title: "Signed URL Expiration",
      content:
        "Direct links to Instagram media (CDN URLs) contain a security signature (`?_nc_cat=...`) with a timestamp. These links are ephemeral and typically expire within a few hours. This is why you cannot simply 'bookmark' a video link; it must be downloaded or refreshed. SSDown fetches a fresh, valid token at the moment of request to facilitate immediate archiving.",
    },
    {
      icon: Lock,
      title: "Public vs Private Graph Data",
      content:
        "Instagram's data architecture strictly separates public and private endpoints. Public posts are accessible via standard Graph API calls or HTML parsing (Open Graph tags). Private content, however, is gated behind strict session authentication. SSDown respects this privacy architecture and does not attempt to bypass access controls for private accounts.",
    },
    {
      icon: Globe,
      title: "Regional Content Delivery",
      content:
        "Instagram utilizes a massive distributed edge network. Sometimes, specific content is geoblocked or served from a specific regional cache. Understanding the difference between a 'broken link' and a 'geoblocked resource' is key for digital troubleshooting. Our servers attempt to resolve these regional discrepancies where possible to provide consistent access.",
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-sm font-semibold mb-4">
            Platform Architecture
          </span>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Technical Insight: Instagram Media Delivery
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore the mechanisms of how Instagram stores, secures, and
            delivers visual content to billions of devices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-5 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-purple-100 dark:hover:border-purple-900 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-purple-500">
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
        <div className="mt-12 p-6 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-900 dark:text-purple-200">
                Privacy First Approach
              </h4>
              <p className="text-sm text-purple-800/80 dark:text-purple-300/80 leading-relaxed">
                We strictly adhere to ethical data access standards. We do not
                provide tools to view private profiles, download stories
                anonymously from private accounts, or bypass 2FA security. Our
                tools are designed solely for interacting with{" "}
                <strong>publicly available information</strong> that the creator
                has chosen to share with the world.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
