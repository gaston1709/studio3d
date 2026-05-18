import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // In Next.js 16.2.6, this is a root property
  allowedDevOrigins: ["studio3d.sie.com.ar", "localhost:3000"],
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
