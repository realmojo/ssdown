"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, QrCode, Link, Lightbulb, MousePointer2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import QRCode from "qrcode";
import { toast } from "sonner";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

export function QRCodeGeneratorClient({ dict }: { dict?: any }) {
  const [url, setUrl] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = useCallback(async (text: string) => {
    if (!text) {
      setQrCodeUrl(null);
      return;
    }

    try {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, text, {
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
        setQrCodeUrl(canvasRef.current.toDataURL("image/png"));
      }
    } catch (err) {
      console.error(err);
      toast.error("QR 코드를 만들지 못했습니다");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      generateQRCode(url);
    }, 500);
    return () => clearTimeout(timer);
  }, [url, generateQRCode]);

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = "qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[50vh]">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 mb-6">
              <QrCode className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {dict?.qr_code_generator?.title || "QR Code Generator"}
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              {dict?.qr_code_generator?.subtitle ||
                "Create custom QR codes for any link in seconds. Free, instant download."}
            </p>

            <Adsense slotId="7759160077" />

            <div className="w-full grid md:grid-cols-2 gap-8 items-start">
              {/* Input Side */}
              <Card className="border-blue-100 dark:border-blue-900/50 shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="w-5 h-5 text-blue-500" />
                    {dict?.qr_code_generator?.step1_title || "Enter URL"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="url"
                      placeholder={
                        dict?.qr_code_generator?.input_placeholder ||
                        "https://example.com"
                      }
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-12 text-lg"
                    />
                    <p className="text-sm text-muted-foreground">
                      입력하는 대로 QR 코드가 자동으로 만들어집니다.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Output Side */}
              <Card className="border-blue-100 dark:border-blue-900/50 shadow-sm md:mt-0 bg-gray-50/50 dark:bg-gray-900/20 h-full flex flex-col justify-center items-center p-6 relative">
                <CardContent className="flex flex-col items-center justify-center w-full space-y-6">
                  <div className="relative bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <canvas
                      ref={canvasRef}
                      className={`${!url ? "opacity-20 blur-sm" : ""} transition-all duration-300`}
                    />
                    {!url && (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-medium">
                        미리 볼 주소를 입력하세요
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={downloadQRCode}
                    disabled={!qrCodeUrl}
                    size="lg"
                    className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {dict?.qr_code_generator?.download_btn || "Download PNG"}
                  </Button>
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
                  {dict?.qr_code_generator?.guide_title || "How to Create"}
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: dict?.qr_code_generator?.step1_title || "Enter URL",
                    desc:
                      dict?.qr_code_generator?.step1_desc ||
                      "Paste the link you want the QR code to point to.",
                    icon: Link,
                  },
                  {
                    step: 2,
                    title: dict?.qr_code_generator?.step2_title || "Customize",
                    desc:
                      dict?.qr_code_generator?.step2_desc ||
                      "We automatically generate a high-quality QR code.",
                    icon: MousePointer2,
                  },
                  {
                    step: 3,
                    title: dict?.qr_code_generator?.step3_title || "Download",
                    desc:
                      dict?.qr_code_generator?.step3_desc ||
                      "Save the QR code image to your device instantly.",
                    icon: Download,
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section className="bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm mb-6 text-yellow-500">
                    <Lightbulb className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">
                    {dict?.qr_code_generator?.tips_title || "QR Code Tips"}
                  </h2>
                  <p className="text-muted-foreground">
                    {dict?.qr_code_generator?.tips_desc ||
                      "Ensure your QR code works perfectly."}
                  </p>
                </div>

                <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title:
                        dict?.qr_code_generator?.tip1_title ||
                        "Contrast is Key",
                      desc: dict?.qr_code_generator?.tip1_desc,
                    },
                    {
                      title:
                        dict?.qr_code_generator?.tip2_title || "Keep it Simple",
                      desc: dict?.qr_code_generator?.tip2_desc,
                    },
                    {
                      title:
                        dict?.qr_code_generator?.tip3_title || "Size Matters",
                      desc: dict?.qr_code_generator?.tip3_desc,
                    },
                    {
                      title:
                        dict?.qr_code_generator?.tip4_title || "Test First",
                      desc: dict?.qr_code_generator?.tip4_desc,
                    },
                  ].map((tip, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-white/50 shadow-sm"
                    >
                      <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
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
            <section className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  {dict?.qna_qr_code_generator?.title || "FAQ"}
                </h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {[1, 2, 3].map((num) => (
                  <AccordionItem key={num} value={`item-${num}`}>
                    <AccordionTrigger>
                      {dict?.qna_qr_code_generator?.[`faq_${num}_q`] ||
                        `Question ${num}`}
                    </AccordionTrigger>
                    <AccordionContent>
                      {dict?.qna_qr_code_generator?.[`faq_${num}_a`] ||
                        `Answer ${num}`}
                    </AccordionContent>
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
