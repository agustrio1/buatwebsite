import { redirect } from "react-router";
import { db } from "~/db";
import { redirects } from "~/db/schema";

type Rule = { toPath: string; statusCode: number };

const TTL_MS = 30_000;
// Path yang tidak pernah dicek, supaya admin, API, dan file statis tidak kena
const SKIP_PREFIXES = [
  "/admin",
  "/api",
  "/login",
  "/logout",
  "/assets",
  "/sitemap",
  "/robots.txt",
  "/rss.xml",
  "/favicon",
];

let cache: Map<string, Rule> | null = null;
let loadedAt = 0;
let loading: Promise<Map<string, Rule>> | null = null;

// Samakan bentuk path request dengan yang disimpan di admin (tanpa slash akhir)
export function normalizeRequestPath(pathname: string) {
  let p = pathname;
  try {
    p = decodeURI(p);
  } catch {
    // path rusak: pakai apa adanya
  }
  // Request data client-side: /blog/x.data dan /_root.data
  p = p.replace(/\.data$/, "");
  if (p === "/_root") p = "/";
  return p.length > 1 ? p.replace(/\/+$/, "") : p;
}

async function loadRules(): Promise<Map<string, Rule>> {
  const now = Date.now();
  if (cache && now - loadedAt < TTL_MS) return cache;
  if (loading) return loading;

  loading = db.query.redirects
    .findMany()
    .then((rows) => {
      const map = new Map<string, Rule>();
      for (const r of rows) {
        map.set(r.fromPath, { toPath: r.toPath, statusCode: r.statusCode });
      }
      cache = map;
      loadedAt = Date.now();
      return map;
    })
    .catch((err) => {
      // DB bermasalah: jangan bikin situs error, pakai cache lama kalau ada
      console.error("[redirects] gagal memuat:", err);
      return cache ?? new Map<string, Rule>();
    })
    .finally(() => {
      loading = null;
    });

  return loading;
}

// Dipanggil dari admin setelah tambah atau hapus redirect
export function invalidateRedirectCache() {
  cache = null;
  loadedAt = 0;
}

export async function findRedirect(pathname: string): Promise<Rule | null> {
  const path = normalizeRequestPath(pathname);
  if (SKIP_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) return null;

  const rules = await loadRules();
  const rule = rules.get(path);
  if (!rule || rule.toPath === path) return null;
  return rule;
}

/**
 * Tetap disediakan supaya pemanggilan lama (mis. di blog/$slug) tidak rusak.
 * Redirect sekarang sudah dicek global di root middleware.
 */
export async function checkRedirect(pathname: string): Promise<never | void> {
  const rule = await findRedirect(pathname);
  if (rule) throw redirect(rule.toPath, rule.statusCode);
}