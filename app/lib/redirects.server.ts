import { db } from "~/db";
import { redirects } from "~/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "react-router";

/**
 * Cek apakah path saat ini punya redirect terdaftar.
 * Kalau ada, langsung throw redirect Response (menghentikan loader).
 * Kalau tidak ada, function ini return tanpa efek apa-apa, biar loader lanjut normal.
 */
export async function checkRedirect(pathname: string): Promise<never | void> {
  const match = await db.query.redirects.findFirst({
    where: eq(redirects.fromPath, pathname),
  });

  if (match) {
    throw redirect(match.toPath, { status: match.statusCode as 301 | 302 });
  }
}