import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.shopier.com',
      },
      {
        protocol: 'https',
        hostname: '**.img-shopier.com',
      },
      {
        protocol: 'https',
        hostname: '**.shopier.app',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopier.com',
      },
      {
        protocol: 'https',
        hostname: 'img-shopier.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopier.app',
      },
      {
        protocol: 'http',
        hostname: '**.shopier.com',
      },
      {
        protocol: 'http',
        hostname: '**.img-shopier.com',
      },
      {
        protocol: 'http',
        hostname: '**.shopier.app',
      }
    ],
  },
};

export default nextConfig;
