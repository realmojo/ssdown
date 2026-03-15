export type LicenseType = 'Free' | 'Trial' | 'Paid' | 'Open Source' | 'Freemium';
export type PlatformType = 'Windows' | 'Mac' | 'Android' | 'iOS' | 'Web' | 'Linux';
export type SecurityStatus = 'Safe' | 'Warning' | 'Dangerous' | 'Unknown';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SeoMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  structuredData: Record<string, any>;
}

export interface AppCoreInfo {
  id: string;
  slug: string;
  name: string;
  version: string;
  platform: PlatformType;
  supportedPlatforms: PlatformType[];

  developer: {
    name: string;
    websiteUrl?: string;
  };

  category: {
    main: string;
    sub: string;
  };
}

export interface DownloadInfo {
  downloadUrl: string;
  fileSize: string;
  downloadCount?: string;
  license: LicenseType;
  price?: number;
  currency?: string;

  security: {
    status: SecurityStatus;
    lastScannedAt: Date | string;
    scanProvider?: string;
  };
}

export interface RatingInfo {
  average: number;
  totalCount: number;
  editorScore?: number;
}

export interface AppContent {
  iconUrl: string;
  screenshotUrls: string[];
  videoUrl?: string;

  shortSummary: string;
  bodyHtml: string;

  pros: string[];
  cons: string[];
  features: string[];
  faq: FaqItem[];
}

export interface TechnicalSpecs {
  osRequirements: string;
  languages: string[];
  lastUpdatedDate: Date | string;
}

export interface RelationalData {
  alternativesAppIds: string[];
  relatedArticlesIds?: string[];
}

export interface SoftwareApplication {
  core: AppCoreInfo;
  seo: SeoMetadata;
  download: DownloadInfo;
  rating: RatingInfo;
  content: AppContent;
  specs: TechnicalSpecs;
  relations: RelationalData;

  createdAt: Date | string;
  updatedAt: Date | string;
}
