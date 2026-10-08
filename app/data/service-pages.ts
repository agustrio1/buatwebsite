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
    metaDesc: "Buat website company profile profesional, cepat, dan SEO-friendly. Tingkatkan kredibilitas & branding bisnis Anda secara online. Konsultasi gratis!",
    ogImage: "/og/company-profile.jpg",
    keywords: [
      "jasa website company profile",
      "buat website profil perusahaan",
      "biaya bikin company profile",
      "website bisnis profesional",
      "web developer company profile"
    ],
    shortDesc: "Tingkatkan kredibilitas dan jangkauan bisnis dengan website profil perusahaan yang modern, responsif, dan SEO-friendly.",
    intro:
      "Website company profile adalah aset utama untuk membangun kepercayaan klien dan investor. Kami merancang website profil perusahaan dengan performa tinggi, struktur konten teruji, dan optimasi SEO lokal untuk memperkuat positioning brand Anda di pasar digital.",
    features: [
      "Desain kustom eksklusif yang disesuaikan dengan Brand Guidelines",
      "Struktur navigasi intuitif & ramah perangkat mobile (Mobile-First)",
      "Fitur formulir kontak & CTAs terintegrasi langsung ke WhatsApp",
      "Optimasi SEO On-Page dasar (Meta Tag, Schema Markup, & XML Sitemap)",
      "Sistem CMS yang mudah dikelola untuk memperbarui konten & berita"
    ],
    related: ["optimasi-kecepatan", "redesign-ui-ux", "maintenance-website"],
  },
  {
    slug: "sistem-erp-pos",
    title: "Jasa Pembuatan Sistem ERP & POS Kasir Custom",
    metaTitle: "Jasa Pembuatan Sistem ERP & POS Custom Berbasis Web",
    metaDesc: "Pengembangan sistem ERP & POS kasir berbasis web custom. Kelola inventori, keuangan, dan operasional bisnis secara efisien & real-time.",
    ogImage: "/og/sistem-erp-pos.jpg",
    keywords: [
      "jasa pembuatan sistem erp",
      "sistem pos custom berbasis web",
      "aplikasi kasir perusahaan",
      "software manajemen inventori",
      "pengembangan software kustom"
    ],
    shortDesc: "Otomatisasi operasional, stok barang, dan laporan keuangan bisnis Anda dengan software ERP & POS berbasis web yang dinamis.",
    intro:
      "Setiap skema bisnis memiliki alur kerja yang unik. Kami mengembangkan software ERP dan POS berbasis web yang disesuaikan 100% dengan kebutuhan operasional perusahaan Anda—dari manajemen stok multi-gudang hingga laporan keuangan terintegrasi.",
    features: [
      "Manajemen inventori & pelacakan stok multi-cabang secara real-time",
      "Sistem kasir (POS) responsif dengan opsi transaksi online/offline",
      "Dashboard analitik penjualan & laporan keuangan terotomatisasi",
      "Manajemen Role & Hak Akses Berjenjang (RBAC) untuk keamanan data",
      "Arsitektur API terbuka yang siap diintegrasikan dengan sistem existing"
    ],
    related: ["website-custom", "maintenance-website"],
  },
  {
    slug: "toko-online",
    title: "Jasa Pembuatan Website Toko Online / E-Commerce",
    metaTitle: "Jasa Pembuatan Toko Online E-Commerce Siap Pakai & Cepat",
    metaDesc: "Toko online e-commerce modern terintegrasi payment gateway & cek ongkir otomatis. Tingkatkan omzet penjualan 24/7. Cek penawarannya!",
    ogImage: "/og/toko-online.jpg",
    keywords: [
      "jasa toko online e-commerce",
      "buat web e-commerce custom",
      "website jualan online",
      "integrasi payment gateway indonesia",
      "toko online cek ongkir otomatis"
    ],
    shortDesc: "Bangun platform e-commerce mandiri dengan integrasi payment gateway, kalkulator ongkir otomatis, dan pengalaman checkout tanpa hambatan.",
    intro:
      "Miliki toko online sendiri tanpa bergantung penuh pada marketplace. Kami membangun platform e-commerce yang cepat, aman, dan dirancang khusus untuk memaksimalkan tingkat konversi (Conversion Rate Optimization) serta kenyamanan belanja pelanggan.",
    features: [
      "Katalog produk dinamis dengan filter varian, pencarian, dan kategori",
      "Integrasi Payment Gateway otomatis (QRIS, Transfer Bank, E-Wallet)",
      "Hitung ongkos kirim otomatis terintegrasi kurir logistik Indonesia",
      "Manajemen pesanan, stok, dan laporan transaksi yang simpel",
      "Performa loading tinggi yang dioptimalkan untuk transaksi mobile"
    ],
    related: ["optimasi-kecepatan", "maintenance-website", "website-custom"],
  },
  {
    slug: "landing-page",
    title: "Jasa Pembuatan Landing Page High-Conversion",
    metaTitle: "Jasa Pembuatan Landing Page Cepat & High Conversion",
    metaDesc: "Tingkatkan hasil iklan Ads dengan landing page berkonversi tinggi. Copywriting persuasif, loading cepat & integrasi tracking lengkap.",
    ogImage: "/og/landing-page.jpg",
    keywords: [
      "jasa buat landing page",
      "landing page iklan google ads",
      "landing page iklan tiktok facebook",
      "jasa desain landing page konversi",
      "landing page murah profesional"
    ],
    shortDesc: "Maksimalkan hasil iklan Google Ads & Social Media Ads Anda dengan landing page berkecepatan tinggi yang fokus pada konversi.",
    intro:
      "Landing page yang lambat dan berantakan membuang anggaran iklan Anda. Kami merancang landing page dengan pendekatan neuro-marketing, struktur terarah, serta kecepatan akselerasi tinggi agar setiap klik menghasilkan prospek bisnis (leads) atau penjualan.",
    features: [
      "Struktur Copywriting persuasif yang berfokus pada Conversion Rate",
      "Kecepatan pemuatan halaman (speed score) di atas rata-rata",
      "Integrasi pixel tracking (Google Analytics 4, Meta Pixel, TikTok Pixel)",
      "Call-to-Action (CTA) interaktif yang menuntun pengunjung ke penjualan",
      "Desain adaptif tanpa gangguan navigasi berlebih (Distraction-Free)"
    ],
    related: ["optimasi-kecepatan", "company-profile"],
  },
  {
    slug: "website-custom",
    title: "Jasa Pembuatan Website Custom Framework & Web App",
    metaTitle: "Jasa Pembuatan Website Custom Framework & Aplikasi Web",
    metaDesc: "Pengembangan website custom & aplikasi web dengan Laravel, React, atau Next.js. Solusi teknis scalable sesuai spesifikasi bisnis.",
    ogImage: "/og/website-custom.jpg",
    keywords: [
      "jasa website custom",
      "web app development indonesia",
      "jasa pembuat framework laravel react",
      "pengembangan aplikasi web skala besar",
      "custom web development"
    ],
    shortDesc: "Solusi pengembangan aplikasi web skala besar berbasis framework modern (Laravel, React, Node.js) yang fleksibel dan terukur.",
    intro:
      "Jika kebutuhan aplikasi atau bisnis Anda tidak bisa ditampung oleh CMS biasa, solusi web kustom adalah jawabannya. Kami membangun arsitektur aplikasi web dari nol menggunakan stack teknologi modern yang aman, skalabel, dan tahan terhadap lalu lintas pengunjung tinggi.",
    features: [
      "Pengembangan dengan tech stack modern (Laravel, React, Next.js, TailWind)",
      "Perancangan database relasional yang terstruktur & teroptimasi",
      "Arsitektur RESTful API / GraphQL untuk integrasi antar platform",
      "Keamanan tingkat tinggi terhadap kerentanan OWASP Top 10",
      "Dokumentasi kode lengkap & pendampingan teknis jangka panjang"
    ],
    related: ["sistem-erp-pos", "maintenance-website", "optimasi-kecepatan"],
  },
  {
    slug: "maintenance-website",
    title: "Jasa Maintenance & Pemeliharaan Website Berkala",
    metaTitle: "Jasa Maintenance Website Profesional, Aman & Terawat",
    metaDesc: "Layanan maintenance website berkala: backup data, update keamanan, perbaikan bug, & optimasi performa agar web selalu lancar.",
    ogImage: "/og/maintenance-website.jpg",
    keywords: [
      "jasa maintenance website",
      "pemeliharaan web berkala",
      "perbaikan website rusak error",
      "jasa backup & keamanan website",
      "update konten website"
    ],
    shortDesc: "Bebaskan tim Anda dari masalah teknis. Kami menjaga keamanan, kecepatan, dan pembaruan rutin website Anda setiap bulan.",
    intro:
      "Website yang terabaikan rawan terkena malware, peretasan, dan penurunan performa yang merusak reputasi di mata Google. Layanan maintenance kami memastikan infrastruktur website Anda selalu diperbarui, aman dari peretasan, dan memiliki backup data berkala.",
    features: [
      "Pemeriksaan keamanan, scanning malware, & pembaruan patch rutin",
      "Pencadangan data (Backup) otomatis harian/mingguan ke cloud terpisah",
      "Monitoring Uptime 24/7 dan penanganan cepat jika terjadi downtime",
      "Perbaikan error teknis, masalah tampilan, serta perbaikan broken link",
      "Bantuan rutin untuk pembaruan teks, gambar, dan konten produk"
    ],
    related: ["optimasi-kecepatan", "redesign-ui-ux"],
  },
  {
    slug: "redesign-ui-ux",
    title: "Jasa Redesign Website & UI/UX Modern",
    metaTitle: "Jasa Redesign Website & UI/UX Modern Berbasis Data",
    metaDesc: "Ubah tampilan website lama menjadi lebih modern, responsif, & mudah digunakan. Tingkatkan brand image dan kenyamanan pengunjung.",
    ogImage: "/og/redesign-ui-ux.jpg",
    keywords: [
      "jasa redesign website",
      "desain ulang tampilan web",
      "jasa ui ux designer website",
      "modernisasi website lama",
      "perbaikan ux website"
    ],
    shortDesc: "Transformasi website lama yang kaku menjadi lebih modern, estetik, dan nyaman digunakan untuk meningkatkan interaksi pengunjung.",
    intro:
      "Tampilan website yang usang dapat menurunkan tingkat kepercayaan calon konsumen. Kami melakukan audit UX mendalam dan merancang ulang antarmuka website Anda agar tampil trendi, cepat diakses, dan memberikan pengalaman pengguna yang unggul di semua ukuran layar.",
    features: [
      "Audit UX komprehensif pada struktur dan alur navigasi website lama",
      "Perancangan antarmuka (UI Design) baru yang segar & sesuai identitas brand",
      "Perbaikan pengalaman pengguna (UX) untuk menekan Bounce Rate",
      "Optimasi tampilan visual khusus pengguna smartphone (Mobile Usability)",
      "Proses migrasi aman tanpa menghilangkan nilai SEO & data lama"
    ],
    related: ["optimasi-kecepatan", "company-profile", "maintenance-website"],
  },
  {
    slug: "optimasi-kecepatan",
    title: "Jasa Optimasi Kecepatan Website & Core Web Vitals",
    metaTitle: "Jasa Optimasi Kecepatan Website, PageSpeed & Core Web Vitals",
    metaDesc: "Website lambat? Percepat loading & perbaiki skor PageSpeed Insights serta Core Web Vitals (LCP, INP, CLS). Ada laporan sebelum–sesudah. Konsultasi gratis.",
    ogImage: "/og/optimasi-kecepatan.jpg",
    updatedAt: "2026-10-08",
    keywords: [
      "jasa optimasi kecepatan website",
      "jasa mempercepat website",
      "jasa optimasi pagespeed",
      "jasa optimasi speed website",
      "jasa speed up website",
      "optimasi core web vitals",
      "perbaiki skor pagespeed insights"
    ],
    shortDesc: "Website lambat membuat pengunjung pergi sebelum halaman selesai dimuat. Kami mempercepat website Anda dan memperbaiki skor PageSpeed Insights serta Core Web Vitals berdasarkan hasil audit, bukan tebakan.",
    answer: {
      heading: "Apa itu jasa optimasi kecepatan website?",
      text: "Jasa optimasi kecepatan website adalah proses mengukur penyebab website lambat, lalu memperbaikinya: gambar, JavaScript, font, skrip pihak ketiga, caching, dan respons server. Targetnya Core Web Vitals berstatus Baik (LCP ≤ 2,5 detik, INP ≤ 200 ms, CLS ≤ 0,1) dan skor PageSpeed Insights yang ikut membaik."
    },
    intro:
      "Website yang lambat membuat pengunjung pergi sebelum sempat membaca penawaran Anda, dan anggaran iklan ikut terbuang untuk klik yang tidak berubah menjadi prospek. Kami mempercepat website dan memperbaiki skor PageSpeed dengan pendekatan berbasis data: mengukur kondisi awal, mencari penyebab lambat yang sebenarnya, memperbaiki yang paling berdampak, lalu mengukur ulang. Core Web Vitals memang salah satu sinyal pengalaman halaman di Google, tetapi manfaat yang paling terasa biasanya ada di pengunjung yang bertahan lebih lama dan konversi yang lebih baik.",
    features: [
      "Audit awal: PageSpeed Insights (mobile & desktop), GTmetrix, dan data lapangan Core Web Vitals di Search Console bila tersedia",
      "Perbaikan LCP, INP, dan CLS sesuai penyebab nyata di website Anda",
      "Kompresi dan konversi gambar ke WebP/AVIF, ukuran gambar responsif, dan lazy loading",
      "Minifikasi CSS/JS, pangkas render-blocking, optimasi font, dan tunda skrip pihak ketiga (analytics, pixel, live chat) yang membebani halaman",
      "Konfigurasi caching, kompresi Brotli/Gzip, dan CDN untuk menurunkan waktu respons server (TTFB)",
      "Laporan sebelum–sesudah beserta daftar perubahan yang dilakukan"
    ],
    problems: {
      heading: "Tanda website Anda perlu dioptimasi",
      items: [
        {
          title: "Skor mobile rendah",
          desc: "Skor PageSpeed Insights di mobile merah atau oranye, atau laporan Data Web Inti di Search Console berstatus Buruk atau Perlu ditingkatkan."
        },
        {
          title: "Halaman terasa lambat di HP",
          desc: "Pengunjung harus menunggu lama sebelum konten tampil atau tombol bisa diklik, terutama dengan koneksi seluler biasa."
        },
        {
          title: "Iklan ramai klik, sedikit prospek",
          desc: "Landing page yang lambat membuat sebagian pengunjung pergi sebelum halaman selesai dimuat, padahal biaya klik sudah terbayar."
        },
        {
          title: "Tampilan melompat saat dimuat",
          desc: "Tombol atau teks bergeser sendiri ketika gambar dan iklan muncul, sehingga pengunjung salah klik. Inilah yang diukur oleh CLS."
        }
      ]
    },
    metrics: {
      heading: "Target yang kami ukur (kategori “Baik” menurut Google)",
      items: [
        { title: "LCP ≤ 2,5 detik", desc: "Kecepatan konten utama (gambar atau judul terbesar) tampil di layar." },
        { title: "INP ≤ 200 ms", desc: "Kecepatan halaman merespons saat diklik, diketuk, atau diketik." },
        { title: "CLS ≤ 0,1", desc: "Stabilitas tampilan: elemen tidak bergeser ketika halaman dimuat." }
      ]
    },
    process: {
      heading: "Cara kami mempercepat website Anda",
      items: [
        {
          title: "Audit dan baseline",
          desc: "Kami mengukur kondisi saat ini lewat data lab (PageSpeed Insights, GTmetrix) dan data pengunjung nyata bila tersedia, lalu mencatat angka awal."
        },
        {
          title: "Tentukan prioritas",
          desc: "Penyebab lambat diurutkan berdasarkan dampak: gambar, JavaScript, font, skrip pihak ketiga, atau server."
        },
        {
          title: "Perbaikan bertahap",
          desc: "Perubahan dikerjakan setelah backup dan diuji, supaya desain dan fungsi website tetap sama."
        },
        {
          title: "Uji ulang dan laporan",
          desc: "Kami mengukur ulang, menyerahkan laporan sebelum–sesudah, dan memberi saran lanjutan bila masih ada yang perlu dibenahi."
        }
      ]
    },
    faqs: [
      {
        q: "Apakah skor PageSpeed pasti 90+?",
        a: "Tidak ada yang bisa menjanjikan angka pasti sebelum website diaudit. Targetnya adalah Core Web Vitals berstatus Baik dan skor hijau di PageSpeed Insights. Hasil akhirnya bergantung pada tema atau framework, hosting, ukuran konten, dan skrip pihak ketiga. Setelah audit, kami jelaskan batas yang realistis untuk website Anda."
      },
      {
        q: "Apa bedanya skor PageSpeed dengan Core Web Vitals?",
        a: "Skor PageSpeed Insights adalah hasil simulasi di lab. Core Web Vitals yang dinilai Google berasal dari data pengunjung nyata (Chrome UX Report) dalam rentang sekitar 28 hari. Karena itu skor bisa membaik langsung, sedangkan status di Search Console baru ikut membaik beberapa minggu kemudian."
      },
      {
        q: "Website berbasis apa saja yang bisa dioptimasi?",
        a: "Kami menangani website PHP/Laravel, React/Next.js, dan Astro. Untuk platform lain, kami cek kecocokannya saat audit karena ruang optimasi tiap platform berbeda."
      },
      {
        q: "Apakah tampilan website akan berubah?",
        a: "Tidak. Tujuannya mempercepat tanpa mengubah desain dan fungsi. Kami membuat backup sebelum mengubah apa pun dan menguji hasilnya sebelum diserahkan."
      },
      {
        q: "Apakah website lebih cepat otomatis naik peringkat di Google?",
        a: "Tidak otomatis. Kecepatan adalah salah satu sinyal pengalaman halaman, sedangkan relevansi dan kualitas konten tetap faktor utama. Website yang cepat membantu pengunjung bertahan dan berkonversi, serta menghilangkan hambatan teknis yang bisa menahan peringkat."
      },
      {
        q: "Berapa biaya dan lama pengerjaannya?",
        a: "Bergantung pada ukuran dan kondisi website. Setelah audit awal, kami memberi penawaran dan estimasi waktu yang jelas. Hubungi kami lewat WhatsApp untuk konsultasi gratis."
      }
    ],
    related: ["landing-page", "website-custom", "maintenance-website", "redesign-ui-ux"],
  },
];