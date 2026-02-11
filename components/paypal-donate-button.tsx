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
        throw new Error(data.error || "Failed to initiate donation");
      }

      if (data.url) {
        // Redirect to PayPal
        window.location.href = data.url;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Donation Error:", error);
      toast.error("Could not start donation. Please check configuration.");
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
      aria-label="Donate with PayPal"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className="h-4 w-4 fill-current" />
      )}
      <span className="hidden sm:inline font-medium">Donate</span>
    </Button>
  );
}
