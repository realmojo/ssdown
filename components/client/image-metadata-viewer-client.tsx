"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileImage,
  FileSearch,
  RotateCcw,
  Copy,
  Check,
  Lightbulb,
  Shield,
  MapPin,
  Camera,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import exifr from "exifr";
import Adsense from "@/components/Adsense";
import { ToolsSidebar } from "@/components/tools-sidebar";

export function ImageMetadataViewerClient({ dict }: { dict?: any }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileType, setFileType] = useState<string>("");
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadImage(e.target.files[0]);
    }
  };

  const loadImage = async (file: File) => {
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
      "image/bmp",
      "image/tiff",
      "image/heic",
      "image/heif",
    ];
    if (!validTypes.includes(file.type)) return;
    if (file.size > 20 * 1024 * 1024) return;

    setFileName(file.name);
    setFileSize(file.size);
    setFileType(file.type);
    setMetadata(null);
    setImageDimensions(null);

    // Parse EXIF metadata
    try {
      const exifData = await exifr.parse(file, true);
      setMetadata(exifData || null);
    } catch {
      setMetadata(null);
    }

    // Read image for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageSrc(dataUrl);
      const img = new Image();
      img.onload = () => {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const loadSampleImage = async () => {
    try {
      const response = await fetch("/test-image.jpg");
      const blob = await response.blob();
      const file = new File([blob], "test-image.jpg", { type: "image/jpeg" });
      loadImage(file);
    } catch (error) {
      console.error("Failed to load sample image:", error);
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setFileName("");
    setFileSize(0);
    setFileType("");
    setMetadata(null);
    setImageDimensions(null);
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
    const file = e.dataTransfer.files[0];
    if (file) loadImage(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatShutterSpeed = (val: number) => {
    if (val >= 1) return `${val}s`;
    return `1/${Math.round(1 / val)}s`;
  };

  const formatAperture = (val: number) => `f/${val}`;

  const formatFocalLength = (val: number) => `${val}mm`;

  const formatGPS = (lat: number, lng: number) => ({
    text: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
  });

  const copyMetadataToClipboard = () => {
    if (!metadata) return;

    let text = `Image Metadata: ${fileName}\n\n`;
    text += `File Info:\n`;
    text += `  Name: ${fileName}\n`;
    text += `  Size: ${formatFileSize(fileSize)}\n`;
    text += `  Type: ${fileType}\n`;
    if (imageDimensions) {
      text += `  Dimensions: ${imageDimensions.width} x ${imageDimensions.height}px\n`;
    }
    text += `\n`;

    if (metadata.Make || metadata.Model) {
      text += `Camera Info:\n`;
      if (metadata.Make) text += `  Make: ${metadata.Make}\n`;
      if (metadata.Model) text += `  Model: ${metadata.Model}\n`;
      if (metadata.Software) text += `  Software: ${metadata.Software}\n`;
      text += `\n`;
    }

    if (
      metadata.ISO ||
      metadata.FNumber ||
      metadata.ExposureTime ||
      metadata.FocalLength
    ) {
      text += `Shooting Settings:\n`;
      if (metadata.ISO) text += `  ISO: ${metadata.ISO}\n`;
      if (metadata.FNumber)
        text += `  Aperture: ${formatAperture(metadata.FNumber)}\n`;
      if (metadata.ExposureTime)
        text += `  Shutter Speed: ${formatShutterSpeed(metadata.ExposureTime)}\n`;
      if (metadata.FocalLength)
        text += `  Focal Length: ${formatFocalLength(metadata.FocalLength)}\n`;
      if (metadata.Flash) text += `  Flash: ${metadata.Flash}\n`;
      if (metadata.WhiteBalance !== undefined)
        text += `  White Balance: ${metadata.WhiteBalance}\n`;
      if (metadata.ExposureMode !== undefined)
        text += `  Exposure Mode: ${metadata.ExposureMode}\n`;
      text += `\n`;
    }

    if (
      metadata.DateTimeOriginal ||
      metadata.CreateDate ||
      metadata.ModifyDate
    ) {
      text += `Date/Time:\n`;
      if (metadata.DateTimeOriginal)
        text += `  Date Taken: ${metadata.DateTimeOriginal}\n`;
      if (metadata.CreateDate) text += `  Created: ${metadata.CreateDate}\n`;
      if (metadata.ModifyDate) text += `  Modified: ${metadata.ModifyDate}\n`;
      text += `\n`;
    }

    if (metadata.latitude !== undefined && metadata.longitude !== undefined) {
      const gps = formatGPS(metadata.latitude, metadata.longitude);
      text += `GPS Location:\n`;
      text += `  Coordinates: ${gps.text}\n`;
      text += `  Google Maps: ${gps.mapsUrl}\n`;
      text += `\n`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasCameraInfo =
    metadata && (metadata.Make || metadata.Model || metadata.Software);
  const hasShootingSettings =
    metadata &&
    (metadata.ISO ||
      metadata.FNumber ||
      metadata.ExposureTime ||
      metadata.FocalLength ||
      metadata.Flash !== undefined ||
      metadata.WhiteBalance !== undefined ||
      metadata.ExposureMode !== undefined);
  const hasDateTime =
    metadata &&
    (metadata.DateTimeOriginal || metadata.CreateDate || metadata.ModifyDate);
  const hasGPS =
    metadata &&
    metadata.latitude !== undefined &&
    metadata.longitude !== undefined;

  return (
    <div className="flex w-full flex-col">
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex w-full flex-col">
        <div className="hidden">
          <FileSearch className="w-10 h-10 text-sky-600 dark:text-sky-400" />
        </div>
        <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
          {dict?.image_metadata_viewer?.title || "Image Metadata Viewer"}
        </h1>
        <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
          {dict?.image_metadata_viewer?.subtitle ||
            "View EXIF metadata from your photos. See camera settings, GPS location, date taken, and more. 100% private — processed in your browser."}
        </p>

        <Adsense slotId="7759160077" />

        {!imageSrc ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20"
                : "border-muted-foreground/30 hover:border-sky-500/50 hover:bg-sky-50/50 dark:hover:bg-sky-900/10"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/tiff,image/heic,image/heif"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {dict?.image_metadata_viewer?.drop_zone ||
                "Drag & drop your image here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {dict?.image_metadata_viewer?.supported ||
                "Supported: PNG, JPG, JPEG, WebP, GIF, BMP, TIFF, HEIC"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {dict?.image_metadata_viewer?.max_file_size ||
                "Max file size: 20MB"}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                loadSampleImage();
              }}
              className="mt-4 text-sm text-sky-600 dark:text-sky-400 hover:underline"
            >
              샘플 이미지로 먼저 써보기
            </button>
          </div>
        ) : (
          <div className="w-full space-y-2 animate-in fade-in slide-in-from-bottom-4">
            {/* Controls */}
            <Card className="border-indigo-200 dark:border-indigo-900/50">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      새 이미지
                    </Button>
                    <span
                      className="text-sm text-muted-foreground truncate max-w-[200px]"
                      title={fileName}
                    >
                      {fileName}
                    </span>
                  </div>
                  {metadata && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={copyMetadataToClipboard}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          메타데이터 복사
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Two-column layout */}
            <div className="grid md:grid-cols-3 gap-2">
              {/* Left: Image preview */}
              <div className="md:col-span-1">
                <Card className="border-indigo-200 dark:border-indigo-900/50">
                  <CardContent className="p-4">
                    <img
                      src={imageSrc}
                      alt="미리보기"
                      className="w-full h-auto rounded-lg"
                      draggable={false}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right: Metadata sections */}
              <div className="md:col-span-2 space-y-4">
                {/* File Info */}
                <Card className="border-indigo-200 dark:border-indigo-900/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Info className="w-5 h-5 text-indigo-600" />
                      파일 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Name:
                      </span>
                      <span
                        className="text-sm font-medium truncate ml-2"
                        title={fileName}
                      >
                        {fileName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Size:
                      </span>
                      <span className="text-sm font-medium">
                        {formatFileSize(fileSize)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Type:
                      </span>
                      <span className="text-sm font-medium">{fileType}</span>
                    </div>
                    {imageDimensions && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Dimensions:
                        </span>
                        <span className="text-sm font-medium">
                          {imageDimensions.width} x {imageDimensions.height}px
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Camera Info */}
                {hasCameraInfo && (
                  <Card className="border-indigo-200 dark:border-indigo-900/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Camera className="w-5 h-5 text-indigo-600" />
                        카메라 정보
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {metadata.Make && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Make:
                          </span>
                          <span className="text-sm font-medium">
                            {metadata.Make}
                          </span>
                        </div>
                      )}
                      {metadata.Model && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Model:
                          </span>
                          <span className="text-sm font-medium">
                            {metadata.Model}
                          </span>
                        </div>
                      )}
                      {metadata.Software && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Software:
                          </span>
                          <span className="text-sm font-medium">
                            {metadata.Software}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Shooting Settings */}
                {hasShootingSettings && (
                  <Card className="border-indigo-200 dark:border-indigo-900/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Camera className="w-5 h-5 text-indigo-600" />
                        촬영 설정
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {metadata.ISO && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            ISO:
                          </span>
                          <span className="text-sm font-medium">
                            {metadata.ISO}
                          </span>
                        </div>
                      )}
                      {metadata.FNumber && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Aperture:
                          </span>
                          <span className="text-sm font-medium">
                            {formatAperture(metadata.FNumber)}
                          </span>
                        </div>
                      )}
                      {metadata.ExposureTime && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            셔터 속도:
                          </span>
                          <span className="text-sm font-medium">
                            {formatShutterSpeed(metadata.ExposureTime)}
                          </span>
                        </div>
                      )}
                      {metadata.FocalLength && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            초점 거리:
                          </span>
                          <span className="text-sm font-medium">
                            {formatFocalLength(metadata.FocalLength)}
                          </span>
                        </div>
                      )}
                      {metadata.Flash !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Flash:
                          </span>
                          <span className="text-sm font-medium">
                            {metadata.Flash}
                          </span>
                        </div>
                      )}
                      {metadata.WhiteBalance !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            화이트 밸런스:
                          </span>
                          <span className="text-sm font-medium">
                            {metadata.WhiteBalance}
                          </span>
                        </div>
                      )}
                      {metadata.ExposureMode !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            노출 모드:
                          </span>
                          <span className="text-sm font-medium">
                            {metadata.ExposureMode}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Date/Time */}
                {hasDateTime && (
                  <Card className="border-indigo-200 dark:border-indigo-900/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Info className="w-5 h-5 text-indigo-600" />
                        Date & Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {metadata.DateTimeOriginal && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            촬영 일시:
                          </span>
                          <span className="text-sm font-medium">
                            {String(metadata.DateTimeOriginal)}
                          </span>
                        </div>
                      )}
                      {metadata.CreateDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Created:
                          </span>
                          <span className="text-sm font-medium">
                            {String(metadata.CreateDate)}
                          </span>
                        </div>
                      )}
                      {metadata.ModifyDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Modified:
                          </span>
                          <span className="text-sm font-medium">
                            {String(metadata.ModifyDate)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* GPS Location */}
                {hasGPS && (
                  <Card className="border-indigo-200 dark:border-indigo-900/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                        GPS 위치
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(() => {
                        const gps = formatGPS(
                          metadata.latitude,
                          metadata.longitude,
                        );
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Coordinates:
                              </span>
                              <span className="text-sm font-medium">
                                {gps.text}
                              </span>
                            </div>
                            <a
                              href={gps.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                            >
                              구글 지도에서 보기
                            </a>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}

                {/* All Metadata (expandable) */}
                {metadata && (
                  <Card className="border-indigo-200 dark:border-indigo-900/50">
                    <CardHeader>
                      <CardTitle className="text-lg">전체 메타데이터</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="all-metadata">
                          <AccordionTrigger>
                            {dict?.image_metadata_viewer?.faq_1_q ||
                              "View All Fields"}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {Object.entries(metadata).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="flex justify-between py-1 border-b last:border-b-0"
                                >
                                  <span
                                    className="text-sm text-muted-foreground truncate max-w-[150px]"
                                    title={key}
                                  >
                                    {key}:
                                  </span>
                                  <span
                                    className="text-sm font-medium truncate max-w-[250px] ml-2"
                                    title={String(value)}
                                  >
                                    {String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                )}

                {/* No metadata message */}
                {!metadata && (
                  <Card className="border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/10">
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground">
                        이 이미지에서 EXIF 메타데이터를 찾지 못했습니다. 화면 캡처나 웹에서 받은 이미지, 편집·압축된 이미지에서는 흔한 일입니다.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* How-to & Tips & FAQ */}
      <div className="w-full max-w-6xl mx-auto mt-3 px-4 space-y-3">
        <section>
          <div className="mb-2">
            <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
              {dict?.image_metadata_viewer?.guide_title ||
                "How to View Image Metadata"}
            </h2>
            <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              {dict?.image_metadata_viewer?.guide_desc ||
                "Extract EXIF metadata from your photos in 3 simple steps."}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-2">
            {[
              {
                step: 1,
                title:
                  dict?.image_metadata_viewer?.step1_title || "이미지 업로드",
                desc:
                  dict?.image_metadata_viewer?.step1_desc ||
                  "Upload a photo from your device. Most photos from cameras and smartphones contain EXIF metadata.",
                icon: Upload,
              },
              {
                step: 2,
                title:
                  dict?.image_metadata_viewer?.step2_title || "View Metadata",
                desc:
                  dict?.image_metadata_viewer?.step2_desc ||
                  "Browse organized sections showing camera settings, GPS location, date taken, and more.",
                icon: FileSearch,
              },
              {
                step: 3,
                title:
                  dict?.image_metadata_viewer?.step3_title || "Copy or Export",
                desc:
                  dict?.image_metadata_viewer?.step3_desc ||
                  "Click 'Copy Metadata' to copy all information as text, or view specific fields in detail.",
                icon: Download,
              },
            ].map((step) => (
              <Card
                key={step.step}
                className="border-indigo-200 dark:border-indigo-900/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-bold">
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

        <section className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-2">
            <div className="hidden">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
              {dict?.image_metadata_viewer?.tips_title || "Image Metadata Tips"}
            </h2>
            <p className="text-muted-foreground">
              메타데이터 뷰어를 더 잘 활용하는 방법입니다.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {[
              {
                title: "카메라 사진에 정보가 더 많습니다",
                desc: "디지털카메라와 스마트폰으로 찍은 사진에는 카메라 설정, GPS 위치, 촬영 시각 등 풍부한 EXIF 정보가 담겨 있습니다.",
                icon: Camera,
              },
              {
                title: "화면 캡처에는 메타데이터가 없습니다",
                desc: "화면 캡처나 프로그램으로 만든 이미지에는 대개 EXIF 정보가 없습니다. 웹 이미지도 개인정보 보호를 위해 메타데이터가 제거된 경우가 많습니다.",
                icon: Shield,
              },
              {
                title: "개인정보 유의",
                desc: "EXIF에는 사진을 찍은 위치의 GPS 좌표가 담길 수 있습니다. 온라인에 사진을 공유할 때 유의하세요.",
                icon: MapPin,
              },
              {
                title: "100% 비공개 처리",
                desc: "모든 메타데이터 추출은 브라우저 안에서 이뤄집니다. 이미지가 기기를 벗어나지 않으며 서버로 업로드되지 않습니다.",
                icon: Shield,
              },
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 rounded-lg bg-white dark:bg-indigo-900/30"
              >
                <div className="flex-shrink-0">
                  <tip.icon className="w-6 h-6 text-indigo-600" />
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
              {dict?.image_metadata_viewer?.faq_title || "Image Metadata FAQ"}
            </h2>
            <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
              이미지 메타데이터와 EXIF 확인에 대해 자주 묻는 질문입니다.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>
                  {dict?.image_metadata_viewer?.faq_2_q ||
                    "What is EXIF metadata?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.image_metadata_viewer?.faq_1_a ||
                    "EXIF (Exchangeable Image File Format) is a standard that stores metadata in image files. It includes information like camera settings (ISO, aperture, shutter speed), date/time, GPS coordinates, camera model, and more. Most digital cameras and smartphones automatically embed this data when taking photos."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>
                  {dict?.image_metadata_viewer?.faq_3_q ||
                    "Is it safe to view metadata online?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.image_metadata_viewer?.faq_2_a ||
                    "Yes! All metadata extraction happens entirely in your browser using JavaScript. Your images are never uploaded to any server. The metadata is read locally on your device and displayed instantly. Your photos and their metadata remain completely private."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>
                  {dict?.image_metadata_viewer?.faq_4_q ||
                    "Why doesn't my image have metadata?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.image_metadata_viewer?.faq_3_a ||
                    "Several reasons: (1) Screenshots and digitally-created images don't contain EXIF data, (2) Many social media platforms strip metadata when you upload photos for privacy, (3) Some photo editing software removes EXIF data when saving, (4) The image may have been exported without preserving metadata."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>
                  {dict?.image_metadata_viewer?.faq_5_q ||
                    "Can I see GPS coordinates?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.image_metadata_viewer?.faq_4_a ||
                    "Yes, if the photo was taken with a GPS-enabled device (like a smartphone with location services enabled) and the GPS data wasn't removed, you'll see the exact coordinates. We provide a direct link to view the location on Google Maps. Be aware that sharing photos with GPS data can reveal your location."}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>
                  {dict?.image_metadata_viewer?.faq_6_q ||
                    "어떤 이미지 형식을 지원하나요?"}
                </AccordionTrigger>
                <AccordionContent>
                  {dict?.image_metadata_viewer?.faq_5_a ||
                    "We support all common image formats including JPG, JPEG, PNG, WebP, GIF, BMP, TIFF, HEIC, and HEIF. JPG images from cameras typically contain the most complete EXIF data. Maximum file size is 20MB."}
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
