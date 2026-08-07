export type LicenseType = 'Free' | 'Trial' | 'Paid' | 'Open Source' | 'Freemium';
export type PlatformType = 'Windows' | 'Mac' | 'Android' | 'iOS' | 'Web' | 'Linux';
export type SecurityStatus = 'Safe' | 'Warning' | 'Dangerous' | 'Unknown';

export interface SeoMetadata {
  title: string;
  description: string;
  titleKr?: string;
  descriptionKr?: string;
  ogImage: string;
  structuredData: Record<string, any>;
}

export interface AppCoreInfo {
  id: string;
  slug: string;
  name: string;
  nameKr?: string;
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
  license: LicenseType;
  price?: number;
  currency?: string;

  security: {
    status: SecurityStatus;
    lastScannedAt: Date | string;
  };
}

export interface RatingInfo {
  average: number;
  totalCount: number;
}

export interface AppContent {
  iconUrl: string;

  shortSummary: string;
  shortSummaryKr?: string;
  bodyHtml: string;
  editorReviewHtml: string;
  aiReviewHtml: string;
  aiReviewHtmlKr?: string;

  pros: string[];
  cons: string[];
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
