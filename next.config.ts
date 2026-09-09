import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["100.102.93.50", "172.16.50.107", "127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vectorseek.com",
      },
    ],
  },
};

export default nextConfig;
