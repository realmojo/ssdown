"use client";

import { useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Share2,
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  CircleX,
  Copy,
  ExternalLink,
  Facebook,
  Linkedin,
  MessageCircle,
  X as XIcon,
  Lightbulb,
  Link2,
  ScanSearch,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

interface OgWarning {
  level: "error" | "warning";
  message: string;
}

interface MetaTag {
  attr: "property" | "name";
  key: string;
  content: string;
}

interface OgDebuggerResult {
  error?: string;
  message?: string;
  requestedUrl?: string;
  finalUrl?: string;
  redirected?: boolean;
  statusCode?: number;
  fetchTimeMs?: number;
  basic?: {
    title?: string;
    description?: string;
    canonical?: string;
    favicon?: string;
    themeColor?: string;
  };
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
    imageWidth?: string;
    imageHeight?: string;
    imageAlt?: string;
    url?: string;
    type?: string;
    siteName?: string;
    locale?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
    site?: string;
    creator?: string;
  };
  tags?: MetaTag[];
  warnings?: OgWarning[];
}

function domainOf(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function OgDebuggerClient({ dict }: { dict?: any }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OgDebuggerResult | null>(null);

  const d = dict?.og_debugger;

  const runAnalysis = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/og-debugger?url=${encodeURIComponent(trimmed)}`);
      const data: OgDebuggerResult = await res.json();
      setResult(data);
      if (data.error) {
        toast.error(data.message || d?.error_generic || "이 주소를 분석하지 못했습니다");
      }
    } catch (err) {
      console.error(err);
      setResult({ error: "network_error", message: "네트워크 오류" });
      toast.error(d?.error_generic || "이 주소를 분석하지 못했습니다");
    } finally {
      setLoading(false);
    }
  }, [url, d]);

  const preview = useMemo(() => {
    if (!result || result.error) return null;
    const og = result.openGraph || {};
    const tw = result.twitter || {};
    const basic = result.basic || {};
    return {
      title: og.title || tw.title || basic.title || "",
      description: og.description || tw.description || basic.description || "",
      image: og.image || tw.image,
      domain: domainOf(og.url || result.finalUrl),
      favicon: basic.favicon,
    };
  }, [result]);

  const errorCount = result?.warnings?.filter((w) => w.level === "error").length ?? 0;
  const warningCount = result?.warnings?.filter((w) => w.level === "warning").length ?? 0;

  const statusInfo = useMemo(() => {
    if (!result || result.error) return null;
    if (errorCount > 0) {
      return {
        label: d?.status_critical || "Critical Issues",
        className:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900",
        Icon: CircleX,
      };
    }
    if (warningCount > 0) {
      return {
        label: d?.status_warning || "Needs Improvement",
        className:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900",
        Icon: AlertTriangle,
      };
    }
    return {
      label: d?.status_good || "Looks Good",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
      Icon: CheckCircle2,
    };
  }, [result, errorCount, warningCount, d]);

  const copyAllTags = () => {
    if (!result?.tags?.length) return;
    const text = result.tags
      .map((t) => `<meta ${t.attr}="${t.key}" content="${t.content}" />`)
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success(d?.copied || "클립보드에 복사했습니다");
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex w-full flex-col">
            <div className="hidden">
              <Share2 className="w-10 h-10 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
              {d?.title || "Open Graph Debugger"}
            </h1>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              {d?.subtitle ||
                "Preview how any link will look when shared on Facebook, X, LinkedIn, and KakaoTalk. Inspect Open Graph and Twitter Card tags instantly."}
            </p>

            <Adsense slotId="7759160077" />

            <Card className="border-fuchsia-100 dark:border-fuchsia-900/50 shadow-sm w-full">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="url"
                    placeholder={d?.input_placeholder || "https://mindpang.com/worldcup/wc-football-star"}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") runAnalysis();
                    }}
                    className="h-12 text-base flex-1"
                  />
                  <Button
                    onClick={runAnalysis}
                    disabled={!url.trim() || loading}
                    size="lg"
                    className="h-12 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-8"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5 mr-2" />
                    )}
                    {d?.analyze_btn || "Analyze"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {d?.input_hint ||
                    "We fetch the page server-side using a social-crawler user agent, just like Facebook and X do."}
                </p>
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <div className="w-full mt-2 space-y-2">
                {result.error ? (
                  <Alert variant="destructive">
                    <CircleX className="h-4 w-4" />
                    <AlertDescription>
                      {result.message || d?.error_generic || "이 주소를 분석하지 못했습니다"}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {/* Summary */}
                    <div className="flex flex-wrap items-center gap-3 justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {preview?.favicon ? (
                          <img
                            src={preview.favicon}
                            alt=""
                            className="w-6 h-6 rounded shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Link2 className="w-5 h-5 text-muted-foreground shrink-0" />
                        )}
                        <a
                          href={result.finalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium truncate hover:underline flex items-center gap-1"
                        >
                          {domainOf(result.finalUrl)}
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                        {result.redirected && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            {d?.redirected || "Redirected"}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs shrink-0">
                          HTTP {result.statusCode}
                        </Badge>
                      </div>
                      {statusInfo && (
                        <span
                          className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full border ${statusInfo.className}`}
                        >
                          <statusInfo.Icon className="w-4 h-4" />
                          {statusInfo.label}
                        </span>
                      )}
                    </div>

                    {/* Warnings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <ListChecks className="w-5 h-5 text-fuchsia-500" />
                          {d?.checks_title || "Checks"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {result.warnings && result.warnings.length > 0 ? (
                          <ul className="space-y-3">
                            {result.warnings.map((w, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm">
                                {w.level === "error" ? (
                                  <CircleX className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                )}
                                <span>{w.message}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            {d?.no_issues || "No issues found — this link is ready to share."}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Social previews */}
                    <div>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ScanSearch className="w-5 h-5 text-fuchsia-500" />
                        {d?.previews_title || "Share Previews"}
                      </h2>
                      <div className="grid md:grid-cols-2 gap-2">
                        {/* Facebook */}
                        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
                            <Facebook className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-semibold text-muted-foreground">Facebook</span>
                          </div>
                          {preview?.image ? (
                            <img src={preview.image} alt="" className="w-full aspect-[1.91/1] object-cover bg-gray-100 dark:bg-gray-800" />
                          ) : (
                            <div className="w-full aspect-[1.91/1] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-muted-foreground text-sm">
                              {d?.no_image || "No image"}
                            </div>
                          )}
                          <div className="p-3 bg-gray-50 dark:bg-gray-900/60">
                            <p className="text-xs uppercase text-muted-foreground truncate">{preview?.domain}</p>
                            <p className="font-semibold text-sm truncate">{preview?.title || d?.no_title || "No title"}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{preview?.description}</p>
                          </div>
                        </div>

                        {/* X / Twitter */}
                        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
                            <XIcon className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold text-muted-foreground">X (Twitter)</span>
                            {result.twitter?.card && (
                              <Badge variant="outline" className="text-[10px] ml-auto">
                                {result.twitter.card}
                              </Badge>
                            )}
                          </div>
                          {preview?.image ? (
                            <img src={preview.image} alt="" className="w-full aspect-[1.91/1] object-cover bg-gray-100 dark:bg-gray-800" />
                          ) : (
                            <div className="w-full aspect-[1.91/1] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-muted-foreground text-sm">
                              {d?.no_image || "No image"}
                            </div>
                          )}
                          <div className="p-3 rounded-b-xl border-t border-gray-100 dark:border-gray-800">
                            <p className="font-semibold text-sm truncate">{preview?.title || d?.no_title || "No title"}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{preview?.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{preview?.domain}</p>
                          </div>
                        </div>

                        {/* LinkedIn */}
                        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
                            <Linkedin className="w-4 h-4 text-sky-700" />
                            <span className="text-xs font-semibold text-muted-foreground">LinkedIn</span>
                          </div>
                          {preview?.image ? (
                            <img src={preview.image} alt="" className="w-full aspect-[1.91/1] object-cover bg-gray-100 dark:bg-gray-800" />
                          ) : (
                            <div className="w-full aspect-[1.91/1] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-muted-foreground text-sm">
                              {d?.no_image || "No image"}
                            </div>
                          )}
                          <div className="p-3">
                            <p className="font-semibold text-sm truncate">{preview?.title || d?.no_title || "No title"}</p>
                            <p className="text-xs text-muted-foreground truncate mt-1">{preview?.domain}</p>
                          </div>
                        </div>

                        {/* KakaoTalk */}
                        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
                            <MessageCircle className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs font-semibold text-muted-foreground">KakaoTalk</span>
                          </div>
                          <div className="p-3 flex gap-3 items-start">
                            {preview?.image ? (
                              <img src={preview.image} alt="" className="w-16 h-16 rounded-md object-cover bg-gray-100 dark:bg-gray-800 shrink-0" />
                            ) : (
                              <div className="w-16 h-16 rounded-md bg-gray-100 dark:bg-gray-800 shrink-0 flex items-center justify-center text-muted-foreground text-[10px] text-center">
                                {d?.no_image || "No image"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{preview?.title || d?.no_title || "No title"}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{preview?.description}</p>
                              <p className="text-xs text-muted-foreground mt-1 truncate">{preview?.domain}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Raw tags */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-lg">
                          {d?.tags_title || "Detected Tags"} ({result.tags?.length ?? 0})
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={copyAllTags}>
                          <Copy className="w-3.5 h-3.5 mr-1.5" />
                          {d?.copy_all || "Copy all"}
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto -mx-2">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-muted-foreground border-b border-gray-100 dark:border-gray-800">
                                <th className="py-2 px-2 font-medium">{d?.col_property || "Property"}</th>
                                <th className="py-2 px-2 font-medium">{d?.col_content || "Content"}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.tags?.map((t, i) => (
                                <tr key={i} className="border-b border-gray-50 dark:border-gray-900 last:border-0">
                                  <td className="py-2 px-2 font-mono text-xs text-fuchsia-600 dark:text-fuchsia-400 whitespace-nowrap align-top">
                                    {t.key}
                                  </td>
                                  <td className="py-2 px-2 text-xs break-all">{t.content}</td>
                                </tr>
                              ))}
                              {(!result.tags || result.tags.length === 0) && (
                                <tr>
                                  <td colSpan={2} className="py-4 text-center text-muted-foreground text-sm">
                                    {d?.no_tags || "No meta tags found"}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Guide, Tips, FAQ */}
          <div className="w-full max-w-5xl mx-auto mt-3 px-4 space-y-3">
            {/* How to Use */}
            <section>
              <div className="text-center mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  {d?.guide_title || "How It Works"}
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-2">
                {[
                  {
                    step: 1,
                    title: d?.step1_title || "Paste a URL",
                    desc: d?.step1_desc || "Enter any public page URL you want to check.",
                    icon: Link2,
                  },
                  {
                    step: 2,
                    title: d?.step2_title || "We Fetch It",
                    desc:
                      d?.step2_desc ||
                      "Our server requests the page using a social-crawler user agent, just like Facebook or X would.",
                    icon: ScanSearch,
                  },
                  {
                    step: 3,
                    title: d?.step3_title || "Review Results",
                    desc:
                      d?.step3_desc ||
                      "See exactly how the link preview will render, plus a full list of detected meta tags and warnings.",
                    icon: ListChecks,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/20 dark:to-pink-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-2 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                    {d?.tips_title || "Open Graph Tips"}
                  </h2>
                  <p className="text-muted-foreground">
                    {d?.tips_desc || "Make sure your links always look their best when shared."}
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    { title: d?.tip1_title || "Use a 1200×630 Image", desc: d?.tip1_desc },
                    { title: d?.tip2_title || "Set og:image:width/height", desc: d?.tip2_desc },
                    { title: d?.tip3_title || "Keep Titles Under 60 Chars", desc: d?.tip3_desc },
                    { title: d?.tip4_title || "Add twitter:card", desc: d?.tip4_desc },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-fuchsia-600 dark:text-fuchsia-400 mb-2">
                        {tip.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{tip.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto">
              <div className="text-center mb-2">
                <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
                  {dict?.page_og_debugger?.faq ? d?.faq_title || "FAQ" : "FAQ"}
                </h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {(dict?.page_og_debugger?.faq || []).map((item: { question: string; answer: string }, idx: number) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>
        </div>
        <aside className="hidden shrink-0 xl:block xl:w-[200px]">
          <ToolsSidebar category="utility" dict={dict} />
        </aside>
      </div>
    </div>
  );
}
