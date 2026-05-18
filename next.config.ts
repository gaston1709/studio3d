import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // In Next.js 16.2.6, this is a root property
  allowedDevOrigins: ["192.168.0.213", "localhost:3000"],
};

export default nextConfig;
