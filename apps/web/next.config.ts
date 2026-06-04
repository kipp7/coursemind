import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@coursemind/api", "@coursemind/contracts"],
};

export default nextConfig;
