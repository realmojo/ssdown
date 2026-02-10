"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Hash,
  Copy,
  Check,
  BookOpen,
  Lightbulb,
  Info,
  Search,
  Sparkles,
} from "lucide-react";
import { hashtagDatabase } from "@/lib/hashtag-data";
import { cn } from "@/lib/utils";

type Platform = "tiktok" | "instagram" | "youtube";

interface HashtagGeneratorClientProps {
  dict?: any;
}

export function HashtagGeneratorClient({ dict }: HashtagGeneratorClientProps) {
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [keyword, setKeyword] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const platformColors: Record<
    Platform,
    { bg: string; hover: string; gradient: string }
  > = {
    tiktok: {
      bg: "bg-gradient-to-r from-pink-500 to-cyan-500",
      hover: "hover:from-pink-600 hover:to-cyan-600",
      gradient: "from-pink-500 to-cyan-500",
    },
    instagram: {
      bg: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
      hover: "hover:from-purple-600 hover:via-pink-600 hover:to-orange-600",
      gradient: "from-purple-500 via-pink-500 to-orange-500",
    },
    youtube: {
      bg: "bg-gradient-to-r from-red-600 to-red-500",
      hover: "hover:from-red-700 hover:to-red-600",
      gradient: "from-red-600 to-red-500",
    },
  };

  // Filter hashtags by keyword
  const filteredHashtags = useMemo(() => {
    const data = hashtagDatabase[platform];
    if (!keyword.trim()) {
      return data;
    }

    const lowerKeyword = keyword.toLowerCase();
    const filteredTrending = data.trending.filter((tag) =>
      tag.toLowerCase().includes(lowerKeyword)
    );

    const filteredNiches: Record<string, string[]> = {};
    Object.entries(data.niches).forEach(([niche, tags]) => {
      const filtered = tags.filter((tag) =>
        tag.toLowerCase().includes(lowerKeyword)
      );
      if (filtered.length > 0 || niche.toLowerCase().includes(lowerKeyword)) {
        filteredNiches[niche] = filtered;
      }
    });

    return {
      trending: filteredTrending,
      niches: filteredNiches,
    };
  }, [platform, keyword]);

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const copyAllHashtags = async () => {
    if (selectedHashtags.length === 0) return;

    const text = selectedHashtags.join(" ");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const clearAll = () => {
    setSelectedHashtags([]);
  };

  const characterCount = selectedHashtags.join(" ").length;

  const renderHashtagBadge = (tag: string) => {
    const isSelected = selectedHashtags.includes(tag);
    return (
      <button
        key={tag}
        onClick={() => toggleHashtag(tag)}
        className={cn(
          "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105",
          isSelected
            ? "bg-indigo-600 text-white shadow-md"
            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        )}
      >
        {tag}
      </button>
    );
  };

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
          <Hash className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {dict?.hashtag_generator?.title || "Hashtag Generator"}
        </h1>
        <p className="text-lg text-muted-foreground">
          {dict?.hashtag_generator?.subtitle ||
            "Find trending and niche-specific hashtags for TikTok, Instagram, and YouTube. Boost your content reach."}
        </p>
      </div>

      {/* Platform Selector */}
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {(["tiktok", "instagram", "youtube"] as Platform[]).map((p) => (
          <Button
            key={p}
            onClick={() => setPlatform(p)}
            variant={platform === p ? "default" : "outline"}
            className={cn(
              "capitalize text-white transition-all duration-300",
              platform === p
                ? `${platformColors[p].bg} ${platformColors[p].hover} shadow-lg`
                : "bg-transparent text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            {p}
          </Button>
        ))}
      </div>

      {/* Keyword Input */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={
              dict?.hashtag_generator?.search_placeholder ||
              "Enter a topic or keyword..."
            }
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10 py-6 text-base"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        {/* Main Hashtag Selection Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trending Section */}
          {filteredHashtags.trending.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  {dict?.hashtag_generator?.trending || "Trending"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {filteredHashtags.trending.map(renderHashtagBadge)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Niche Categories */}
          {Object.entries(filteredHashtags.niches).map(([niche, tags]) => {
            if (tags.length === 0) return null;
            return (
              <Card key={niche}>
                <CardHeader>
                  <CardTitle className="capitalize text-lg">{niche}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(renderHashtagBadge)}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* No Results */}
          {filteredHashtags.trending.length === 0 &&
            Object.keys(filteredHashtags.niches).length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {dict?.hashtag_generator?.no_results ||
                    "No hashtags found. Try a different keyword."}
                </CardContent>
              </Card>
            )}
        </div>

        {/* Selected Panel (Sticky) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="border-2 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="text-lg">
                {dict?.hashtag_generator?.selected || "Selected"} (
                {selectedHashtags.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  {selectedHashtags.length}{" "}
                  {dict?.hashtag_generator?.hashtags || "hashtags"}
                </p>
                <p>
                  {characterCount}{" "}
                  {dict?.hashtag_generator?.characters || "characters"}
                </p>
              </div>

              {selectedHashtags.length > 0 && (
                <div className="space-y-2">
                  <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
                    {selectedHashtags.join(" ")}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={copyAllHashtags}
                      className={cn(
                        "flex-1 transition-all duration-300",
                        copied
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      )}
                    >
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          {dict?.hashtag_generator?.copied || "Copied!"}
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          {dict?.hashtag_generator?.copy_all || "Copy All"}
                        </>
                      )}
                    </Button>
                    <Button onClick={clearAll} variant="outline">
                      {dict?.hashtag_generator?.clear_all || "Clear All"}
                    </Button>
                  </div>
                </div>
              )}

              {selectedHashtags.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4">
                  Click hashtags to add them here
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Guide & FAQ Section */}
      <div className="w-full max-w-6xl mx-auto mt-20 space-y-16">
        {/* Step-by-Step Guide */}
        <section>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
              <BookOpen className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.hashtag_generator?.guide_title ||
                "How to Use the Hashtag Generator"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.hashtag_generator?.guide_desc ||
                "Find the perfect hashtags for your content in seconds."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title:
                  dict?.hashtag_generator?.step1_title ||
                  "Choose Your Platform",
                desc:
                  dict?.hashtag_generator?.step1_desc ||
                  "Select TikTok, Instagram, or YouTube to get platform-specific hashtag suggestions.",
                icon: Hash,
              },
              {
                step: 2,
                title:
                  dict?.hashtag_generator?.step2_title || "Enter a Keyword",
                desc:
                  dict?.hashtag_generator?.step2_desc ||
                  "Type a topic or keyword related to your content. We'll show you relevant hashtags from curated lists.",
                icon: Search,
              },
              {
                step: 3,
                title: dict?.hashtag_generator?.step3_title || "Copy & Use",
                desc:
                  dict?.hashtag_generator?.step3_desc ||
                  "Select the hashtags you want, then copy them all with one click. Paste directly into your post.",
                icon: Copy,
              },
            ].map((step) => (
              <Card key={step.step} className="border-indigo-100 dark:border-indigo-900/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500 text-white font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
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
              {dict?.hashtag_generator?.tips_title || "Hashtag Strategy Tips"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.hashtag_generator?.tips_desc ||
                "Maximize your content reach with these hashtag best practices."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title:
                  dict?.hashtag_generator?.tip1_title ||
                  "Mix Popular & Niche",
                desc:
                  dict?.hashtag_generator?.tip1_desc ||
                  "Combine trending hashtags with niche-specific ones for the best reach and discoverability balance.",
              },
              {
                title:
                  dict?.hashtag_generator?.tip2_title || "Platform Limits",
                desc:
                  dict?.hashtag_generator?.tip2_desc ||
                  "Instagram allows 30 hashtags, TikTok captions max at 300 characters, YouTube descriptions allow 5000 characters.",
              },
              {
                title:
                  dict?.hashtag_generator?.tip3_title || "Stay Relevant",
                desc:
                  dict?.hashtag_generator?.tip3_desc ||
                  "Only use hashtags that are relevant to your content. Irrelevant hashtags can hurt your reach.",
              },
              {
                title:
                  dict?.hashtag_generator?.tip4_title || "Rotate Hashtags",
                desc:
                  dict?.hashtag_generator?.tip4_desc ||
                  "Don't use the same hashtags on every post. Rotate them to avoid being flagged as spam.",
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-indigo-500" />
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
              {dict?.hashtag_generator?.features_title || "Generator Features"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.hashtag_generator?.features_desc ||
                "Everything you need to find the right hashtags."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title:
                  dict?.hashtag_generator?.feature1_title ||
                  "Platform-Specific",
                desc:
                  dict?.hashtag_generator?.feature1_desc ||
                  "Curated hashtag lists tailored for TikTok, Instagram, and YouTube.",
              },
              {
                title:
                  dict?.hashtag_generator?.feature2_title || "Niche Categories",
                desc:
                  dict?.hashtag_generator?.feature2_desc ||
                  "Browse hashtags organized by niche: fitness, food, travel, tech, and more.",
              },
              {
                title:
                  dict?.hashtag_generator?.feature3_title || "One-Click Copy",
                desc:
                  dict?.hashtag_generator?.feature3_desc ||
                  "Copy all selected hashtags to your clipboard with a single click.",
              },
              {
                title:
                  dict?.hashtag_generator?.feature4_title || "Count Tracking",
                desc:
                  dict?.hashtag_generator?.feature4_desc ||
                  "Track hashtag count and character count to stay within platform limits.",
              },
            ].map((feature, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.qna_hashtag_generator?.title || "Hashtag Generator FAQ"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.qna_hashtag_generator?.desc ||
                "Common questions about finding the right hashtags."}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {[1, 2, 3, 4, 5].map((i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">
                  {dict?.qna_hashtag_generator?.[`faq_${i}_q`] || "Question"}
                </AccordionTrigger>
                <AccordionContent className="whitespace-pre-line text-muted-foreground">
                  {dict?.qna_hashtag_generator?.[`faq_${i}_a`] || "Answer"}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}
