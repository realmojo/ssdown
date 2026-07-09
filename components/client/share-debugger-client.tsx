"use client";

import { useCallback, useState, type ComponentType } from "react";
import {
  Share2,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
  Facebook,
  Twitter,
  MessageCircle,
  AtSign,
  Globe,
  Newspaper,
  Search,
  ImageOff,
  CheckCircle2,
  XCircle,
  Gauge,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

interface RawTag {
  key: string;
  value: string;
}

interface ShareMeta {
  requestedUrl: string;
  inputUrl: string;
  contentType: string;
  domain: string;
  title: string;
  pageTitle: string;
  description: string;
  metaDescription: string;
  image: string;
  imageWidth: number | null;
  imageHeight: number | null;
  siteName: string;
  ogType: string;
  ogUrl: string;
  twitterCard: string;
  twitterSite: string;
  themeColor: string;
  locale: string;
  canonical: string;
  favicon: string;
  hasViewport: boolean;
  hasStructuredData: boolean;
  rawTags: RawTag[];
}

interface SeoCheck {
  label: string;
  detail: string;
  status: "pass" | "warning" | "fail";
  points: number;
  maxPoints: number;
}

function computeSeoScore(meta: ShareMeta): { score: number; checks: SeoCheck[] } {
  const checks: SeoCheck[] = [];

  const titleLen = meta.pageTitle.length;
  if (!meta.pageTitle) {
    checks.push({ label: "Title tag", detail: "Missing <title> tag.", status: "fail", points: 0, maxPoints: 15 });
  } else if (titleLen < 10 || titleLen > 60) {
    checks.push({
      label: "Title tag",
      detail: `${titleLen} characters. Aim for 10-60 characters.`,
      status: "warning",
      points: 8,
      maxPoints: 15,
    });
  } else {
    checks.push({
      label: "Title tag",
      detail: `${titleLen} characters. Good length.`,
      status: "pass",
      points: 15,
      maxPoints: 15,
    });
  }

  const descLen = meta.metaDescription.length;
  if (!meta.metaDescription) {
    checks.push({ label: "Meta description", detail: "Missing meta description.", status: "fail", points: 0, maxPoints: 15 });
  } else if (descLen < 50 || descLen > 160) {
    checks.push({
      label: "Meta description",
      detail: `${descLen} characters. Aim for 50-160 characters.`,
      status: "warning",
      points: 8,
      maxPoints: 15,
    });
  } else {
    checks.push({
      label: "Meta description",
      detail: `${descLen} characters. Good length.`,
      status: "pass",
      points: 15,
      maxPoints: 15,
    });
  }

  checks.push(
    meta.title
      ? { label: "Open Graph title", detail: "og:title found.", status: "pass", points: 10, maxPoints: 10 }
      : { label: "Open Graph title", detail: "Missing og:title.", status: "fail", points: 0, maxPoints: 10 },
  );

  checks.push(
    meta.description
      ? { label: "Open Graph description", detail: "og:description found.", status: "pass", points: 10, maxPoints: 10 }
      : { label: "Open Graph description", detail: "Missing og:description.", status: "fail", points: 0, maxPoints: 10 },
  );

  if (!meta.image) {
    checks.push({ label: "Open Graph image", detail: "Missing og:image.", status: "fail", points: 0, maxPoints: 15 });
  } else {
    checks.push({ label: "Open Graph image", detail: "og:image found.", status: "pass", points: 15, maxPoints: 15 });
  }

  if (!meta.image) {
    checks.push({ label: "Image size", detail: "No image to measure.", status: "fail", points: 0, maxPoints: 10 });
  } else if (!meta.imageWidth || !meta.imageHeight) {
    checks.push({
      label: "Image size",
      detail: "og:image:width/height not declared. Platforms may crop unpredictably.",
      status: "warning",
      points: 5,
      maxPoints: 10,
    });
  } else if (meta.imageWidth >= 1200 && meta.imageHeight >= 630) {
    checks.push({
      label: "Image size",
      detail: `${meta.imageWidth}×${meta.imageHeight}. Meets the 1200×630 recommendation.`,
      status: "pass",
      points: 10,
      maxPoints: 10,
    });
  } else {
    checks.push({
      label: "Image size",
      detail: `${meta.imageWidth}×${meta.imageHeight}. Below the recommended 1200×630.`,
      status: "warning",
      points: 5,
      maxPoints: 10,
    });
  }

  checks.push(
    meta.siteName
      ? { label: "Site name", detail: "og:site_name found.", status: "pass", points: 5, maxPoints: 5 }
      : { label: "Site name", detail: "Missing og:site_name.", status: "warning", points: 0, maxPoints: 5 },
  );

  checks.push(
    meta.canonical
      ? { label: "Canonical URL", detail: "rel=canonical found.", status: "pass", points: 5, maxPoints: 5 }
      : { label: "Canonical URL", detail: "Missing rel=canonical link.", status: "warning", points: 0, maxPoints: 5 },
  );

  checks.push(
    meta.twitterCard
      ? { label: "Twitter Card", detail: `twitter:card = ${meta.twitterCard}.`, status: "pass", points: 5, maxPoints: 5 }
      : { label: "Twitter Card", detail: "Missing twitter:card.", status: "warning", points: 0, maxPoints: 5 },
  );

  checks.push(
    meta.hasViewport
      ? { label: "Mobile viewport", detail: "viewport meta tag found.", status: "pass", points: 5, maxPoints: 5 }
      : { label: "Mobile viewport", detail: "Missing viewport meta tag.", status: "fail", points: 0, maxPoints: 5 },
  );

  checks.push(
    meta.hasStructuredData
      ? { label: "Structured data", detail: "JSON-LD schema found.", status: "pass", points: 5, maxPoints: 5 }
      : { label: "Structured data", detail: "No JSON-LD structured data found.", status: "warning", points: 0, maxPoints: 5 },
  );

  const score = checks.reduce((sum, c) => sum + c.points, 0);
  return { score, checks };
}

function seoGrade(score: number): { label: string; color: string; ring: string } {
  if (score >= 90) return { label: "Excellent", color: "text-green-600 dark:text-green-400", ring: "stroke-green-500" };
  if (score >= 70) return { label: "Good", color: "text-emerald-600 dark:text-emerald-400", ring: "stroke-emerald-500" };
  if (score >= 50) return { label: "Needs Work", color: "text-amber-600 dark:text-amber-400", ring: "stroke-amber-500" };
  return { label: "Poor", color: "text-red-600 dark:text-red-400", ring: "stroke-red-500" };
}

const SAMPLE_URL = "https://ssdown.app";

function truncate(text: string, max: number): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

function buildWarnings(meta: ShareMeta): string[] {
  const warnings: string[] = [];
  if (!meta.title) {
    warnings.push(
      "No og:title found. Most platforms will fall back to the page's <title> tag or show nothing.",
    );
  }
  if (!meta.description) {
    warnings.push(
      "No og:description found. The preview text will be blank on Facebook, Threads, and KakaoTalk.",
    );
  }
  if (!meta.image) {
    warnings.push(
      "No og:image found. Facebook, X, Threads, KakaoTalk, and Naver Blog will show no thumbnail.",
    );
  }
  if (meta.title && meta.title.length > 90) {
    warnings.push(
      `og:title is ${meta.title.length} characters. Facebook and X usually truncate titles longer than ~90 characters.`,
    );
  }
  if (meta.description && meta.description.length > 200) {
    warnings.push(
      `og:description is ${meta.description.length} characters. Most platforms truncate descriptions around 150-200 characters.`,
    );
  }
  if (!meta.siteName) {
    warnings.push("No og:site_name found. Facebook previews won't show a publisher name.");
  }
  return warnings;
}

function PreviewImage({
  src,
  className,
  emptyClassName,
}: {
  src: string;
  className: string;
  emptyClassName: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={emptyClassName}>
        <ImageOff className="w-5 h-5 text-gray-400" />
      </div>
    );
  }
  return <img src={src} alt="" className={className} onError={() => setFailed(true)} />;
}

