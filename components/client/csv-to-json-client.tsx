"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileJson,
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

export function CsvToJsonClient() {
  const [csvInput, setCsvInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Robust CSV parser handling quotes
  const parseCSV = (str: string) => {
    const arr: string[][] = [];
    let quote = false; // 'true' means we're inside a quoted field
    let col = 0,
      row = 0;

    for (let c = 0; c < str.length; c++) {
      const cc = str[c],
        nc = str[c + 1]; // Current character, next character
      arr[row] = arr[row] || []; // Create a new row if necessary
      arr[row][col] = arr[row][col] || ""; // Create a new column (start with empty string) if necessary

      // If the current character is a quotation mark, and we're inside a
      // quoted field, and the next character is also a quotation mark,
      // add a quotation mark to the current column and skip the next character
      if (cc == '"' && quote && nc == '"') {
        arr[row][col] += cc;
        ++c;
        continue;
      }

      // If it's just one quotation mark, begin/end quoted field
      if (cc == '"') {
        quote = !quote;
        continue;
      }

      // If it's a comma and we're not in a quoted field, move on to the next column
      if (cc == "," && !quote) {
        ++col;
        continue;
      }

      // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
      // and move on to the next row and move to column 0 of that new row
      if (cc == "\r" && nc == "\n" && !quote) {
        ++row;
        col = 0;
        ++c;
        continue;
      }

      // If it's a newline (LF or CR) and we're not in a quoted field,
      // move on to the next row and move to column 0 of that new row
      if ((cc == "\n" || cc == "\r") && !quote) {
        ++row;
        col = 0;
        continue;
      }

      // Otherwise, append the current character to the current column
      arr[row][col] += cc;
    }
    return arr;
  };

  const convertToJson = () => {
    setError(null);
    if (!csvInput.trim()) {
      setJsonOutput("");
      return;
    }

    try {
      const data = parseCSV(csvInput.trim());

      if (data.length < 2) {
        throw new Error("CSV requires at least a header row and one data row.");
      }

      const headers = data[0];
      const rows = data.slice(1);

      const result = rows.map((row) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          // Handle case where row might be shorter than headers
          obj[header] = row[index] !== undefined ? row[index] : "";
        });
        return obj;
      });
      // Filter out empty rows if any
      const filteredResult = result.filter((r) =>
        Object.values(r).some((v) => v !== ""),
      );

      setJsonOutput(JSON.stringify(filteredResult, null, 2));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      setError("Error parsing CSV. Please check formatting.");
      setJsonOutput("");
    }
  };

  const handleCopy = () => {
    if (!jsonOutput) return;
    navigator.clipboard.writeText(jsonOutput);
    toast.success("JSON copied to clipboard");
  };

  const handleClear = () => {
    setCsvInput("");
    setJsonOutput("");
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 mb-6">
          <FileJson className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          CSV to JSON Converter
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          Convert comma-separated values (CSV) to JSON array. Paste your CSV
          code, or Drag & Drop a file.
        </p>

        <div className="w-full grid md:grid-cols-2 gap-4">
          <Card
            className={`border-gray-200 dark:border-gray-800 transition-colors ${isDragging ? "border-green-500 bg-green-50 dark:bg-green-900/10" : ""}`}
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
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-lg border-2 border-dashed border-green-500">
                    <p className="text-lg font-medium text-green-600 dark:text-green-400">
                      Drop CSV file here
                    </p>
                  </div>
                )}
                <Textarea
                  placeholder={
                    'name,age,city\n"John Doe",30,"New York"\n"Jane Smith",25,"London"'
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
                  <FileJson className="w-4 h-4 text-muted-foreground" />
                  JSON Output
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!jsonOutput}
                  className="h-8"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                readOnly
                placeholder="[ { ... }, { ... } ]"
                className="flex-1 font-mono text-sm resize-none bg-muted/30"
                value={jsonOutput}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button
            size="lg"
            onClick={convertToJson}
            className="bg-green-600 hover:bg-green-700 text-white min-w-[200px]"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Convert CSV to JSON
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
              Tips for CSV Conversion
            </h2>
            <p className="text-muted-foreground">
              Format your CSV correctly for best results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Headers",
                desc: "The first row must contain the column headers. These will become the keys in your JSON objects.",
              },
              {
                title: "Quotes",
                desc: 'Strings containing commas must be wrapped in double quotes. Example: "New York, NY".',
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
              Common questions about our CSV to JSON converter.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: "Can I use semicolons as separators?",
                  a: "Currently the tool is optimized for comma-separated values (CSV). Semicolons might be treated as part of the text.",
                },
                {
                  q: "Data privacy?",
                  a: "All conversion happens locally in your browser. Your CSV data is never uploaded.",
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
