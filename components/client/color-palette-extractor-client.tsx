"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
import Adsense from "@/components/Adsense";
  Upload,
  Palette,
  Loader2,
  Copy,
  Check,
  Download,
  Lightbulb,
  Zap,
  Layers,
  FileImage,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  percentage: number;
}

type CopyState = "idle" | "hex" | "rgb" | "hsl";

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function colorDistance(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number },
): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
      Math.pow(c1.g - c2.g, 2) +
      Math.pow(c1.b - c2.b, 2),
  );
}

function kMeans(
  pixels: { r: number; g: number; b: number }[],
  k: number,
  maxIterations: number = 20,
): ExtractedColor[] {
  if (pixels.length === 0) return [];

  const centroids: { r: number; g: number; b: number }[] = [];
  for (let i = 0; i < k; i++) {
    centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
  }

  let assignments: number[] = new Array(pixels.length).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    const newAssignments: number[] = [];

    for (let i = 0; i < pixels.length; i++) {
      let minDist = Infinity;
      let closestCentroid = 0;

      for (let j = 0; j < k; j++) {
        const dist = colorDistance(pixels[i], centroids[j]);
        if (dist < minDist) {
          minDist = dist;
          closestCentroid = j;
        }
      }
      newAssignments.push(closestCentroid);
    }

    let changed = false;
    for (let i = 0; i < assignments.length; i++) {
      if (assignments[i] !== newAssignments[i]) {
        changed = true;
        break;
      }
    }
    assignments = newAssignments;

    if (!changed) break;

    const clusterSums: { r: number; g: number; b: number; count: number }[] =
      [];
    for (let i = 0; i < k; i++) {
      clusterSums.push({ r: 0, g: 0, b: 0, count: 0 });
    }

    for (let i = 0; i < pixels.length; i++) {
      const cluster = assignments[i];
      clusterSums[cluster].r += pixels[i].r;
      clusterSums[cluster].g += pixels[i].g;
      clusterSums[cluster].b += pixels[i].b;
      clusterSums[cluster].count++;
    }

    for (let i = 0; i < k; i++) {
      if (clusterSums[i].count > 0) {
        centroids[i] = {
          r: clusterSums[i].r / clusterSums[i].count,
          g: clusterSums[i].g / clusterSums[i].count,
          b: clusterSums[i].b / clusterSums[i].count,
        };
      }
    }
  }

  const clusterCounts: number[] = new Array(k).fill(0);
  for (let i = 0; i < assignments.length; i++) {
    clusterCounts[assignments[i]]++;
  }

  const totalPixels = pixels.length;
  const colors: ExtractedColor[] = centroids.map((centroid, idx) => {
    const rgb = {
      r: Math.round(centroid.r),
      g: Math.round(centroid.g),
      b: Math.round(centroid.b),
    };
    return {
      hex: rgbToHex(rgb.r, rgb.g, rgb.b),
      rgb,
      hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
      percentage: (clusterCounts[idx] / totalPixels) * 100,
    };
  });

  return colors.sort((a, b) => b.percentage - a.percentage);
}