function FacebookPreview({ meta }: { meta: ShareMeta }) {
  return (
    <div className="rounded-lg overflow-hidden border border-[#dadde1] dark:border-[#3a3b3c] bg-white dark:bg-[#242526]">
      <div className="w-full aspect-[1.91/1] bg-gray-100 dark:bg-gray-800">
        <PreviewImage
          src={meta.image}
          className="w-full h-full object-cover"
          emptyClassName="w-full h-full flex items-center justify-center"
        />
      </div>
      <div className="p-3 bg-[#f0f2f5] dark:bg-[#3a3b3c]">
        <p className="text-[11px] uppercase text-[#65676b] dark:text-[#b0b3b8] tracking-wide mb-1">
          {meta.domain}
        </p>
        <p className="text-[15px] font-semibold text-[#050505] dark:text-[#e4e6eb] leading-snug line-clamp-2">
          {truncate(meta.title, 100) || "No title"}
        </p>
        <p className="text-[13px] text-[#65676b] dark:text-[#b0b3b8] line-clamp-1 mt-0.5">
          {truncate(meta.description, 150)}
        </p>
      </div>
    </div>
  );
}

function XPreview({ meta }: { meta: ShareMeta }) {
  const large = meta.twitterCard !== "summary";
  if (large) {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#cfd9de] dark:border-[#38444d] bg-white dark:bg-black">
        <div className="w-full aspect-[1.91/1] bg-gray-100 dark:bg-gray-900">
          <PreviewImage
            src={meta.image}
            className="w-full h-full object-cover"
            emptyClassName="w-full h-full flex items-center justify-center"
          />
        </div>
        <div className="p-3">
          <p className="text-[13px] text-[#536471] dark:text-[#71767b] line-clamp-1">
            {meta.domain}
          </p>
          <p className="text-[15px] text-[#0f1419] dark:text-[#e7e9ea] line-clamp-1 mt-0.5">
            {truncate(meta.title, 70) || "No title"}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl overflow-hidden border border-[#cfd9de] dark:border-[#38444d] flex bg-white dark:bg-black">
      <div className="w-[96px] h-[96px] shrink-0 bg-gray-100 dark:bg-gray-900">
        <PreviewImage
          src={meta.image}
          className="w-full h-full object-cover"
          emptyClassName="w-full h-full flex items-center justify-center"
        />
      </div>
      <div className="p-3 min-w-0 flex flex-col justify-center">
        <p className="text-[13px] text-[#536471] dark:text-[#71767b] line-clamp-1">
          {meta.domain}
        </p>
        <p className="text-[15px] text-[#0f1419] dark:text-[#e7e9ea] line-clamp-2 mt-0.5">
          {truncate(meta.title, 70) || "No title"}
        </p>
      </div>
    </div>
  );
}

function KakaoTalkPreview({ meta }: { meta: ShareMeta }) {
  return (
    <div className="flex">
      <div className="max-w-[300px] w-full rounded-2xl overflow-hidden bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-gray-700 shadow-sm flex">
        <div className="w-[76px] h-[76px] shrink-0 bg-gray-100 dark:bg-gray-800">
          <PreviewImage
            src={meta.image}
            className="w-full h-full object-cover"
            emptyClassName="w-full h-full flex items-center justify-center"
          />
        </div>
        <div className="p-2.5 min-w-0 flex flex-col justify-center">
          <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
            {truncate(meta.title, 40) || "No title"}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
            {meta.domain}
          </p>
        </div>
      </div>
    </div>
  );
}

function ThreadsPreview({ meta }: { meta: ShareMeta }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
      <div className="w-full aspect-[1.91/1] bg-gray-100 dark:bg-gray-900">
        <PreviewImage
          src={meta.image}
          className="w-full h-full object-cover"
          emptyClassName="w-full h-full flex items-center justify-center"
        />
      </div>
      <div className="p-3">
        <p className="text-[12px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {meta.domain}
        </p>
        <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mt-0.5">
          {truncate(meta.title, 80) || "No title"}
        </p>
      </div>
    </div>
  );
}

