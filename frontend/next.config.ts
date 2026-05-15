import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'see.fontimg.com',
      },
    ],
  },
};

export default nextConfig;
