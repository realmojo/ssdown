"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileSpreadsheet,
  FileType,
  Trash2,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

export function ExcelToPdfClient({ dict }: { dict?: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setFile(file);
    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: "array" });
    setWorkbook(wb);
    setSheets(wb.SheetNames);
    if (wb.SheetNames.length > 0) {
      setSelectedSheet(wb.SheetNames[0]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
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

  const handleConvert = async () => {
    if (!workbook || !selectedSheet) return;
    setIsProcessing(true);

    try {
      const ws = workbook.Sheets[selectedSheet];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

      if (!data || data.length === 0) {
        throw new Error("시트가 비어 있습니다.");
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      let y = margin;

      // Simple rendering logic:
      // Identify approximate column widths based on equal distribution or character count
      // For simple grid, simple spacing.

      doc.setFontSize(10);
      const lineHeight = 7;

      // Calculate dynamic column widths?
      // Let's assume max 10 columns fit in a page for simplicity, or just dump text.
      // Better: simple loop

      const colCount = data[0].length;
      const colWidth = (pageWidth - margin * 2) / colCount;

      data.forEach((row) => {
        // Check page break
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        row.forEach((cell, colIndex) => {
          const text = String(cell == null ? "" : cell);
          // Truncate if too long?
          // Just write text
          doc.text(text, margin + colIndex * colWidth, y, {
            maxWidth: colWidth - 2,
          });
        });

        y += lineHeight;
        // Draw line
        doc.setDrawColor(200);
        doc.line(margin, y - 2, pageWidth - margin, y - 2);
      });

      doc.save(`${file?.name.replace(/.xlsx|.xls/, "")}_${selectedSheet}.pdf`);
      toast.success("PDF를 내려받았습니다!");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      toast.error("PDF를 만들지 못했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setWorkbook(null);
    setSheets([]);
    setSelectedSheet("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
      <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex w-full flex-col">
        <div className="hidden">
          <FileType className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
          {dict?.excel_to_pdf?.title || "Excel to PDF Converter"}
        </h1>
        <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
          {dict?.excel_to_pdf?.subtitle || "Convert Excel spreadsheets to PDF documents. Upload your file and download the PDF."}
        </p>

        <Adsense slotId="7759160077" />

        <Card className="w-full border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-300 dark:border-gray-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              }`}
            >
              <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                클릭해서 올리거나 엑셀 파일을 끌어다 놓으세요
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
            <div className="space-y-2">
              <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
                <FileSpreadsheet className="w-8 h-8 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      시트 선택:
                    </span>
                    <Select
                      value={selectedSheet}
                      onValueChange={setSelectedSheet}
                    >
                      <SelectTrigger className="w-[180px] h-8">
                        <SelectValue placeholder="시트 선택" />
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

              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white mt-4"
                onClick={handleConvert}
                disabled={isProcessing}
              >
                {isProcessing ? "Generating PDF..." : "Convert to PDF"}
              </Button>
            </div>
          )}
          </CardContent>
        </Card>
      </div>

      <div className="w-full max-w-4xl mx-auto mt-3 px-4 space-y-3">
        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-2">
            <div className="hidden">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
              {dict?.excel_to_pdf?.tips_title || "Tips for Best Results"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.excel_to_pdf?.tips_desc || "What to expect from PDF conversion."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            {[
              {
                title: dict?.excel_to_pdf?.tip1_title || "Data Table",
                desc: dict?.excel_to_pdf?.tip1_desc || "The tool automatically formats your data into a clean table structure.",
              },
              {
                title: dict?.excel_to_pdf?.tip2_title || "Column Fit",
                desc: dict?.excel_to_pdf?.tip2_desc || "Columns are distributed evenly across the page width. Very wide tables may wrap text.",
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
      <aside className="hidden shrink-0 xl:block xl:w-[200px]">
        <ToolsSidebar category="file" dict={dict} />
      </aside>
      </div>
    </div>
  );
}
