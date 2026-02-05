import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
      }, {
        protocol: "https",
        hostname: "coin-images.coingecko.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "assets.coincap.io",
      },
      {
        protocol: "https",
        hostname: "images.cryptocompare.com",
      },
      {
        protocol: "https",
        hostname: "resources.cryptocompare.com",
      }
    ]
  }
};

export default nextConfig;