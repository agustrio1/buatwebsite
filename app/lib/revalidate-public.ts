import { revalidatePath } from "next/cache";

/**
 * Revalidasi on-demand untuk halaman publik yang sudah di-cache (ISR/SSG,
 * revalidate 300s). Dipanggil dari server action admin supaya perubahan konten
 * langsung terlihat, sementara interval 300 tetap jadi jaring pengaman.
 *
 * Catatan: /blog dan /projek (list) dibaca lewat searchParams sehingga selalu
 * dirender dinamis, jadi tidak perlu di-revalidate di sini.
 */

type Slug = string | null | undefined;

function uniqueSlugs(slugs: Slug[]): string[] {
  return Array.from(new Set(slugs.filter((s): s is string => Boolean(s))));
}

export function revalidatePostPages(slugs: Slug[]) {
  revalidatePath("/"); // beranda menampilkan artikel terbaru
  for (const slug of uniqueSlugs(slugs)) revalidatePath(`/blog/${slug}`);
}

export function revalidateProjectPages(slugs: Slug[]) {
  revalidatePath("/"); // beranda menampilkan marquee projek
  for (const slug of uniqueSlugs(slugs)) revalidatePath(`/projek/${slug}`);
}

export function revalidateServicePages() {
  revalidatePath("/"); // beranda menampilkan layanan unggulan
  revalidatePath("/kontak"); // daftar layanan di halaman kontak
}

export function revalidateCityPages(slugs: Slug[]) {
  revalidatePath("/", "layout"); // daftar kota muncul di footer semua halaman
  for (const slug of uniqueSlugs(slugs)) {
    revalidatePath(`/jasa-pembuatan-website/${slug}`);
  }
}

export function revalidateSettings() {
  // Settings dipakai header/footer/JSON-LD di seluruh halaman publik.
  revalidatePath("/", "layout");
}

export function revalidateCustomPages(slugs: Slug[]) {
  for (const slug of uniqueSlugs(slugs)) revalidatePath(`/${slug}`);
  // Sitemap menyertakan halaman custom published.
  revalidatePath("/sitemap-1.xml");
}
