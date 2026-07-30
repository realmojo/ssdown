"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileCode,
  ArrowRightLeft,
  Copy,
  Trash2,
  CheckCircle2,
  Lightbulb,
  FileSpreadsheet,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

export function XmlToCsvClient({ dict }: { dict?: any }) {
  const [xmlInput, setXmlInput] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const convertToCsv = () => {
    setError(null);
    if (!xmlInput.trim()) {
      setCsvOutput("");
      return;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlInput, "text/xml");

      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        throw new Error("올바르지 않은 XML 형식입니다");
      }

      // Finds the first element that has children which are also elements
      // Assumption: XML is like <root><item>...</item><item>...</item></root>
      const root = xmlDoc.documentElement;
      let rows: Element[] = [];

      // If root has children elements, use them.
      // If root has no children elements, maybe it's too simple?

      const children = Array.from(root.children);
      if (children.length === 0) {
        throw new Error("행으로 변환할 하위 요소가 XML에 없습니다.");
      }
      rows = children;

      // Extract all unique tag names from all rows to build headers
      const headersSet = new Set<string>();
      rows.forEach((row) => {
        Array.from(row.children).forEach((child) => {
          headersSet.add(child.tagName);
        });
        // Also attributes? For now, let's stick to child elements for CSV columns
        // Attributes could also be columns like @id
        Array.from(row.attributes).forEach((attr) => {
          headersSet.add("@" + attr.name);
        });
      });

      const headers = Array.from(headersSet);
      if (headers.length === 0) {
        // Maybe rows have text content directly? e.g. <list><item>A</item><item>B</item></list>
        // In this case, use a default header "value"
        const hasText = rows.some((r) => r.textContent?.trim());
        if (hasText) headers.push("value");
        else throw new Error("XML 요소에서 데이터를 찾지 못했습니다.");
      }

      // Build CSV
      let csv = headers.join(",") + "\n";

      rows.forEach((row) => {
        const rowData = headers.map((header) => {
          let val = "";
          if (header.startsWith("@")) {
            val = row.getAttribute(header.substring(1)) || "";
          } else if (header === "value" && row.children.length === 0) {
            val = row.textContent || "";
          } else {
            const child = row.querySelector(`:scope > ${header}`); // Direct child only
            val = child ? child.textContent || "" : "";
          }

          // Escape quotes and wrap in quotes if necessary
          val = val.replace(/"/g, '""');
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            val = `"${val}"`;
          }
          return val;
        });
        csv += rowData.join(",") + "\n";
      });

      setCsvOutput(csv);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      setError("XML을 해석하지 못했습니다. 목록 형태의 구조인지 확인해 주세요.");
      setCsvOutput("");
    }
  };

  const handleCopy = () => {
    if (!csvOutput) return;
    navigator.clipboard.writeText(csvOutput);
    toast.success("CSV를 클립보드에 복사했습니다");
  };

  const handleClear = () => {
    setXmlInput("");
    setCsvOutput("");
    setError(null);
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const text = await file.text();
      setXmlInput(text);
      setError(null);
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
      <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex w-full flex-col">
        <div className="hidden">
          <FileSpreadsheet className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
          {dict?.xml_to_csv?.title || "XML to CSV Converter"}
        </h1>
        <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
          {dict?.xml_to_csv?.subtitle || "Convert XML list data to CSV spreadsheet. Paste your XML code, or Drag & Drop a file."}
        </p>

        <Adsense slotId="7759160077" />

        <div className="w-full grid md:grid-cols-2 gap-4">
          <Card
            className={`border-gray-200 dark:border-gray-800 transition-colors ${isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CardContent className="p-4 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-muted-foreground" />
                  XML 입력
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="relative flex-1 flex flex-col">
                {isDragging && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-lg border-2 border-dashed border-indigo-500">
                    <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400">
                      여기에 XML 파일을 끌어다 놓으세요
                    </p>
                  </div>
                )}
                <Textarea
                  placeholder={
                    '<users>\n  <user id="1">\n    <name>홍길동</name>\n    <email>hong@example.com</email>\n  </user>\n  <user id="2">\n    <name>김영희</name>\n    <email>kim@example.com</email>\n  </user>\n</users>'
                  }
                  className="flex-1 font-mono text-sm resize-none whitespace-pre"
                  value={xmlInput}
                  onChange={(e) => setXmlInput(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="p-4 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                  CSV 출력
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!csvOutput}
                  className="h-8"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                readOnly
                placeholder="header1,header2..."
                className="flex-1 font-mono text-sm resize-none bg-muted/30"
                value={csvOutput}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-2">
          <Button
            size="lg"
            onClick={convertToCsv}
            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[200px]"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            XML을 CSV로 변환
          </Button>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto mt-3 px-4 space-y-3">
        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-2">
            <div className="hidden">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
              {dict?.xml_to_csv?.tips_title || "Tips for Best Results"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.xml_to_csv?.tips_desc || "Ensure your XML is formatted as a list of items."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            {[
              {
                title: dict?.xml_to_csv?.tip1_title || "List Structure",
                desc: dict?.xml_to_csv?.tip1_desc || "The tool works best when your XML root element contains a list of similar child elements (representing rows).",
              },
              {
                title: dict?.xml_to_csv?.tip2_title || "Consistent Tags",
                desc: dict?.xml_to_csv?.tip2_desc || "Use consistent tag names across your items. Missing tags will result in empty CSV cells.",
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <div className="mb-2">
            <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
              자주 묻는 질문
            </h2>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              XML → CSV 변환기에 대해 자주 묻는 질문입니다.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: "속성도 지원하나요?",
                  a: "Yes, XML attributes are extracted as columns prefixed with '@'.",
                },
                {
                  q: "열 구성이 서로 다르면 어떻게 되나요?",
                  a: "The tool unions all tag names found in all rows to create the header list. If a row is missing a tag, that cell will be empty.",
                },
              ].map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>
      </div>
      <aside className="hidden shrink-0 xl:block xl:w-[200px]">
        <ToolsSidebar category="file" dict={dict} />
      </aside>
      </div>
    </div>
  );
}
