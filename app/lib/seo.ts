import { db } from "~/db";
import { siteSettings } from "~/db/schema";
import { eq } from "drizzle-orm";

export async function getSiteUrl() {
  const row = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, "general"),
  });
  const general = (row?.value as any) ?? {};
  const url = general.siteUrl || "https://example.com";
  return url.replace(/\/$/, ""); // buang trailing slash biar konsisten
}

export function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}