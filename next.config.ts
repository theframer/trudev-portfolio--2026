import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_BASE_PATH || "",
  allowedDevOrigins: ["192.168.31.49"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
