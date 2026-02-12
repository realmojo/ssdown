"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileImage,
  Crop,
  RotateCcw,
  Lightbulb,
  Layers,
  Zap,
  Scissors,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type AspectRatio = "free" | "1:1" | "16:9" | "9:16" | "4:3" | "3:2" | "2:3";

const ASPECT_RATIOS: { label: string; value: AspectRatio; ratio?: number }[] = [
  { label: "Free", value: "free" },
  { label: "1:1", value: "1:1", ratio: 1 },
  { label: "16:9", value: "16:9", ratio: 16 / 9 },
  { label: "9:16", value: "9:16", ratio: 9 / 16 },
  { label: "4:3", value: "4:3", ratio: 4 / 3 },
  { label: "3:2", value: "3:2", ratio: 3 / 2 },
  { label: "2:3", value: "2:3", ratio: 2 / 3 },
];

export function CropImageClient() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free");
  const [isMoving, setIsMoving] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [croppedSize, setCroppedSize] = useState<{ width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadImage(e.target.files[0]);
    }
  };

  const loadImage = (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/bmp"];
    if (!validTypes.includes(file.type)) return;
    if (file.size > 20 * 1024 * 1024) return;

    setFileName(file.name);
    setCroppedUrl(null);
    setCroppedSize(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = useCallback(() => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const displayWidth = img.clientWidth;
    const displayHeight = img.clientHeight;

    setImageSize({ width: displayWidth, height: displayHeight });
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });

    const margin = Math.min(displayWidth, displayHeight) * 0.1;
    setCropArea({
      x: margin,
      y: margin,
      width: displayWidth - margin * 2,
      height: displayHeight - margin * 2,
    });
  }, []);

  const applyAspectRatio = useCallback(
    (ratio: AspectRatio) => {
      setAspectRatio(ratio);
      if (ratio === "free" || imageSize.width === 0) return;
      const ratioObj = ASPECT_RATIOS.find((r) => r.value === ratio);
      if (!ratioObj?.ratio) return;

      setCropArea((prev) => {
        const r = ratioObj.ratio!;
        let newWidth = prev.width;
        let newHeight = prev.width / r;

        if (newHeight > imageSize.height) {
          newHeight = imageSize.height;
          newWidth = newHeight * r;
        }
        if (newWidth > imageSize.width) {
          newWidth = imageSize.width;
          newHeight = newWidth / r;
        }

        const x = Math.max(0, Math.min(prev.x, imageSize.width - newWidth));
        const y = Math.max(0, Math.min(prev.y, imageSize.height - newHeight));

        return { x, y, width: newWidth, height: newHeight };
      });
    },
    [imageSize],
  );

  const clampCrop = useCallback(
    (crop: CropArea): CropArea => {
      const minSize = 20;
      const w = Math.max(minSize, Math.min(crop.width, imageSize.width));
      const h = Math.max(minSize, Math.min(crop.height, imageSize.height));
      const x = Math.max(0, Math.min(crop.x, imageSize.width - w));
      const y = Math.max(0, Math.min(crop.y, imageSize.height - h));
      return { x, y, width: w, height: h };
    },
    [imageSize],
  );

  const getPointerPos = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      const container = containerRef.current;
      const img = imageRef.current;
      if (!container || !img) return { x: 0, y: 0 };
      const imgRect = img.getBoundingClientRect();
      return {
        x: e.clientX - imgRect.left,
        y: e.clientY - imgRect.top,
      };
    },
    [],
  );

  const handleCropMouseDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const pos = getPointerPos(e);
      setIsMoving(true);
      setDragStart({ x: pos.x - cropArea.x, y: pos.y - cropArea.y });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [cropArea, getPointerPos],
  );

  const handleHandleMouseDown = useCallback(
    (handle: string, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const pos = getPointerPos(e);
      setIsResizing(handle);
      setDragStart({ x: pos.x, y: pos.y });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [getPointerPos],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const pos = getPointerPos(e);

      if (isMoving) {
        const newX = pos.x - dragStart.x;
        const newY = pos.y - dragStart.y;
        setCropArea((prev) =>
          clampCrop({ ...prev, x: newX, y: newY }),
        );
      }

      if (isResizing) {
        const dx = pos.x - dragStart.x;
        const dy = pos.y - dragStart.y;
        setDragStart({ x: pos.x, y: pos.y });

        setCropArea((prev) => {
          let { x, y, width, height } = prev;
          const ratioObj = ASPECT_RATIOS.find((r) => r.value === aspectRatio);
          const ratio = ratioObj?.ratio;

          switch (isResizing) {
            case "nw":
              x += dx;
              y += dy;
              width -= dx;
              height -= dy;
              break;
            case "ne":
              y += dy;
              width += dx;
              height -= dy;
              break;
            case "sw":
              x += dx;
              width -= dx;
              height += dy;
              break;
            case "se":
              width += dx;
              height += dy;
              break;
            case "n":
              y += dy;
              height -= dy;
              break;
            case "s":
              height += dy;
              break;
            case "w":
              x += dx;
              width -= dx;
              break;
            case "e":
              width += dx;
              break;
          }

          if (ratio) {
            if (isResizing.includes("e") || isResizing.includes("w")) {
              height = width / ratio;
            } else {
              width = height * ratio;
            }
          }

          return clampCrop({ x, y, width, height });
        });
      }
    },
    [isMoving, isResizing, dragStart, getPointerPos, clampCrop, aspectRatio],
  );

  const handlePointerUp = useCallback(() => {
    setIsMoving(false);
    setIsResizing(null);
  }, []);

  const handleCrop = useCallback(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !imageSize.width) return;

    const scaleX = naturalSize.width / imageSize.width;
    const scaleY = naturalSize.height / imageSize.height;

    const sx = cropArea.x * scaleX;
    const sy = cropArea.y * scaleY;
    const sw = cropArea.width * scaleX;
    const sh = cropArea.height * scaleY;

    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    const ext = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    let mimeType = "image/png";
    if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
    else if (ext === "webp") mimeType = "image/webp";

    const dataUrl = canvas.toDataURL(mimeType, 0.92);
    setCroppedUrl(dataUrl);
    setCroppedSize({ width: canvas.width, height: canvas.height });
  }, [cropArea, imageSize, naturalSize, fileName]);

  const handleDownload = useCallback(() => {
    if (!croppedUrl) return;
    const link = document.createElement("a");
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const ext = fileName.substring(fileName.lastIndexOf("."));
    link.href = croppedUrl;
    link.download = `${nameWithoutExt}_cropped${ext}`;
    link.click();
  }, [croppedUrl, fileName]);

  const handleReset = () => {
    setImageSrc(null);
    setFileName("");
    setCroppedUrl(null);
    setCroppedSize(null);
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
    setAspectRatio("free");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadImage(file);
  }, []);

  const scaleX = naturalSize.width && imageSize.width ? naturalSize.width / imageSize.width : 1;
  const scaleY = naturalSize.height && imageSize.height ? naturalSize.height / imageSize.height : 1;
  const outputW = Math.round(cropArea.width * scaleX);
  const outputH = Math.round(cropArea.height * scaleY);

  const handles = ["nw", "ne", "sw", "se", "n", "s", "w", "e"];

  const getHandleStyle = (handle: string) => {
    const size = 12;
    const half = size / 2;
    const base: React.CSSProperties = {
      position: "absolute",
      width: size,
      height: size,
      backgroundColor: "white",
      border: "2px solid #3b82f6",
      borderRadius: 2,
      zIndex: 30,
    };
    switch (handle) {
      case "nw":
        return { ...base, top: -half, left: -half, cursor: "nw-resize" };
      case "ne":
        return { ...base, top: -half, right: -half, cursor: "ne-resize" };
      case "sw":
        return { ...base, bottom: -half, left: -half, cursor: "sw-resize" };
      case "se":
        return { ...base, bottom: -half, right: -half, cursor: "se-resize" };
      case "n":
        return { ...base, top: -half, left: "50%", marginLeft: -half, cursor: "n-resize" };
      case "s":
        return { ...base, bottom: -half, left: "50%", marginLeft: -half, cursor: "s-resize" };
      case "w":
        return { ...base, top: "50%", left: -half, marginTop: -half, cursor: "w-resize" };
      case "e":
        return { ...base, top: "50%", right: -half, marginTop: -half, cursor: "e-resize" };
      default:
        return base;
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 mb-6">
          <Crop className="w-10 h-10 text-orange-600 dark:text-orange-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Crop Image
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          Crop your image to any size. Select a region, choose an aspect ratio, and download. 100% free and private.
        </p>

        {!imageSrc ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                : "border-muted-foreground/30 hover:border-orange-500/50 hover:bg-orange-50/50 dark:hover:bg-orange-900/10"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Drag & drop your image here
            </p>
            <p className="text-sm text-muted-foreground">
              Supported: PNG, JPG, JPEG, WebP, GIF, BMP
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Max file size: 20MB
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setImageSrc("/test-image.jpg");
                setFileName("test-image.jpg");
              }}
              className="mt-4 text-sm text-orange-600 dark:text-orange-400 hover:underline"
            >
              Or try with a sample image
            </button>
          </div>
        ) : (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Controls */}
            <Card className="border-orange-100 dark:border-orange-900/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      New Image
                    </Button>
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]" title={fileName}>
                      {fileName}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Output: {outputW} x {outputH} px
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Aspect Ratio</label>
                  <div className="flex flex-wrap gap-2">
                    {ASPECT_RATIOS.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => applyAspectRatio(r.value)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          aspectRatio === r.value
                            ? "bg-orange-500 text-white border-orange-500"
                            : "border-muted hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crop Area */}
            <div
              ref={containerRef}
              className="w-full flex items-center justify-center bg-muted/30 rounded-xl overflow-hidden select-none"
              style={{ touchAction: "none" }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <div className="relative inline-block">
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Image to crop"
                  onLoad={onImageLoad}
                  className="max-w-full max-h-[70vh] block"
                  draggable={false}
                />

                {/* Overlay */}
                {imageSize.width > 0 && (
                  <>
                    {/* Dark overlay outside crop */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: "rgba(0,0,0,0.5)",
                        clipPath: `polygon(
                          0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
                          ${(cropArea.x / imageSize.width) * 100}% ${(cropArea.y / imageSize.height) * 100}%,
                          ${(cropArea.x / imageSize.width) * 100}% ${((cropArea.y + cropArea.height) / imageSize.height) * 100}%,
                          ${((cropArea.x + cropArea.width) / imageSize.width) * 100}% ${((cropArea.y + cropArea.height) / imageSize.height) * 100}%,
                          ${((cropArea.x + cropArea.width) / imageSize.width) * 100}% ${(cropArea.y / imageSize.height) * 100}%,
                          ${(cropArea.x / imageSize.width) * 100}% ${(cropArea.y / imageSize.height) * 100}%
                        )`,
                      }}
                    />

                    {/* Crop selection box */}
                    <div
                      className="absolute border-2 border-blue-500"
                      style={{
                        left: cropArea.x,
                        top: cropArea.y,
                        width: cropArea.width,
                        height: cropArea.height,
                        cursor: "move",
                        zIndex: 20,
                      }}
                      onPointerDown={handleCropMouseDown}
                    >
                      {/* Rule of thirds grid */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                        <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                      </div>

                      {/* Resize handles */}
                      {handles.map((h) => (
                        <div
                          key={h}
                          style={getHandleStyle(h)}
                          onPointerDown={(e) => handleHandleMouseDown(h, e)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={handleCrop}
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg min-w-[160px]"
              >
                <Scissors className="w-5 h-5 mr-2" />
                Crop Image
              </Button>
              {croppedUrl && (
                <Button
                  size="lg"
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg min-w-[160px] animate-in fade-in slide-in-from-bottom-2"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </Button>
              )}
            </div>

            {/* Preview */}
            {croppedUrl && croppedSize && (
              <Card className="border-green-100 dark:border-green-900/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Cropped Result
                    <span className="text-sm font-normal text-muted-foreground">
                      ({croppedSize.width} x {croppedSize.height} px)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <img
                    src={croppedUrl}
                    alt="Cropped result"
                    className="max-w-full max-h-[400px] rounded-lg shadow-md"
                  />
                </CardContent>
              </Card>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>

      {/* How-to & Tips & FAQ */}
      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              How to Crop Images
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Crop any image to the perfect size in 3 simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: "Upload Image",
                desc: "Upload a PNG, JPG, WebP, GIF, or BMP image from your device.",
                icon: Upload,
              },
              {
                step: 2,
                title: "Select Crop Area",
                desc: "Drag to move, resize handles to adjust. Choose a preset aspect ratio or crop freely.",
                icon: Crop,
              },
              {
                step: 3,
                title: "Crop & Download",
                desc: "Click 'Crop Image' and download your perfectly cropped image.",
                icon: Download,
              },
            ].map((step) => (
              <Card key={step.step} className="border-orange-100 dark:border-orange-900/50">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Cropping Tips
            </h2>
            <p className="text-muted-foreground">
              Get the best results when cropping your images.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Use Aspect Ratios",
                desc: "Select a preset ratio like 1:1 for profile photos, 16:9 for YouTube thumbnails, or 9:16 for Instagram Stories.",
                icon: Layers,
              },
              {
                title: "Rule of Thirds",
                desc: "The grid lines help you align subjects along the thirds for a more balanced composition.",
                icon: Crop,
              },
              {
                title: "100% Private",
                desc: "All cropping happens in your browser using Canvas API. Your images never leave your device.",
                icon: Scissors,
              },
              {
                title: "Original Quality",
                desc: "The cropped image maintains the same resolution and quality as the original — no compression applied.",
                icon: Zap,
              },
            ].map((tip, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-orange-500" />
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
              Image Cropping FAQ
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Common questions about cropping images online.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>Is my image uploaded to a server?</AccordionTrigger>
                <AccordionContent>
                  No. All image processing happens entirely in your browser using the Canvas API. Your images never leave your device and are never sent to any server.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>What image formats are supported?</AccordionTrigger>
                <AccordionContent>
                  You can crop PNG, JPG, JPEG, WebP, GIF, and BMP images. The cropped image will be saved in the same format as the original.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>Will cropping reduce image quality?</AccordionTrigger>
                <AccordionContent>
                  No. The crop tool extracts the selected region at full original resolution. There is no re-compression or quality loss during the cropping process.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>Can I crop to a specific aspect ratio?</AccordionTrigger>
                <AccordionContent>
                  Yes! Choose from preset aspect ratios like 1:1 (square), 16:9 (widescreen), 9:16 (portrait), 4:3, 3:2, and 2:3. You can also crop freely without any ratio constraint.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>What is the maximum file size?</AccordionTrigger>
                <AccordionContent>
                  The maximum file size is 20MB. Since all processing happens in your browser, larger files may take a moment to load depending on your device.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
