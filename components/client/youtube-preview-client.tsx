"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Copy,
  MoreHorizontal,
  Info,
  ChevronDown,
  X,
  RotateCcw,
  MonitorPlay,
  Captions,
  RectangleHorizontal,
  CreditCard,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  Link2,
  PenLine,
  Eye,
  Type,
  FileText,
  Tags,
  Settings,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { YoutubeUrlInput } from "@/components/client/youtube-url-input";

import { VideoDetails } from "@/lib/youtube";
import { useRouter } from "next/navigation";

interface ApiResponse {
  id: string;
  url: string;
  status: "success" | "error";
  data?: VideoDetails;
  message?: string;
  error?: string;
}

export function YoutubePreviewClient({
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
  const [showMore, setShowMore] = useState(true);
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.shortDescription || "",
  );
  const [tags, setTags] = useState<string[]>(initialData?.keywords || []);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>("");
  const [tagInput, setTagInput] = useState("");
  const [category, setCategory] = useState(
    initialData?.category || "Entertainment",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
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
      // Initialize form values
      setTitle(data.data.title);
      setDescription(data.data.shortDescription);
      setTags(data.data.keywords || []);
      if (data.data.category) {
        setCategory(data.data.category);
      }

      // Select best quality thumbnail
      const thumbs = data.data.thumbnail.thumbnails;
      if (thumbs && thumbs.length > 0) {
        setSelectedThumbnail(thumbs[thumbs.length - 1].url);
      }

      if (data.id) {
        router.push(`/tools/youtube-preview/${data.id}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Something went wrong. Please check the URL and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Render Input Form
  const renderInputForm = () => (
    <YoutubeUrlInput
      url={url}
      setUrl={setUrl}
      loading={loading}
      onSubmit={handleSubmit}
      error={error}
      buttonText="Preview"
      loadingText="Loading"
      className={result ? "mb-8" : "mb-12"}
    />
  );

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      {!result ? (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl min-h-[40vh]">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            Youtube Preview Editor
          </h1>
          <p className="text-muted-foreground text-center max-w-lg mb-8">
            Preview and edit how your YouTube video will look.
          </p>
          {renderInputForm()}
        </div>
      ) : (
        <>
          {renderInputForm()}
          <div className="w-full max-w-[1280px] h-[85vh] rounded-xl overflow-hidden shadow-2xl border border-border bg-background flex flex-col transition-colors duration-300">
            {/* Top Bar */}
            <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border bg-background transition-colors duration-300">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-foreground">
                  Video details
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Undo Changes
                </Button>
                <Button
                  className="bg-[#3ea6ff] hover:bg-[#3ea6ff]/90 text-black font-medium px-6"
                  size="sm"
                >
                  SAVE
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                >
                  <MoreHorizontal />
                </Button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
              {/* Main Content (Left Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
                <div className="max-w-3xl space-y-8">
                  {/* Title */}
                  <div className="space-y-2 border border-blue-500 rounded-md p-3 bg-card relative group hover:border-[#3ea6ff] transition-colors">
                    <div className="flex justify-between">
                      <Label className="text-xs text-blue-500">
                        Title (required)
                      </Label>
                      <div className="text-xs text-muted-foreground">
                        <Info className="w-3 h-3 inline mr-1" />
                        <span>AI Generated</span>
                      </div>
                    </div>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-transparent border-0 p-0 text-base focus-visible:ring-0 leading-relaxed h-auto shadow-none"
                    />
                    <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                      {title.length}/100
                    </div>
                  </div>
                  {/* Description */}
                  <div className="space-y-2 border border-input rounded-md p-3 bg-card relative group hover:border-foreground transition-colors">
                    <Label className="text-xs text-muted-foreground group-hover:text-foreground">
                      Description
                    </Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-transparent border-0 p-0 text-sm focus-visible:ring-0 min-h-[150px] resize-none leading-relaxed shadow-none"
                    />
                    <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                      {description.length}/5000
                    </div>
                  </div>
                  {/* Thumbnails */}
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Thumbnail</Label>
                      <p className="text-xs text-muted-foreground">
                        Select or upload a picture that shows what's in your
                        video. A good thumbnail stands out and draws viewers'
                        attention.
                      </p>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {(result.thumbnail?.thumbnails || [])
                        .slice(-3)
                        .reverse()
                        .map((thumb, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedThumbnail(thumb.url)}
                            className={`relative w-[160px] aspect-video flex-shrink-0 cursor-pointer border-2 rounded-sm overflow-hidden ${selectedThumbnail === thumb.url ? "border-foreground" : "border-transparent opacity-70 hover:opacity-100"}`}
                          >
                            <img
                              src={thumb.url}
                              alt="thumbnail"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      <div className="w-[160px] aspect-video flex-shrink-0 border border-dashed border-input rounded-sm flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted transition-colors">
                        <ImageIcon className="w-6 h-6 mb-2" />
                        <span className="text-xs">Upload file</span>
                      </div>
                    </div>
                  </div>
                  {/* Playlists */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Playlists</Label>
                    <p className="text-xs text-muted-foreground">
                      Add your video to one or more playlists. Playlists can
                      help viewers discover your content faster.
                    </p>
                    <Select>
                      <SelectTrigger className="w-full md:w-[350px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="playlist1">My Playlist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Audience */}
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Audience</Label>
                      <div className="text-xs text-muted-foreground">
                        <h4 className="font-medium text-foreground mb-1">
                          Is this video made for kids? (Required)
                        </h4>
                        <p className="mb-2">
                          Regardless of your location, you're legally required
                          to comply with the Children's Online Privacy
                          Protection Act (COPPA) and/or other laws. You're
                          required to tell us whether your videos are made for
                          kids.
                        </p>
                        <p className="flex items-center gap-1 text-blue-500 cursor-pointer hover:underline">
                          <Info className="w-3 h-3" />
                          What's content made for kids?
                        </p>
                      </div>
                    </div>

                    <RadioGroup
                      defaultValue="not-for-kids"
                      className="space-y-3 p-4 bg-card rounded-md border border-border"
                    >
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="for-kids" id="for-kids" />
                        <Label
                          htmlFor="for-kids"
                          className="font-normal cursor-pointer"
                        >
                          Yes, it's made for kids
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem
                          value="not-for-kids"
                          id="not-for-kids"
                        />
                        <Label
                          htmlFor="not-for-kids"
                          className="font-normal cursor-pointer"
                        >
                          No, it's not made for kids
                        </Label>
                      </div>
                    </RadioGroup>

                    <div className="flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                      <ChevronDown className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Age restriction (advanced)
                      </span>
                    </div>
                  </div>
                  {/* Show More Trigger */}
                  <Button
                    variant="ghost"
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 font-semibold text-sm pl-0 uppercase"
                    onClick={() => setShowMore(!showMore)}
                  >
                    {showMore ? "Show Less" : "Show More"}
                  </Button>
                  {/* Expanded Content */}
                  {showMore && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                      {/* Paid Promotion */}
                      <div className="space-y-2">
                        <Label className="text-base font-medium">
                          Paid promotion
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          If you accepted anything of value to make this video,
                          you must avoid creating a false impression.
                        </p>
                        <div className="flex items-start space-x-2">
                          <Checkbox id="paid-promo" />
                          <Label
                            htmlFor="paid-promo"
                            className="font-normal text-muted-foreground text-sm cursor-pointer leading-tight"
                          >
                            My video contains paid promotion like a product
                            placement, sponsorship, or endorsement
                          </Label>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Tags</Label>
                        <p className="text-xs text-muted-foreground">
                          Tags can be useful if content in your video is
                          commonly misspelled. Otherwise, tags play a minimal
                          role in your video's discovery.
                        </p>
                        <div className="border border-input rounded-md p-3 bg-card flex flex-wrap gap-2 focus-within:border-foreground transition-colors">
                          {tags.map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="gap-1 pr-1 font-normal text-sm"
                            >
                              {tag}
                              <X
                                className="w-3 h-3 hover:text-foreground cursor-pointer"
                                onClick={() => removeTag(tag)}
                              />
                            </Badge>
                          ))}
                          <input
                            type="text"
                            className="bg-transparent border-0 outline-none flex-1 min-w-[100px] text-sm h-6 text-foreground placeholder:text-muted-foreground"
                            placeholder="Add tag"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enter a comma after each tag
                        </p>
                      </div>

                      {/* Language and Captions */}
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">
                            Video language
                          </Label>
                          <Select defaultValue="korean">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="korean">Korean</SelectItem>
                              <SelectItem value="english">English</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">
                            Caption certification
                          </Label>
                          <Select defaultValue="none">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="certification">
                                This content has never aired on television in
                                the U.S.
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* License */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                          License
                        </Label>
                        <Select defaultValue="standard">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">
                              Standard YouTube License
                            </SelectItem>
                            <SelectItem value="cc">
                              Creative Commons - Attribution
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-start space-x-2 pt-2">
                          <Checkbox id="embedding" defaultChecked />
                          <Label
                            htmlFor="embedding"
                            className="font-normal text-muted-foreground text-sm cursor-pointer"
                          >
                            Allow embedding
                          </Label>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Checkbox id="feed" defaultChecked />
                          <Label
                            htmlFor="feed"
                            className="font-normal text-muted-foreground text-sm cursor-pointer"
                          >
                            Publish to subscriptions feed and notify subscribers
                          </Label>
                        </div>
                      </div>

                      {/* Shorts Remixing */}
                      <div className="space-y-2">
                        <Label className="text-base font-medium">
                          Shorts remixing
                        </Label>
                        <RadioGroup defaultValue="allow" className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="allow" id="allow" />
                            <Label
                              htmlFor="allow"
                              className="font-normal cursor-pointer"
                            >
                              Allow video and audio remixing
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="audio-only"
                              id="audio-only"
                            />
                            <Label
                              htmlFor="audio-only"
                              className="font-normal cursor-pointer"
                            >
                              Allow only audio remixing
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="none" id="none" />
                            <Label
                              htmlFor="none"
                              className="font-normal cursor-pointer"
                            >
                              Don't allow remixing
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Category */}
                      <div className="space-y-2">
                        <Label className="text-base font-medium">
                          Category
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Add your video to a category so viewers can find it
                          more easily.
                        </p>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="w-full md:w-[350px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="Entertainment">
                              Entertainment
                            </SelectItem>
                            <SelectItem value="Music">Music</SelectItem>
                            <SelectItem value="Gaming">Gaming</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="People & Blogs">
                              People & Blogs
                            </SelectItem>
                            <SelectItem value="Comedy">Comedy</SelectItem>
                            <SelectItem value="Film & Animation">
                              Film & Animation
                            </SelectItem>
                            <SelectItem value="Autos & Vehicles">
                              Autos & Vehicles
                            </SelectItem>
                            <SelectItem value="Pets & Animals">
                              Pets & Animals
                            </SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Travel & Events">
                              Travel & Events
                            </SelectItem>
                            <SelectItem value="Science & Technology">
                              Science & Technology
                            </SelectItem>
                            <SelectItem value="News & Politics">
                              News & Politics
                            </SelectItem>
                            <SelectItem value="Howto & Style">
                              Howto & Style
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Comments */}
                      <div className="space-y-2">
                        <Label className="text-base font-medium">
                          Comments and ratings
                        </Label>
                        <RadioGroup defaultValue="on" className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="on" id="comments-on" />
                            <Label
                              htmlFor="comments-on"
                              className="font-normal"
                            >
                              On
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="off" id="comments-off" />
                            <Label
                              htmlFor="comments-off"
                              className="font-normal"
                            >
                              Off
                            </Label>
                          </div>
                        </RadioGroup>
                        <div className="flex items-start space-x-2 pt-2">
                          <Checkbox id="show-likes" defaultChecked />
                          <Label
                            htmlFor="show-likes"
                            className="font-normal text-muted-foreground text-sm cursor-pointer"
                          >
                            Show how many viewers like this video
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="h-20"></div> {/* Spacer for bottom scroll */}
                </div>
              </div>

              {/* Right Sidebar (Preview) */}
              <div className="w-[350px] bg-card border-l border-border p-0 flex flex-col hidden lg:flex">
                <div className="p-4 flex-1">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4 group cursor-pointer">
                    {(result.thumbnail?.thumbnails || []).length > 0 ? (
                      <img
                        src={
                          selectedThumbnail ||
                          (result.thumbnail?.thumbnails || [])[
                            (result.thumbnail?.thumbnails || []).length - 1
                          ]?.url
                        }
                        alt="video preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <MonitorPlay className="text-white fill-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-1 py-0.5 bg-black/80 text-white text-xs rounded">
                      {formatDuration(result.lengthSeconds)}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Video Link
                      </Label>
                      <div className="flex items-center text-blue-500 gap-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-sm no-underline hover:underline"
                        >
                          {url}
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Filename
                      </Label>
                      <p className="text-sm truncate text-foreground">
                        {result.title}.mp4
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Video Quality
                      </Label>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="secondary"
                          className="bg-blue-500 text-white hover:bg-blue-600 rounded-sm text-[10px] h-5 px-1 font-bold"
                        >
                          SD
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-muted text-muted-foreground hover:bg-muted/80 rounded-sm text-[10px] h-5 px-1 font-bold"
                        >
                          HD
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-muted text-muted-foreground hover:bg-muted/80 rounded-sm text-[10px] h-5 px-1 font-bold"
                        >
                          4K
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Actions */}
                <div className="p-2 border-t border-border space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted gap-3 font-normal"
                  >
                    <Captions className="w-5 h-5" />
                    Subtitles
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted gap-3 font-normal"
                  >
                    <RectangleHorizontal className="w-5 h-5" />
                    End screen
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted gap-3 font-normal"
                  >
                    <CreditCard className="w-5 h-5" />
                    Cards
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Guide & FAQ Section */}
      <div className="w-full max-w-6xl mx-auto mt-20 px-4 space-y-16">
        {/* Step-by-Step Guide */}
        <section>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.youtube_preview?.guide_title || "How to Use YouTube Preview Editor"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.youtube_preview?.guide_desc || "Learn how to preview and optimize your YouTube video metadata for better visibility."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: dict?.youtube_preview?.step1_title || "Enter the Video URL",
                desc: dict?.youtube_preview?.step1_desc || "Paste any YouTube video URL to load its current metadata.",
                icon: Link2,
              },
              {
                step: 2,
                title: dict?.youtube_preview?.step2_title || "Edit the Metadata",
                desc: dict?.youtube_preview?.step2_desc || "Modify the video title, description, tags, and other settings.",
                icon: PenLine,
              },
              {
                step: 3,
                title: dict?.youtube_preview?.step3_title || "Preview the Result",
                desc: dict?.youtube_preview?.step3_desc || "Review how your video will appear on YouTube with the updated metadata.",
                icon: Eye,
              },
            ].map((step) => (
              <Card key={step.step} className="border-blue-100 dark:border-blue-900/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold">
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
              {dict?.youtube_preview?.tips_title || "YouTube Metadata Optimization Tips"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.youtube_preview?.tips_desc || "Improve your video's visibility and click-through rate with these proven strategies."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: dict?.youtube_preview?.tip1_title || "Craft Compelling Titles",
                desc: dict?.youtube_preview?.tip1_desc || "Keep titles under 60 characters. Place important keywords at the beginning.",
                icon: Type,
              },
              {
                title: dict?.youtube_preview?.tip2_title || "Write Detailed Descriptions",
                desc: dict?.youtube_preview?.tip2_desc || "Include a summary in the first 2-3 lines, relevant keywords, timestamps, and links.",
                icon: FileText,
              },
              {
                title: dict?.youtube_preview?.tip3_title || "Use Strategic Tags",
                desc: dict?.youtube_preview?.tip3_desc || "Add 5-15 relevant tags mixing broad and specific terms.",
                icon: Tags,
              },
              {
                title: dict?.youtube_preview?.tip4_title || "Optimize Thumbnail Selection",
                desc: dict?.youtube_preview?.tip4_desc || "Choose thumbnails with bright colors, clear text overlay, and expressive faces.",
                icon: CheckCircle2,
              },
            ].map((tip, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <Info className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.youtube_preview?.features_title || "Preview Editor Features"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.youtube_preview?.features_desc || "Everything you need to perfect your YouTube video metadata."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: dict?.youtube_preview?.feature1_title || "YouTube Studio Interface",
                desc: dict?.youtube_preview?.feature1_desc || "Edit metadata in an interface that mirrors YouTube Studio.",
              },
              {
                title: dict?.youtube_preview?.feature2_title || "Real-Time Preview",
                desc: dict?.youtube_preview?.feature2_desc || "See your changes reflected instantly in the preview panel.",
              },
              {
                title: dict?.youtube_preview?.feature3_title || "Tag Management",
                desc: dict?.youtube_preview?.feature3_desc || "Add, remove, and organize video tags with an intuitive editor.",
              },
              {
                title: dict?.youtube_preview?.feature4_title || "Complete Settings",
                desc: dict?.youtube_preview?.feature4_desc || "Preview audience settings, license options, and more.",
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
              {dict?.qna_youtube_preview?.title || "YouTube Preview Editor FAQ"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.qna_youtube_preview?.desc || "Frequently asked questions about using the YouTube Preview Editor."}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {[1, 2, 3, 4, 5].map((i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">
                  {dict?.qna_youtube_preview?.[`faq_${i}_q`] || "Question"}
                </AccordionTrigger>
                <AccordionContent className="whitespace-pre-line text-muted-foreground">
                  {dict?.qna_youtube_preview?.[`faq_${i}_a`] || "Answer"}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}

function formatDuration(seconds: string) {
  const s = parseInt(seconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
