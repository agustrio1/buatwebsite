import { db } from "~/db";
import { getSiteUrl } from "~/lib/seo";
import { buildUrlset, toIso, xmlResponse } from "~/lib/sitemap.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = (await getSiteUrl()).replace(/\/$/, "");
  const allProjects = await db.query.projects.findMany();

  return xmlResponse(
    buildUrlset(
      allProjects.map((p) => ({
        loc: `${base}/projek/${p.slug}`,
        lastmod: toIso(p.completedAt, p.createdAt),
      }))
    )
  );
}
