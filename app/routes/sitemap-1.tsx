import { getSiteUrl, escapeXml } from "~/lib/seo";
import { getPublicSettings } from "~/lib/settings.server";
import { normalizeCalculatorConfig } from "~/lib/price-calculator";
import { servicePages } from "~/data/service-pages";

export async function loader() {
  const [siteUrl, settings] = await Promise.all([getSiteUrl(), getPublicSettings()]);

  const staticPages = [
    { path: "", priority: "1.0", changefreq: "weekly" },
    { path: "/layanan", priority: "0.8", changefreq: "weekly" },
    { path: "/projek", priority: "0.8", changefreq: "weekly" },
    { path: "/blog", priority: "0.8", changefreq: "daily" },
    { path: "/kontak", priority: "0.6", changefreq: "monthly" },
    { path: "/legal/syarat-ketentuan", priority: "0.3", changefreq: "yearly" },
    { path: "/legal/kebijakan-privasi", priority: "0.3", changefreq: "yearly" },
  ];

  // Halaman kalkulator hanya ada kalau sudah diaktifkan dan diisi di admin
  const calculator = normalizeCalculatorConfig(settings.price_calculator);
  if (calculator.enabled && calculator.baseItems.length > 0) {
    staticPages.push({ path: "/kalkulator", priority: "0.7", changefreq: "monthly" });
  }

  const serviceUrls = servicePages.map((s) => ({
    path: `/layanan/${s.slug}`,
    priority: "0.7",
    changefreq: "monthly",
  }));

  const allUrls = [...staticPages, ...serviceUrls];

  const urls = allUrls
    .map(
      (p) => `  <url>
    <loc>${siteUrl}${escapeXml(p.path)}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}