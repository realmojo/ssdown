"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileSpreadsheet,
  Download,
  Trash2,
  CheckCircle2,
  Lightbulb,
  FileText,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import Adsense from "@/components/Adsense";

export function CsvToExcelClient({ dict }: { dict?: any }) {
  const [csvInput, setCsvInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const convertToExcel = () => {
    setError(null);
    if (!csvInput.trim()) {
      return;
    }

    try {
      const wb = XLSX.read(csvInput, { type: "string", raw: true });
      XLSX.writeFile(wb, "converted_data.xlsx");
      toast.success("Excel file downloaded");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      setError("Error creating Excel file. Please check your CSV format.");
    }
  };

  const handleClear = () => {
    setCsvInput("");
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-lime-100 dark:from-green-900/30 dark:to-lime-900/30 mb-6">
          <FileSpreadsheet className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.csv_to_excel?.title || "CSV to Excel Converter"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.csv_to_excel?.subtitle || "Convert comma-separated values to Excel (.xlsx) format. Paste your data, or Drag & Drop a file."}
        </p>

        <Adsense slotId="7759160077" />

        <div className="w-full max-w-2xl">
          <Card
            className={`border-gray-200 dark:border-gray-800 transition-colors ${isDragging ? "border-green-500 bg-green-50 dark:bg-green-900/10" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CardContent className="p-4 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
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
                    'name,age,email\n"John Doe",30,john@example.com\n"Jane Smith",25,jane@example.com'
                  }
                  className="flex-1 font-mono text-sm resize-none whitespace-pre"
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
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
            className="bg-green-600 hover:bg-green-700 text-white min-w-[200px]"
          >
            <Download className="w-4 h-4 mr-2" />
            {dict?.csv_to_excel?.download_btn || "Download as Excel"}
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
              {dict?.csv_to_excel?.tips_title || "Tips for Best Results"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.csv_to_excel?.tips_desc || "Ensure your CSV data is clean."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: dict?.csv_to_excel?.tip1_title || "Delimiters",
                desc: dict?.csv_to_excel?.tip1_desc || "The tool automatically detects comma separators. Ensure your data uses consistent delimiters.",
              },
              {
                title: dict?.csv_to_excel?.tip2_title || "Character Encoding",
                desc: dict?.csv_to_excel?.tip2_desc || "We support UTF-8 characters so your data is preserved correctly.",
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
              Common questions about our CSV to Excel converter.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: "Is formatting preserved?",
                  a: "No, CSV is a plain text format. The generated Excel file will contain raw data.",
                },
                {
                  q: "Can I open the file in Google Sheets?",
                  a: "Yes, the .xlsx file generated is compatible with Microsoft Excel, Google Sheets, and LibreOffice.",
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
