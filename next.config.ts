import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["konva", "react-konva"],
  },
};

export default nextConfig;
