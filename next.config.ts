import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lets phones on the same Wi-Fi load the dev server
  allowedDevOrigins: ["192.168.1.12"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
