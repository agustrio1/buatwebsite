import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hasil build bisa dijalankan mandiri dengan `node server.js` (Docker).
  output: "standalone",

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.enterprisejadikanweb.biz.id" },
    ],
  },

  experimental: {
    // Meniru perilaku CSS inline di root.tsx versi React Router:
    // CSS ditempel ke <head> supaya tidak ada request stylesheet yang memblokir render.
    inlineCss: true,
    // Default server action 1MB terlalu kecil: JSON TipTap artikel panjang +
    // upload cover lewat form multipart cepat melewatinya. 4.5MB = plafon
    // payload function di Vercel.
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },

  async headers() {
    // Header keamanan dasar untuk semua rute. Sengaja tidak memakai CSP ketat
    // karena Next (Turbopack) menyisipkan script/style inline yang akan terblokir.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
