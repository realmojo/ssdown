"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
import Adsense from "@/components/Adsense";
  Copy,
  CheckCircle2,
  AlignLeft,
  Type,
  Lightbulb,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

export function InstagramLineBreakClient({ dict }: { dict?: any }) {
  const [text, setText] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleConvert = () => {
    // Replace newlines with newline + zero-width space
    // Standard approach: Ensure line breaks are preserved by using a special separator if needed,
    // but often just ensuring clean unicode newlines works.
    // However, the "invisible char" trick is: newline + \u2063 (invisible separator) or \u2800 (braille blank)
    // Let's use the most reliable method: \n + \u2800 (braille pattern blank) often works best for Instagram to force a line.
    // Or just simple unicode \u2063 invisible separator.

    // Simple logic: Replace multiple newlines with single ones potentially,
    // BUT usually users want to KEEP empty lines.
    // So we replace any newline that is followed by another newline (empty line) with an invisible char.

    // Strategy:
    // 1. Trim end of lines
    // 2. Replace empty lines (double \n) with \n\u2800\n

    // Actually, a common simple formatter logic:
    // Remove extra spaces at end of lines.
    // Replace empty lines with a special blank char.

    let result = text;

    // 1. Remove trailing spaces on each line
    result = result
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n");

    // 2. Replace empty lines with invisible separator
    // Convert double newlines to newline + invisible char + newline
    // The \u2800 is the "Braille Pattern Blank" which is treated as a character by IG but looks empty.
    result = result.replace(/\n\n/g, "\n\u2800\n");

    setConvertedText(result);
    copyToClipboard(result);
  };

  const copyToClipboard = async (str: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(str);
        setIsCopied(true);
        toast.success("Converted & Copied!");
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy", err);
      toast.error("Failed to copy");
    }
  };

  const handleReset = () => {
    setText("");
    setConvertedText("");
    setIsCopied(false);
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 mb-6">
          <AlignLeft className="w-10 h-10 text-pink-600 dark:text-pink-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.instagram_line_break?.title ||
            "Instagram Line Break Generator"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.instagram_line_break?.subtitle ||
            "Create clean Instagram captions with perfect line breaks."}
        </p>

        <div className="w-full grid md:grid-cols-2 gap-8 items-start">
          {/* Input Side */}
          <Card className="border-pink-100 dark:border-pink-900/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                <span>Input</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 px-2 text-muted-foreground"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Clear
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={
                  dict?.instagram_line_break?.input_placeholder ||
                  "Type your caption here..."
                }
                className="min-h-[300px] resize-none text-base p-4 focus-visible:ring-pink-500"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Output Side */}
          <Card className="border-pink-100 dark:border-pink-900/50 shadow-sm md:mt-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500" />
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                <span>Preview</span>
                {isCopied && (
                  <span className="text-sm font-medium text-green-600 flex items-center animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    {dict?.instagram_line_break?.copied || "Copied!"}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full min-h-[300px]">
              <div className="flex-grow bg-muted/30 rounded-md p-4 whitespace-pre-wrap font-sans text-base border border-dashed border-muted-foreground/20">
                {convertedText || (
                  <span className="text-muted-foreground italic">
                    Your formatted text will appear here...
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-md"
                  onClick={handleConvert}
                  disabled={!text}
                >
                  {isCopied ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {dict?.instagram_line_break?.copied || "Copied!"}
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5 mr-2" />
                      {dict?.instagram_line_break?.convert_btn ||
                        "Convert & Copy"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Guide, Tips, FAQ */}
      <div className="w-full max-w-5xl mx-auto mt-16 px-4 space-y-16">
        {/* How to Use */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              {dict?.instagram_line_break?.guide_title || "How to Use"}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title:
                  dict?.instagram_line_break?.step1_title || "Type Caption",
                desc:
                  dict?.instagram_line_break?.step1_desc ||
                  "Write your caption exactly how you want it to look.",
                icon: Type,
              },
              {
                step: 2,
                title: dict?.instagram_line_break?.step2_title || "Convert",
                desc:
                  dict?.instagram_line_break?.step2_desc ||
                  "Click the button to add invisible line break characters.",
                icon: ArrowRight,
              },
              {
                step: 3,
                title:
                  dict?.instagram_line_break?.step3_title || "Copy & Paste",
                desc:
                  dict?.instagram_line_break?.step3_desc ||
                  "Paste the result into Instagram.",
                icon: Copy,
              },
            ].map((step) => (
              <div
                key={step.step}
                className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/3 text-center md:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-yellow-500">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                {dict?.instagram_line_break?.tips_title || "Caption Tips"}
              </h2>
              <p className="text-muted-foreground">
                {dict?.instagram_line_break?.tips_desc ||
                  "Write engaging captions that convert."}
              </p>
            </div>

            <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
              {[
                {
                  title:
                    dict?.instagram_line_break?.tip1_title ||
                    "First Line Matters",
                  desc: dict?.instagram_line_break?.tip1_desc,
                },
                {
                  title:
                    dict?.instagram_line_break?.tip2_title || "Use Whitespace",
                  desc: dict?.instagram_line_break?.tip2_desc,
                },
                {
                  title: dict?.instagram_line_break?.tip3_title || "Hashtags",
                  desc: dict?.instagram_line_break?.tip3_desc,
                },
                {
                  title:
                    dict?.instagram_line_break?.tip4_title || "Call to Action",
                  desc: dict?.instagram_line_break?.tip4_desc,
                },
              ].map((tip, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                >
                  <h3 className="font-semibold text-pink-600 dark:text-pink-400 mb-2">
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

        {/* FAQ */}
        <Adsense slotId="7759160077" />

        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              {dict?.qna_instagram_line_break?.title || "FAQ"}
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {[1, 2, 3].map((num) => (
              <AccordionItem key={num} value={`item-${num}`}>
                <AccordionTrigger>
                  {dict?.qna_instagram_line_break?.[`faq_${num}_q`] ||
                    `Question ${num}`}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.qna_instagram_line_break?.[`faq_${num}_a`] ||
                    `Answer ${num}`}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}
