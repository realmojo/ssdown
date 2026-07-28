"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { VideoItem } from "../client/video-saver-client";

interface XDownloaderClientProps {
  items: VideoItem[];
  item?: {
    id: string;
    user: {
      screenName: string;
    };
  };
  itemIndex?: number;
  downloadEndpoint: string;
  downloadFileName?: (quality: string) => string;
  transformVideoUrl?: (url: string) => string;
  formatQuality?: (bitrate: string | number) => string;
  theme: {
    downloadButtonHover: string;
    downloadButtonText: string;
    indicatorColor: string;
  };
  dict?: {
    common?: {
      downloading?: string;
    };
  };
}

const XDownloaderClient = ({
  items,
  item,
  itemIndex = 0,
  downloadEndpoint,
  downloadFileName,
  transformVideoUrl,
  formatQuality,
  theme,
  dict,
}: XDownloaderClientProps) => {
  const [downloadingVideo, setDownloadingVideo] = useState<string | null>(null);

  const getQuality = (video: VideoItem) => {
    if (formatQuality && video.bitrate) {
      return formatQuality(video.bitrate);
    }
    return video.quality;
  };

  const handleDownload = async (
    url: string,
    fileName: string,
    downloadKey: string,
  ) => {
    setDownloadingVideo(downloadKey);
    try {
      // 서버 프록시를 통해 비디오를 가져오기 (CORS 문제 해결)
      const proxyUrl = `${downloadEndpoint}?videoUrl=${encodeURIComponent(
        url,
      )}&filename=${encodeURIComponent(fileName)}`;

      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`영상을 가져오지 못했습니다: ${response.statusText}`);
      }

      // Blob으로 변환
      const blob = await response.blob();

      // Blob URL 생성
      const blobUrl = window.URL.createObjectURL(blob);

      // 다운로드 링크 생성 및 클릭
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // 정리
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
      // 에러 발생 시 기본 다운로드 방식으로 폴백
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloadingVideo(null);
    }
  };

  return (
    <>
      {items.map((video: VideoItem, videoIndex: number) => {
        const downloadKey = `${itemIndex}-${videoIndex}`;
        const isDownloading = downloadingVideo === downloadKey;
        const quality = getQuality(video);
        const finalUrl = transformVideoUrl
          ? transformVideoUrl(video.url)
          : video.url;
        const fileName = downloadFileName
          ? downloadFileName(quality)
          : `ssdown-${item?.user?.screenName || "video"}-${
              item?.id || "unknown"
            }-${quality}.mp4`;

        return (
          <button
            key={videoIndex}
            type="button"
            title={fileName}
            disabled={isDownloading}
            className={`w-full h-12 flex justify-between items-center px-6 bg-gray-50 ${
              theme.downloadButtonHover
            } dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-md group transition-all ${
              isDownloading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={(e) => {
              e.preventDefault();
              handleDownload(finalUrl, fileName, downloadKey);
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-2 h-2 rounded-full ${theme.indicatorColor} animate-pulse`}
              />
              <span className="font-semibold">{quality}</span>
            </div>
            <div
              className={`flex items-center gap-2 ${theme.downloadButtonText} group-hover:translate-x-1 transition-transform`}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-medium">
                    {dict?.common?.downloading || "Downloading..."}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-medium">다운로드</span>
                  <Download className="w-4 h-4" />
                </>
              )}
            </div>
          </button>
        );
      })}
    </>
  );
};

export { XDownloaderClient };
