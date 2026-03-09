"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileSpreadsheet,
  FileCode,
  Copy,
  Trash2,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import Adsense from "@/components/Adsense";

export function ExcelToXmlClient({ dict }: { dict?: any }) {
  const [xmlOutput, setXmlOutput] = useState("");
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        setWorkbook(wb);
        setSheets(wb.SheetNames);
        if (wb.SheetNames.length > 0) {
          const firstSheet = wb.SheetNames[0];
          setSelectedSheet(firstSheet);
          processSheet(wb, firstSheet);
        }
        setError(null);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_err) {
        setError(
          "Error reading Excel file. Please ensure it is a valid .xlsx or .xls file.",
        );
        setWorkbook(null);
        setSheets([]);
        setXmlOutput("");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // ...

  const processSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    const ws = wb.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(ws);

    // Sanitize headers? The keys in jsonData are the headers.
    // Convert to XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';

    jsonData.forEach((row: any) => {
      xml += "  <row>\n";
      Object.keys(row).forEach((key) => {
        const safeKey = key.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
        const value = String(row[key])
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

        xml += `    <${safeKey}>${value}</${safeKey}>\n`;
      });
      xml += "  </row>\n";
    });
    xml += "</root>";

    setXmlOutput(xml);
  };

  const handleSheetChange = (value: string) => {
    setSelectedSheet(value);
    if (workbook) {
      processSheet(workbook, value);
    }
  };

  const handleCopy = () => {
    if (!xmlOutput) return;
    navigator.clipboard.writeText(xmlOutput);
    toast.success("XML copied to clipboard");
  };

  const handleClear = () => {
    setWorkbook(null);
    setSheets([]);
    setSelectedSheet("");
    setXmlOutput("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 mb-6">
          <FileCode className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.excel_to_xml?.title || "Excel to XML Converter"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.excel_to_xml?.subtitle || "Convert Excel spreadsheet rows to XML elements. Supports multiple sheets and custom columns."}
        </p>

        <Adsense slotId="7759160077" />

        <div className="w-full max-w-2xl mb-8">
          {!workbook ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                  : "border-gray-300 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              }`}
            >
              <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Click to upload or Drag & Drop Excel file
              </p>
              <p className="text-sm text-muted-foreground">
                Supports .xlsx and .xls
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-4 border">
              <FileSpreadsheet className="w-8 h-8 text-purple-600" />
              <div className="flex-1">
                <p className="font-medium">File uploaded</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">
                    Select Sheet:
                  </span>
                  <Select
                    value={selectedSheet}
                    onValueChange={handleSheetChange}
                  >
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue placeholder="Select sheet" />
                    </SelectTrigger>
                    <SelectContent>
                      {sheets.map((sheet) => (
                        <SelectItem key={sheet} value={sheet}>
                          {sheet}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClear}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          )}
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
        </div>

        {xmlOutput && (
          <div className="w-full max-w-4xl">
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
                    className="h-8"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  readOnly
                  className="flex-1 font-mono text-sm resize-none bg-muted/30 whitespace-pre"
                  value={xmlOutput}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="w-full max-w-4xl mx-auto mt-12 px-4 space-y-16">
        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Format Information
            </h2>
            <p className="text-muted-foreground">
              Understanding the output structure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Row Based",
                desc: "Each row in your Excel sheet becomes a <row> element in the XML output.",
              },
              {
                title: "Column Tags",
                desc: "Column headers become tag names. Special characters in headers are replaced with underscores.",
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
              Common questions about Excel to XML conversion.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: "Data limit?",
                  a: "We support files up to 10MB to ensure smooth browser performance.",
                },
                {
                  q: "Can I use custom root tag?",
                  a: "The default is <root>, but you can find and replace it in the output easily.",
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
