import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Catch type errors at build time — do NOT silently ignore
  reactStrictMode: true,

  // Allow cross-origin requests from preview / sandbox iframes
  allowedDevOrigins: ["*"],

  // Security headers applied to every response (dev / preview-safe)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Allow embedding in preview / sandbox iframes — use CSP frame-ancestors
          // in production reverse-proxy (Caddy / Nginx) instead of X-Frame-Options.
          // X-Frame-Options is intentionally omitted here so the dev preview works.
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
