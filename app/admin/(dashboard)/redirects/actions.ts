"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { redirects } from "~/db/schema";
import { requireAdmin } from "~/lib/session.server";
import { invalidateRedirectCache } from "~/lib/redirects.server";
import type { RedirectState } from "~/components/admin/redirects-client";

const ALLOWED_STATUS = [301, 302, 307, 308];
const PROTECTED_PREFIXES = ["/admin", "/api", "/login", "/logout", "/sitemap", "/robots.txt", "/rss.xml"];

// Hasil: path internal rapi (tanpa slash akhir), URL eksternal apa adanya, atau null kalau tidak valid
function normalizePath(raw: string, opts: { allowExternal: boolean; allowQuery: boolean }) {
  const value = raw.trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    if (!opts.allowExternal) return null;
    try {
      return new URL(value).toString();
    } catch {
      return null;
    }
  }

  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (/\s/.test(value)) return null;
  if (!opts.allowQuery && /[?#]/.test(value)) return null;

  return value.length > 1 ? value.replace(/\/+$/, "") : value;
}

// Ikuti rantai redirect dari tujuan baru. Kalau kembali ke path asal, berarti loop.
async function wouldLoop(fromPath: string, toPath: string) {
  let current = toPath;
  for (let i = 0; i < 10; i++) {
    if (current === fromPath) return true;
    if (!current.startsWith("/")) return false;
    const next = await db.query.redirects.findFirst({ where: eq(redirects.fromPath, current) });
    if (!next) return false;
    current = next.toPath;
  }
  return true;
}

export async function createRedirect(
  _prevState: RedirectState,
  formData: FormData
): Promise<RedirectState> {
  await requireAdmin();

  const fromPath = normalizePath(String(formData.get("fromPath") ?? ""), {
    allowExternal: false,
    allowQuery: false,
  });
  const toPath = normalizePath(String(formData.get("toPath") ?? ""), {
    allowExternal: true,
    allowQuery: true,
  });
  const statusCode = Number(formData.get("statusCode") ?? 301);

  if (!fromPath) {
    return { ok: false, error: "Path asal harus diawali / dan tidak boleh mengandung spasi, ? atau #" };
  }
  if (!toPath) {
    return { ok: false, error: "Path tujuan harus diawali / atau berupa URL lengkap (https://...)" };
  }
  if (!ALLOWED_STATUS.includes(statusCode)) {
    return { ok: false, error: "Status code tidak valid" };
  }
  if (fromPath === "/") {
    return { ok: false, error: "Homepage tidak boleh dijadikan path asal" };
  }
  if (PROTECTED_PREFIXES.some((p) => fromPath === p || fromPath.startsWith(`${p}/`))) {
    return { ok: false, error: "Path ini dilindungi dan tidak boleh di-redirect" };
  }
  if (fromPath === toPath) {
    return { ok: false, error: "Path asal dan tujuan tidak boleh sama" };
  }

  const existing = await db.query.redirects.findFirst({ where: eq(redirects.fromPath, fromPath) });
  if (existing) {
    return { ok: false, error: "Path asal ini sudah terdaftar" };
  }

  if (await wouldLoop(fromPath, toPath)) {
    return { ok: false, error: "Redirect ini akan membuat loop. Cek redirect yang sudah ada." };
  }

  // Ratakan rantai: redirect lama yang menuju path asal ini langsung diarahkan ke tujuan baru
  await db.update(redirects).set({ toPath }).where(eq(redirects.toPath, fromPath));

  await db.insert(redirects).values({ fromPath, toPath, statusCode });
  invalidateRedirectCache();
  revalidatePath("/admin/redirects");
  return { ok: true, error: null };
}

export async function deleteRedirect(id: string) {
  await requireAdmin();
  await db.delete(redirects).where(eq(redirects.id, id));
  invalidateRedirectCache();
  revalidatePath("/admin/redirects");
}
