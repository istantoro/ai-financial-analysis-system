import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Optimize large icon/chart libraries — tree-shake at import level
  experimental: {
    optimizePackageImports: ["lucide-react", "chart.js", "react-chartjs-2"],
  },
  // Fix "multiple lockfiles" warning and allow resolution of monorepo dependencies
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
