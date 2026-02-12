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

export function XmlToCsvClient() {
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
        throw new Error("Invalid XML format");
      }

      // Finds the first element that has children which are also elements
      // Assumption: XML is like <root><item>...</item><item>...</item></root>
      const root = xmlDoc.documentElement;
      let rows: Element[] = [];

      // If root has children elements, use them.
      // If root has no children elements, maybe it's too simple?

      const children = Array.from(root.children);
      if (children.length === 0) {
        throw new Error("XML has no child elements to convert to rows.");
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
        else throw new Error("No data found in XML elements.");
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
    } catch (err) {
      setError("Error parsing XML. Ensure structure is list-based.");
      setCsvOutput("");
    }
  };

  const handleCopy = () => {
    if (!csvOutput) return;
    navigator.clipboard.writeText(csvOutput);
    toast.success("CSV copied to clipboard");
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
    <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 mb-6">
          <FileSpreadsheet className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          XML to CSV Converter
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          Convert XML list data to CSV spreadsheet. Paste your XML code, or Drag
          & Drop a file.
        </p>

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
                  XML Input
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
                      Drop XML file here
                    </p>
                  </div>
                )}
                <Textarea
                  placeholder={
                    '<users>\n  <user id="1">\n    <name>John</name>\n    <email>john@example.com</email>\n  </user>\n  <user id="2">\n    <name>Jane</name>\n    <email>jane@example.com</email>\n  </user>\n</users>'
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
                  CSV Output
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

        <div className="mt-8">
          <Button
            size="lg"
            onClick={convertToCsv}
            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[200px]"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Convert XML to CSV
          </Button>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto mt-12 px-4 space-y-16">
        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Tips for Best Results
            </h2>
            <p className="text-muted-foreground">
              Ensure your XML is formatted as a list of items.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "List Structure",
                desc: "The tool works best when your XML root element contains a list of similar child elements (representing rows).",
              },
              {
                title: "Consistent Tags",
                desc: "Use consistent tag names across your items. Missing tags will result in empty CSV cells.",
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
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Common questions about our XML to CSV converter.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: "Do you support attributes?",
                  a: "Yes, XML attributes are extracted as columns prefixed with '@'.",
                },
                {
                  q: "What about inconsistent columns?",
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
  );
}
