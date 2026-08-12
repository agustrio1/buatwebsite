import { getSiteUrl } from "~/lib/seo";

export async function loader() {
  const siteUrl = await getSiteUrl();

  const staticPages = [
    { path: "", priority: "1.0", changefreq: "weekly" },
    { path: "/projek", priority: "0.8", changefreq: "weekly" },
    { path: "/blog", priority: "0.8", changefreq: "daily" },
  ];

  const urls = staticPages
    .map(
      (p) => `  <url>
    <loc>${siteUrl}${p.path}</loc>
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