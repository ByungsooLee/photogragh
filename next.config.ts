import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.microcms-assets.io"],
  },
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
