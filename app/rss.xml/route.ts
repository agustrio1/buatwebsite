import { db } from "~/db";
import { posts } from "~/db/schema";
import { eq, desc } from "drizzle-orm";
import { getPublicSettings } from "~/lib/settings.server";

export const dynamic = "force-dynamic";

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;

  const settings = await getPublicSettings();
  const general = (settings.general as Record<string, any>) ?? {};
  const siteName = general.siteName ?? "Blog";
  const siteTagline = general.siteTagline ?? "";

  const publishedPosts = await db.query.posts.findMany({
    where: eq(posts.status, "published"),
    orderBy: [desc(posts.publishedAt)],
    limit: 30,
    with: { category: true, author: true },
  });

  const items = publishedPosts
    .map((post) => {
      const link = `${origin}/blog/${post.slug}`;
      const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : new Date().toUTCString();
      const description = post.summary ?? "";
      const category = post.category ? `<category>${escapeXml(post.category.name)}</category>` : "";
      const author = post.author ? `<dc:creator>${escapeXml(post.author.name)}</dc:creator>` : "";

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
      ${category}
      ${author}
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${origin}</link>
    <description>${escapeXml(siteTagline)}</description>
    <language>id-ID</language>
    <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=3600",
    },
  });
}
