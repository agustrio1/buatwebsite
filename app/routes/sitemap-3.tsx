import { db } from "~/db";
import { posts } from "~/db/schema";
import { eq } from "drizzle-orm";
import { getSiteUrl, escapeXml } from "~/lib/seo";

export async function loader() {
  const siteUrl = await getSiteUrl();
  const publishedPosts = await db.query.posts.findMany({
    where: eq(posts.status, "published"),
  });

  const urls = publishedPosts
    .map((post) => {
      const lastmod = (post.updatedAt ?? post.publishedAt ?? post.createdAt).toISOString();
      return `  <url>
    <loc>${siteUrl}/blog/${escapeXml(post.slug)}</loc>
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