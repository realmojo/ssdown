"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

interface YoutubeUrlInputProps {
  url: string;
  setUrl: (url: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  error?: string | null;
  buttonText?: string;
  loadingText?: string;
  className?: string;
}

export function YoutubeUrlInput({
  url,
  setUrl,
  loading,
  onSubmit,
  error,
  buttonText = "Start",
  loadingText = "Loading...",
  className = "",
}: YoutubeUrlInputProps) {
  return (
    <div className={`w-full max-w-xl transition-all duration-300 ${className}`}>
      <form onSubmit={onSubmit} className="relative flex items-center">
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <Input
            type="text"
            placeholder="유튜브 주소를 붙여넣으세요…"
            className="w-full pl-10 pr-32 h-14 text-lg rounded-full border-2 focus-visible:ring-offset-2 transition-all shadow-sm bg-background"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="absolute right-2 top-2 bottom-2 rounded-full px-6"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {loadingText}
            </>
          ) : (
            buttonText
          )}
        </Button>
      </form>
      {error && (
        <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
      )}
    </div>
  );
}
