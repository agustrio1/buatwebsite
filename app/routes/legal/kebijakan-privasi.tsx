import { useOutletContext } from "react-router";

export default function KebijakanPrivasi() {
  const { settings } = useOutletContext<{ settings: Record<string, any> }>();
  const general = settings.general ?? {};
  const contact = settings.contact ?? {};
  const siteName = general.siteName ?? "kami";

  return (
    <article className="max-w-2xl mx-auto px-4 md:px-8 py-16">
      <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
        Legal
      </span>
      <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">Kebijakan Privasi</h1>
      <p className="text-sm text-slate-400 mt-2">Terakhir diperbarui: Agustus 2026</p>

      <div className="prose prose-sm sm:prose-base max-w-none mt-8 text-slate-600">
        <p>
          Kebijakan Privasi ini menjelaskan bagaimana {siteName} ("kami") mengumpulkan, menggunakan,
          dan melindungi data pribadi Anda saat mengunjungi situs web atau menggunakan layanan kami.
        </p>

        <h2>1. Data yang Kami Kumpulkan</h2>
        <p>Kami dapat mengumpulkan informasi berikut saat Anda berinteraksi dengan situs kami:</p>
        <ul>
          <li>Nama, alamat email, dan nomor telepon yang Anda kirimkan melalui formulir kontak atau permintaan konsultasi</li>
          <li>Nama perusahaan dan jenis layanan yang Anda minati (jika diisi)</li>
          <li>Pesan atau isi permintaan yang Anda kirimkan kepada kami</li>
          <li>Data teknis dasar seperti jenis perangkat dan halaman yang dikunjungi, melalui alat analitik (misalnya Google Analytics), jika diaktifkan</li>
        </ul>

        <h2>2. Bagaimana Kami Menggunakan Data</h2>
        <p>Data yang kami kumpulkan digunakan untuk:</p>
        <ul>
          <li>Merespons pertanyaan atau permintaan konsultasi Anda</li>
          <li>Memproses pemesanan layanan dan komunikasi terkait proyek</li>
          <li>Meningkatkan kualitas layanan dan konten situs kami</li>
          <li>Mengirimkan informasi terkait layanan, jika Anda memberikan persetujuan</li>
        </ul>

        <h2>3. Penyimpanan Data</h2>
        <p>
          Data yang Anda berikan disimpan pada infrastruktur penyedia layanan basis data pihak
          ketiga yang kami gunakan, dengan praktik keamanan standar industri. Kami tidak menjual
          atau menyewakan data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran.
        </p>

        <h2>4. Berbagi Data dengan Pihak Ketiga</h2>
        <p>
          Kami dapat menggunakan layanan pihak ketiga untuk mendukung operasional situs, seperti
          penyedia hosting gambar, layanan analitik, dan platform komunikasi (WhatsApp). Data yang
          dibagikan ke layanan tersebut terbatas pada yang diperlukan untuk fungsi layanan itu
          sendiri, dan tunduk pada kebijakan privasi masing-masing penyedia.
        </p>

        <h2>5. Cookie</h2>
        <p>
          Situs kami dapat menggunakan cookie untuk keperluan fungsional (misalnya menjaga sesi
          login admin) dan analitik. Anda dapat mengatur browser untuk menolak cookie, namun
          beberapa fitur situs mungkin tidak berfungsi optimal.
        </p>

        <h2>6. Hak Anda</h2>
        <p>
          Anda berhak meminta akses, koreksi, atau penghapusan data pribadi yang kami simpan
          terkait Anda, dengan menghubungi kami melalui kontak di bawah.
        </p>

        <h2>7. Keamanan Data</h2>
        <p>
          Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi data Anda dari akses,
          perubahan, atau pengungkapan yang tidak sah. Namun, tidak ada metode transmisi data melalui
          internet yang sepenuhnya aman, dan kami tidak dapat menjamin keamanan mutlak.
        </p>

        <h2>8. Perubahan Kebijakan</h2>
        <p>
          Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan berlaku
          sejak dipublikasikan di halaman ini.
        </p>

        <h2>9. Kontak</h2>
        <p>
          Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau ingin menggunakan hak
          Anda atas data pribadi, silakan hubungi kami melalui{" "}
          {contact.emailPrimary ? (
            <a href={`mailto:${contact.emailPrimary}`}>{contact.emailPrimary}</a>
          ) : (
            "kontak yang tersedia di halaman ini"
          )}
          .
        </p>
      </div>
    </article>
  );
}