"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
import Adsense from "@/components/Adsense";
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

export function CsvToXmlClient({ dict }: { dict?: any }) {
  const [csvInput, setCsvInput] = useState("");
  const [xmlOutput, setXmlOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Robust CSV parser
  const parseCSV = (str: string) => {
    const arr: string[][] = [];
    let quote = false;
    let col = 0,
      row = 0;

    for (let c = 0; c < str.length; c++) {
      const cc = str[c],
        nc = str[c + 1];
      arr[row] = arr[row] || [];
      arr[row][col] = arr[row][col] || "";

      if (cc == '"' && quote && nc == '"') {
        arr[row][col] += cc;
        ++c;
        continue;
      }
      if (cc == '"') {
        quote = !quote;
        continue;
      }
      if (cc == "," && !quote) {
        ++col;
        continue;
      }
      if (cc == "\r" && nc == "\n" && !quote) {
        ++row;
        col = 0;
        ++c;
        continue;
      }
      if ((cc == "\n" || cc == "\r") && !quote) {
        ++row;
        col = 0;
        continue;
      }
      arr[row][col] += cc;
    }
    return arr;
  };

  const convertToXml = () => {
    setError(null);
    if (!csvInput.trim()) {
      setXmlOutput("");
      return;
    }

    try {
      const data = parseCSV(csvInput.trim());

      if (data.length < 2) {
        throw new Error("CSV requires at least a header row and one data row.");
      }

      const headers = data[0].map((h) =>
        h.trim().replace(/[^a-zA-Z0-9_-]/g, "_"),
      ); // Sanitize tag names
      const rows = data.slice(1);

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';

      rows.forEach((row) => {
        // Skip empty rows
        if (row.length === 1 && row[0] === "") return;

        xml += "  <row>\n";
        headers.forEach((header, index) => {
          const value = row[index] !== undefined ? row[index] : "";
          // Escape XML entities
          const escapedValue = value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");

          xml += `    <${header}>${escapedValue}</${header}>\n`;
        });
        xml += "  </row>\n";
      });
      xml += "</root>";

      setXmlOutput(xml);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      setError("Error parsing CSV. Please check formatting.");
      setXmlOutput("");
    }
  };

  const handleCopy = () => {
    if (!xmlOutput) return;
    navigator.clipboard.writeText(xmlOutput);
    toast.success("XML copied to clipboard");
  };

  const handleClear = () => {
    setCsvInput("");
    setXmlOutput("");
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
      setCsvInput(text);
      setError(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-100 to-green-100 dark:from-teal-900/30 dark:to-green-900/30 mb-6">
          <FileCode className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.csv_to_xml?.title || "CSV to XML Converter"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.csv_to_xml?.subtitle || "Convert CSV spreadsheets to structured XML format. Paste your CSV code, or Drag & Drop a file."}
        </p>

        <div className="w-full grid md:grid-cols-2 gap-4">
          <Card
            className={`border-gray-200 dark:border-gray-800 transition-colors ${isDragging ? "border-teal-500 bg-teal-50 dark:bg-teal-900/10" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CardContent className="p-4 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                  CSV Input
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
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-lg border-2 border-dashed border-teal-500">
                    <p className="text-lg font-medium text-teal-600 dark:text-teal-400">
                      Drop CSV file here
                    </p>
                  </div>
                )}
                <Textarea
                  placeholder={
                    'id,name,email\n1,"John Doe",john@example.com\n2,"Jane Smith",jane@example.com'
                  }
                  className="flex-1 font-mono text-sm resize-none whitespace-pre"
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="p-4 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-muted-foreground" />
                  XML Output
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!xmlOutput}
                  className="h-8"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                readOnly
                placeholder="<?xml ... ?>"
                className="flex-1 font-mono text-sm resize-none bg-muted/30"
                value={xmlOutput}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button
            size="lg"
            onClick={convertToXml}
            className="bg-teal-600 hover:bg-teal-700 text-white min-w-[200px]"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Convert CSV to XML
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
              {dict?.csv_to_xml?.tips_title || "Tips for XML Output"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.csv_to_xml?.tips_desc || "Understanding how your CSV becomes XML."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: dict?.csv_to_xml?.tip1_title || "Tag Names",
                desc: dict?.csv_to_xml?.tip1_desc || "CSV headers are sanitized (spaces replaced by underscores) to ensure valid XML tag names.",
              },
              {
                title: dict?.csv_to_xml?.tip2_title || "Escaping",
                desc: dict?.csv_to_xml?.tip2_desc || "Special characters like <, >, &, \", and ' are automatically escaped to keep the XML valid.",
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

        <Adsense slotId="7759160077" />

        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Common questions about our CSV to XML converter.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: "What encoding is used?",
                  a: "The output XML specifies UTF-8 encoding.",
                },
                {
                  q: "Are huge CSV files supported?",
                  a: "Since processing happens in your browser, very large files may be slow or run out of memory. We recommend splitting large files using our Split CSV tool.",
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
