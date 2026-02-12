declare module "gifshot" {
  interface GifOptions {
    images: string[];
    interval?: number;
    gifWidth?: number;
    gifHeight?: number;
    numWorkers?: number;
  }

  interface GifResult {
    error: boolean;
    errorCode?: string;
    errorMsg?: string;
    image?: string;
  }

  const gifshot: {
    createGIF(options: GifOptions, callback: (obj: GifResult) => void): void;
  };

  export default gifshot;
}
