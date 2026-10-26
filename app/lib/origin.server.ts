import { getSiteUrl } from "~/lib/seo";

/**
 * React Router memakai `new URL(request.url).origin` untuk URL absolut di
 * JSON-LD/canonical. Next 16 tidak meng-export `origin()` dari next/headers
 * dan host di balik proxy Docker bisa berbeda dari domain produksi, jadi
 * dipakai siteUrl yang tersimpan di settings — nilai yang sama saat produksi.
 */
export async function getRequestOrigin(): Promise<string> {
  return getSiteUrl();
}
