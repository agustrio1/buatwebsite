import type { Config } from "@react-router/dev/config";

export default {
  // Server-side render tetap aktif untuk semua halaman dinamis (blog, kota, projek, layanan, admin, dll)
  ssr: true,

  // Hanya halaman statis yang tidak bergantung database yang di-prerender
  prerender: [
    "/",
    "/legal/syarat-ketentuan",
    "/legal/kebijakan-privasi",
    "/robots.txt",
    "/llms.txt",
  ],
} satisfies Config;