import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { findRedirect } from "~/lib/redirects.server";

/**
 * Padanan middleware di root.tsx versi React Router: setiap GET/HEAD dicek
 * terhadap tabel redirects sebelum request masuk route.
 *
 * Next 16 menjalankan file ini di Node.js runtime, jadi query Neon dan cache
 * in-memory di redirects.server.ts bisa dipakai apa adanya.
 */
/**
 * Padanan export headers() per-route di versi React Router. App Router tidak
 * punya hook setara, jadi aturan Cache-Control yang sama dipasang di sini.
 * Hanya response 200 yang disentuh; route admin/api/auth tidak pernah kena.
 */
const CACHE_RULES: { match: (p: string) => boolean; value: string }[] = [
  {
    match: (p) => /^\/blog\/.+/.test(p),
    value: "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  },
  {
    match: (p) => p === "/",
    value: "public, max-age=60, s-maxage=600, stale-while-revalidate=86400",
  },
  {
    match: (p) => p === "/blog" || p === "/projek" || p.startsWith("/projek/") || p === "/kontak",
    value: "public, max-age=60, s-maxage=600, stale-while-revalidate=86400",
  },
  {
    // routes/layanan/$slug.tsx dan jasa-pembuatan-website/$city.tsx
    match: (p) => p.startsWith("/layanan/") || p.startsWith("/jasa-pembuatan-website/"),
    value: "public, max-age=60, s-maxage=600, stale-while-revalidate=86400",
  },
];

function cacheControlFor(pathname: string): string | undefined {
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/logout") ||
    pathname.startsWith("/legal") ||
    pathname === "/kalkulator"
  ) {
    return undefined;
  }
  return CACHE_RULES.find((r) => r.match(pathname))?.value;
}

export default async function proxy(request: NextRequest) {
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return NextResponse.next();
  }

  const url = new URL(request.url);
  const rule = await findRedirect(url.pathname);
  if (rule) {
    return NextResponse.redirect(new URL(rule.toPath, request.url), {
      status: rule.statusCode,
    });
  }

  const response = NextResponse.next();
  const cacheControl = cacheControlFor(url.pathname);
  if (cacheControl) response.headers.set("Cache-Control", cacheControl);
  return response;
}

export const config = {
  // Lewati asset internal Next; sisanya (termasuk URL yang tidak cocok route
  // apa pun) tetap dicek supaya safety-net redirect di entry.server lama ikut
  // terjaga.
  matcher: ["/((?!_next/|favicon.ico).*)"],
};
