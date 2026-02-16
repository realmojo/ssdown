"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileCode,
  Download,
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
import * as XLSX from "xlsx";
import { toast } from "sonner";

export function XmlToExcelClient({ dict }: { dict?: any }) {
  const [xmlInput, setXmlInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const convertToExcel = () => {
    setError(null);
    if (!xmlInput.trim()) {
      return;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlInput, "text/xml");

      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        throw new Error("Invalid XML format");
      }

      const root = xmlDoc.documentElement;
      let rows: Element[] = [];
      const children = Array.from(root.children);

      if (children.length === 0) {
        throw new Error("XML has no child elements (rows) to convert.");
      }
      rows = children;

      // Extract data into array of objects
      const data = rows.map((row) => {
        const obj: any = {};
        // Attributes
        Array.from(row.attributes).forEach((attr) => {
          obj["@" + attr.name] = attr.value;
        });
        // Children
        Array.from(row.children).forEach((child) => {
          obj[child.tagName] = child.textContent;
        });
        // If no children but has text content
        if (row.children.length === 0 && row.textContent?.trim()) {
          obj["value"] = row.textContent.trim();
        }
        return obj;
      });

      if (data.length === 0) {
        throw new Error("No data found to convert.");
      }

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, "converted_xml.xlsx");
      toast.success("Excel file downloaded");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      setError(
        "Error parsing XML. Please ensure it has a list-like structure.",
      );
    }
  };

  const handleClear = () => {
    setXmlInput("");
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 mb-6">
          <FileSpreadsheet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.xml_to_excel?.title || "XML to Excel Converter"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.xml_to_excel?.subtitle || "Convert XML data to Excel (.xlsx) spreadsheet. Paste your XML or Drag & Drop a file."}
        </p>

        <div className="w-full max-w-2xl">
          <Card
            className={`border-gray-200 dark:border-gray-800 transition-colors ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : ""}`}
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
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-lg border-2 border-dashed border-blue-500">
                    <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                      Drop XML file here
                    </p>
                  </div>
                )}
                <Textarea
                  placeholder={
                    '<catalog>\n  <book id="bk101">\n    <author>Gambardella, Matthew</author>\n    <title>XML Developer\'s Guide</title>\n    <price>44.95</price>\n  </book>\n  ...\n</catalog>'
                  }
                  className="flex-1 font-mono text-sm resize-none whitespace-pre"
                  value={xmlInput}
                  onChange={(e) => setXmlInput(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button
            size="lg"
            onClick={convertToExcel}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]"
          >
            <Download className="w-4 h-4 mr-2" />
            {dict?.xml_to_excel?.download_btn || "Download as Excel"}
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
              {dict?.xml_to_excel?.tips_title || "Tips for Best Results"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.xml_to_excel?.tips_desc || "Format your XML for optimal conversion."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: dict?.xml_to_excel?.tip1_title || "Flat Structure",
                desc: dict?.xml_to_excel?.tip1_desc || "Excel is a flat table format. XML with simple nested items (rows) works best.",
              },
              {
                title: dict?.xml_to_excel?.tip2_title || "Attributes & Tags",
                desc: dict?.xml_to_excel?.tip2_desc || "Both element attributes and child tags are converted into columns.",
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
              Common questions about XML to Excel conversion.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: "What if my XML is deeply nested?",
                  a: "Deeply nested structures might not display correctly in a flat Excel sheet. We recommend flattening your data structure if possible.",
                },
                {
                  q: "Is it secure?",
                  a: "Yes, the conversion happens entirely within your browser.",
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
