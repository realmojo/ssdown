import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Ensure metadata is properly rendered in head
  reactStrictMode: true,
};

export default nextConfig;
