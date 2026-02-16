"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileSpreadsheet,
  Split,
  Trash2,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import JSZip from "jszip";
import { toast } from "sonner";

export function SplitCsvClient({ dict }: { dict?: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [splitMode, setSplitMode] = useState<"rows" | "files">("rows");
  const [splitValue, setSplitValue] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const parseCSV = (str: string) => {
    // Simple line splitter handling quotes
    // Reusing the robust parser from other tools
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

  const arrayToCSV = (arr: string[][]) => {
    return arr
      .map((row) =>
        row
          .map((val) => {
            val = val.replace(/"/g, '""');
            if (val.search(/("|,|\n)/g) >= 0) val = '"' + val + '"';
            return val;
          })
          .join(","),
      )
      .join("\n");
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const text = await file.text();
      const data = parseCSV(text);

      if (data.length < 2) throw new Error("CSV requires a header and data.");

      const header = data[0];
      const rows = data.slice(1);

      // Remove empty last row if any
      if (
        rows.length > 0 &&
        rows[rows.length - 1].length === 1 &&
        rows[rows.length - 1][0] === ""
      ) {
        rows.pop();
      }

      let chunkSize = 0;
      if (splitMode === "rows") {
        chunkSize = splitValue;
      } else {
        chunkSize = Math.ceil(rows.length / splitValue);
      }

      const zip = new JSZip();

      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const csvContent = arrayToCSV([header, ...chunk]);
        const fileName = `${file.name.replace(".csv", "")}_part_${Math.floor(i / chunkSize) + 1}.csv`;
        zip.file(fileName, csvContent);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(".csv", "")}_split.zip`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Split successful! Downloading ZIP...");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      toast.error("Error splitting CSV.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    if (file) setFile(file);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 mb-6">
          <Split className="w-8 h-8 text-orange-600 dark:text-orange-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.split_csv?.title || "Split CSV File"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.split_csv?.subtitle || "Split large CSV files into smaller chunks. Maintain headers in every
          file."}
        </p>

        <div className="w-full max-w-2xl mb-8">
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                  : "border-gray-300 dark:border-gray-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              }`}
            >
              <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Click to upload or Drag & Drop CSV file
              </p>
              <p className="text-sm text-muted-foreground">
                Supports .csv files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
                <FileSpreadsheet className="w-8 h-8 text-orange-600" />
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleClear}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-4 mb-4">
                    <Button
                      variant={splitMode === "rows" ? "default" : "outline"}
                      onClick={() => {
                        setSplitMode("rows");
                        setSplitValue(100);
                      }}
                      className={
                        splitMode === "rows"
                          ? "bg-orange-600 hover:bg-orange-700"
                          : ""
                      }
                    >
                      Split by Rows
                    </Button>
                    <Button
                      variant={splitMode === "files" ? "default" : "outline"}
                      onClick={() => {
                        setSplitMode("files");
                        setSplitValue(2);
                      }}
                      className={
                        splitMode === "files"
                          ? "bg-orange-600 hover:bg-orange-700"
                          : ""
                      }
                    >
                      Split into Files
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      {splitMode === "rows"
                        ? "Rows per file"
                        : "Number of files"}
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min="1"
                        value={splitValue}
                        onChange={(e) =>
                          setSplitValue(parseInt(e.target.value) || 1)
                        }
                        className="max-w-[150px]"
                      />
                      <span className="text-sm text-muted-foreground">
                        {splitMode === "rows" ? "rows" : "files"}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-4"
                    onClick={handleSplit}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Split CSV"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto mt-12 px-4 space-y-16">
        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.split_csv?.tips_title || "Tips for Best Results"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.split_csv?.tips_desc || "How to effectively split your CSV files."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: dict?.split_csv?.tip1_title || "Header Row",
                desc: dict?.split_csv?.tip1_desc || "We ensure the header row (first line) is copied to every split file so data structure remains consistent.",
              },
              {
                title: dict?.split_csv?.tip2_title || "Download Format",
                desc: dict?.split_csv?.tip2_desc || "All split files are bundled into a single ZIP file for easy downloading.",
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
      </div>
    </div>
  );
}
