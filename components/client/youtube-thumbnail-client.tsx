"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  BookOpen,
  Lightbulb,
  Info,
  CheckCircle2,
  Search,
  Link2,
  ImageDown,
  Image,
  Maximize,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  dict,
}: {
  initialData?: VideoDetails | null;
  initialId?: string;
  dict?: any;
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
      // Navigate to the SEO-friendly URL with the video ID.
      if (data.id) {
        router.push(`/tools/youtube-thumbnail/${data.id}`);
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

      {/* Guide & FAQ Section */}
      <div className="w-full max-w-6xl mx-auto mt-20 px-4 space-y-16">
        {/* Step-by-Step Guide */}
        <section>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.youtube_thumbnail?.guide_title || "How to Download YouTube Thumbnails"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.youtube_thumbnail?.guide_desc || "Follow these simple steps to download any YouTube video thumbnail in the highest quality available."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: dict?.youtube_thumbnail?.step1_title || "Find the YouTube Video",
                desc: dict?.youtube_thumbnail?.step1_desc || "Open YouTube and navigate to the video whose thumbnail you want to download.",
                icon: Search,
              },
              {
                step: 2,
                title: dict?.youtube_thumbnail?.step2_title || "Copy the Video URL",
                desc: dict?.youtube_thumbnail?.step2_desc || "Copy the video URL from your browser's address bar.",
                icon: Link2,
              },
              {
                step: 3,
                title: dict?.youtube_thumbnail?.step3_title || "Download the Thumbnail",
                desc: dict?.youtube_thumbnail?.step3_desc || "Paste the URL, click Download, and choose your preferred resolution.",
                icon: ImageDown,
              },
            ].map((step) => (
              <Card key={step.step} className="border-purple-100 dark:border-purple-900/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 text-white font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tips & Best Practices */}
        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.youtube_thumbnail?.tips_title || "Tips for YouTube Thumbnails"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.youtube_thumbnail?.tips_desc || "Get the most out of YouTube thumbnail downloads with these helpful tips."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: dict?.youtube_thumbnail?.tip1_title || "Choose the Highest Resolution",
                desc: dict?.youtube_thumbnail?.tip1_desc || "The 'Max Resolution' option provides the best quality, typically 1920x1080 or higher.",
                icon: Maximize,
              },
              {
                title: dict?.youtube_thumbnail?.tip2_title || "Understanding Thumbnail Sizes",
                desc: dict?.youtube_thumbnail?.tip2_desc || "YouTube generates several thumbnail sizes: maxresdefault, sddefault, hqdefault, and mqdefault.",
                icon: Image,
              },
              {
                title: dict?.youtube_thumbnail?.tip3_title || "Use for Content Research",
                desc: dict?.youtube_thumbnail?.tip3_desc || "Studying successful YouTube thumbnails is a proven strategy for improving your own click-through rates.",
                icon: CheckCircle2,
              },
              {
                title: dict?.youtube_thumbnail?.tip4_title || "Respect Creator Rights",
                desc: dict?.youtube_thumbnail?.tip4_desc || "Thumbnails are created by video uploaders and are their intellectual property.",
                icon: CheckCircle2,
              },
            ].map((tip, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features & Capabilities */}
        <section>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <Info className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.youtube_thumbnail?.features_title || "YouTube Thumbnail Download Features"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.youtube_thumbnail?.features_desc || "Everything you need to download and use YouTube thumbnails effectively."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: dict?.youtube_thumbnail?.feature1_title || "All Available Sizes",
                desc: dict?.youtube_thumbnail?.feature1_desc || "Download every thumbnail resolution YouTube provides.",
              },
              {
                title: dict?.youtube_thumbnail?.feature2_title || "Instant Preview",
                desc: dict?.youtube_thumbnail?.feature2_desc || "See all thumbnail versions side by side with resolution details.",
              },
              {
                title: dict?.youtube_thumbnail?.feature3_title || "One-Click Download",
                desc: dict?.youtube_thumbnail?.feature3_desc || "Download any thumbnail size with a single click.",
              },
              {
                title: dict?.youtube_thumbnail?.feature4_title || "Video Information",
                desc: dict?.youtube_thumbnail?.feature4_desc || "View video title, channel name, and view count.",
              },
            ].map((feature, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.qna_youtube_thumbnail?.title || "YouTube Thumbnail FAQ"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.qna_youtube_thumbnail?.desc || "Common questions about downloading YouTube video thumbnails."}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {[1, 2, 3, 4, 5].map((i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">
                  {dict?.qna_youtube_thumbnail?.[`faq_${i}_q`] || "Question"}
                </AccordionTrigger>
                <AccordionContent className="whitespace-pre-line text-muted-foreground">
                  {dict?.qna_youtube_thumbnail?.[`faq_${i}_a`] || "Answer"}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}
