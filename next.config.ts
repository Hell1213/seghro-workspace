import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Catch type errors at build time — do NOT silently ignore
  reactStrictMode: true,

  // Allow cross-origin requests from any origin (preview / sandbox iframes, proxy domains)
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://21.0.2.118:3000',
    // Production: add your domain(s) here
  ],

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
          // CORS - allow specific origins in production
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGINS || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Request-Id',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https: http: wss:; frame-ancestors 'self' *;",
          },
          // Strict-Transport-Security
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
