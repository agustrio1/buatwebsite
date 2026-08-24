import { db } from "~/db";
import { cities } from "~/db/schema";
import { eq } from "drizzle-orm";
import { getSiteUrl, escapeXml } from "~/lib/seo";

export async function loader() {
  const siteUrl = await getSiteUrl();
  const activeCities = await db.query.cities.findMany({
    where: eq(cities.isActive, true),
  });

  const urls = activeCities
    .map((city) => {
      const lastmod = city.updatedAt.toISOString();
      return `  <url>
    <loc>${siteUrl}/jasa-pembuatan-website/${escapeXml(city.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
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