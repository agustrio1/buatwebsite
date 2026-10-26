import { db } from "~/db";
import { posts } from "~/db/schema";
import { eq } from "drizzle-orm";
import { getSiteUrl } from "~/lib/seo";
import { buildUrlset, toIso, xmlResponse } from "~/lib/sitemap.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = (await getSiteUrl()).replace(/\/$/, "");
  const publishedPosts = await db.query.posts.findMany({
    where: eq(posts.status, "published"),
  });

  return xmlResponse(
    buildUrlset(
      publishedPosts.map((post) => ({
        loc: `${base}/blog/${post.slug}`,
        lastmod: toIso(post.updatedAt, post.publishedAt, post.createdAt),
      }))
    )
  );
}
