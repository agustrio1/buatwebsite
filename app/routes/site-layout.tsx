import { Outlet, useLoaderData } from "react-router";
import { db } from "~/db";
import { SiteHeader } from "~/components/site/header";
import { SiteFooter } from "~/components/site/footer";

export async function loader() {
  const rows = await db.query.siteSettings.findMany();
  const settings: Record<string, any> = {};

  for (const row of rows) {
    try {
      settings[row.key] = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
    } catch {
      settings[row.key] = row.value;
    }
  }

  return { settings };
}

export default function SiteLayout() {
  const { settings } = useLoaderData<typeof loader>();

  // Extract SEO & General Data
  const seoData = settings.seo || {};
  const generalData = settings.general || {};
  const contactData = settings.contact || {};

  const siteName = generalData.siteName || "WebCraft";
  const siteUrl = generalData.siteUrl || "https://trioagus.id";

  // Extract WhatsApp Phone Number
  const rawPhone = contactData.whatsappNumber || contactData.phoneOffice || "";
  const cleanPhone = String(rawPhone).replace(/\D/g, "");

  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Halo, saya ingin bertanya mengenai layanan Anda.")}`
    : "#";

  // Hanya memakai WebSite Schema (WebSite JSON-LD)
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Script WebSite JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <SiteHeader settings={settings} />

      <main className="flex-1">
        <Outlet context={{ settings }} />
      </main>

      <SiteFooter settings={settings} />

      {/* Floating WhatsApp CTA Button */}
      {cleanPhone ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-lg transition-all"
          aria-label="Hubungi kami via WhatsApp"
        >
          <svg
            className="w-5 h-5 shrink-0"
            viewBox="0 0 24 24"
            fill="#FFFFFF"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12.012 2C6.486 2 2 6.479 2 12.005c0 2.13.663 4.106 1.794 5.733L2 22l4.406-1.748A9.957 9.957 0 0012.012 22c5.527 0 10.013-4.479 10.013-9.995C22.025 6.479 17.539 2 12.012 2zm0 18.232c-1.802 0-3.486-.487-4.938-1.339l-.354-.208-2.617 1.038.988-2.505-.23-.365A8.183 8.183 0 013.8 12.005c0-4.528 3.684-8.212 8.212-8.212 4.528 0 8.213 3.684 8.213 8.212 0 4.528-3.685 8.227-8.213 8.227zm4.502-6.155c-.247-.124-1.463-.722-1.69-.804-.227-.083-.392-.124-.557.124-.165.247-.64.804-.784.97-.144.165-.289.185-.536.062-.247-.124-1.044-.385-1.988-1.227-.735-.656-1.232-1.465-1.376-1.712-.144-.247-.015-.381.108-.504.111-.11.247-.289.371-.433.124-.144.165-.247.247-.412.083-.165.042-.31-.02-.433-.062-.124-.557-1.341-.763-1.836-.2-.482-.404-.417-.557-.425-.144-.008-.31-.008-.475-.008s-.433.062-.66.31c-.227.247-.866.846-.866 2.064 0 1.217.887 2.393 1.011 2.558.124.165 1.745 2.664 4.229 3.738.591.255 1.053.407 1.412.521.593.188 1.133.162 1.56.098.476-.071 1.463-.598 1.669-1.176.206-.578.206-1.073.144-1.176-.062-.103-.227-.185-.474-.309z" />
          </svg>
          <span className="text-sm font-semibold">Hubungi Kami</span>
        </a>
      ) : null}
    </div>
  );
}
