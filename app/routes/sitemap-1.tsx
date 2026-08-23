import { getSiteUrl, escapeXml } from "~/lib/seo";
import { servicePages } from "~/data/service-pages";

export async function loader() {
  const siteUrl = await getSiteUrl();

  const staticPages = [
    { path: "", priority: "1.0", changefreq: "weekly" },
    { path: "/layanan", priority: "0.8", changefreq: "weekly" },
    { path: "/projek", priority: "0.8", changefreq: "weekly" },
    { path: "/blog", priority: "0.8", changefreq: "daily" },
    { path: "/kontak", priority: "0.6", changefreq: "monthly" },
    { path: "/legal/syarat-ketentuan", priority: "0.3", changefreq: "yearly" },
    { path: "/legal/kebijakan-privasi", priority: "0.3", changefreq: "yearly" },
  ];

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