"use client";

import { useState, useCallback } from "react";
import {
  Binary,
  ArrowRight,
  Trash2,
  Copy,
  ArrowDownUp,
  Lock,
  Lightbulb,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

type Mode = "base64" | "url";

function encodeBase64(input: string): string {
  return btoa(unescape(encodeURIComponent(input)));
}

function decodeBase64(input: string): string {
  return decodeURIComponent(escape(atob(input)));
}

function byteLength(input: string): number {
  return new TextEncoder().encode(input).length;
}

export function Base64UrlEncoderClient({ dict }: { dict?: any }) {
  const [mode, setMode] = useState<Mode>("base64");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [encodeFullUrl, setEncodeFullUrl] = useState(false);

  const handleEncode = useCallback(() => {
    if (!input) return;
    try {
      if (mode === "base64") {
        setOutput(encodeBase64(input));
      } else {
        setOutput(encodeFullUrl ? encodeURI(input) : encodeURIComponent(input));
      }
    } catch {
      toast.error(mode === "base64" ? "Invalid Base64 input" : "Invalid URL input");
    }
  }, [input, mode, encodeFullUrl]);

  const handleDecode = useCallback(() => {
    if (!input) return;
    try {
      if (mode === "base64") {
        setOutput(decodeBase64(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch {
      toast.error(mode === "base64" ? "Invalid Base64 input" : "Invalid URL input");
    }
  }, [input, mode]);

  const handleSwap = useCallback(() => {
    if (!output) return;
    setInput(output);
    setOutput("");
  }, [output]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Output copied to clipboard");
    } catch {
      toast.error("Failed to copy output");
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
  }, []);

  const modeTabs: { value: Mode; label: string; icon: typeof Binary }[] = [
    { value: "base64", label: "Base64", icon: Binary },
    { value: "url", label: "URL", icon: Link2 },
  ];

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-5xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-lime-100 to-green-100 dark:from-lime-900/30 dark:to-green-900/30 mb-6">
              <Binary className="w-10 h-10 text-lime-600 dark:text-lime-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {dict?.base64_url_encoder?.title || "Base64 / URL Encoder"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {dict?.base64_url_encoder?.subtitle ||
                "Encode and decode Base64 and URL text instantly and securely, right in your browser."}
            </p>

            <Adsense slotId="7759160077" />

            {/* Mode Toggle */}
            <div className="w-full flex justify-center mb-6">
              <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                {modeTabs.map((tab) => {
                  const active = mode === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setMode(tab.value)}
                      className={`inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                        active
                          ? "bg-lime-500 text-white shadow-sm"
                          : "text-muted-foreground hover:bg-lime-50 dark:hover:bg-lime-900/20"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Converter */}
            <Card className="w-full border-lime-100 dark:border-lime-900/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Binary className="w-5 h-5 text-lime-500" />
                  {mode === "base64" ? "Base64 Converter" : "URL Converter"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClear}
                    disabled={!input && !output}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Input
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {byteLength(input)} bytes
                    </span>
                  </div>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type or paste your text here..."
                    className="w-full min-h-[160px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500 transition-colors placeholder:text-muted-foreground font-mono"
                  />
                </div>

                {/* URL full-encode option */}
                {mode === "url" && (
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={encodeFullUrl}
                      onChange={(e) => setEncodeFullUrl(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500/50 accent-lime-500"
                    />
                    Encode full URL (encodeURI) — preserves <code className="px-1">:/?#</code>
                  </label>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleEncode}
                    disabled={!input}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-lime-500 text-white hover:bg-lime-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Encode
                  </button>
                  <button
                    onClick={handleDecode}
                    disabled={!input}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg border border-lime-300 dark:border-lime-800 text-lime-700 dark:text-lime-300 hover:bg-lime-50 dark:hover:bg-lime-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Decode
                  </button>
                  <button
                    onClick={handleSwap}
                    disabled={!output}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-lime-50 dark:hover:bg-lime-900/20 hover:border-lime-300 dark:hover:border-lime-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowDownUp className="w-4 h-4" />
                    Swap
                  </button>
                </div>

                {/* Output */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Output
                    </label>
                    <button
                      onClick={handleCopy}
                      disabled={!output}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-lime-50 dark:hover:bg-lime-900/20 hover:border-lime-300 dark:hover:border-lime-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </button>
                  </div>
                  <textarea
                    value={output}
                    readOnly
                    placeholder="Result appears here..."
                    className="w-full min-h-[160px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-base leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500 transition-colors placeholder:text-muted-foreground font-mono"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guide, Tips, FAQ */}
          <div className="w-full max-w-5xl mx-auto mt-16 px-4 space-y-16">
            {/* How to Use */}
            <section>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  How to Use
                </h2>
                <p className="text-muted-foreground">
                  Convert Base64 and URL text in seconds.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: "Choose a Mode",
                    desc: "Switch between Base64 and URL depending on the kind of conversion you need.",
                    icon: Binary,
                  },
                  {
                    step: 2,
                    title: "Encode or Decode",
                    desc: "Paste your text into the input, then press Encode or Decode to transform it instantly.",
                    icon: ArrowRight,
                  },
                  {
                    step: 3,
                    title: "Copy the Result",
                    desc: "Copy the output to your clipboard, or use Swap to feed it back for a reverse conversion.",
                    icon: Copy,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-lime-100 dark:bg-lime-900/30 text-lime-600 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-900/20 dark:to-green-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-lime-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Encoding Tips</h2>
                  <p className="text-muted-foreground">
                    Get the most out of Base64 and URL conversions.
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Base64 Is Not Encryption",
                      desc: "Base64 only encodes data into an ASCII-safe format. It is easily reversible, so never use it to protect passwords or secrets.",
                    },
                    {
                      title: "UTF-8 Safe by Design",
                      desc: "This tool handles emoji and accented characters correctly by converting to UTF-8 bytes before Base64, avoiding the classic btoa() error.",
                    },
                    {
                      title: "Component vs Full URL",
                      desc: "Use standard URL encode for a single query value, and 'Encode full URL' when you need a complete, valid link that keeps its slashes and colons.",
                    },
                    {
                      title: "Use Swap to Verify",
                      desc: "After encoding, hit Swap and Decode to confirm you get the original text back — a quick round-trip sanity check.",
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-lime-600 dark:text-lime-400 mb-2">
                        {tip.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {tip.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Privacy note */}
            <section className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <Lock className="w-4 h-4 text-lime-500" />
              All conversion runs locally in your browser. No data leaves your device.
            </section>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4">FAQ</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    q: "Does my text get sent to a server?",
                    a: "No. All Base64 and URL encoding or decoding happens entirely in your browser using native JavaScript. Your text never leaves your device and is never uploaded or stored anywhere.",
                  },
                  {
                    q: "Does Base64 encoding support Unicode and emoji?",
                    a: "Yes. This tool is fully UTF-8 safe. It correctly encodes and decodes non-ASCII characters, accented letters, and emoji by handling the UTF-8 byte sequence before applying Base64.",
                  },
                  {
                    q: "What is the difference between URL encode and encodeURI?",
                    a: "Standard URL encode (encodeURIComponent) escapes every reserved character, making it ideal for encoding a single query parameter value. The 'Encode full URL' option (encodeURI) preserves characters like :/?# so a complete URL stays valid and clickable.",
                  },
                  {
                    q: "Why do I get an 'Invalid Base64 input' error?",
                    a: "That error appears when the input is not valid Base64, such as containing spaces, line breaks, or characters outside the Base64 alphabet. Make sure you are decoding a properly encoded Base64 string, or switch the mode to encode first.",
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
