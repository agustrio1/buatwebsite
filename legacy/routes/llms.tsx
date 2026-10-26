import { db } from "~/db";
import { siteSettings, services, posts, projects } from "~/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSiteUrl } from "~/lib/seo";

export async function loader() {
  const siteUrl = await getSiteUrl();

  const rows = await db.query.siteSettings.findMany();
  const settings: Record<string, any> = {};
  for (const row of rows) settings[row.key] = row.value;

  const general = settings.general ?? {};
  const seo = settings.seo ?? {};

  const [allServices, recentPosts, recentProjects] = await Promise.all([
    db.query.services.findMany(),
    db.query.posts.findMany({
      where: eq(posts.status, "published"),
      orderBy: [desc(posts.publishedAt)],
      limit: 10,
    }),
    db.query.projects.findMany({
      orderBy: [desc(projects.createdAt)],
      limit: 10,
    }),
  ]);

  const lines: string[] = [];

  lines.push(`# ${general.siteName ?? "Website"}`);
  lines.push("");
  if (general.siteTagline) lines.push(`> ${general.siteTagline}`);
  if (seo.metaDescription) lines.push("", seo.metaDescription);
  lines.push("");

  lines.push("## Layanan");
  for (const s of allServices) {
    lines.push(`- [${s.title}](${siteUrl}/#layanan)${s.summary ? `: ${s.summary}` : ""}`);
  }
  lines.push("");

  lines.push("## Portofolio");
  lines.push(`Lihat semua projek: ${siteUrl}/projek`);
  for (const p of recentProjects) {
    lines.push(`- [${p.title}](${siteUrl}/projek/${p.slug})${p.summary ? `: ${p.summary}` : ""}`);
  }
  lines.push("");

  lines.push("## Blog");
  lines.push(`Lihat semua artikel: ${siteUrl}/blog`);
  for (const post of recentPosts) {
    lines.push(`- [${post.title}](${siteUrl}/blog/${post.slug})${post.summary ? `: ${post.summary}` : ""}`);
  }
  lines.push("");

  lines.push("## Kontak");
  const contact = settings.contact ?? {};
  if (contact.emailPrimary) lines.push(`Email: ${contact.emailPrimary}`);
  if (contact.whatsappNumber) lines.push(`WhatsApp: +${contact.whatsappNumber}`);
  if (contact.address) lines.push(`Alamat: ${contact.address}`);

  const body = lines.join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}