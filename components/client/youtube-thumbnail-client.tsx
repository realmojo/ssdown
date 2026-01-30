"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { YoutubeUrlInput } from "@/components/client/youtube-url-input";

import { VideoDetails } from "@/lib/youtube";
import { useRouter } from "next/navigation";

// ... (other imports)

interface ApiResponse {
  id: string;
  url: string;
  status: "success" | "error";
  data?: VideoDetails;
  message?: string;
  error?: string;
}

export function YoutubeThumbnailClient({
  initialData,
  initialId,
}: {
  initialData?: VideoDetails | null;
  initialId?: string;
}) {
  const [url, setUrl] = useState(
    initialId ? `https://www.youtube.com/watch?v=${initialId}` : "",
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VideoDetails | null>(
    initialData || null,
  );
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    // Optimistic UI update or wait for fetch?
    // Since we want SEO URL, we should redirect to the dynamic page.
    // However, if we do that, we lose the client-side state until the new page loads.
    // Let's try to fetch client-side first to show immediate results, AND push the router.
    // Actually, simply fetching client side is faster for the user.
    // But to satisfy "SEO exposure", the user wants the URL to change.

    // Strategy:
    // 1. Fetch data.
    // 2. If success, update state AND router.push shallowly or to the [id] page?
    // If we push to [id] page, it will preserve the state if we use a transition, but a full navigation might be slower.

    // Let's implement the existing fetch logic, and then update the URL.
    setResult(null);

    try {
      const response = await fetch(
        `/api/yt/thumbnail?url=${encodeURIComponent(url)}`,
      );
      const data: ApiResponse = await response.json();

      if (!response.ok || data.status === "error" || !data.data) {
        throw new Error(
          data.error || data.message || "Failed to fetch video info",
        );
      }

      setResult(data.data);
      // Update URL without reloading if possible, or just push.
      // User requested /yt/thumbnail/[id].
      // We should navigate there.
      if (data.id) {
        router.push(`/yt/thumbnail/${data.id}`);
      }
    } catch (err: any) {
      setError(
        err.message ||
          "Something went wrong. Please check the URL and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getQualityLabel = (width: number) => {
    if (width >= 1920) return "Max Resolution (HD/4K)";
    if (width >= 1280) return "Standard HD (720p)";
    if (width >= 640) return "High Quality (SD)";
    if (width >= 480) return "Medium Quality";
    return "Standard Quality";
  };
  // Render Input Form
  const renderInputForm = () => (
    <YoutubeUrlInput
      url={url}
      setUrl={setUrl}
      loading={loading}
      onSubmit={handleSubmit}
      error={error}
      buttonText="Download"
      loadingText="Fetching..."
      className={result ? "mb-8" : "mb-12"}
    />
  );

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      {!result ? (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl min-h-[40vh]">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            Youtube Thumbnail Analysis
          </h1>
          <p className="text-muted-foreground text-center max-w-lg mb-8">
            Analyze high-quality thumbnails from any YouTube video.
          </p>
          {renderInputForm()}
        </div>
      ) : (
        <>{renderInputForm()}</>
      )}

      {result && (
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="mb-8 overflow-hidden bg-card/50 backdrop-blur-sm border-muted">
            <CardHeader>
              <CardTitle className="line-clamp-2 text-xl break-words">
                {result.title}
              </CardTitle>
              <CardDescription className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                <span className="font-medium text-foreground">
                  {result.author}
                </span>
                <span>•</span>
                <span>{parseInt(result.viewCount).toLocaleString()} views</span>
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...(result.thumbnail?.thumbnails || [])]
              .reverse()
              .map((thumb, index) => (
                <Card
                  key={index}
                  className="overflow-hidden flex flex-col h-full border-muted hover:border-primary/50 transition-colors"
                >
                  <div className="relative aspect-video bg-muted/50 overflow-hidden group">
                    <img
                      src={thumb.url}
                      alt={`Thumbnail ${thumb.width}x${thumb.height}`}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="pt-4 pb-2 flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">
                        {thumb.width} x {thumb.height}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getQualityLabel(thumb.width)}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 pb-4">
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all duration-300"
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          const response = await fetch(thumb.url);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          // Extract exact filename from URL if possible, otherwise construct it
                          const urlParts = thumb.url.split("/");
                          const lastPart =
                            urlParts[urlParts.length - 1].split("?")[0];
                          link.download =
                            lastPart ||
                            `thumbnail-${thumb.width}x${thumb.height}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } catch (err) {
                          console.error("Failed to download image:", err);
                          // Fallback to opening in new tab
                          window.open(thumb.url, "_blank");
                        }
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Image
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
