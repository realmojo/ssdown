"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function PaypalDonateButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "후원을 시작하지 못했습니다");
      }

      if (data.url) {
        // Redirect to PayPal
        window.location.href = data.url;
      } else {
        throw new Error("서버 응답이 올바르지 않습니다");
      }
    } catch (error) {
      console.error("Donation Error:", error);
      toast.error("후원을 시작하지 못했습니다. 설정을 확인해 주세요.");
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDonate}
      disabled={loading}
      className={`gap-2 text-rose-500 hover:text-white hover:bg-rose-500 border-rose-200 transition-colors ${className}`}
      aria-label="페이팔로 후원하기"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className="h-4 w-4 fill-current" />
      )}
      <span className="hidden sm:inline font-medium">후원하기</span>
    </Button>
  );
}
