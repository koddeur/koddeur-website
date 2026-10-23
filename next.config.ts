import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The laptop page was tested at /home before becoming the home page.
  async redirects() {
    return [{ source: "/home", destination: "/", permanent: true }];
  },
};

export default nextConfig;
