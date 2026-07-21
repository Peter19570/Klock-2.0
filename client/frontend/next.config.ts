import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // REMOVE these:
  // output: 'standalone',
  // distDir: '.next',
};

export default nextConfig;