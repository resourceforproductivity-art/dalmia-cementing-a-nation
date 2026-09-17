import type { NextConfig } from "next";
const isPages = process.env.GITHUB_PAGES === "true";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  ...(isPages ? {
    output: "export",
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || "/dalmia-cementing-a-nation",
    trailingSlash: true,
    images: { unoptimized: true },
  } : {}),
};
export default nextConfig;
