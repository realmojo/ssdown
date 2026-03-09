"use client";

import { useState, useRef } from "react";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Type,
  Image,
  RotateCw,
  Trash2,
  Download,
  Upload,
  Loader2,
  RotateCcw,
  FileText,
  Lightbulb,
  Shield,
  Zap,
  Layers,
  ChevronUp,
  ChevronDown,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Adsense from "@/components/Adsense";

type TabType = "pages" | "text" | "image";

interface PageInfo {
  pageIndex: number;
  rotation: number;
  width: number;
  height: number;
}

interface TextOverlay {
  id: string;
  text: string;
  pageIndex: number;
  x: number;
  y: number;
  fontSize: number;
}

interface ImageOverlay {
  id: string;
  file: File;
  preview: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function PdfEditorClient({ dict }: { dict?: any }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");
  const [pagesInfo, setPagesInfo] = useState<PageInfo[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("pages");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string | null>(null);

  // Text overlays
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [newText, setNewText] = useState("");
  const [newTextPage, setNewTextPage] = useState(0);
  const [newTextX, setNewTextX] = useState(50);
  const [newTextY, setNewTextY] = useState(700);
  const [newTextFontSize, setNewTextFontSize] = useState(16);

  // Image overlays
  const [imageOverlays, setImageOverlays] = useState<ImageOverlay[]>([]);
  const [newImagePage, setNewImagePage] = useState(0);
  const [newImageX, setNewImageX] = useState(50);
  const [newImageY, setNewImageY] = useState(400);
  const [newImageWidth, setNewImageWidth] = useState(200);
  const [newImageHeight, setNewImageHeight] = useState(200);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const loadPdf = async (file: File) => {
    setError(null);
    setResultUrl(null);
    setResultSize(null);
    setTextOverlays([]);
    setImageOverlays([]);

    if (file.type !== "application/pdf") {
      setError(`"${file.name}" is not a PDF file. Only PDF files are accepted.`);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError(`"${file.name}" exceeds the 50MB file size limit.`);
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      const pages: PageInfo[] = [];

      for (let i = 0; i < count; i++) {
        const page = pdf.getPage(i);
        pages.push({
          pageIndex: i,
          rotation: page.getRotation().angle,
          width: page.getWidth(),
          height: page.getHeight(),
        });
      }

      setPdfFile(file);
      setPdfName(file.name);
      setPagesInfo(pages);
    } catch {
      setError(`"${file.name}" could not be read. It may be corrupted or password-protected.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) loadPdf(e.target.files[0]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) loadPdf(e.dataTransfer.files[0]);
  };

  // Page operations
  const rotatePage = (pageIndex: number, angleDelta: number) => {
    setPagesInfo((prev) => prev.map((p) => p.pageIndex === pageIndex ? { ...p, rotation: (p.rotation + angleDelta + 360) % 360 } : p));
    setResultUrl(null);
  };

  const deletePage = (pageIndex: number) => {
    if (pagesInfo.length <= 1) { setError("Cannot delete the last remaining page."); return; }
    setPagesInfo((prev) => prev.filter((p) => p.pageIndex !== pageIndex));
    setTextOverlays((prev) => prev.filter((t) => t.pageIndex !== pageIndex));
    setImageOverlays((prev) => {
      const removed = prev.filter((im) => im.pageIndex === pageIndex);
      removed.forEach((im) => URL.revokeObjectURL(im.preview));
      return prev.filter((im) => im.pageIndex !== pageIndex);
    });
    setResultUrl(null);
  };

  const movePage = (currentIdx: number, direction: -1 | 1) => {
    setPagesInfo((prev) => {
      const target = currentIdx + direction;
      if (target < 0 || target >= prev.length) return prev;
      const newArr = [...prev];
      [newArr[currentIdx], newArr[target]] = [newArr[target], newArr[currentIdx]];
      return newArr;
    });
    setResultUrl(null);
  };

  // Text overlay operations
  const addTextOverlay = () => {
    if (!newText.trim()) { setError("Please enter some text to add."); return; }
    setError(null);
    setTextOverlays((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: newText, pageIndex: newTextPage, x: newTextX, y: newTextY, fontSize: newTextFontSize },
    ]);
    setNewText("");
    setResultUrl(null);
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays((prev) => prev.filter((t) => t.id !== id));
    setResultUrl(null);
  };

  // Image overlay operations
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) { setError("Only JPG, PNG, or WebP images are supported."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Image must be under 10MB."); return; }

    setError(null);
    const preview = URL.createObjectURL(file);
    setImageOverlays((prev) => [
      ...prev,
      { id: crypto.randomUUID(), file, preview, pageIndex: newImagePage, x: newImageX, y: newImageY, width: newImageWidth, height: newImageHeight },
    ]);
    setResultUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeImageOverlay = (id: string) => {
    setImageOverlays((prev) => {
      const item = prev.find((im) => im.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((im) => im.id !== id);
    });
    setResultUrl(null);
  };

  // Apply all edits and generate result
  const applyEdits = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setResultSize(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      // Copy pages in new order
      const pageIndices = pagesInfo.map((p) => p.pageIndex);
      const copiedPages = await newPdf.copyPages(srcPdf, pageIndices);

      for (let i = 0; i < copiedPages.length; i++) {
        const page = newPdf.addPage(copiedPages[i]);
        const targetRotation = pagesInfo[i].rotation;
        page.setRotation(degrees(targetRotation));
      }

      setProgress(30);

      // Apply text overlays
      const font = await newPdf.embedFont(StandardFonts.Helvetica);
      for (const overlay of textOverlays) {
        const listIdx = pagesInfo.findIndex((p) => p.pageIndex === overlay.pageIndex);
        if (listIdx === -1) continue;
        const page = newPdf.getPage(listIdx);
        page.drawText(overlay.text, {
          x: overlay.x,
          y: overlay.y,
          size: overlay.fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      }

      setProgress(60);

      // Apply image overlays
      for (const overlay of imageOverlays) {
        const listIdx = pagesInfo.findIndex((p) => p.pageIndex === overlay.pageIndex);
        if (listIdx === -1) continue;

        const imgArrayBuffer = await overlay.file.arrayBuffer();
        const uint8 = new Uint8Array(imgArrayBuffer);

        let embeddedImage;
        if (overlay.file.type === "image/png") {
          embeddedImage = await newPdf.embedPng(uint8);
        } else if (overlay.file.type === "image/jpeg") {
          embeddedImage = await newPdf.embedJpg(uint8);
        } else {
          // WebP: convert via canvas
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const htmlImg = new window.Image();
          const pngBlob = await new Promise<Blob>((resolve, reject) => {
            htmlImg.onload = () => {
              canvas.width = htmlImg.width;
              canvas.height = htmlImg.height;
              ctx?.drawImage(htmlImg, 0, 0);
              canvas.toBlob((blob) => {
                if (blob) resolve(blob); else reject(new Error("Canvas conversion failed"));
              }, "image/png");
            };
            htmlImg.onerror = () => reject(new Error("Image load failed"));
            htmlImg.src = overlay.preview;
          });
          const pngBuffer = await pngBlob.arrayBuffer();
          embeddedImage = await newPdf.embedPng(new Uint8Array(pngBuffer));
        }

        const page = newPdf.getPage(listIdx);
        page.drawImage(embeddedImage, {
          x: overlay.x,
          y: overlay.y,
          width: overlay.width,
          height: overlay.height,
        });
      }

      setProgress(90);

      const pdfBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize((blob.size / (1024 * 1024)).toFixed(2));
      setProgress(100);
    } catch {
      setError("Failed to apply edits. The PDF may be corrupted or contain unsupported features.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    const baseName = pdfName.replace(/\.pdf$/i, "") || "document";
    link.download = `${baseName}_edited.pdf`;
    link.click();
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    imageOverlays.forEach((im) => URL.revokeObjectURL(im.preview));
    setPdfFile(null);
    setPdfName("");
    setPagesInfo([]);
    setActiveTab("pages");
    setIsDragging(false);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    setResultSize(null);
    setTextOverlays([]);
    setImageOverlays([]);
    setNewText("");
    setNewTextPage(0);
    setNewTextX(50);
    setNewTextY(700);
    setNewTextFontSize(16);
    setNewImagePage(0);
    setNewImageX(50);
    setNewImageY(400);
    setNewImageWidth(200);
    setNewImageHeight(200);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const getRotationLabel = (angle: number) => {
    switch (angle) {
      case 90: return "90";
      case 180: return "180";
      case 270: return "270";
      default: return "0";
    }
  };

  const tabs: { key: TabType; label: string; icon: typeof Pencil }[] = [
    { key: "pages", label: "Pages", icon: Layers },
    { key: "text", label: "Add Text", icon: Type },
    { key: "image", label: "Add Image", icon: Image },
  ];

  const totalEdits = textOverlays.length + imageOverlays.length;

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 mb-6">
          <Pencil className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">{dict?.pdf_editor?.title || "PDF Editor"}</h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">{dict?.pdf_editor?.subtitle || "Edit your PDF: manage pages (delete, rotate, reorder), add text, and insert images. 100% private — processed in your browser."}</p>

        <Adsense slotId="7759160077" />

        {!pdfFile && (
          <div
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragging ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-muted-foreground/30 hover:border-red-500/50 hover:bg-red-50/50 dark:hover:bg-red-900/10"}`}
          >
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">{dict?.pdf_editor?.drop_zone || "Drag & drop a PDF file here"}</p>
            <p className="text-sm text-muted-foreground">Only PDF files accepted. Max 50MB per file.</p>
          </div>
        )}

        {error && (<div className="w-full max-w-2xl mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">{error}</div>)}

        {pdfFile && (
          <div className="w-full max-w-2xl mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{pdfName} &middot; {pagesInfo.length} page{pagesInfo.length !== 1 ? "s" : ""}{totalEdits > 0 ? ` &middot; ${totalEdits} edit${totalEdits !== 1 ? "s" : ""}` : ""}</div>
              <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2" />Clear</Button>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-muted">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-red-600 text-red-600 dark:text-red-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Pages tab */}
            {activeTab === "pages" && (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {pagesInfo.map((pi, idx) => (
                  <div key={`${pi.pageIndex}-${idx}`} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-muted">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold">{idx + 1}</div>
                    <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Page {idx + 1} <span className="text-xs text-muted-foreground">(original #{pi.pageIndex + 1})</span></p>
                      <p className="text-xs text-muted-foreground">{Math.round(pi.width)} x {Math.round(pi.height)} pt &middot; Rotation: {getRotationLabel(pi.rotation)}&deg;</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => movePage(idx, -1)} disabled={idx === 0} title="Move up"><ChevronUp className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => movePage(idx, 1)} disabled={idx === pagesInfo.length - 1} title="Move down"><ChevronDown className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => rotatePage(pi.pageIndex, 90)} title="Rotate 90 CW"><RotateCw className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30" onClick={() => deletePage(pi.pageIndex)} title="Delete page"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Text tab */}
            {activeTab === "text" && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg border border-muted space-y-3">
                  <textarea value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Enter text to add..." rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 resize-y" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Page</label>
                      <select value={newTextPage} onChange={(e) => setNewTextPage(Number(e.target.value))} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm">
                        {pagesInfo.map((_, idx) => (<option key={idx} value={pagesInfo[idx].pageIndex}>Page {idx + 1}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">X Position</label>
                      <input type="number" value={newTextX} onChange={(e) => setNewTextX(Number(e.target.value))} min={0} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Y Position</label>
                      <input type="number" value={newTextY} onChange={(e) => setNewTextY(Number(e.target.value))} min={0} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Font Size</label>
                      <input type="number" value={newTextFontSize} onChange={(e) => setNewTextFontSize(Number(e.target.value))} min={8} max={72} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
                    </div>
                  </div>
                  <Button size="sm" onClick={addTextOverlay} className="bg-red-600 hover:bg-red-700 text-white"><Plus className="w-4 h-4 mr-1" />Add Text</Button>
                </div>

                {textOverlays.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Added Text ({textOverlays.length})</h3>
                    {textOverlays.map((t) => {
                      const listIdx = pagesInfo.findIndex((p) => p.pageIndex === t.pageIndex);
                      return (
                        <div key={t.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-muted">
                          <Type className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">&quot;{t.text}&quot;</p>
                            <p className="text-xs text-muted-foreground">Page {listIdx + 1} &middot; ({t.x}, {t.y}) &middot; {t.fontSize}px</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => removeTextOverlay(t.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Add Image tab */}
            {activeTab === "image" && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg border border-muted space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Page</label>
                      <select value={newImagePage} onChange={(e) => setNewImagePage(Number(e.target.value))} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm">
                        {pagesInfo.map((_, idx) => (<option key={idx} value={pagesInfo[idx].pageIndex}>Page {idx + 1}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">X</label>
                      <input type="number" value={newImageX} onChange={(e) => setNewImageX(Number(e.target.value))} min={0} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Y</label>
                      <input type="number" value={newImageY} onChange={(e) => setNewImageY(Number(e.target.value))} min={0} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Width</label>
                      <input type="number" value={newImageWidth} onChange={(e) => setNewImageWidth(Number(e.target.value))} min={10} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Height</label>
                      <input type="number" value={newImageHeight} onChange={(e) => setNewImageHeight(Number(e.target.value))} min={10} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
                    </div>
                  </div>
                  <div>
                    <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" />
                    <Button size="sm" onClick={() => imageInputRef.current?.click()} className="bg-red-600 hover:bg-red-700 text-white"><Upload className="w-4 h-4 mr-1" />Upload & Add Image</Button>
                    <span className="text-xs text-muted-foreground ml-2">JPG, PNG, WebP. Max 10MB.</span>
                  </div>
                </div>

                {imageOverlays.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Added Images ({imageOverlays.length})</h3>
                    {imageOverlays.map((im) => {
                      const listIdx = pagesInfo.findIndex((p) => p.pageIndex === im.pageIndex);
                      return (
                        <div key={im.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-muted">
                          <div className="flex-shrink-0 w-10 h-10 rounded overflow-hidden bg-muted"><img src={im.preview} alt={im.file.name} className="w-full h-full object-cover" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{im.file.name}</p>
                            <p className="text-xs text-muted-foreground">Page {listIdx + 1} &middot; ({im.x}, {im.y}) &middot; {im.width}x{im.height}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => removeImageOverlay(im.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Apply button */}
            {!resultUrl && (
              <div className="flex justify-center pt-4">
                <Button size="lg" onClick={applyEdits} disabled={isProcessing} className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]">
                  {isProcessing ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Applying... {progress}%</>) : (<><Pencil className="w-5 h-5 mr-2" />Apply Edits & Save</>)}
                </Button>
              </div>
            )}

            {isProcessing && (<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div className="bg-red-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} /></div>)}

            {resultUrl && (
              <div className="flex flex-col items-center gap-3 pt-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="text-sm text-muted-foreground">PDF edited successfully! {pagesInfo.length} page{pagesInfo.length !== 1 ? "s" : ""} &middot; {resultSize} MB</div>
                <Button size="lg" onClick={handleDownload} className="bg-red-600 hover:bg-red-700 text-white shadow-lg min-w-[200px]"><Download className="w-5 h-5 mr-2" />{dict?.pdf_editor?.download_btn || "Download Edited PDF"}</Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">{dict?.pdf_editor?.guide_title || "How to Edit a PDF"}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{dict?.pdf_editor?.guide_desc || "Edit your PDF documents in 3 simple steps."}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: 1, title: dict?.pdf_editor?.step1_title || "Upload PDF", desc: dict?.pdf_editor?.step1_desc || "Drag and drop or click to select a PDF file from your device.", icon: Upload },
              { step: 2, title: dict?.pdf_editor?.step2_title || "Make Your Edits", desc: dict?.pdf_editor?.step2_desc || "Use tabs to manage pages (reorder, rotate, delete), add text annotations, or insert images.", icon: Pencil },
              { step: 3, title: dict?.pdf_editor?.step3_title || "Save & Download", desc: dict?.pdf_editor?.step3_desc || "Click 'Apply Edits & Save' to generate your edited PDF and download it.", icon: Download },
            ].map((s) => (
              <Card key={s.step} className="border-red-200 dark:border-red-900/50">
                <CardHeader><div className="flex items-center gap-3 mb-2"><div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white font-bold">{s.step}</div><CardTitle className="text-xl">{s.title}</CardTitle></div></CardHeader>
                <CardContent><p className="text-muted-foreground leading-relaxed">{s.desc}</p></CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4"><Lightbulb className="w-8 h-8 text-yellow-500" /></div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">{dict?.pdf_editor?.tips_title || "PDF Editor Tips"}</h2>
            <p className="text-muted-foreground">{dict?.pdf_editor?.tips_desc || "Get the best results when editing PDF documents."}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: dict?.pdf_editor?.tip1_title || "100% Private", desc: dict?.pdf_editor?.tip1_desc || "All processing happens in your browser using pdf-lib. Your files never leave your device.", icon: Shield },
              { title: dict?.pdf_editor?.tip2_title || "Page Management", desc: dict?.pdf_editor?.tip2_desc || "Reorder, rotate, and delete pages. Perfect for reorganizing scanned documents.", icon: Layers },
              { title: dict?.pdf_editor?.tip3_title || "Text Annotations", desc: dict?.pdf_editor?.tip3_desc || "Add text at precise coordinates. Specify page, position, and font size for each annotation.", icon: Type },
              { title: dict?.pdf_editor?.tip4_title || "Image Insertion", desc: dict?.pdf_editor?.tip4_desc || "Insert JPG, PNG, or WebP images at specific positions and sizes on any page.", icon: Zap },
            ].map((tip, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-red-800/30">
                <div className="flex-shrink-0"><tip.icon className="w-6 h-6 text-red-600 dark:text-red-400" /></div>
                <div><h3 className="font-semibold mb-2">{tip.title}</h3><p className="text-sm text-muted-foreground">{tip.desc}</p></div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">{dict?.pdf_editor?.faq_title || "PDF Editor FAQ"}</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">{dict?.pdf_editor?.faq_desc || "Common questions about editing PDF documents."}</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1"><AccordionTrigger>{dict?.pdf_editor?.faq_1_q || "Is it free to edit PDFs?"}</AccordionTrigger><AccordionContent>{dict?.pdf_editor?.faq_1_a || "Yes, this PDF editor is 100% free. There are no hidden fees, watermarks, or limitations on the edits you can make."}</AccordionContent></AccordionItem>
              <AccordionItem value="faq-2"><AccordionTrigger>{dict?.pdf_editor?.faq_2_q || "Is my PDF secure when editing?"}</AccordionTrigger><AccordionContent>{dict?.pdf_editor?.faq_2_a || "Absolutely. All processing happens entirely in your browser using pdf-lib. Your PDF never leaves your device and is never uploaded to any server."}</AccordionContent></AccordionItem>
              <AccordionItem value="faq-3"><AccordionTrigger>{dict?.pdf_editor?.faq_3_q || "Can I edit the existing text in a PDF?"}</AccordionTrigger><AccordionContent>{dict?.pdf_editor?.faq_3_a || "Currently, this tool supports adding new text overlays and managing pages. Editing existing text in a PDF requires re-creating the text content, which is not yet supported. You can add new text annotations on top of existing content."}</AccordionContent></AccordionItem>
              <AccordionItem value="faq-4"><AccordionTrigger>{dict?.pdf_editor?.faq_4_q || "What coordinate system is used for positioning?"}</AccordionTrigger><AccordionContent>{dict?.pdf_editor?.faq_4_a || "PDF coordinates start from the bottom-left corner of the page. X increases to the right, and Y increases upward. A typical A4 page is 595 x 842 points. Adjust X and Y values to position your text or images precisely."}</AccordionContent></AccordionItem>
              <AccordionItem value="faq-5"><AccordionTrigger>{dict?.pdf_editor?.faq_5_q || "Can I undo my edits?"}</AccordionTrigger><AccordionContent>{dict?.pdf_editor?.faq_5_a || "You can remove individual text or image overlays before applying. Once you click &quot;Apply Edits &amp; Save&quot;, a new PDF is generated. Your original file is never modified, so you can always start over with the original."}</AccordionContent></AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
