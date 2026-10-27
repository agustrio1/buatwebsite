import { db } from "~/db";
import { siteSettings } from "~/db/schema";
import { eq } from "drizzle-orm";

export async function getSiteUrl() {
  const row = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, "general"),
  });
  const general = (row?.value as any) ?? {};
  const url = general.siteUrl || "https://jadikanweb.id";
  return url.replace(/\/$/, ""); // buang trailing slash biar konsisten
}

/**
 * URL absolut gambar OG dinamis (/og?title=..) — fallback untuk halaman
 * tanpa ogImageUrl. Butuh siteUrl supaya absolut (dipakai di metadata).
 */
export function ogUrl(opts: {
  siteUrl: string;
  title: string;
  subtitle?: string;
  label?: string;
}): string {
  const q = new URLSearchParams({ title: opts.title.slice(0, 110) });
  if (opts.subtitle) q.set("subtitle", opts.subtitle.slice(0, 150));
  if (opts.label) q.set("label", opts.label.slice(0, 40));
  return `${opts.siteUrl.replace(/\/$/, "")}/og?${q.toString()}`;
}

export function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}