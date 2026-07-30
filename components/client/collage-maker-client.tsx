"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  LayoutGrid,
  RotateCcw,
  Lightbulb,
  Layers,
  Zap,
  Shield,
  Plus,
  X,
  MousePointerClick,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

interface LoadedImage {
  id: string;
  src: string;
  name: string;
  element: HTMLImageElement;
}

interface SlotDef {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Template {
  id: string;
  name: string;
  slots: SlotDef[];
}

const TEMPLATES: Template[] = [
  {
    id: "single",
    name: "Single (1x1)",
    slots: [{ x: 0, y: 0, w: 1, h: 1 }],
  },
  {
    id: "side-by-side",
    name: "Side by Side (2x1)",
    slots: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 },
    ],
  },
  {
    id: "stacked",
    name: "Stacked (1x2)",
    slots: [
      { x: 0, y: 0, w: 1, h: 0.5 },
      { x: 0, y: 0.5, w: 1, h: 0.5 },
    ],
  },
  {
    id: "grid-2x2",
    name: "Grid (2x2)",
    slots: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  {
    id: "trio-h",
    name: "Trio Horizontal (3x1)",
    slots: [
      { x: 0, y: 0, w: 1 / 3, h: 1 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 1 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
    ],
  },
  {
    id: "trio-v",
    name: "Trio Vertical (1x3)",
    slots: [
      { x: 0, y: 0, w: 1, h: 1 / 3 },
      { x: 0, y: 1 / 3, w: 1, h: 1 / 3 },
      { x: 0, y: 2 / 3, w: 1, h: 1 / 3 },
    ],
  },
  {
    id: "big-left",
    name: "Big Left (1+2)",
    slots: [
      { x: 0, y: 0, w: 2 / 3, h: 1 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 0.5 },
      { x: 2 / 3, y: 0.5, w: 1 / 3, h: 0.5 },
    ],
  },
  {
    id: "big-top",
    name: "Big Top (2+1)",
    slots: [
      { x: 0, y: 0, w: 0.5, h: 2 / 3 },
      { x: 0.5, y: 0, w: 0.5, h: 2 / 3 },
      { x: 0, y: 2 / 3, w: 1, h: 1 / 3 },
    ],
  },
];

const CANVAS_SIZE = 1000;

export function CollageMakerClient({ dict }: { dict?: any }) {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(
    TEMPLATES[3],
  );
  const [gap, setGap] = useState(0);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [cornerRadius, setCornerRadius] = useState(0);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [slotAssignments, setSlotAssignments] = useState<
    Record<number, LoadedImage>
  >({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addFiles = (files: FileList | File[]) => {
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
      "image/bmp",
    ];
    const fileArray = Array.from(files).filter(
      (f) => validTypes.includes(f.type) && f.size <= 20 * 1024 * 1024,
    );

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const loaded: LoadedImage = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            src: dataUrl,
            name: file.name,
            element: img,
          };
          setImages((prev) => [...prev, loaded]);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    const newAssignments: Record<number, LoadedImage> = {};
    Object.entries(slotAssignments).forEach(([slot, img]) => {
      if (img.id !== id) {
        newAssignments[Number(slot)] = img;
      }
    });
    setSlotAssignments(newAssignments);
  };

  const assignImageToSlot = (img: LoadedImage) => {
    if (activeSlot === null) return;
    setSlotAssignments((prev) => ({ ...prev, [activeSlot]: img }));
    setActiveSlot(null);
  };

  const clearSlot = (slot: number) => {
    const newAssignments = { ...slotAssignments };
    delete newAssignments[slot];
    setSlotAssignments(newAssignments);
  };

  const loadSampleImages = async () => {
    try {
      const response = await fetch("/test-image.jpg");
      const blob = await response.blob();
      const file1 = new File([blob], "sample-1.jpg", { type: "image/jpeg" });
      const file2 = new File([blob], "sample-2.jpg", { type: "image/jpeg" });
      const file3 = new File([blob], "sample-3.jpg", { type: "image/jpeg" });
      const file4 = new File([blob], "sample-4.jpg", { type: "image/jpeg" });
      addFiles([file1, file2, file3, file4]);
    } catch (error) {
      console.error("Failed to load sample images:", error);
    }
  };

  const handleReset = () => {
    setImages([]);
    setSlotAssignments({});
    setPreviewUrl(null);
    setActiveSlot(null);
    setSelectedTemplate(TEMPLATES[3]);
    setGap(0);
    setBgColor("#ffffff");
    setCornerRadius(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    selectedTemplate.slots.forEach((slot, idx) => {
      const img = slotAssignments[idx];
      if (!img) return;

      const slotX = slot.x * CANVAS_SIZE + (slot.x > 0 ? gap / 2 : 0);
      const slotY = slot.y * CANVAS_SIZE + (slot.y > 0 ? gap / 2 : 0);
      const slotW =
        slot.w * CANVAS_SIZE - (slot.x > 0 || slot.x + slot.w < 1 ? gap : 0);
      const slotH =
        slot.h * CANVAS_SIZE - (slot.y > 0 || slot.y + slot.h < 1 ? gap : 0);

      ctx.save();

      if (cornerRadius > 0) {
        const radius = Math.min(cornerRadius, slotW / 2, slotH / 2);
        ctx.beginPath();
        ctx.moveTo(slotX + radius, slotY);
        ctx.lineTo(slotX + slotW - radius, slotY);
        ctx.arcTo(slotX + slotW, slotY, slotX + slotW, slotY + radius, radius);
        ctx.lineTo(slotX + slotW, slotY + slotH - radius);
        ctx.arcTo(
          slotX + slotW,
          slotY + slotH,
          slotX + slotW - radius,
          slotY + slotH,
          radius,
        );
        ctx.lineTo(slotX + radius, slotY + slotH);
        ctx.arcTo(slotX, slotY + slotH, slotX, slotY + slotH - radius, radius);
        ctx.lineTo(slotX, slotY + radius);
        ctx.arcTo(slotX, slotY, slotX + radius, slotY, radius);
        ctx.closePath();
        ctx.clip();
      }

      const imgW = img.element.naturalWidth;
      const imgH = img.element.naturalHeight;
      const scale = Math.max(slotW / imgW, slotH / imgH);
      const scaledW = imgW * scale;
      const scaledH = imgH * scale;
      const offsetX = slotX + (slotW - scaledW) / 2;
      const offsetY = slotY + (slotH - scaledH) / 2;

      ctx.drawImage(img.element, offsetX, offsetY, scaledW, scaledH);
      ctx.restore();
    });

    const dataUrl = canvas.toDataURL("image/png", 1.0);
    setPreviewUrl(dataUrl);
  }, [slotAssignments, selectedTemplate, gap, bgColor, cornerRadius]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = "collage.png";
    link.click();
  };

  const hasAllSlotsAssigned = selectedTemplate.slots.every(
    (_, idx) => slotAssignments[idx],
  );

  return (
    <div className="flex w-full flex-col">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex w-full flex-col">
        <div className="hidden">
          <LayoutGrid className="w-10 h-10 text-fuchsia-600 dark:text-fuchsia-400" />
        </div>
        <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
          {dict?.collage_maker?.title || "Collage Maker"}
        </h1>
        <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
          {dict?.collage_maker?.subtitle ||
            "Create beautiful photo collages with 8 customizable templates. Upload images, choose a layout, customize spacing and style. 100% private — processed in your browser."}
        </p>

        <Adsense slotId="7759160077" />

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 mb-2 ${
            isDragging
              ? "border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20"
              : "border-muted-foreground/30 hover:border-fuchsia-500/50 hover:bg-fuchsia-50/50 dark:hover:bg-fuchsia-900/10"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          {images.length === 0 ? (
            <>
              <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {dict?.collage_maker?.drop_zone || "여기에 이미지를 끌어다 놓으세요"}
              </p>
              <p className="text-sm text-muted-foreground">
                콜라주에 넣을 이미지를 여러 장 올리세요. 지원 형식: PNG, JPG, WebP, GIF, BMP
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                파일당 최대 20MB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  loadSampleImages();
                }}
                className="mt-4 text-sm text-fuchsia-600 dark:text-fuchsia-400 hover:underline"
              >
                샘플 이미지로 먼저 써보기
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-5 h-5 text-fuchsia-600" />
              <span className="text-sm font-medium">이미지 더 추가</span>
            </div>
          )}
        </div>

        {/* Uploaded Images */}
        {images.length > 0 && (
          <div className="w-full space-y-2 animate-in fade-in slide-in-from-bottom-4">
            <Card className="border-fuchsia-200 dark:border-fuchsia-900/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">
                    {images.length} image{images.length !== 1 ? "s" : ""}{" "}
                    uploaded
                    {activeSlot !== null && (
                      <span className="ml-2 text-fuchsia-600 dark:text-fuchsia-400">
                        • Click an image for slot {activeSlot + 1}
                      </span>
                    )}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {dict?.collage_maker?.another_btn || "Reset"}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      onClick={() =>
                        activeSlot !== null && assignImageToSlot(img)
                      }
                      className={`relative group ${
                        activeSlot !== null
                          ? "cursor-pointer ring-2 ring-fuchsia-500 ring-offset-2"
                          : ""
                      }`}
                    >
                      <img
                        src={img.src}
                        alt={img.name}
                        className="w-20 h-20 object-cover rounded-lg border border-muted"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.id);
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="제거"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Template Selection */}
            <Card className="border-fuchsia-200 dark:border-fuchsia-900/50">
              <CardHeader>
                <CardTitle className="text-lg">템플릿 선택</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template);
                        setSlotAssignments({});
                        setActiveSlot(null);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedTemplate.id === template.id
                          ? "border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20"
                          : "border-muted hover:border-fuchsia-300 hover:bg-fuchsia-50/50 dark:hover:bg-fuchsia-900/10"
                      }`}
                    >
                      <svg viewBox="0 0 100 100" className="w-full h-auto mb-2">
                        {template.slots.map((slot, idx) => (
                          <rect
                            key={idx}
                            x={slot.x * 100}
                            y={slot.y * 100}
                            width={slot.w * 100}
                            height={slot.h * 100}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        ))}
                      </svg>
                      <p className="text-xs font-medium text-center">
                        {template.name}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customization */}
            <Card className="border-fuchsia-200 dark:border-fuchsia-900/50">
              <CardHeader>
                <CardTitle className="text-lg">스타일 조절</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">간격</label>
                      <span className="text-sm text-muted-foreground">
                        {gap}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={gap}
                      onChange={(e) => setGap(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-fuchsia-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      배경색
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-muted cursor-pointer"
                      />
                      {["#ffffff", "#000000", "#f5f5f4"].map((c) => (
                        <button
                          key={c}
                          onClick={() => setBgColor(c)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform ${
                            bgColor === c
                              ? "border-fuchsia-500 scale-110"
                              : "border-muted"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        모서리 둥글기
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {cornerRadius}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="1"
                      value={cornerRadius}
                      onChange={(e) => setCornerRadius(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-fuchsia-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Preview */}
            <Card className="border-fuchsia-200 dark:border-fuchsia-900/50">
              <CardHeader>
                <CardTitle className="text-lg">미리보기</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative w-full max-w-xl mx-auto">
                  <div className="relative w-full pb-[100%] bg-muted/30 rounded-xl overflow-hidden">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="콜라주 미리보기"
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    )}
                    {selectedTemplate.slots.map((slot, idx) => {
                      const hasImage = slotAssignments[idx];
                      const isActive = activeSlot === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveSlot(idx)}
                          className={`absolute border-2 transition-all ${
                            isActive
                              ? "border-fuchsia-500 bg-fuchsia-500/20 animate-pulse"
                              : hasImage
                                ? "border-transparent hover:border-fuchsia-300"
                                : "border-dashed border-muted-foreground/50 hover:border-fuchsia-400 bg-black/10"
                          }`}
                          style={{
                            left: `${slot.x * 100}%`,
                            top: `${slot.y * 100}%`,
                            width: `${slot.w * 100}%`,
                            height: `${slot.h * 100}%`,
                          }}
                          title={
                            hasImage
                              ? `Slot ${idx + 1}: Click to change`
                              : `Slot ${idx + 1}: Click to assign`
                          }
                        >
                          {!hasImage && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                              <MousePointerClick className="w-6 h-6 mb-1" />
                              <span className="text-xs font-medium">
                                {idx + 1}
                              </span>
                            </div>
                          )}
                          {hasImage && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearSlot(idx);
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 hover:opacity-100 transition-opacity"
                              title="칸 비우기"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {!hasAllSlotsAssigned && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    칸을 누른 뒤 이미지를 클릭하면 배치됩니다
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Download */}
            {hasAllSlotsAssigned && (
              <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2">
                <Button
                  size="lg"
                  onClick={handleDownload}
                  className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-lg min-w-[180px]"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {dict?.collage_maker?.download_btn || "Download Collage"}
                </Button>
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* How-to & Tips & FAQ */}
      <div className="w-full max-w-6xl mx-auto mt-3 px-4 space-y-3">
        <section>
          <div className="mb-2">
            <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
              {dict?.collage_maker?.guide_title || "How to Create a Collage"}
            </h2>
            <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              {dict?.collage_maker?.guide_desc ||
                "Create a beautiful photo collage in 4 simple steps."}
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-2">
            {[
              {
                step: 1,
                title: dict?.collage_maker?.step1_title || "이미지 업로드s",
                desc:
                  dict?.collage_maker?.step1_desc ||
                  "Upload multiple images by dragging & dropping or clicking to browse. You can add as many images as you need.",
                icon: Upload,
              },
              {
                step: 2,
                title: dict?.collage_maker?.step2_title || "Choose Template",
                desc:
                  dict?.collage_maker?.step2_desc ||
                  "Select from 8 predefined templates: single, 2x1, 1x2, 2x2, 3x1, 1x3, big left, or big top layouts.",
                icon: LayoutGrid,
              },
              {
                step: 3,
                title: dict?.collage_maker?.step3_title || "Assign Images",
                desc:
                  dict?.collage_maker?.step3_desc ||
                  "Click a slot in the preview, then click an image to assign it. Repeat for all slots until the collage is complete.",
                icon: MousePointerClick,
              },
              {
                step: 4,
                title: dict?.collage_maker?.tip4_title || "Download",
                desc:
                  dict?.collage_maker?.tip4_desc ||
                  "Customize gap, background color, and corner radius. Click 'Download' to save your collage as PNG.",
                icon: Download,
              },
            ].map((step) => (
              <Card
                key={step.step}
                className="border-fuchsia-200 dark:border-fuchsia-900/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-fuchsia-500 text-white font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-2">
            <div className="hidden">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
              {dict?.collage_maker?.tips_title || "Collage Tips"}
            </h2>
            <p className="text-muted-foreground">
              사진 콜라주를 만들 때 가장 좋은 결과를 얻는 방법입니다.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {[
              {
                title: "칸에 꽉 채우기",
                desc: "이미지가 각 칸을 꽉 채우도록 자동 조정됩니다. 가운데를 기준으로 잘려 딱 맞게 배치됩니다.",
                icon: Layers,
              },
              {
                title: "간격으로 여백 주기",
                desc: "간격 슬라이더(0~50px)로 이미지 사이 여백을 조절하세요. 배경색이 그 여백을 채워 깔끔해 보입니다.",
                icon: Zap,
              },
              {
                title: "모서리 둥글기로 분위기 내기",
                desc: "모서리 둥글기(0~40px)를 적용하면 각 칸의 모서리가 둥글어집니다. 부드럽고 세련된 콜라주에 잘 어울립니다.",
                icon: Shield,
              },
              {
                title: "클릭해서 다시 배치",
                desc: "이미 이미지를 배치한 칸인가요? 칸을 다시 눌러 다른 이미지를 고르거나 X를 눌러 비울 수 있습니다.",
                icon: MousePointerClick,
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-fuchsia-500" />
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
          <div className="mb-2">
            <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
              {dict?.collage_maker?.faq_title || "Collage Maker FAQ"}
            </h2>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              사진 콜라주 만들기에 대해 자주 묻는 질문입니다.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>
                  {dict?.collage_maker?.faq_1_q || "Is it free to use?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.collage_maker?.faq_1_a ||
                    "Yes, this collage maker is 100% free. There are no hidden fees, watermarks, or limitations on the number of collages you can create."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>
                  {dict?.collage_maker?.faq_2_q ||
                    "Is it secure? Where are my images stored?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.collage_maker?.faq_2_a ||
                    "Your images are completely secure. All processing happens in your browser using Canvas API. Images never leave your device and are never uploaded to any server."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>
                  {dict?.collage_maker?.faq_3_q ||
                    "What templates are available?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.collage_maker?.faq_3_a ||
                    "We offer 8 templates: Single (1x1), Side by Side (2x1), Stacked (1x2), Grid (2x2), Trio Horizontal (3x1), Trio Vertical (1x3), Big Left (1+2 layout), and Big Top (2+1 layout)."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>
                  {dict?.collage_maker?.faq_4_q ||
                    "How do I assign images to slots?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.collage_maker?.faq_4_a ||
                    "Click a slot in the preview area, then click an image from your uploaded images. The image will be assigned to that slot. To change it, click the slot again and select a different image."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>
                  {dict?.collage_maker?.faq_5_q || "결과물은 어떤 형식인가요?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.collage_maker?.faq_5_a ||
                    "The collage is always saved as PNG (1000x1000px) to ensure maximum quality. You can convert it to other formats using our Image Converter tool if needed."}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
        </div>
        <aside className="hidden shrink-0 xl:block xl:w-[200px]">
          <ToolsSidebar category="image" dict={dict} />
        </aside>
      </div>
    </div>
  );
}
