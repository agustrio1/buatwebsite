import { getSiteUrl } from "~/lib/seo";

export async function loader() {
  const siteUrl = await getSiteUrl();

  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /login
Disallow: /logout

Sitemap: ${siteUrl}/sitemap-index.xml
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}