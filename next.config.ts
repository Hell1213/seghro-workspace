import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Catch type errors at build time — do NOT silently ignore
  reactStrictMode: true,

  // Allow cross-origin requests from preview / sandbox iframes
  allowedDevOrigins: [
    "http://localhost:3000",
  ],

  // Security headers applied to every response
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
