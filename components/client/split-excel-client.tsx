"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Split,
  Trash2,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { toast } from "sonner";
import Adsense from "@/components/Adsense";

export function SplitExcelClient({ dict }: { dict?: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: "array" });

      if (wb.SheetNames.length === 0) throw new Error("Excel file is empty.");
      if (wb.SheetNames.length === 1) {
        toast.info("Workbook only has 1 sheet. Nothing to split.");
        setIsProcessing(false);
        return;
      }

      const zip = new JSZip();

      wb.SheetNames.forEach((sheetName) => {
        const ws = wb.Sheets[sheetName];
        const newWb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWb, ws, sheetName);
        const wbOut = XLSX.write(newWb, { bookType: "xlsx", type: "array" });
        zip.file(`${sheetName}.xlsx`, wbOut);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(".xlsx", "").replace(".xls", "")}_sheets.zip`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Workbook split by sheets! Downloading ZIP...");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      toast.error("Error splitting Excel file.");
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-lime-100 to-green-100 dark:from-lime-900/30 dark:to-green-900/30 mb-6">
          <Split className="w-8 h-8 text-lime-600 dark:text-lime-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.split_excel?.title || "Split Excel by Sheets"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.split_excel?.subtitle || "Upload an Excel workbook and save each sheet as a separate file."}
        </p>

        <Adsense slotId="7759160077" />

        <div className="w-full max-w-2xl mb-8">
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-lime-500 bg-lime-50 dark:bg-lime-900/20"
                  : "border-gray-300 dark:border-gray-700 hover:border-lime-500 hover:bg-lime-50 dark:hover:bg-lime-900/20"
              }`}
            >
              <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Click to upload or Drag & Drop Excel file
              </p>
              <p className="text-sm text-muted-foreground">
                Supports .xlsx, .xls
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
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
                <FileSpreadsheet className="w-8 h-8 text-lime-600" />
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

              <Button
                className="w-full bg-lime-600 hover:bg-lime-700 text-white mt-4"
                onClick={handleSplit}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Split by Sheets"}
              </Button>
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
              {dict?.split_excel?.tips_title || "Tips for Best Results"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.split_excel?.tips_desc || "How to effectively split your Excel files."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: dict?.split_excel?.tip1_title || "One Sheet per File",
                desc: dict?.split_excel?.tip1_desc || "This tool creates a new Excel file for every worksheet found in your uploaded workbook.",
              },
              {
                title: dict?.split_excel?.tip2_title || "File Naming",
                desc: dict?.split_excel?.tip2_desc || "The output files are named after the sheet names defined in your original Excel file.",
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
