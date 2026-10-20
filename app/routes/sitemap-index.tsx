import { getSiteUrl } from "~/lib/seo";
import { xmlResponse } from "~/lib/sitemap.server";

export async function loader() {
  const base = (await getSiteUrl()).replace(/\/$/, "");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${base}/sitemap-1.xml</loc></sitemap>
  <sitemap><loc>${base}/sitemap-2.xml</loc></sitemap>
  <sitemap><loc>${base}/sitemap-3.xml</loc></sitemap>
  <sitemap><loc>${base}/sitemap-4.xml</loc></sitemap>
</sitemapindex>`;

  return xmlResponse(xml);
}