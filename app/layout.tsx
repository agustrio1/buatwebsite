import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getPublicSettings } from "~/lib/settings.server";
import { safeJsonLd } from "~/lib/json-ld";
import { buildRootMetadata } from "~/lib/metadata";
import { WaTracker } from "~/components/site/wa-tracker";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Sama seperti versi React Router: CSS ditempel ke <head> lewat
// experimental.inlineCss supaya tidak ada request stylesheet yang memblokir
// render (lihat next.config.ts).

export async function generateMetadata(): Promise<Metadata> {
  return buildRootMetadata(await getPublicSettings());
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f97316",
};

function toInternationalPhone(raw: unknown) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return undefined;
  return `+${digits.startsWith("0") ? `62${digits.slice(1)}` : digits}`;
}

/**
 * WebSite + Organization JSON-LD. Dulu komponen client yang membaca loader
 * "root"; di Next data settings sudah ada di server sehingga cukup dirender
 * sebagai Server Component.
 */
function StructuredData({ settings }: { settings: Record<string, any> }) {
  const general = settings.general ?? {};
  const contact = settings.contact ?? {};

  const siteName = general.siteName || "Website";
  const siteUrl = (general.siteUrl || "").replace(/\/$/, "");

  if (!siteUrl) return null;

  const telephone = toInternationalPhone(contact.whatsappNumber);

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: siteName,
    url: `${siteUrl}/`,
    inLanguage: "id-ID",
    publisher: { "@id": `${siteUrl}/#organization` },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    alternateName: general.companyLegalName || undefined,
    url: `${siteUrl}/`,
    logo: general.logoUrl
      ? {
          "@type": "ImageObject",
          url: general.logoUrl,
        }
      : undefined,
    contactPoint: telephone
      ? [
          {
            "@type": "ContactPoint",
            telephone,
            contactType: "customer service",
            areaServed: "ID",
            availableLanguage: ["Indonesian"],
          },
        ]
      : undefined,
    sameAs: [
      settings.socials?.instagram,
      settings.socials?.linkedin,
      settings.socials?.facebook,
      settings.socials?.tiktok,
      settings.socials?.youtube,
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }}
      />
    </>
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicSettings();

  return (
    <html lang="id">
      <body>
        {/* Tanpa crossOrigin: gambar dimuat lewat <img> biasa, jadi koneksi
            preconnect baru bisa dipakai ulang. React 19 menaikkan tag ini ke
            <head> saat streaming. */}
        <link rel="preconnect" href="https://cdn.enterprisejadikanweb.biz.id" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* Ditulis manual karena alternates.types tidak bisa dipakai bersama
            alternates.canonical (tipe string) di metadata root. */}
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss.xml" />
        <WaTracker />
        <StructuredData settings={settings} />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