export function ColorPaletteExtractorClient({ dict }: { dict?: any }) {
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [colorCount, setColorCount] = useState<number>(6);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copyStates, setCopyStates] = useState<
    Record<number, CopyState | "idle">
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      return;
    }

    if (file.size > maxSize) {
      return;
    }

    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
        setColors([]);
      }
    };
    reader.readAsDataURL(file);
  };

  const extractColors = async () => {
    if (!image) return;

    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDim = 200;
      const scale = Math.min(maxDim / img.width, maxDim / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels: { r: number; g: number; b: number }[] = [];

      for (let i = 0; i < imageData.data.length; i += 4) {
        pixels.push({
          r: imageData.data[i],
          g: imageData.data[i + 1],
          b: imageData.data[i + 2],
        });
      }

      const extracted = kMeans(pixels, colorCount);
      setColors(extracted);
      setIsProcessing(false);
    };

    img.onerror = () => {
      setIsProcessing(false);
    };

    img.src = image;
  };

  const copyToClipboard = async (
    text: string,
    index: number,
    type: CopyState,
  ) => {
    await navigator.clipboard.writeText(text);
    setCopyStates((prev) => ({ ...prev, [index]: type }));
    setTimeout(() => {
      setCopyStates((prev) => ({ ...prev, [index]: "idle" }));
    }, 2000);
  };

  const downloadPalette = () => {
    if (colors.length === 0) return;

    const canvas = document.createElement("canvas");
    const colorHeight = 100;
    const textHeight = 80;
    canvas.width = 800;
    canvas.height = colors.length * (colorHeight + textHeight);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    colors.forEach((color, idx) => {
      const y = idx * (colorHeight + textHeight);

      ctx.fillStyle = color.hex;
      ctx.fillRect(0, y, canvas.width, colorHeight);

      ctx.fillStyle = "#000000";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(`${color.hex}`, 20, y + colorHeight + 30);
      ctx.font = "16px sans-serif";
      ctx.fillText(
        `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
        20,
        y + colorHeight + 55,
      );
      ctx.fillText(
        `${color.percentage.toFixed(1)}%`,
        canvas.width - 100,
        y + colorHeight + 42,
      );
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "color-palette.png";
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[50vh]">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 mb-6">
          <Palette className="w-10 h-10 text-pink-600 dark:text-pink-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {dict?.color_palette_extractor?.title || "Color Palette Extractor"}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {dict?.color_palette_extractor?.subtitle ||
            "Extract dominant colors from any image. Get HEX, RGB, and HSL color codes instantly."}
        </p>

        {!image ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                : "border-muted-foreground/30 hover:border-pink-500/50 hover:bg-pink-50/50 dark:hover:bg-pink-900/10"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {dict?.color_palette_extractor?.drop_zone ||
                "Drag & drop your image here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {dict?.color_palette_extractor?.supported ||
                "Supported: PNG, JPG, JPEG, WEBP"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Max file size: 10MB
            </p>
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                const res = await fetch("/test-image.jpg");
                const blob = await res.blob();
                const file = new File([blob], "test-image.jpg", { type: "image/jpeg" });
                processFile(file);
              }}
              className="mt-4 text-sm text-pink-600 dark:text-pink-400 hover:underline"
            >
              Or try with a sample image
            </button>
          </div>
        ) : (
          <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <Card className="border-pink-100 dark:border-pink-900/50">
              <CardContent className="flex flex-col gap-6 p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={image}
                      alt="Uploaded"
                      className="max-w-full md:max-w-xs rounded-lg shadow-md"
                    />
                    <p className="text-sm text-muted-foreground mt-2 text-center truncate">
                      {imageName}
                    </p>
                  </div>

                  <div className="flex-1 flex flex-col justify-center gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          {dict?.color_palette_extractor?.color_count_label ||
                            "Number of Colors"}
                          : {colorCount}
                        </label>
                      </div>
                      <Slider
                        value={[colorCount]}
                        onValueChange={(val) => setColorCount(val[0])}
                        min={3}
                        max={12}
                        step={1}
                        disabled={isProcessing}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>3 colors</span>
                        <span>12 colors</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={extractColors}
                        disabled={isProcessing}
                        className="bg-pink-600 hover:bg-pink-700 text-white flex-1"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {dict?.color_palette_extractor?.extracting ||
                              "Extracting..."}
                          </>
                        ) : (
                          <>
                            <Palette className="w-4 h-4 mr-2" />
                            {dict?.color_palette_extractor?.extract_btn ||
                              "Extract Colors"}
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setImage(null);
                          setColors([]);
                          setImageName("");
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {colors.length > 0 && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="flex rounded-lg overflow-hidden shadow-lg w-full max-w-3xl h-24">
                    {colors.map((color, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: color.hex,
                          width: `${color.percentage}%`,
                        }}
                        className="hover:opacity-80 transition-opacity"
                        title={`${color.hex} - ${color.percentage.toFixed(1)}%`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {colors.map((color, idx) => (
                    <Card key={idx} className="border-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-20 h-20 rounded-lg shadow-md flex-shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-sm font-semibold">
                                {color.hex.toUpperCase()}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {color.percentage.toFixed(1)}%
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <code className="text-xs flex-1 truncate">
                                  {color.hex}
                                </code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  onClick={() =>
                                    copyToClipboard(color.hex, idx, "hex")
                                  }
                                >
                                  {copyStates[idx] === "hex" ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>

                              <div className="flex items-center gap-2">
                                <code className="text-xs flex-1 truncate">
                                  rgb({color.rgb.r}, {color.rgb.g},{" "}
                                  {color.rgb.b})
                                </code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  onClick={() =>
                                    copyToClipboard(
                                      `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
                                      idx,
                                      "rgb",
                                    )
                                  }
                                >
                                  {copyStates[idx] === "rgb" ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>

                              <div className="flex items-center gap-2">
                                <code className="text-xs flex-1 truncate">
                                  hsl({color.hsl.h}, {color.hsl.s}%,{" "}
                                  {color.hsl.l}%)
                                </code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  onClick={() =>
                                    copyToClipboard(
                                      `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
                                      idx,
                                      "hsl",
                                    )
                                  }
                                >
                                  {copyStates[idx] === "hsl" ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    size="lg"
                    onClick={downloadPalette}
                    className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {dict?.color_palette_extractor?.download_palette_btn ||
                      "Download Palette"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl mx-auto mt-12 px-4 space-y-16">
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.color_palette_extractor?.guide_title ||
                "How to Extract Color Palettes"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict?.color_palette_extractor?.guide_desc ||
                "Extract dominant colors from images in 3 simple steps."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title:
                  dict?.color_palette_extractor?.step1_title || "Upload Image",
                desc:
                  dict?.color_palette_extractor?.step1_desc ||
                  "Upload the image you want to extract colors from. Any PNG, JPG, or WebP image works.",
                icon: Upload,
              },
              {
                step: 2,
                title:
                  dict?.color_palette_extractor?.step2_title ||
                  "Adjust Color Count",
                desc:
                  dict?.color_palette_extractor?.step2_desc ||
                  "Use the slider to choose how many colors to extract (3-12). The algorithm finds the most dominant colors.",
                icon: Layers,
              },
              {
                step: 3,
                title:
                  dict?.color_palette_extractor?.step3_title ||
                  "Copy & Download",
                desc:
                  dict?.color_palette_extractor?.step3_desc ||
                  "Copy individual color codes or download the entire palette as a PNG image.",
                icon: Zap,
              },
            ].map((step) => (
              <Card
                key={step.step}
                className="border-pink-100 dark:border-pink-900/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-500 text-white font-bold">
                      {step.step}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
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
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.color_palette_extractor?.tips_title ||
                "Color Extraction Tips"}
            </h2>
            <p className="text-muted-foreground">
              {dict?.color_palette_extractor?.tips_desc ||
                "Get the best color palettes from your images."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title:
                  dict?.color_palette_extractor?.tip1_title ||
                  "Choose Right Count",
                desc:
                  dict?.color_palette_extractor?.tip1_desc ||
                  "For simple images, 3-5 colors work best. For complex photos with many colors, try 8-12 colors.",
                icon: Palette,
              },
              {
                title:
                  dict?.color_palette_extractor?.tip2_title ||
                  "Color Percentage",
                desc:
                  dict?.color_palette_extractor?.tip2_desc ||
                  "Each color shows what percentage of the image it represents. This helps identify the most dominant colors.",
                icon: Layers,
              },
              {
                title:
                  dict?.color_palette_extractor?.tip3_title || "Use for Design",
                desc:
                  dict?.color_palette_extractor?.tip3_desc ||
                  "Perfect for designers extracting brand colors from logos or creating color schemes from inspiration photos.",
                icon: FileImage,
              },
              {
                title:
                  dict?.color_palette_extractor?.tip4_title ||
                  "Download Palette",
                desc:
                  dict?.color_palette_extractor?.tip4_desc ||
                  "Save the palette as a PNG reference image to use in your design projects or share with your team.",
                icon: Download,
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Adsense slotId="7759160077" />

        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {dict?.qna_color_palette_extractor?.title ||
                "Color Palette Extractor FAQ"}
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              {dict?.qna_color_palette_extractor?.desc ||
                "Common questions about extracting color palettes from images."}
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[1, 2, 3, 4, 5].map((num) => (
                <AccordionItem key={num} value={`item-${num}`}>
                  <AccordionTrigger>
                    {dict?.qna_color_palette_extractor?.[`faq_${num}_q`] ||
                      `Question ${num}`}
                  </AccordionTrigger>
                  <AccordionContent>
                    {dict?.qna_color_palette_extractor?.[`faq_${num}_a`] ||
                      `Answer to question ${num}`}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
