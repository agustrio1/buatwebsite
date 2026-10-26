import { getSiteUrl } from "~/lib/seo";

const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

const RULES = `Allow: /
Disallow: /admin
Disallow: /api
Disallow: /login
Disallow: /logout`;

export async function loader() {
  const siteUrl = await getSiteUrl();

  const aiGroups = AI_AGENTS.map((ua) => `User-agent: ${ua}\n${RULES}`).join("\n\n");

  const body = `User-agent: *
${RULES}

${aiGroups}

Sitemap: ${siteUrl}/sitemap-index.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}