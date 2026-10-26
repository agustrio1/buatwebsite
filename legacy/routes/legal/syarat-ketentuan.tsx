import { useOutletContext } from "react-router";

export default function SyaratKetentuan() {
  const { settings } = useOutletContext<{ settings: Record<string, any> }>();
  const general = settings.general ?? {};
  const contact = settings.contact ?? {};
  const siteName = general.siteName ?? "kami";

  return (
    <article className="max-w-2xl mx-auto px-4 md:px-8 py-16">
      <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
        Legal
      </span>
      <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">Syarat & Ketentuan</h1>
      <p className="text-sm text-slate-400 mt-2">Terakhir diperbarui: Agustus 2026</p>

      <div className="prose prose-sm sm:prose-base max-w-none mt-8 text-slate-600">
        <p>
          Syarat & Ketentuan ini mengatur penggunaan layanan yang disediakan oleh {siteName}
          {" "}("kami", "Penyedia Layanan") kepada pengguna atau klien ("Anda", "Klien"). Dengan
          menggunakan situs web ini atau memesan layanan kami, Anda dianggap telah membaca,
          memahami, dan menyetujui seluruh ketentuan berikut.
        </p>

        <h2>1. Lingkup Layanan</h2>
        <p>
          Kami menyediakan jasa pembuatan, pengembangan, dan pemeliharaan website sesuai dengan
          paket atau kesepakatan yang dipilih oleh Klien. Detail spesifik cakupan pekerjaan,
          jumlah halaman, fitur, dan waktu pengerjaan akan dikonfirmasi melalui komunikasi
          langsung (WhatsApp, email, atau dokumen kesepakatan terpisah) sebelum pekerjaan dimulai.
        </p>

        <h2>2. Proses Pemesanan</h2>
        <p>
          Pemesanan layanan dilakukan melalui formulir kontak, WhatsApp, atau saluran komunikasi
          resmi lain yang kami sediakan. Kesepakatan mengenai ruang lingkup pekerjaan, harga, dan
          jadwal dianggap sah setelah dikonfirmasi secara tertulis oleh kedua belah pihak.
        </p>

        <h2>3. Pembayaran</h2>
        <p>
          Skema pembayaran (uang muka, cicilan, atau pelunasan di awal) akan ditentukan berdasarkan
          kesepakatan untuk masing-masing proyek. Pekerjaan akan dimulai setelah pembayaran sesuai
          skema yang disepakati diterima. Keterlambatan pembayaran dapat menyebabkan penundaan
          jadwal pengerjaan.
        </p>

        <h2>4. Revisi</h2>
        <p>
          Setiap paket layanan memiliki jatah revisi yang berbeda-beda sesuai yang tercantum pada
          halaman layanan atau kesepakatan awal. Permintaan revisi di luar cakupan yang disepakati
          dapat dikenakan biaya tambahan sesuai kesepakatan.
        </p>

        <h2>5. Kepemilikan & Hak Cipta</h2>
        <p>
          Setelah pembayaran dilunasi secara penuh, hak penggunaan atas hasil akhir website
          (desain, kode, dan konten yang dibuat khusus untuk Klien) beralih kepada Klien, kecuali
          untuk aset pihak ketiga (font, gambar stok, plugin berlisensi) yang tunduk pada lisensi
          masing-masing penyedia. Kami berhak menampilkan hasil pekerjaan sebagai bagian dari
          portofolio kami, kecuali disepakati lain secara tertulis.
        </p>

        <h2>6. Batasan Tanggung Jawab</h2>
        <p>
          Kami berupaya memberikan hasil pekerjaan terbaik sesuai kesepakatan, namun tidak
          bertanggung jawab atas kerugian yang timbul akibat penggunaan website oleh Klien setelah
          serah terima, termasuk namun tidak terbatas pada gangguan pihak ketiga (hosting, domain,
          layanan eksternal) di luar kendali kami.
        </p>

        <h2>7. Pembatalan</h2>
        <p>
          Pembatalan proyek yang sudah berjalan dapat dilakukan dengan pemberitahuan tertulis.
          Biaya yang telah dibayarkan untuk pekerjaan yang sudah dikerjakan tidak dapat dikembalikan,
          kecuali disepakati lain oleh kedua belah pihak.
        </p>

        <h2>8. Perubahan Ketentuan</h2>
        <p>
          Kami dapat memperbarui Syarat & Ketentuan ini dari waktu ke waktu. Perubahan akan berlaku
          sejak dipublikasikan di halaman ini.
        </p>

        <h2>9. Kontak</h2>
        <p>
          Jika Anda memiliki pertanyaan mengenai Syarat & Ketentuan ini, silakan hubungi kami
          melalui{" "}
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