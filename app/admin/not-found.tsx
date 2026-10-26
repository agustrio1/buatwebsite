import { Compass } from "lucide-react";
import { buttonVariants } from "~/lib/button-variants";

/**
 * 404 khusus area admin. Letaknya di segment app/admin sehingga dibungkus
 * AdminShell (sidebar & header tetap tampil), bukan halaman putih full-screen
 * seperti not-found publik.
 */
export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-brand-500">
          <Compass size={28} />
        </div>
        <p className="text-5xl font-bold text-brand-500">404</p>
        <h1 className="mt-3 text-xl font-bold text-brand-dark">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Halaman admin yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <a href="/admin" className={buttonVariants()}>
            ke Dashboard
          </a>
          <a href="/admin/posts" className={buttonVariants({ variant: "outline" })}>
            ke Artikel
          </a>
        </div>
      </div>
    </div>
  );
}
