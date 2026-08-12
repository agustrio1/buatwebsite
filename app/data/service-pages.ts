export type ServicePage = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  keywords: string[];
  shortDesc: string;
  intro: string;
  features: string[];
};

export const servicePages: ServicePage[] = [
  {
    slug: "company-profile",
    title: "Jasa Pembuatan Website Company Profile Profesional",
    metaTitle: "Jasa Pembuatan Website Company Profile Profesional & SEO",
    metaDesc: "Buat website company profile profesional, cepat, dan SEO-friendly. Tingkatkan kredibilitas & branding bisnis Anda secara online. Konsultasi gratis!",
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
  },
  {
    slug: "sistem-erp-pos",
    title: "Jasa Pembuatan Sistem ERP & POS Kasir Custom",
    metaTitle: "Jasa Pembuatan Sistem ERP & POS Custom Berbasis Web",
    metaDesc: "Pengembangan sistem ERP & POS kasir berbasis web custom. Kelola inventori, keuangan, dan operasional bisnis secara efisien & real-time.",
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
  },
  {
    slug: "toko-online",
    title: "Jasa Pembuatan Website Toko Online / E-Commerce",
    metaTitle: "Jasa Pembuatan Toko Online E-Commerce Siap Pakai & Cepat",
    metaDesc: "Toko online e-commerce modern terintegrasi payment gateway & cek ongkir otomatis. Tingkatkan omzet penjualan 24/7. Cek penawarannya!",
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
  },
  {
    slug: "landing-page",
    title: "Jasa Pembuatan Landing Page High-Conversion",
    metaTitle: "Jasa Pembuatan Landing Page Cepat & High Conversion",
    metaDesc: "Tingkatkan hasil iklan Ads dengan landing page berkonversi tinggi. Copywriting persuasif, loading cepat & integrasi tracking lengkap.",
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
  },
  {
    slug: "website-custom",
    title: "Jasa Pembuatan Website Custom Framework & Web App",
    metaTitle: "Jasa Pembuatan Website Custom Framework & Aplikasi Web",
    metaDesc: "Pengembangan website custom & aplikasi web dengan Laravel, React, atau Next.js. Solusi teknis scalable sesuai spesifikasi bisnis.",
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
  },
  {
    slug: "maintenance-website",
    title: "Jasa Maintenance & Pemeliharaan Website Berkala",
    metaTitle: "Jasa Maintenance Website Profesional, Aman & Terawat",
    metaDesc: "Layanan maintenance website berkala: backup data, update keamanan, perbaikan bug, & optimasi performa agar web selalu lancar.",
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
  },
  {
    slug: "redesign-ui-ux",
    title: "Jasa Redesign Website & UI/UX Modern",
    metaTitle: "Jasa Redesign Website & UI/UX Modern Berbasis Data",
    metaDesc: "Ubah tampilan website lama menjadi lebih modern, responsif, & mudah digunakan. Tingkatkan brand image dan kenyamanan pengunjung.",
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
  },
  {
    slug: "optimasi-kecepatan",
    title: "Jasa Optimasi Kecepatan Website & Core Web Vitals",
    metaTitle: "Jasa Optimasi Kecepatan Website & Core Web Vitals Google",
    metaDesc: "Percepat loading website hingga skor 90+ di PageSpeed Insights. Tingkatkan peringkat SEO & pengalaman pengguna secara drastis.",
    keywords: [
      "jasa optimasi kecepatan website",
      "cara mempercepat loading web",
      "optimasi core web vitals google",
      "perbaiki pagespeed insights 90+",
      "jasa speed up website"
    ],
    shortDesc: "Tingkatkan skor PageSpeed Insights hingga hijau (90+) dan lolos indikator Google Core Web Vitals untuk peringkat SEO yang lebih baik.",
    intro:
      "Kecepatan pemuatan halaman adalah salah satu faktor penentu peringkat terpenting di Google. Kami menganalisis kode, gambar, server, dan skrip pihak ketiga untuk menghilangkan hambatan teknis agar website Anda dapat dimuat secara instan.",
    features: [
      "Audit teknis menyeluruh pada skor LCP, INP, dan CLS (Core Web Vitals)",
      "Kompresi dan konversi format gambar ke generasi baru (WebP/AVIF)",
      "Minifikasi dan pembersihan file CSS, JS, serta pangkas render-blocking assets",
      "Penerapan mekanisme Caching mendalam & konfigurasinya di server/CDN",
      "Garansi peningkatan skor kecepatan di Google PageSpeed Insights & GTmetrix"
    ],
  },
];