function NaverBlogPreview({ meta }: { meta: ShareMeta }) {
  return (
    <div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 flex bg-white dark:bg-[#1a1a1a]">
      <div className="w-[110px] h-[110px] shrink-0 bg-gray-100 dark:bg-gray-800">
        <PreviewImage
          src={meta.image}
          className="w-full h-full object-cover"
          emptyClassName="w-full h-full flex items-center justify-center"
        />
      </div>
      <div className="p-3 min-w-0 flex flex-col justify-center gap-1">
        <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
          {truncate(meta.title, 60) || "No title"}
        </p>
        <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-2">
          {truncate(meta.description, 90)}
        </p>
        <p className="text-[12px] text-[#03c75a] font-medium mt-0.5">{meta.domain}</p>
      </div>
    </div>
  );
}

function WordPressPreview({ meta }: { meta: ShareMeta }) {
  return (
    <div className="rounded-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 flex overflow-hidden">
      <div className="w-[110px] shrink-0 bg-gray-100 dark:bg-gray-800">
        <PreviewImage
          src={meta.image}
          className="w-full h-full object-cover"
          emptyClassName="w-full h-full flex items-center justify-center"
        />
      </div>
      <div className="p-3 min-w-0 flex flex-col justify-center">
        <p className="text-[15px] font-semibold text-[#1e1e1e] dark:text-gray-100 line-clamp-1">
          {truncate(meta.title, 60) || "No title"}
        </p>
        <p className="text-[13px] text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
          {truncate(meta.description, 120)}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 uppercase tracking-wide">
          {meta.domain}
        </p>
      </div>
    </div>
  );
}

const PLATFORMS: Array<{
  key: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  iconColor: string;
  Preview: ComponentType<{ meta: ShareMeta }>;
}> = [
  { key: "facebook", label: "Facebook", Icon: Facebook, iconColor: "text-[#1877f2]", Preview: FacebookPreview },
  { key: "x", label: "X (Twitter)", Icon: Twitter, iconColor: "text-gray-900 dark:text-white", Preview: XPreview },
  { key: "kakaotalk", label: "KakaoTalk", Icon: MessageCircle, iconColor: "text-[#fee500]", Preview: KakaoTalkPreview },
  { key: "threads", label: "Threads", Icon: AtSign, iconColor: "text-gray-900 dark:text-white", Preview: ThreadsPreview },
  { key: "naver", label: "Naver Blog", Icon: Globe, iconColor: "text-[#03c75a]", Preview: NaverBlogPreview },
  { key: "wordpress", label: "WordPress", Icon: Newspaper, iconColor: "text-[#21759b]", Preview: WordPressPreview },
];

export function ShareDebuggerClient({ dict }: { dict?: any }) {
  const [url, setUrl] = useState("");
  const [meta, setMeta] = useState<ShareMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const runCheck = useCallback(async (targetUrl: string) => {
    const value = targetUrl.trim();
    if (!value) {
      setError("Please enter a URL to check.");
      return;
    }
    setLoading(true);
    setError("");
    setMeta(null);
    try {
      const res = await fetch(`/api/share-debugger?url=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch that page.");
      }
      setMeta(data as ShareMeta);
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      runCheck(url);
    },
    [url, runCheck],
  );

  const handleSample = useCallback(() => {
    setUrl(SAMPLE_URL);
    runCheck(SAMPLE_URL);
  }, [runCheck]);

  const handleCopy = useCallback(() => {
    if (!meta) return;
    const text = meta.rawTags.length
      ? meta.rawTags.map((tag) => `${tag.key}: ${tag.value}`).join("\n")
      : [
          `og:title: ${meta.title}`,
          `og:description: ${meta.description}`,
          `og:image: ${meta.image}`,
          `og:site_name: ${meta.siteName}`,
          `og:url: ${meta.ogUrl}`,
          `og:type: ${meta.ogType}`,
          `twitter:card: ${meta.twitterCard}`,
        ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [meta]);

  const warnings = meta ? buildWarnings(meta) : [];
  const seo = meta ? computeSeoScore(meta) : null;
  const seoGradeInfo = seo ? seoGrade(seo.score) : null;

  return (
    <div className="container max-w-7xl mx-auto px-4 pb-16">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-5xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 mb-6">
              <Share2 className="w-10 h-10 text-sky-600 dark:text-sky-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {dict?.share_debugger?.title || "Share Debugger"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {dict?.share_debugger?.subtitle ||
                "Paste a URL to inspect its Open Graph and meta tags, then preview exactly how the link will look when shared on Facebook, X, KakaoTalk, Threads, Naver Blog, and WordPress."}
            </p>

            <Adsense slotId="7759160077" />

            {/* URL Input */}
            <Card className="w-full border-sky-100 dark:border-sky-900/50 shadow-sm mt-8">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/your-page"
                    className="flex-1"
                    inputMode="url"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="gap-2">
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      Check
                    </Button>
                    <Button type="button" variant="outline" onClick={handleSample} disabled={loading}>
                      Try Sample
                    </Button>
                  </div>
                </form>
                {error && (
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                  </p>
                )}
              </CardContent>
            </Card>

            {meta && seo && seoGradeInfo && (
              <>
                {/* SEO Score */}
                <Card className="w-full mt-8 border-gray-100 dark:border-gray-800 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Gauge className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      SEO Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-6 sm:items-center mb-6">
                      <div className="relative w-24 h-24 shrink-0 mx-auto sm:mx-0">
                        <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            strokeWidth="3"
                            className="stroke-gray-200 dark:stroke-gray-800"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            strokeWidth="3"
                            strokeDasharray={`${(seo.score / 100) * 100.5} 100.5`}
                            strokeLinecap="round"
                            className={seoGradeInfo.ring}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold">{seo.score}</span>
                          <span className="text-[10px] text-muted-foreground">/ 100</span>
                        </div>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className={`text-lg font-semibold ${seoGradeInfo.color}`}>
                          {seoGradeInfo.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Based on title, description, Open Graph tags, image size, and mobile/structured data signals.
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {seo.checks.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm">
                          {c.status === "pass" && (
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                          )}
                          {c.status === "warning" && (
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                          )}
                          {c.status === "fail" && (
                            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                          )}
                          <span>
                            <span className="font-medium">{c.label}:</span>{" "}
                            <span className="text-muted-foreground">{c.detail}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Scrape result */}
                <Card className="w-full mt-6 border-gray-100 dark:border-gray-800 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Scrape Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      <div>
                        <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">
                          Content-Type
                        </dt>
                        <dd className="break-words">{meta.contentType || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">
                          Fetched URL
                        </dt>
                        <dd className="break-all">{meta.requestedUrl}</dd>
                      </div>
                    </dl>
                    {meta.inputUrl !== meta.requestedUrl && (
                      <p className="text-xs text-muted-foreground mt-3">
                        * The fetched URL above differs from the URL you entered because the page
                        redirected.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Raw meta summary */}
                <Card className="w-full mt-6 border-gray-100 dark:border-gray-800 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <PreviewImage
                        src={meta.favicon}
                        className="w-5 h-5 rounded-sm object-contain"
                        emptyClassName="w-5 h-5"
                      />
                      {meta.domain || "Extracted Tags"}
                    </CardTitle>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copied ? "Copied" : "Copy Tags"}
                    </button>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      <div>
                        <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">
                          og:title
                        </dt>
                        <dd className="break-words">{meta.title || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">
                          og:site_name
                        </dt>
                        <dd className="break-words">{meta.siteName || "—"}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">
                          og:description
                        </dt>
                        <dd className="break-words">{meta.description || "—"}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">
                          og:image
                        </dt>
                        <dd className="break-all text-sky-600 dark:text-sky-400">
                          {meta.image || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">
                          og:type
                        </dt>
                        <dd>{meta.ogType || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">
                          twitter:card
                        </dt>
                        <dd>{meta.twitterCard || "—"}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                {/* Raw meta tags */}
                {meta.rawTags.length > 0 && (
                  <Card className="w-full mt-6 border-gray-100 dark:border-gray-800 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Raw Meta Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <tbody>
                            {meta.rawTags.map((tag, idx) => (
                              <tr
                                key={idx}
                                className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                              >
                                <td className="py-2 pr-4 font-mono text-xs text-muted-foreground whitespace-nowrap align-top">
                                  {tag.key}
                                </td>
                                <td className="py-2 break-all">{tag.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Warnings */}
                {warnings.length > 0 && (
                  <div className="w-full mt-6 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 p-4">
                    <p className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-400 mb-2 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      {warnings.length} issue{warnings.length > 1 ? "s" : ""} found
                    </p>
                    <ul className="space-y-1.5">
                      {warnings.map((w, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-amber-700 dark:text-amber-300/90 pl-6 relative before:content-['•'] before:absolute before:left-2"
                        >
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Platform previews */}
                <div className="w-full mt-10">
                  <h2 className="text-xl font-bold mb-6 text-center">Share Previews</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {PLATFORMS.map(({ key, label, Icon, iconColor, Preview }) => (
                      <div key={key}>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={`w-4 h-4 ${iconColor}`} />
                          <span className="text-sm font-semibold text-muted-foreground">
                            {label}
                          </span>
                        </div>
                        <Preview meta={meta} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Guide, Tips, FAQ */}
          <div className="w-full max-w-5xl mx-auto mt-16 px-4 space-y-16">
            {/* How to Use */}
            <section>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4">How to Use</h2>
                <p className="text-muted-foreground">
                  Check your link's share preview before you post it anywhere.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: "Paste your URL",
                    desc: "Enter the full link to the page you want to check, including https://.",
                    icon: Search,
                  },
                  {
                    step: 2,
                    title: "Inspect the tags",
                    desc: "See the exact og:title, og:description, og:image, and twitter:card values found on the page.",
                    icon: Share2,
                  },
                  {
                    step: 3,
                    title: "Compare previews",
                    desc: "View how the link renders on Facebook, X, KakaoTalk, Threads, Naver Blog, and WordPress side by side.",
                    icon: Check,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4">FAQ</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    q: "What is a Share Debugger?",
                    a: "It's a tool that fetches a URL's HTML, reads its Open Graph (og:) and Twitter Card meta tags, and shows a mock-up of how the link will look when pasted into Facebook, X, KakaoTalk, Threads, Naver Blog, or WordPress.",
                  },
                  {
                    q: "Why does my link look different on each platform?",
                    a: "Each platform reads different tags (og:title vs twitter:title), truncates text at different lengths, and uses different layouts for the thumbnail image. This tool renders those layout differences side by side so you can catch problems before sharing.",
                  },
                  {
                    q: "Why is my image or title missing?",
                    a: "Most likely the page is missing an og:image, og:title, or og:description tag, or the page requires JavaScript to render its content (crawlers only read the initial HTML, not JavaScript-rendered content).",
                  },
                  {
                    q: "Does this tool store the URLs I check?",
                    a: "No. The URL is fetched server-side to read its meta tags and the result is returned directly to your browser. Nothing is stored.",
                  },
                  {
                    q: "Why doesn't the preview match exactly what I see on Facebook or X?",
                    a: "Platforms sometimes cache a previously fetched preview, apply their own image cropping, or make small layout tweaks. This tool reflects the current meta tags on the page — if a platform is showing a stale preview, use that platform's own cache-refresh tool (e.g. Facebook Sharing Debugger) after fixing your tags.",
                  },
                ].map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx + 1}`}>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>
        </div>
        <aside className="hidden lg:block w-64 shrink-0">
          <ToolsSidebar category="utility" dict={dict} />
        </aside>
      </div>
    </div>
  );
}
