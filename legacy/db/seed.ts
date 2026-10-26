import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

import { users, siteSettings } from "./schema";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum dikonfigurasi pada file .env");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function main() {
  console.log("🌱 Memulai proses seeding database...");

  // ==========================================
  // 1. SEED AKUN ADMIN
  // ==========================================
  console.log("👤 Membuat akun Admin default...");
  
  const hashedPassword = await bcrypt.hash("kalibago!", 10);

  await db
    .insert(users)
    .values({
      name: "Super Admin",
      email: "admin@agency.id",
      passwordHash: hashedPassword,
      role: "admin",
    })
    .onConflictDoNothing();

  // ==========================================
  // 2. SEED SITE SETTINGS (SANGAT LENGKAP)
  // ==========================================
  console.log("⚙️ Membuat konfigurasi Site Settings...");

  const defaultSettings = [
    // 1. General & Brand Identity
    {
      key: "general",
      value: {
        siteName: "WebCraft Studio",
        siteTagline: "Jasa Pembuatan Website Modern, Cepat & SEO Friendly",
        companyLegalName: "PT WebCraft Digital Indonesia",
        logoUrl: "https://ik.imagekit.io/your_id/logo.png",
        logoDarkUrl: "https://ik.imagekit.io/your_id/logo-dark.png",
        faviconUrl: "https://ik.imagekit.io/your_id/favicon.ico",
        copyrightText: "© 2026 WebCraft Studio. All rights reserved.",
        maintenanceMode: false,
      },
    },

    // 2. SEO & Meta Search Engine
    {
      key: "seo",
      value: {
        metaTitle: "Jasa Pembuatan Website Professional - WebCraft Studio",
        metaDescription:
          "Solusi pembuatan website bisnis, UMKM, landing page, dan e-commerce menggunakan React Router v7, Tailwind CSS, dan sistem cepat berkinerja tinggi.",
        keywords: [
          "jasa pembuatan website",
          "bikin web murah",
          "web developer indonesia",
          "landing page umkm",
          "react router v7 web",
        ],
        ogImageUrl: "https://ik.imagekit.io/your_id/og-image.jpg",
        twitterHandle: "@webcraft_id",
        googleAnalyticsId: "G-XXXXXXXXXX",
        googleTagManagerId: "GTM-XXXXXXX",
        googleSearchConsoleCode: "google-site-verification-code-here",
        robotsIndex: true,
      },
    },

    // 3. Contact & Location Information
    {
      key: "contact",
      value: {
        emailPrimary: "hello@webcraft.id",
        emailSupport: "support@webcraft.id",
        whatsappNumber: "6281234567890",
        phoneOffice: "+62 354 123456",
        address: "Jl. Pemuda No. 88, Kota Kediri",
        province: "Jawa Timur",
        postalCode: "64129",
        googleMapsEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.8!2d112.01!3d-7.81",
        coordinates: {
          lat: -7.816667,
          lng: 112.016667,
        },
      },
    },

    // 4. Social Media Links
    {
      key: "socials",
      value: {
        instagram: "https://instagram.com/webcraft.id",
        linkedin: "https://linkedin.com/company/webcraft-studio",
        github: "https://github.com/webcraft-studio",
        youtube: "https://youtube.com/@webcraftstudio",
        facebook: "https://facebook.com/webcraft.official",
        tiktok: "https://tiktok.com/@webcraft.id",
      },
    },

    // 5. Hero Section Configuration
    {
      key: "hero",
      value: {
        badgeText: "🚀 Agensi Web Development Terpercaya 2026",
        headline: "Bangun Credibility Bisnis Anda Dengan Website Berkinerja Tinggi",
        subheadline:
          "Kami membantu UMKM dan Perusahaan memiliki website modern yang responsif, cepat, serta teroptimasi SEO secara otomatis.",
        ctaPrimaryText: "Konsultasi Gratis via WA",
        ctaPrimaryUrl: "https://wa.me/6281234567890?text=Halo%20saya%20ingin%20konsultasi%20website",
        ctaSecondaryText: "Lihat Paket Harga",
        ctaSecondaryUrl: "#pricing",
      },
    },

    // 6. Operational Hours
    {
      key: "operational_hours",
      value: {
        workDays: "Senin - Sabtu",
        workHours: "08:00 - 17:00 WIB",
        timezone: "Asia/Jakarta (WIB)",
        isSupport24_7: true,
        closedDays: ["Minggu", "Hari Libur Nasional"],
      },
    },

    // 7. Feature Toggles & UI Configurations
    {
      key: "features",
      value: {
        showPricingSection: true,
        showPortfolioDemoLinks: true,
        showBlogSection: true,
        showTestimonials: true,
        enableDirectWhatsAppInquiry: true,
        enableDarkModeToggle: true,
      },
    },

    // 8. Custom WhatsApp Quick Message Templates
    {
      key: "whatsapp_templates",
      value: {
        defaultConsultation:
          "Halo Kak, saya tertarik untuk konsultasi pembuatan website.",
        packageInquiry:
          "Halo Kak, saya berminat dengan paket {packageName}. Boleh minta info detailnya?",
        customQuotation:
          "Halo Kak, saya ingin minta penawaran harga custom untuk projek website saya.",
      },
    },
  ];

  for (const setting of defaultSettings) {
    await db
      .insert(siteSettings)
      .values(setting)
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: setting.value },
      });
  }

  console.log("✅ Seeding selesai! Akun Admin dan Site Settings berhasil dibuat.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Terjadi kesalahan saat seeding:", err);
  process.exit(1);
});
