import { db } from "~/db";
import { projects } from "~/db/schema";
import { getSiteUrl, escapeXml } from "~/lib/seo";

export async function loader() {
  const siteUrl = await getSiteUrl();
  const allProjects = await db.query.projects.findMany();

  const urls = allProjects
    .map((p) => {
      const lastmod = (p.completedAt ?? p.createdAt).toISOString();
      return `  <url>
    <loc>${siteUrl}/projek/${escapeXml(p.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}