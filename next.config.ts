import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: 'incremental',
  },
  images: {
    domains: [],
    unoptimized: true,
  },
  devIndicators: false,
  // async redirects() {
  //   return [
  //     {
  //       source: "/",
  //       destination: "/home",
  //       permanent: true,
  //     },
  //   ];
  // },
  async rewrites() {
    return [
      {
        source: "/admin",
        destination: "http://localhost:3000/",
      },
    ];
  },
};

export default nextConfig;
