import { getSiteUrl } from "~/lib/seo";

export async function loader() {
  const siteUrl = await getSiteUrl();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${siteUrl}/sitemap-1.xml</loc></sitemap>
  <sitemap><loc>${siteUrl}/sitemap-2.xml</loc></sitemap>
  <sitemap><loc>${siteUrl}/sitemap-3.xml</loc></sitemap>
  <sitemap><loc>${siteUrl}/sitemap-4.xml</loc></sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}