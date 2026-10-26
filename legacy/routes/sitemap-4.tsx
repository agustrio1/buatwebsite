import { db } from "~/db";
import { cities } from "~/db/schema";
import { eq } from "drizzle-orm";
import { getSiteUrl } from "~/lib/seo";
import { buildUrlset, toIso, xmlResponse } from "~/lib/sitemap.server";

export async function loader() {
  const base = (await getSiteUrl()).replace(/\/$/, "");
  const activeCities = await db.query.cities.findMany({
    where: eq(cities.isActive, true),
  });

  return xmlResponse(
    buildUrlset(
      activeCities.map((city) => ({
        loc: `${base}/jasa-pembuatan-website/${city.slug}`,
        lastmod: toIso(city.updatedAt),
      }))
    )
  );
}