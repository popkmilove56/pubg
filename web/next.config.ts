import type { NextConfig } from "next";

const managerRoutes = ["/admin", "/create", "/teams", "/control", "/detail", "/live", "/overlay", "/observer", "/website"];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: managerRoutes.map((source) => ({
        source,
        destination: source === "/website" ? "/website-manager/index.html" : "/admin/index.html",
      })),
    };
  },
};

export default nextConfig;
