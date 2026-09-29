import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["100.102.93.50", "172.16.50.107", "127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vectorseek.com",
      },
      // Avatar Google (login OAuth) — tanpa ini next/image menolak
      // session.user.image dengan error "hostname is not configured".
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
