import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// bitrate -> p 변환 트위터에서 사용
export function getQualityForBitrate(bitrate: number) {
  if (bitrate <= 150 * 1024) {
    return "144p";
  } else if (bitrate <= 432 * 1024) {
    return "240p";
  } else if (bitrate <= 832 * 1024) {
    return "360p";
  } else if (bitrate <= 2.5 * 1024 * 1024) {
    return "480p";
  } else if (bitrate <= 5 * 1024 * 1024) {
    return "720p";
  } else if (bitrate <= 8 * 1024 * 1024) {
    return "1080p";
  } else {
    return "4K";
  }
}
