import { eq } from "drizzle-orm";
import { db } from "~/db";
import { pages } from "~/db/schema";
import { getSiteUrl } from "~/lib/seo";
import { getPublicSettings } from "~/lib/settings.server";
import { normalizeCalculatorConfig } from "~/lib/price-calculator";
import { servicePages } from "~/data/service-pages";
import { buildUrlset, toIso, xmlResponse } from "~/lib/sitemap.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const [siteUrl, settings] = await Promise.all([getSiteUrl(), getPublicSettings()]);
  const base = siteUrl.replace(/\/$/, "");

  const paths = [
    "/",
    "/layanan",
    "/projek",
    "/blog",
    "/kontak",
    "/legal/syarat-ketentuan",
    "/legal/kebijakan-privasi",
  ];

  // Halaman kalkulator hanya ada kalau sudah diaktifkan dan diisi di admin
  const calculator = normalizeCalculatorConfig(settings.price_calculator);
  if (calculator.enabled && calculator.baseItems.length > 0) {
    paths.push("/kalkulator");
  }

  for (const s of servicePages) {
    paths.push(`/layanan/${s.slug}`);
  }

  // Halaman custom dari Page Builder (published saja)
  const customPages = await db.query.pages.findMany({
    where: eq(pages.status, "published"),
    columns: { slug: true, updatedAt: true },
  });

  const entries: Array<{ loc: string; lastmod?: string }> = paths.map((p) => ({
    loc: `${base}${p}`,
  }));
  for (const p of customPages) {
    entries.push({
      loc: `${base}/${p.slug}`,
      lastmod: toIso(p.updatedAt),
    });
  }

  return xmlResponse(buildUrlset(entries));
}
