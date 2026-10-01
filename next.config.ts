import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["100.102.93.50", "172.16.50.107", "127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      // Google OAuth avatars (vectorseek.com); next/image rejects hosts missing here.
      {
        protocol: "https",
        hostname: "vectorseek.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
