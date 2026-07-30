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
import { ToolsSidebar } from "@/components/tools-sidebar";

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

      if (wb.SheetNames.length === 0) throw new Error("엑셀 파일이 비어 있습니다.");
      if (wb.SheetNames.length === 1) {
        toast.info("통합 문서에 시트가 하나뿐이라 분할할 것이 없습니다.");
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

      toast.success("시트별로 분할했습니다! ZIP 파일을 내려받는 중…");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      toast.error("엑셀 파일을 분할하지 못했습니다.");
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
    <div className="w-full">
      <div className="flex gap-2">
      <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex w-full flex-col">
        <div className="hidden">
          <Split className="w-8 h-8 text-lime-600 dark:text-lime-400" />
        </div>
        <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
          {dict?.split_excel?.title || "Split Excel by Sheets"}
        </h1>
        <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
          {dict?.split_excel?.subtitle || "Upload an Excel workbook and save each sheet as a separate file."}
        </p>

        <Adsense slotId="7759160077" />

        <div className="w-full max-w-2xl mb-2">
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

      <div className="w-full max-w-4xl mx-auto mt-3 px-4 space-y-3">
        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-2">
            <div className="hidden">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
              {dict?.split_excel?.tips_title || "Tips for Best Results"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.split_excel?.tips_desc || "How to effectively split your Excel files."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-2">
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
      <aside className="hidden shrink-0 xl:block xl:w-[200px]">
        <ToolsSidebar category="file" dict={dict} />
      </aside>
      </div>
    </div>
  );
}
