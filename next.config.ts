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
  },
};

export default nextConfig;
