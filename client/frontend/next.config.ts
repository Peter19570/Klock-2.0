import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.43.138",
    "172.20.10.5",
    "172.30.32.1",
    "sandier-unpsychically-rickie.ngrok-free.dev",
  ],
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: "http://localhost:8080/:path*",
      },
    ];
  },
};

export default nextConfig;