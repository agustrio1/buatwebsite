import { getSiteUrl } from "~/lib/seo";
import { getPublicSettings } from "~/lib/settings.server";
import { normalizeCalculatorConfig } from "~/lib/price-calculator";
import { servicePages } from "~/data/service-pages";
import { buildUrlset, xmlResponse } from "~/lib/sitemap.server";

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

  return xmlResponse(buildUrlset(paths.map((p) => ({ loc: `${base}${p}` }))));
}
