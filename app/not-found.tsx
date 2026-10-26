/**
 * 404 statis Next. Padanan cabang isRouteErrorResponse(status 404) dari
 * ErrorBoundary lama. notFound() di halaman dynamic (blog/proyek/layanan/kota)
 * juga jatuh ke file ini, tetap dibungkus layout segment-nya masing-masing.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <p className="text-brand-500 font-bold text-6xl">404</p>
        <h1 className="text-2xl font-bold text-brand-dark mt-4">Halaman Tidak Ditemukan</h1>
        <p className="text-slate-500 mt-2 leading-relaxed">
          Halaman yang Anda cari tidak ada atau sudah dipindahkan.
        </p>

        <a
          href="/"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3 rounded-full mt-6 transition-colors"
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
}
