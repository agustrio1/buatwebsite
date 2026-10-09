export type ServiceBlock = {
  heading: string;
  items: { title: string; desc: string }[];
};

export type ServiceFaq = { q: string; a: string };

export type ServicePage = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  // Path relatif (diawali /) atau URL penuh. Dipakai untuk og:image.
  ogImage?: string;
  // Format YYYY-MM-DD. Dipakai untuk dateModified di schema + teks "Diperbarui" di halaman.
  updatedAt?: string;
  keywords: string[];
  shortDesc: string;
  // Opsional: jawaban langsung 40-60 kata (untuk AEO / AI Overview)
  answer?: { heading: string; text: string };
  intro: string;
  features: string[];
  // Opsional: dirender di halaman kalau diisi
  problems?: ServiceBlock;
  metrics?: ServiceBlock;
  process?: ServiceBlock;
  faqs?: ServiceFaq[];
  related?: string[];
};

export const servicePages: ServicePage[] = [
  {
    slug: "company-profile",
    title: "Jasa Pembuatan Website Company Profile Profesional",
    metaTitle: "Jasa Pembuatan Website Company Profile Profesional & SEO",
    metaDesc:
      "Jasa pembuatan website company profile untuk UMKM dan bisnis: responsif, ramah SEO, dan mudah dikelola sendiri. Konsultasi awal gratis via WhatsApp.",
    ogImage: "/og/company-profile.jpg",
    updatedAt: "2026-10-09",
    keywords: [
      "jasa website company profile",
      "buat website profil perusahaan",
      "biaya bikin company profile",
      "website bisnis profesional",
      "web developer company profile",
    ],
    shortDesc:
      "Website company profile yang menjelaskan bisnis Anda dengan jelas, nyaman dibuka di HP, dan disusun agar mudah ditemukan di Google.",
    answer: {
      heading: "Apa itu website company profile?",
      text: "Website company profile adalah halaman resmi bisnis di internet yang memuat profil perusahaan, layanan atau produk, portofolio, dan kontak. Fungsinya membuat calon pelanggan lebih percaya sebelum menghubungi, sekaligus memudahkan mereka menemukan Anda di Google. Isinya biasanya beranda, tentang kami, layanan, portofolio, blog, dan halaman kontak.",
    },
    intro:
      "Sebelum menghubungi sebuah bisnis, calon pelanggan hampir selalu mencari tahu dulu: mereka mengecek Google, lalu melihat websitenya. Bisnis tanpa website, atau dengan website yang lambat dan membingungkan, lebih sulit meyakinkan dibanding bisnis yang informasinya jelas dan mudah dibuka di HP. Kami membuat website company profile yang disesuaikan dengan identitas brand Anda, disusun dengan struktur yang ramah SEO, dan bisa Anda kelola sendiri lewat admin panel. Untuk kebutuhan multi-halaman, pengerjaan umumnya sekitar 3–5 hari kerja setelah materi (logo, teks, foto) lengkap kami terima.",
    features: [
      "Desain disesuaikan dengan identitas brand Anda: logo, warna, dan gaya visual",
      "Tampilan responsif yang dirancang mulai dari layar HP",
      "Tombol WhatsApp dan formulir kontak agar calon pelanggan mudah menghubungi",
      "SEO on-page: judul halaman, meta description, struktur heading, dan sitemap",
      "Integrasi analytics untuk memantau jumlah dan asal pengunjung",
      "Admin panel untuk memperbarui teks dan gambar, dilengkapi panduan pemakaian",
      "Domain dan hosting tahun pertama sudah termasuk di paket Starter dan Pro",
    ],
    problems: {
      heading: "Tanda bisnis Anda butuh website company profile",
      items: [
        {
          title: "Pertanyaan yang sama terus berulang",
          desc: "Calon pelanggan sering menanyakan layanan, harga, atau lokasi lewat DM, padahal jawabannya bisa dibaca sendiri di satu tempat.",
        },
        {
          title: "Belum ada tempat resmi untuk portofolio",
          desc: "Saat ada yang minta contoh pekerjaan, Anda masih mengirim file satu per satu atau tautan yang tercecer.",
        },
        {
          title: "Tidak muncul saat dicari di Google",
          desc: "Nama bisnis Anda sulit ditemukan karena tidak ada halaman yang bisa diindeks mesin pencari.",
        },
        {
          title: "Website lama sulit dipakai di HP",
          desc: "Tulisan terlalu kecil, tombol sulit diketuk, atau halaman lama dimuat, sehingga pengunjung pergi.",
        },
      ],
    },
    process: {
      heading: "Alur pembuatan website company profile",
      items: [
        {
          title: "Konsultasi dan pengumpulan materi",
          desc: "Kami membahas bisnis, target pelanggan, dan halaman yang dibutuhkan, lalu Anda menyiapkan logo, teks, dan foto.",
        },
        {
          title: "Desain dan struktur halaman",
          desc: "Tampilan dan susunan halaman dirancang mengikuti identitas brand, dengan struktur konten yang ramah SEO.",
        },
        {
          title: "Pengembangan dan pengujian",
          desc: "Website dibangun, diuji di berbagai ukuran layar, lalu direvisi sesuai kesepakatan di awal.",
        },
        {
          title: "Rilis dan pendampingan awal",
          desc: "Website online, Anda mendapat panduan pemakaian admin panel, dan kami mendampingi di masa awal pemakaian.",
        },
      ],
    },
    faqs: [
      {
        q: "Berapa biaya pembuatan website company profile?",
        a: "Paket Starter untuk 1 halaman mulai dari Rp1.500.000, dan Paket Pro untuk website hingga 10 halaman mulai dari Rp3.500.000. Keduanya sudah termasuk domain dan hosting tahun pertama. Biaya final bergantung pada jumlah halaman dan fitur, dan kami beri penawaran jelas setelah konsultasi.",
      },
      {
        q: "Berapa lama pengerjaannya?",
        a: "Untuk company profile multi-halaman sekitar 3–5 hari kerja, dihitung sejak materi seperti logo, teks, dan foto lengkap kami terima. Jika materi belum siap, waktu pengerjaan ikut bergeser.",
      },
      {
        q: "Apa yang perlu saya siapkan?",
        a: "Yang paling membantu: logo, teks tentang bisnis dan layanan, foto produk atau usaha, dan contoh website yang Anda sukai. Kalau belum lengkap, kami bantu arahkan saat konsultasi.",
      },
      {
        q: "Apakah domain dan hosting sudah termasuk?",
        a: "Untuk paket Starter dan Pro, domain dan hosting tahun pertama sudah termasuk. Tahun berikutnya ada biaya perpanjangan, dan kami infokan sebelum kesepakatan supaya tidak ada biaya mendadak.",
      },
      {
        q: "Bisakah saya mengubah isi website sendiri?",
        a: "Bisa. Paket Pro menyediakan admin panel beserta panduan pemakaian, sehingga teks dan gambar bisa diperbarui tanpa perlu paham coding.",
      },
    ],
    related: ["optimasi-kecepatan", "redesign-ui-ux", "maintenance-website"],
  },
  {
    slug: "sistem-erp-pos",
    title: "Jasa Pembuatan Sistem ERP & POS Kasir Custom",
    metaTitle: "Jasa Pembuatan Sistem ERP & POS Custom Berbasis Web",
    metaDesc:
      "Jasa pembuatan sistem ERP skala kecil dan POS kasir custom berbasis web: master data, keuangan, transaksi, dan laporan sesuai alur kerja bisnis Anda.",
    ogImage: "/og/sistem-erp-pos.jpg",
    updatedAt: "2026-10-09",
    keywords: [
      "jasa pembuatan sistem erp",
      "sistem pos custom berbasis web",
      "aplikasi kasir perusahaan",
      "software manajemen inventori",
      "pengembangan software kustom",
    ],
    shortDesc:
      "Sistem ERP skala kecil dan POS berbasis web yang menyatukan pencatatan transaksi, keuangan, dan laporan, dengan modul yang disesuaikan alur kerja bisnis Anda.",
    answer: {
      heading: "Apa itu sistem ERP dan POS berbasis web?",
      text: "ERP adalah sistem yang menyatukan pencatatan operasional bisnis, seperti data barang dan pelanggan, transaksi, keuangan, dan laporan, di satu tempat. POS adalah sistem kasir untuk mencatat penjualan. Versi berbasis web bisa dibuka lewat browser tanpa instal program, dan modulnya disesuaikan dengan alur kerja bisnis.",
    },
    intro:
      "Banyak usaha mencatat penjualan, hutang piutang, dan keuangan di buku atau spreadsheet yang terpisah, sehingga laporan baru bisa dilihat setelah direkap manual. Kami membangun sistem berbasis web yang menyatukan pencatatan itu. Sebagai gambaran, demo Mini ERP kami mencakup master data, chart of accounts dan buku besar, hutang piutang, penjualan dan pembelian, kas masuk dan keluar, serta laporan laba rugi dan arus kas. Modul lain seperti stok atau kasir (POS) dikerjakan sesuai kebutuhan, dan lingkupnya kami bahas dulu sebelum pengerjaan supaya tidak ada fitur yang dijanjikan di luar kesepakatan. Demo di situs ini adalah demo buatan sendiri, bukan proyek klien.",
    features: [
      "Master data: barang atau jasa, pelanggan, vendor, dan kategori",
      "Chart of Accounts, buku besar, serta pengelolaan akun kas dan bank",
      "Pencatatan hutang dan piutang",
      "Transaksi penjualan, pembelian, kas masuk, dan kas keluar",
      "Laporan laba rugi, arus kas, dan ringkasan transaksi harian atau bulanan",
      "Hak akses pengguna berbasis peran, sehingga tiap orang hanya melihat data yang relevan",
      "Modul tambahan seperti stok atau kasir (POS) dibangun sesuai kebutuhan dan dibahas saat konsultasi",
    ],
    problems: {
      heading: "Tanda usaha Anda butuh sistem ERP atau POS",
      items: [
        {
          title: "Laporan direkap manual",
          desc: "Setiap akhir bulan Anda atau admin menggabungkan catatan dari berbagai file untuk mengetahui untung rugi.",
        },
        {
          title: "Data tersebar",
          desc: "Data pelanggan, vendor, dan transaksi ada di banyak tempat, sehingga sulit dicari dan rawan selisih.",
        },
        {
          title: "Hutang piutang sulit dipantau",
          desc: "Anda tidak tahu pasti tagihan mana yang sudah jatuh tempo atau pembayaran mana yang belum diterima.",
        },
        {
          title: "Akses data tidak terbatas",
          desc: "Semua orang bisa melihat atau mengubah catatan, padahal sebagian data seharusnya hanya untuk pihak tertentu.",
        },
      ],
    },
    process: {
      heading: "Alur pengembangan sistem",
      items: [
        {
          title: "Pemetaan alur kerja",
          desc: "Kami memahami cara bisnis Anda mencatat transaksi dan keuangan saat ini, termasuk laporan yang Anda perlukan.",
        },
        {
          title: "Penentuan modul dan lingkup",
          desc: "Fitur dibagi menjadi yang wajib dan yang bisa menyusul, supaya sistem tidak membengkak sebelum dipakai.",
        },
        {
          title: "Pengembangan bertahap dan uji",
          desc: "Modul dibangun bertahap dan diuji dengan data contoh, sehingga Anda bisa memberi masukan sebelum sistem rampung.",
        },
        {
          title: "Serah terima dan pendampingan",
          desc: "Sistem dirilis, pengguna mendapat panduan, dan kami mendampingi di masa awal pemakaian.",
        },
      ],
    },
    faqs: [
      {
        q: "Apakah ini software jadi atau dibuat khusus?",
        a: "Dibuat sesuai alur kerja bisnis Anda. Demo Mini ERP kami menunjukkan gambaran modul yang bisa dibangun, tetapi fitur akhirnya ditentukan dari kebutuhan Anda.",
      },
      {
        q: "Modul apa saja yang ada di demo?",
        a: "Demo mencakup master data, chart of accounts dan buku besar, akun kas dan bank, hutang piutang, penjualan dan pembelian, kas masuk dan keluar, laporan laba rugi dan arus kas, serta pengaturan hak akses pengguna.",
      },
      {
        q: "Apakah bisa ditambah modul stok atau kasir?",
        a: "Bisa dibangun sesuai kebutuhan, tetapi modul tersebut belum ada di demo saat ini. Lingkup dan estimasinya kami bahas saat konsultasi.",
      },
      {
        q: "Berapa biaya pembuatan sistemnya?",
        a: "Termasuk Paket Custom, jadi harga ditentukan setelah kebutuhan dibahas. Faktor utamanya adalah jumlah modul, kompleksitas laporan, dan jumlah pengguna.",
      },
      {
        q: "Bisakah dihubungkan dengan sistem yang sudah ada?",
        a: "Bisa dibahas. Kemungkinannya bergantung pada sistem lama Anda, misalnya apakah menyediakan API atau ekspor data.",
      },
    ],
    related: ["website-custom", "maintenance-website"],
  },
  {
    slug: "toko-online",
    title: "Jasa Pembuatan Website Toko Online / E-Commerce",
    metaTitle: "Jasa Pembuatan Toko Online E-Commerce dengan Pembayaran & Ongkir Otomatis",
    metaDesc:
      "Jasa pembuatan toko online dengan pembayaran lewat payment gateway, ongkir otomatis, dan checkout sebagai tamu atau member. Konsultasi gratis via WhatsApp.",
    ogImage: "/og/toko-online.jpg",
    updatedAt: "2026-10-09",
    keywords: [
      "jasa toko online e-commerce",
      "buat web e-commerce custom",
      "website jualan online",
      "integrasi payment gateway indonesia",
      "toko online cek ongkir otomatis",
    ],
    shortDesc:
      "Toko online milik sendiri dengan pembayaran lewat payment gateway, ongkos kirim otomatis, dan checkout yang bisa dipakai tamu maupun member.",
    answer: {
      heading: "Apa saja yang termasuk dalam jasa pembuatan toko online?",
      text: "Toko online buatan kami mencakup katalog produk, keranjang dan checkout, pembayaran lewat payment gateway (yang sudah kami pakai: Duitku), ongkos kirim otomatis lewat Biteship, serta manajemen pesanan di admin panel. Pelanggan bisa checkout sebagai tamu atau membuat akun untuk riwayat pesanan dan voucher.",
    },
    intro:
      "Berjualan di marketplace memang praktis, tetapi Anda bergantung pada aturan, biaya, dan tampilan platform orang lain. Toko online sendiri memberi kendali atas brand, data pelanggan, dan alur belanja. Demo toko online kami memperlihatkan alur lengkapnya: pelanggan memilih produk, ongkir dihitung otomatis lewat Biteship, pembayaran diproses lewat Duitku, lalu pesanan masuk ke admin panel. Demo ini kami bangun sendiri, bukan proyek klien, dan fiturnya bisa disesuaikan dengan toko Anda.",
    features: [
      "Katalog produk dengan kategori dan pencarian",
      "Pembayaran lewat payment gateway Duitku, dengan metode yang tersedia mengikuti pengaturan akun Anda",
      "Ongkos kirim dihitung otomatis lewat Biteship",
      "Checkout sebagai tamu tanpa akun, atau login untuk melihat riwayat pesanan",
      "Promo voucher untuk pelanggan yang memiliki akun",
      "Manajemen pesanan di admin panel",
      "Penyimpanan gambar produk di Cloudflare R2 dan tampilan yang nyaman di HP",
    ],
    problems: {
      heading: "Tanda Anda siap punya toko online sendiri",
      items: [
        {
          title: "Ongkir dan harga ditanyakan lewat chat",
          desc: "Setiap pembeli bertanya ongkir satu per satu, padahal bisa dihitung otomatis saat checkout.",
        },
        {
          title: "Cek pembayaran dilakukan manual",
          desc: "Anda harus mengecek mutasi rekening dan mencocokkan transfer dengan pesanan satu per satu.",
        },
        {
          title: "Terlalu bergantung pada marketplace",
          desc: "Biaya, aturan, dan tampilan ditentukan platform, sementara data pelanggan tidak sepenuhnya milik Anda.",
        },
        {
          title: "Pembeli enggan membuat akun",
          desc: "Sebagian pembeli pergi karena harus mendaftar dulu. Checkout sebagai tamu memangkas hambatan itu.",
        },
      ],
    },
    process: {
      heading: "Alur pembuatan toko online",
      items: [
        {
          title: "Konsultasi dan pemetaan toko",
          desc: "Kami membahas produk, cara pengiriman, metode pembayaran, dan fitur yang benar-benar dibutuhkan di awal.",
        },
        {
          title: "Desain dan struktur toko",
          desc: "Tampilan katalog, halaman produk, dan alur checkout dirancang sesuai brand dan kebiasaan pembeli di HP.",
        },
        {
          title: "Pengembangan dan integrasi",
          desc: "Toko dibangun dan dihubungkan dengan payment gateway serta layanan ongkir, lalu diuji dengan transaksi uji.",
        },
        {
          title: "Rilis dan pendampingan awal",
          desc: "Toko online rilis, Anda mendapat panduan mengelola produk dan pesanan, dan kami mendampingi di masa awal.",
        },
      ],
    },
    faqs: [
      {
        q: "Payment gateway apa yang dipakai?",
        a: "Demo kami memakai Duitku. Metode pembayaran yang bisa dipilih pembeli bergantung pada pengaturan akun Duitku Anda. Pilihan penyedia lain bisa dibahas saat konsultasi.",
      },
      {
        q: "Apakah saya perlu mendaftar akun sendiri?",
        a: "Umumnya perlu. Akun payment gateway dan layanan ongkir sebaiknya terdaftar atas nama usaha Anda supaya dana dan datanya masuk ke Anda. Kami membantu proses integrasinya.",
      },
      {
        q: "Apakah ada biaya per transaksi?",
        a: "Biaya transaksi pembayaran ditentukan oleh penyedia payment gateway, bukan oleh kami. Nilainya Anda lihat langsung di ketentuan penyedia.",
      },
      {
        q: "Berapa biaya dan lama pembuatan toko online?",
        a: "Termasuk Paket Custom, jadi biaya dan estimasi waktu ditentukan setelah kebutuhan dibahas, terutama jumlah fitur dan integrasi yang diperlukan.",
      },
      {
        q: "Apakah bisa checkout tanpa membuat akun?",
        a: "Bisa. Pembeli dapat checkout sebagai tamu, atau membuat akun jika ingin memakai voucher dan melihat riwayat pesanan.",
      },
    ],
    related: ["optimasi-kecepatan", "maintenance-website", "website-custom"],
  },
  {
    slug: "landing-page",
    title: "Jasa Pembuatan Landing Page High-Conversion",
    metaTitle: "Jasa Pembuatan Landing Page Cepat & Fokus Konversi",
    metaDesc:
      "Jasa pembuatan landing page cepat dan fokus konversi untuk iklan dan promosi. Paket Starter mulai Rp1.500.000, termasuk domain dan hosting tahun pertama.",
    ogImage: "/og/landing-page.jpg",
    updatedAt: "2026-10-09",
    keywords: [
      "jasa buat landing page",
      "landing page iklan google ads",
      "landing page iklan tiktok facebook",
      "jasa desain landing page konversi",
      "landing page murah profesional",
    ],
    shortDesc:
      "Landing page satu halaman yang fokus pada satu tujuan, ringan dibuka di HP, dan siap dipasangi pelacakan untuk iklan maupun promosi.",
    answer: {
      heading: "Apa itu landing page?",
      text: "Landing page adalah halaman tunggal yang dirancang untuk satu tujuan, misalnya mengajak pengunjung menghubungi lewat WhatsApp, mengisi formulir, atau membeli. Berbeda dengan website lengkap, isinya fokus pada satu penawaran dan satu ajakan bertindak, sehingga cocok untuk iklan dan promosi.",
    },
    intro:
      "Landing page yang lambat atau tidak jelas membuat klik iklan terbuang: pengunjung datang, bingung harus berbuat apa, lalu pergi. Kami merancang landing page dengan satu fokus. Penawaran dijelaskan singkat, ajakan bertindak mudah ditemukan, halaman ringan dibuka di HP, dan pelacakan bisa dipasang supaya Anda tahu dari mana pengunjung datang. Pengerjaan landing page umumnya 1–2 hari kerja setelah materi lengkap kami terima. Perlu diingat, hasil akhir seperti jumlah prospek juga dipengaruhi penawaran, harga, dan kualitas trafik iklan Anda.",
    features: [
      "Satu halaman dengan alur yang jelas: masalah, solusi, penawaran, dan ajakan bertindak",
      "Kerangka teks disusun dari informasi bisnis yang Anda berikan",
      "Tombol WhatsApp langsung dan formulir kontak",
      "Pemasangan pelacakan: Google Analytics 4, Meta Pixel, atau TikTok Pixel sesuai kebutuhan",
      "Gambar dikompres dan skrip dijaga seminimal mungkin agar halaman ringan",
      "Tampilan responsif, dirancang mulai dari layar HP",
      "SEO dasar dan pemasangan Google Search Console, serta domain dan hosting tahun pertama di paket Starter",
    ],
    problems: {
      heading: "Tanda Anda butuh landing page",
      items: [
        {
          title: "Iklan diarahkan ke halaman yang terlalu ramai",
          desc: "Pengunjung dari iklan harus mencari sendiri apa yang ditawarkan di website yang penuh menu dan informasi lain.",
        },
        {
          title: "Promo butuh halaman cepat",
          desc: "Anda sedang menjalankan promo atau peluncuran produk dan butuh halaman khusus yang bisa tayang dalam hitungan hari.",
        },
        {
          title: "Belum tahu iklan mana yang efektif",
          desc: "Tanpa pelacakan, sulit mengetahui klik dari iklan mana yang benar-benar menghasilkan pesan atau pembelian.",
        },
        {
          title: "Jualan masih lewat satu nomor WhatsApp tanpa halaman",
          desc: "Calon pembeli tidak punya tempat untuk membaca penawaran lengkap sebelum menghubungi.",
        },
      ],
    },
    process: {
      heading: "Alur pembuatan landing page",
      items: [
        {
          title: "Tentukan tujuan dan penawaran",
          desc: "Kami menentukan satu tujuan halaman dan penawaran utamanya, supaya isi halaman tidak melebar.",
        },
        {
          title: "Susun kerangka dan tampilan",
          desc: "Urutan bagian halaman dan tampilan disusun dari informasi bisnis Anda.",
        },
        {
          title: "Bangun, pasang pelacakan, dan uji",
          desc: "Halaman dibangun, pelacakan dipasang, lalu diuji di HP dan desktop.",
        },
        {
          title: "Rilis",
          desc: "Landing page online dan siap dipakai untuk iklan atau promosi.",
        },
      ],
    },
    faqs: [
      {
        q: "Berapa biaya pembuatan landing page?",
        a: "Paket Starter untuk 1 halaman mulai dari Rp1.500.000, sudah termasuk domain dan hosting tahun pertama, desain responsif, tombol WhatsApp, SEO dasar, dan pemasangan Google Search Console.",
      },
      {
        q: "Berapa lama pengerjaannya?",
        a: "Umumnya 1–2 hari kerja, dihitung sejak materi seperti teks, foto, dan logo lengkap kami terima.",
      },
      {
        q: "Apakah teks halamannya dibuatkan?",
        a: "Kami membantu menyusun kerangka dan alur teks dari informasi bisnis yang Anda berikan. Detail penawaran, harga, dan data bisnis tetap berasal dari Anda supaya akurat.",
      },
      {
        q: "Bisakah dipasangi Meta Pixel atau Google Analytics?",
        a: "Bisa. Kami memasang Google Analytics 4, Meta Pixel, atau TikTok Pixel sesuai kebutuhan iklan Anda.",
      },
      {
        q: "Apakah landing page pasti meningkatkan penjualan?",
        a: "Tidak ada yang bisa menjanjikan angka pasti. Kami memastikan halaman jelas, ringan, dan terukur. Hasilnya tetap dipengaruhi penawaran, harga, dan kualitas trafik iklan Anda.",
      },
    ],
    related: ["optimasi-kecepatan", "company-profile"],
  },
  {
    slug: "website-custom",
    title: "Jasa Pembuatan Website Custom Framework & Web App",
    metaTitle: "Jasa Pembuatan Website Custom & Aplikasi Web",
    metaDesc:
      "Jasa pembuatan website custom dan aplikasi web dengan SvelteKit, React, Astro, PHP/Laravel, atau Go, dibangun sesuai alur kerja bisnis Anda. Konsultasi gratis.",
    ogImage: "/og/website-custom.jpg",
    updatedAt: "2026-10-09",
    keywords: [
      "jasa website custom",
      "web app development indonesia",
      "jasa pembuat framework laravel react",
      "pengembangan aplikasi web",
      "custom web development",
    ],
    shortDesc:
      "Aplikasi web yang dibangun khusus untuk alur kerja bisnis Anda, dengan teknologi yang dipilih sesuai kebutuhan dan anggaran.",
    answer: {
      heading: "Apa itu website custom dan aplikasi web?",
      text: "Website custom dan aplikasi web adalah sistem yang dibangun khusus untuk alur kerja tertentu, bukan template atau CMS siap pakai. Cocok jika Anda butuh fitur yang tidak tersedia di CMS biasa, misalnya dashboard, sistem booking, portal pelanggan, integrasi pembayaran, atau pengolahan data khusus.",
    },
    intro:
      "Kalau kebutuhan Anda tidak bisa ditampung oleh template atau CMS biasa, aplikasi web yang dibangun khusus bisa jadi pilihan. Kami mengerjakan sistem dengan SvelteKit, React atau Next.js, Astro, PHP (termasuk Laravel), dan Go. Pilihan teknologinya mengikuti kebutuhan dan anggaran Anda, bukan sebaliknya. Contoh yang bisa Anda lihat langsung ada di bagian demo proyek: toko online dengan pembayaran dan ongkir otomatis, CRM, Mini ERP keuangan, dan sistem booking rental mobil. Semuanya demo buatan sendiri, bukan proyek klien.",
    features: [
      "Pemilihan teknologi yang disesuaikan kebutuhan, skala, dan anggaran Anda",
      "Perancangan database relasional yang terstruktur",
      "REST API untuk menghubungkan sistem dengan aplikasi atau layanan lain",
      "Login dan hak akses pengguna berbasis peran",
      "Praktik keamanan dasar: validasi input, penyimpanan password ter-hash, dan perlindungan dari serangan umum seperti XSS dan CSRF, dengan mengacu pada OWASP Top 10",
      "Deploy ke hosting yang sesuai, misalnya Cloudflare, VPS, atau shared hosting",
      "Panduan pemakaian dasar untuk tim Anda dan pendampingan awal setelah rilis",
    ],
    problems: {
      heading: "Tanda Anda butuh aplikasi web custom",
      items: [
        {
          title: "CMS atau template tidak cukup",
          desc: "Alur bisnis Anda punya aturan khusus, misalnya perhitungan harga, persetujuan, atau jadwal, yang tidak bisa diwakili plugin biasa.",
        },
        {
          title: "Proses masih manual",
          desc: "Tim Anda memindahkan data antar spreadsheet, chat, dan catatan secara manual, sehingga lambat dan rawan salah.",
        },
        {
          title: "Butuh integrasi",
          desc: "Anda ingin sistem terhubung dengan payment gateway, ekspedisi, atau layanan lain, tetapi aplikasi yang ada tidak mendukungnya.",
        },
        {
          title: "Butuh akses terbatas per pengguna",
          desc: "Beberapa orang perlu melihat data berbeda, misalnya admin, staf, dan pelanggan, dalam satu sistem.",
        },
      ],
    },
    process: {
      heading: "Alur pengembangan aplikasi web",
      items: [
        {
          title: "Diskusi kebutuhan",
          desc: "Kami memahami alur kerja yang ingin disederhanakan, pengguna sistemnya, dan batasan anggaran serta waktu.",
        },
        {
          title: "Perancangan dan penentuan lingkup",
          desc: "Fitur dibagi menjadi yang wajib dan opsional, lalu struktur data dan tampilan dirancang sebelum coding.",
        },
        {
          title: "Pengembangan bertahap",
          desc: "Aplikasi dibangun per bagian dan diuji, sehingga Anda bisa memberi masukan sebelum semuanya selesai.",
        },
        {
          title: "Rilis dan pendampingan",
          desc: "Aplikasi dirilis, tim Anda mendapat panduan, dan kami mendampingi di masa awal pemakaian.",
        },
      ],
    },
    faqs: [
      {
        q: "Teknologi apa yang kalian pakai?",
        a: "Kami mengerjakan dengan SvelteKit, React atau Next.js, Astro, PHP termasuk Laravel, dan Go. Pilihan akhirnya bergantung pada kebutuhan, skala, dan anggaran, dan kami jelaskan alasannya saat konsultasi.",
      },
      {
        q: "Apa bedanya dengan memakai CMS atau template?",
        a: "CMS dan template cepat dan murah untuk kebutuhan umum. Aplikasi custom dibuat untuk alur kerja yang tidak bisa diwakili CMS, tetapi waktu dan biayanya lebih besar. Kami akan bilang terus terang kalau kebutuhan Anda sebenarnya cukup dengan CMS.",
      },
      {
        q: "Berapa biaya pembuatannya?",
        a: "Termasuk Paket Custom, jadi harga ditentukan setelah kebutuhan dibahas. Faktor utamanya adalah jumlah fitur, integrasi, dan kompleksitas alur kerja.",
      },
      {
        q: "Apakah ada contoh yang bisa dicoba?",
        a: "Ada. Di halaman demo proyek tersedia toko online, CRM, Mini ERP keuangan, dan sistem booking rental mobil. Semuanya demo buatan sendiri, dan tidak semua punya tombol demo langsung.",
      },
      {
        q: "Bagaimana perawatan setelah aplikasi selesai?",
        a: "Pendampingan awal setelah rilis sudah termasuk. Untuk perawatan berkelanjutan seperti pembaruan, backup, dan perbaikan, tersedia layanan maintenance terpisah.",
      },
    ],
    related: ["sistem-erp-pos", "maintenance-website", "optimasi-kecepatan"],
  },
  {
    slug: "maintenance-website",
    title: "Jasa Maintenance & Pemeliharaan Website Berkala",
    metaTitle: "Jasa Maintenance Website Berkala: Backup, Update & Perbaikan",
    metaDesc:
      "Jasa maintenance website berkala: backup, pembaruan, perbaikan error, dan pemantauan agar website tetap aman dan berfungsi. Konsultasi via WhatsApp.",
    ogImage: "/og/maintenance-website.jpg",
    updatedAt: "2026-10-09",
    keywords: [
      "jasa maintenance website",
      "pemeliharaan web berkala",
      "perbaikan website rusak error",
      "jasa backup & keamanan website",
      "update konten website",
    ],
    shortDesc:
      "Perawatan rutin agar website Anda tetap berfungsi, ter-backup, dan diperbarui, sehingga tim Anda tidak perlu mengurus masalah teknis sendiri.",
    answer: {
      heading: "Apa itu maintenance website?",
      text: "Maintenance website adalah perawatan rutin agar website tetap aman dan berfungsi: pembaruan perangkat lunak, backup, pemantauan, perbaikan error, dan pembaruan konten. Tanpa perawatan, website berisiko error setelah pembaruan, kehilangan data saat ada masalah, atau punya celah keamanan yang tidak tertambal.",
    },
    intro:
      "Website yang dibiarkan tanpa perawatan perlahan bermasalah: pustaka perangkat lunak ketinggalan versi, ada tautan rusak, backup tidak pernah dibuat, dan masalah baru ketahuan setelah pengunjung mengeluh. Layanan maintenance kami menangani hal-hal rutin itu supaya Anda bisa fokus ke bisnis. Cakupan, frekuensi backup, dan waktu respons kami sepakati di awal sesuai kebutuhan dan hosting yang dipakai, supaya tidak ada janji yang tidak bisa dipenuhi.",
    features: [
      "Backup berkala, dengan frekuensi menyesuaikan hosting dan kebutuhan Anda",
      "Pembaruan CMS, plugin, atau dependency agar tidak ketinggalan versi",
      "Pemantauan uptime dengan notifikasi saat website tidak bisa diakses",
      "Perbaikan error teknis, masalah tampilan, dan tautan rusak",
      "Pengecekan keamanan dasar, seperti sertifikat SSL dan akses admin",
      "Bantuan memperbarui teks, gambar, dan konten produk",
      "Laporan singkat berkala tentang apa yang sudah dikerjakan",
    ],
    problems: {
      heading: "Tanda website Anda butuh maintenance",
      items: [
        {
          title: "Tidak ada backup",
          desc: "Kalau terjadi kerusakan atau kesalahan, Anda tidak punya salinan yang aman untuk dipulihkan.",
        },
        {
          title: "Error muncul setelah pembaruan",
          desc: "Sebagian fitur berhenti bekerja setelah ada pembaruan, dan tidak ada yang menangani dengan cepat.",
        },
        {
          title: "Tautan dan halaman rusak",
          desc: "Pengunjung menemukan halaman kosong atau tautan mati, yang mengurangi kepercayaan.",
        },
        {
          title: "Tidak ada yang memantau",
          desc: "Website bisa mati berjam-jam tanpa disadari karena tidak ada notifikasi.",
        },
      ],
    },
    process: {
      heading: "Cara kerja layanan maintenance",
      items: [
        {
          title: "Pengecekan kondisi awal",
          desc: "Kami memeriksa teknologi, hosting, backup, dan masalah yang sudah ada pada website Anda.",
        },
        {
          title: "Kesepakatan cakupan",
          desc: "Frekuensi backup, jenis pekerjaan, dan waktu respons disepakati tertulis di awal.",
        },
        {
          title: "Perawatan rutin",
          desc: "Pembaruan, backup, pemantauan, dan perbaikan dijalankan sesuai kesepakatan.",
        },
        {
          title: "Laporan",
          desc: "Anda menerima ringkasan pekerjaan dan saran bila ada hal yang perlu ditingkatkan.",
        },
      ],
    },
    faqs: [
      {
        q: "Apakah ada jaminan website tidak pernah mati?",
        a: "Tidak ada yang bisa menjamin uptime 100%, karena ketersediaan juga dipengaruhi penyedia hosting. Kami memantau dan menindaklanjuti gangguan sesuai waktu respons yang disepakati.",
      },
      {
        q: "Apakah bisa untuk website yang dibuat orang lain?",
        a: "Bisa, setelah kami cek dulu kondisi dan teknologinya. Tidak semua website bisa kami terima, dan kami sampaikan terus terang jika tidak cocok.",
      },
      {
        q: "Berapa biaya maintenance?",
        a: "Bergantung pada ukuran website dan cakupan perawatan. Setelah pengecekan awal, kami beri penawaran bulanan yang jelas.",
      },
      {
        q: "Apakah termasuk pembaruan konten?",
        a: "Bantuan memperbarui teks, gambar, dan konten produk bisa dimasukkan ke cakupan. Batas jumlah perubahan per bulan kami sepakati di awal.",
      },
    ],
    related: ["optimasi-kecepatan", "redesign-ui-ux"],
  },
  {
    slug: "redesign-ui-ux",
    title: "Jasa Redesign Website & UI/UX Modern",
    metaTitle: "Jasa Redesign Website & UI/UX Modern",
    metaDesc:
      "Jasa redesign website: tampilan lebih modern, responsif, dan mudah dipakai, tanpa kehilangan URL dan SEO penting. Konsultasi gratis via WhatsApp.",
    ogImage: "/og/redesign-ui-ux.jpg",
    updatedAt: "2026-10-09",
    keywords: [
      "jasa redesign website",
      "desain ulang tampilan web",
      "jasa ui ux designer website",
      "modernisasi website lama",
      "perbaikan ux website",
    ],
    shortDesc:
      "Tampilan dan alur website lama dirapikan agar lebih modern, nyaman dipakai di HP, dan lebih jelas mengarahkan pengunjung.",
    answer: {
      heading: "Apa itu redesign website?",
      text: "Redesign website adalah proses merancang ulang tampilan dan alur penggunaan website yang sudah ada, tanpa membuangnya sama sekali. Tujuannya membuat website lebih modern, mudah dipakai terutama di HP, dan lebih jelas mengarahkan pengunjung, sambil menjaga URL dan konten penting agar nilai SEO tidak hilang sia-sia.",
    },
    intro:
      "Website yang tampilannya usang atau sulit dipakai membuat calon pelanggan ragu, apa pun kualitas produk Anda. Kami meninjau website yang ada, memetakan apa yang membingungkan, lalu merancang ulang tampilan dan alurnya. Peninjauan dilakukan berdasarkan praktik umum desain dan penggunaan, ditambah data analytics Anda bila tersedia. Konten dan URL yang sudah punya nilai di Google dipertahankan, dan URL yang harus berubah diarahkan dengan redirect 301 supaya pengunjung dan mesin pencari tidak tersesat.",
    features: [
      "Peninjauan struktur halaman, navigasi, dan alur penggunaan website lama",
      "Desain antarmuka baru yang sesuai identitas brand",
      "Perbaikan pengalaman pengguna: navigasi, tombol ajakan bertindak, dan formulir",
      "Penyesuaian tampilan untuk pengguna HP",
      "Redirect 301 untuk URL yang berubah agar nilai SEO tidak hilang sia-sia",
      "Konten lama dipertahankan atau dirapikan sesuai kebutuhan",
      "Opsi digabung dengan optimasi kecepatan bila website lama lambat",
    ],
    problems: {
      heading: "Tanda website Anda perlu redesign",
      items: [
        {
          title: "Tampilannya terlihat usang",
          desc: "Calon pelanggan menilai kualitas bisnis dari tampilan website, dan tampilan lama bisa mengurangi kepercayaan.",
        },
        {
          title: "Sulit dipakai di HP",
          desc: "Tulisan kecil, tombol rapat, atau tampilan terpotong membuat pengunjung HP kesulitan.",
        },
        {
          title: "Pengunjung bingung harus ke mana",
          desc: "Menu terlalu banyak atau ajakan bertindak tidak jelas, sehingga pengunjung tidak menghubungi Anda.",
        },
        {
          title: "Sulit diperbarui",
          desc: "Mengubah satu teks saja butuh bantuan orang lain atau waktu lama.",
        },
      ],
    },
    process: {
      heading: "Alur redesign website",
      items: [
        {
          title: "Peninjauan website lama",
          desc: "Kami mencatat struktur, konten penting, dan masalah penggunaan, termasuk URL yang perlu dipertahankan.",
        },
        {
          title: "Rancangan baru",
          desc: "Tampilan dan susunan halaman dirancang ulang sesuai brand, lalu didiskusikan dengan Anda.",
        },
        {
          title: "Pembangunan dan migrasi",
          desc: "Rancangan dibangun, konten dipindahkan, dan redirect dipasang untuk URL yang berubah.",
        },
        {
          title: "Pengujian dan rilis",
          desc: "Kami menguji tampilan dan tautan di berbagai perangkat sebelum website baru dirilis.",
        },
      ],
    },
    faqs: [
      {
        q: "Apakah SEO website lama akan hilang setelah redesign?",
        a: "Kami berusaha menjaganya dengan mempertahankan URL dan konten penting serta memasang redirect 301 untuk URL yang berubah. Namun perubahan besar pada website tetap bisa memengaruhi posisi di Google untuk sementara, jadi tidak ada janji bahwa peringkat pasti tetap.",
      },
      {
        q: "Apakah semua konten website lama ikut dipindahkan?",
        a: "Konten yang masih relevan dipindahkan atau dirapikan. Konten yang sudah usang kami diskusikan dengan Anda sebelum dihapus.",
      },
      {
        q: "Berapa lama dan berapa biaya redesign?",
        a: "Bergantung pada jumlah halaman dan tingkat perubahan. Setelah meninjau website Anda, kami beri penawaran dan estimasi waktu yang jelas.",
      },
      {
        q: "Apakah redesign bisa sekaligus mempercepat website?",
        a: "Bisa. Redesign sering menjadi kesempatan yang baik untuk merapikan gambar dan kode. Optimasi kecepatan yang lebih mendalam tersedia sebagai layanan tersendiri.",
      },
    ],
    related: ["optimasi-kecepatan", "company-profile", "maintenance-website"],
  },
  {
    slug: "optimasi-kecepatan",
    title: "Jasa Optimasi Kecepatan Website & Core Web Vitals",
    metaTitle: "Jasa Optimasi Kecepatan Website, PageSpeed & Core Web Vitals",
    metaDesc:
      "Website lambat? Percepat loading & perbaiki skor PageSpeed Insights serta Core Web Vitals (LCP, INP, CLS). Ada laporan sebelum–sesudah. Konsultasi gratis.",
    ogImage: "/og/optimasi-kecepatan.jpg",
    updatedAt: "2026-10-09",
    keywords: [
      "jasa optimasi kecepatan website",
      "jasa mempercepat website",
      "jasa optimasi pagespeed",
      "jasa optimasi speed website",
      "jasa speed up website",
      "optimasi core web vitals",
      "perbaiki skor pagespeed insights",
    ],
    shortDesc:
      "Website lambat membuat pengunjung pergi sebelum halaman selesai dimuat. Kami mempercepat website Anda dan memperbaiki skor PageSpeed Insights serta Core Web Vitals berdasarkan hasil audit, bukan tebakan.",
    answer: {
      heading: "Apa itu jasa optimasi kecepatan website?",
      text: "Jasa optimasi kecepatan website adalah proses mengukur penyebab website lambat, lalu memperbaikinya: gambar, JavaScript, font, skrip pihak ketiga, caching, dan respons server. Targetnya Core Web Vitals berstatus Baik (LCP ≤ 2,5 detik, INP ≤ 200 ms, CLS ≤ 0,1) dan skor PageSpeed Insights yang ikut membaik.",
    },
    intro:
      "Website yang lambat membuat pengunjung pergi sebelum sempat membaca penawaran Anda, dan anggaran iklan ikut terbuang untuk klik yang tidak berubah menjadi prospek. Kami mempercepat website dengan pendekatan berbasis pengukuran: mengukur kondisi awal, mencari penyebab lambat yang sebenarnya, memperbaiki yang paling berdampak, lalu mengukur ulang. Core Web Vitals memang salah satu sinyal pengalaman halaman di Google, tetapi manfaat yang paling terasa biasanya ada di pengunjung yang bertahan lebih lama dan konversi yang lebih baik. Sebagai gambaran proses kerjanya, kami menulis studi kasus optimasi PageSpeed pada website jadikanweb.id sendiri di blog, lengkap dengan hal yang belum berhasil.",
    features: [
      "Audit awal: PageSpeed Insights (mobile & desktop), GTmetrix, dan data lapangan Core Web Vitals di Search Console bila tersedia",
      "Perbaikan LCP, INP, dan CLS sesuai penyebab nyata di website Anda",
      "Kompresi dan konversi gambar ke WebP/AVIF, ukuran gambar responsif, dan lazy loading",
      "Minifikasi CSS/JS, pangkas render-blocking, optimasi font, dan tunda skrip pihak ketiga (analytics, pixel, live chat) yang membebani halaman",
      "Konfigurasi caching, kompresi Brotli/Gzip, dan CDN untuk menurunkan waktu respons server (TTFB)",
      "Laporan sebelum–sesudah beserta daftar perubahan yang dilakukan",
    ],
    problems: {
      heading: "Tanda website Anda perlu dioptimasi",
      items: [
        {
          title: "Skor mobile rendah",
          desc: "Skor PageSpeed Insights di mobile merah atau oranye, atau laporan Data Web Inti di Search Console berstatus Buruk atau Perlu ditingkatkan.",
        },
        {
          title: "Halaman terasa lambat di HP",
          desc: "Pengunjung harus menunggu lama sebelum konten tampil atau tombol bisa diklik, terutama dengan koneksi seluler biasa.",
        },
        {
          title: "Iklan ramai klik, sedikit prospek",
          desc: "Landing page yang lambat membuat sebagian pengunjung pergi sebelum halaman selesai dimuat, padahal biaya klik sudah terbayar.",
        },
        {
          title: "Tampilan melompat saat dimuat",
          desc: "Tombol atau teks bergeser sendiri ketika gambar dan iklan muncul, sehingga pengunjung salah klik. Inilah yang diukur oleh CLS.",
        },
      ],
    },
    metrics: {
      heading: "Target yang kami ukur (kategori “Baik” menurut Google)",
      items: [
        { title: "LCP ≤ 2,5 detik", desc: "Kecepatan konten utama (gambar atau judul terbesar) tampil di layar." },
        { title: "INP ≤ 200 ms", desc: "Kecepatan halaman merespons saat diklik, diketuk, atau diketik." },
        { title: "CLS ≤ 0,1", desc: "Stabilitas tampilan: elemen tidak bergeser ketika halaman dimuat." },
      ],
    },
    process: {
      heading: "Cara kami mempercepat website Anda",
      items: [
        {
          title: "Audit dan baseline",
          desc: "Kami mengukur kondisi saat ini lewat data lab (PageSpeed Insights, GTmetrix) dan data pengunjung nyata bila tersedia, lalu mencatat angka awal.",
        },
        {
          title: "Tentukan prioritas",
          desc: "Penyebab lambat diurutkan berdasarkan dampak: gambar, JavaScript, font, skrip pihak ketiga, atau server.",
        },
        {
          title: "Perbaikan bertahap",
          desc: "Perubahan dikerjakan setelah backup dan diuji, supaya desain dan fungsi website tetap sama.",
        },
        {
          title: "Uji ulang dan laporan",
          desc: "Kami mengukur ulang, menyerahkan laporan sebelum–sesudah, dan memberi saran lanjutan bila masih ada yang perlu dibenahi.",
        },
      ],
    },
    faqs: [
      {
        q: "Apakah skor PageSpeed pasti 90+?",
        a: "Tidak ada yang bisa menjanjikan angka pasti sebelum website diaudit. Targetnya adalah Core Web Vitals berstatus Baik dan skor hijau di PageSpeed Insights. Hasil akhirnya bergantung pada tema atau framework, hosting, ukuran konten, dan skrip pihak ketiga. Setelah audit, kami jelaskan batas yang realistis untuk website Anda.",
      },
      {
        q: "Apa bedanya skor PageSpeed dengan Core Web Vitals?",
        a: "Skor PageSpeed Insights adalah hasil simulasi di lab. Core Web Vitals yang dinilai Google berasal dari data pengunjung nyata (Chrome UX Report) dalam rentang sekitar 28 hari. Karena itu skor bisa membaik langsung, sedangkan status di Search Console baru ikut membaik beberapa minggu kemudian.",
      },
      {
        q: "Apakah ada contoh hasilnya?",
        a: "Ada satu studi kasus di blog kami: optimasi website jadikanweb.id sendiri, di mana Speed Index turun dari 4,1 ke 2,0 detik dan skor aksesibilitas naik dari 84 ke 96 pada hasil tes kami, termasuk hal yang belum berhasil. Itu website kami sendiri, bukan klien, dan hasil tiap website berbeda.",
      },
      {
        q: "Website berbasis apa saja yang bisa dioptimasi?",
        a: "Kami menangani website PHP/Laravel, React/Next.js, SvelteKit, dan Astro. Untuk platform lain, kami cek kecocokannya saat audit karena ruang optimasi tiap platform berbeda.",
      },
      {
        q: "Apakah tampilan website akan berubah?",
        a: "Tidak. Tujuannya mempercepat tanpa mengubah desain dan fungsi. Kami membuat backup sebelum mengubah apa pun dan menguji hasilnya sebelum diserahkan.",
      },
      {
        q: "Apakah website lebih cepat otomatis naik peringkat di Google?",
        a: "Tidak otomatis. Kecepatan adalah salah satu sinyal pengalaman halaman, sedangkan relevansi dan kualitas konten tetap faktor utama. Website yang cepat membantu pengunjung bertahan dan berkonversi, serta menghilangkan hambatan teknis yang bisa menahan peringkat.",
      },
      {
        q: "Berapa biaya dan lama pengerjaannya?",
        a: "Bergantung pada ukuran dan kondisi website. Setelah audit awal, kami memberi penawaran dan estimasi waktu yang jelas. Hubungi kami lewat WhatsApp untuk konsultasi gratis.",
      },
    ],
    related: ["landing-page", "website-custom", "maintenance-website", "redesign-ui-ux"],
  },
];