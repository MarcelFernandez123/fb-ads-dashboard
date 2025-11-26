import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/fb-ads-dashboard',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
