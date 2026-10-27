import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "~/db";
import { cities, services } from "~/db/schema";
import { and, asc, eq, ne } from "drizzle-orm";
import {
  Check,
  MessageCircle,
  ChevronRight,
  MapPin,
  Calculator,
} from "lucide-react";
import { buildWaLink } from "~/lib/format";
import { safeJsonLd } from "~/lib/json-ld";
import { normalizeCalculatorConfig } from "~/lib/price-calculator";
import { servicePages } from "~/data/service-pages";
import { getPublicSettings } from "~/lib/settings.server";
import { getSiteUrl, ogUrl } from "~/lib/seo";
import { buildMetadata } from "~/lib/metadata";
import { BriefForm } from "~/components/site/brief-form";
import { CityFaqAccordion } from "~/components/site/city-faq-accordion";

// Halaman lokal non-kota (mis. artikel Kediri) yang ditampilkan paling depan
// di bagian "Layanan Kami di Kota Lain". Ubah atau kosongkan sesuai kebutuhan.
const EXTRA_LOCAL_LINKS: { label: string; href: string }[] = [
  { label: "Jasa Website Kediri", href: "/blog/jasa-pembuatan-website-kediri" },
];

const STOPWORDS = new Set([
  "jasa",
  "pembuatan",
  "website",
  "web",
  "dan",
  "yang",
  "untuk",
  "dengan",
]);

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOPWORDS.has(t));
}

// Mencocokkan teks "Layanan yang Relevan" dari database ke halaman layanan statis.
// Semua kata kunci di teks harus ada di judul/slug layanan; kalau tidak cocok, tidak jadi link.
function findServiceSlug(label: string): string | null {
  const labelTokens = new Set(tokenize(label));
  if (labelTokens.size === 0) return null;

  let best: { slug: string; score: number } | null = null;
  for (const s of servicePages) {
    const serviceTokens = new Set(tokenize(`${s.title} ${s.slug}`));
    let hit = 0;
    labelTokens.forEach((t) => {
      if (serviceTokens.has(t)) hit++;
    });
    if (hit !== labelTokens.size) continue;
    const score = hit / (labelTokens.size + serviceTokens.size - hit);
    if (!best || score > best.score) best = { slug: s.slug, score };
  }
  return best ? best.slug : null;
}

// Kota aktif diketahui dari database; prerender saat build, sisanya on-demand
// (dynamicParams = true, sama seperti SSR + cache versi lama).
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const rows = await db.query.cities.findMany({
    where: eq(cities.isActive, true),
    columns: { slug: true },
  });
  return rows.map((c) => ({ city: c.slug }));
}

const getCityPageData = cache(async (citySlug: string) => {
  const [city, allServices, otherCities, settings] = await Promise.all([
    db.query.cities.findFirst({
      where: and(eq(cities.slug, citySlug), eq(cities.isActive, true)),
    }),
    db.query.services.findMany({
      orderBy: [asc(services.sortOrder)],
      columns: { id: true, title: true },
    }),
    db.query.cities.findMany({
      where: and(eq(cities.isActive, true), ne(cities.slug, citySlug)),
      orderBy: [asc(cities.sortOrder), asc(cities.name)],
      columns: { name: true, slug: true },
      limit: 8,
    }),
    getPublicSettings(),
  ]);

  if (!city) return null;
  return { city, services: allServices, otherCities, settings };
});

type Params = Promise<{ city: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { city: citySlug } = await params;
  const data = await getCityPageData(citySlug);
  if (!data) return { title: "Halaman tidak ditemukan" };

  const { city } = data;
  const title = city.metaTitle || `Jasa Pembuatan Website ${city.name} Profesional`;
  const description =
    city.metaDescription ||
    `Jasa pembuatan website profesional untuk bisnis di ${city.name}. Cepat, modern, dan terjangkau.`;

  const siteUrl = await getSiteUrl();

  return buildMetadata({
    title,
    description,
    path: `/jasa-pembuatan-website/${city.slug}`,
    // Kota tidak punya gambar OG sendiri → selalu pakai generator dinamis
    ogImage: ogUrl({ siteUrl, title, subtitle: `Layanan untuk bisnis di ${city.name}`, label: "JadikanWeb" }),
    ogImageDimensions: { width: 1200, height: 630 },
  });
}

export default async function CityServicePage({ params }: { params: Params }) {
  const { city: citySlug } = await params;
  const data = await getCityPageData(citySlug);
  if (!data) notFound();

  const { city, services: serviceOptions, otherCities, settings } = data;

  const businessTypes = (city.businessTypes as string[] | null) ?? [];
  const relevantServices = (city.relevantServices as string[] | null) ?? [];
  const advantages = (city.advantages as string[] | null) ?? [];
  const serviceAreas = (city.serviceAreas as string[] | null) ?? [];
  const faqs = (city.faqs as { question: string; answer: string }[] | null) ?? [];

  const relevantLinks = relevantServices.map((label) => ({
    label,
    slug: findServiceSlug(label),
  }));

  const general = settings.general ?? {};
  const contact = settings.contact ?? {};
  const templates = settings.whatsapp_templates ?? {};
  const briefForm = settings.brief_form ?? {};

  const calculator = normalizeCalculatorConfig(settings.price_calculator);
  const showCalculator = calculator.enabled && calculator.baseItems.length > 0;

  const waNumber = city.ctaWhatsappNumber || contact.whatsappNumber;
  const waLink = buildWaLink(
    waNumber,
    (templates.packageInquiry ?? "Halo, saya berminat dengan layanan {packageName}").replace(
      "{packageName}",
      `Jasa Pembuatan Website di ${city.name}`
    )
  );

  const siteUrl = String(general.siteUrl || "").replace(/\/$/, "");
  const pageUrl = siteUrl ? `${siteUrl}/jasa-pembuatan-website/${city.slug}` : undefined;
  const breadcrumbLabel = `Jasa Pembuatan Website ${city.name}`;

  const cityPlace = {
    "@type": "City",
    name: city.name,
    ...(city.province
      ? { containedInPlace: { "@type": "AdministrativeArea", name: city.province } }
      : {}),
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: city.h1 || `Jasa Pembuatan Website di ${city.name}`,
    serviceType: "Jasa Pembuatan Website",
    url: pageUrl,
    areaServed:
      serviceAreas.length > 0
        ? [cityPlace, ...serviceAreas.map((area) => ({ "@type": "Place", name: area }))]
        : cityPlace,
    provider: siteUrl
      ? { "@id": `${siteUrl}/#organization` }
      : { "@type": "Organization", name: general.siteName },
  };

  const breadcrumbJsonLd = siteUrl
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: breadcrumbLabel, item: pageUrl },
        ],
      }
    : null;

  const faqJsonLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  const showOtherLocal = EXTRA_LOCAL_LINKS.length > 0 || otherCities.length > 0;

  return (
    <article className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(serviceJsonLd) }}
      />
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
        />
      )}

      <nav aria-label="Breadcrumb" className="mb-8 min-w-0">
        <ol className="flex items-center gap-1.5 text-sm text-slate-500">
          <li>
            <Link href="/" className="hover:text-brand-600 transition-colors">
              Beranda
            </Link>
          </li>
          <ChevronRight size={14} className="shrink-0" aria-hidden="true" />
          <li className="truncate text-slate-400" aria-current="page">
            {breadcrumbLabel}
          </li>
        </ol>
      </nav>

      <h1 className="text-2xl md:text-4xl font-bold text-brand-dark leading-tight">
        {city.h1 || `Jasa Pembuatan Website Profesional di ${city.name}`}
      </h1>

      <p className="text-lg text-slate-600 mt-4 leading-relaxed">
        {city.intro ||
          `Bantu bisnis Anda di ${city.name} tampil profesional secara online dengan website modern, cepat, dan mudah dikelola.`}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3.5 rounded-full transition-colors shadow-lg shadow-brand-500/20"
        >
          <MessageCircle size={18} /> Konsultasi via WhatsApp
        </a>
        <Link href="/projek" className="text-sm font-medium text-brand-600 hover:underline">
          Lihat demo proyek
        </Link>
      </div>

      {city.localContext && (
        <p className="text-slate-600 leading-relaxed mt-8">{city.localContext}</p>
      )}

      {(city.localChallenges || city.whyWebsiteNeeded) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {city.localChallenges && (
            <div className="bg-slate-50 rounded-2xl p-5">
              <h2 className="font-semibold text-brand-dark text-sm mb-2">Tantangan Bisnis Lokal</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{city.localChallenges}</p>
            </div>
          )}
          {city.whyWebsiteNeeded && (
            <div className="bg-slate-50 rounded-2xl p-5">
              <h2 className="font-semibold text-brand-dark text-sm mb-2">Kenapa Website Dibutuhkan</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{city.whyWebsiteNeeded}</p>
            </div>
          )}
        </div>
      )}

      {businessTypes.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-brand-dark text-sm mb-3">Jenis Bisnis yang Kami Layani</h2>
          <div className="flex flex-wrap gap-2">
            {businessTypes.map((type) => (
              <span
                key={type}
                className="text-xs font-medium bg-brand-100 text-brand-700 px-3 py-1.5 rounded-full"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {(relevantLinks.length > 0 || advantages.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          {relevantLinks.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-brand-dark mb-4">Layanan yang Relevan</h2>
              <ul className="space-y-3">
                {relevantLinks.map(({ label, slug }) => (
                  <li key={label} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check size={16} className="text-brand-500 mt-0.5 shrink-0" />
                    {slug ? (
                      <Link
                        href={`/layanan/${slug}`}
                        className="text-brand-600 hover:underline underline-offset-2"
                      >
                        {label}
                      </Link>
                    ) : (
                      label
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {advantages.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-brand-dark mb-4">Keunggulan</h2>
              <ul className="space-y-3">
                {advantages.map((a) => (
                  <li key={a} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check size={16} className="text-brand-500 mt-0.5 shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {serviceAreas.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-brand-dark text-sm mb-3">Area yang Kami Layani</h2>
          <div className="flex flex-wrap gap-2">
            {serviceAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full"
              >
                <MapPin size={12} className="text-slate-400" />
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {faqs.length > 0 && (
        <div className="mt-12">
          <h2 className="font-semibold text-brand-dark text-lg mb-4">
            Pertanyaan Seputar Layanan di {city.name}
          </h2>
          <CityFaqAccordion faqs={faqs} />
        </div>
      )}

      <div id="brief" className="rounded-3xl border border-slate-200 bg-white px-6 py-10 mt-12">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-brand-dark">
            {city.ctaTitle || `Siap Bangun Website Bisnis Anda di ${city.name}?`}
          </h2>
          <p className="text-slate-500 mt-3 max-w-md mx-auto leading-relaxed">
            {city.ctaDescription || "Konsultasikan kebutuhan website Anda, gratis tanpa komitmen."}
          </p>
        </div>

        <div className="max-w-xl mx-auto mt-8">
          <BriefForm services={serviceOptions} budgetOptions={briefForm.budgetOptions} />
        </div>

        <div className="text-center mt-6">
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
          >
            <MessageCircle size={18} /> Atau konsultasi langsung untuk {city.name} via WhatsApp
          </a>
        </div>
      </div>

      {showCalculator && (
        <p className="text-sm text-center mt-6">
          <Link
            href="/kalkulator"
            className="inline-flex items-center gap-1.5 text-brand-600 hover:underline"
          >
            <Calculator size={15} /> Hitung estimasi biaya website Anda
          </Link>
        </p>
      )}

      {showOtherLocal && (
        <div className="mt-10 border-t border-slate-100 pt-8">
          <h2 className="font-semibold text-brand-dark text-sm mb-3">Layanan Kami di Kota Lain</h2>
          <div className="flex flex-wrap gap-2">
            {EXTRA_LOCAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-slate-600 bg-slate-100 hover:bg-brand-100 hover:text-brand-700 px-3 py-1.5 rounded-full transition-colors"
              >
                {l.label}
              </Link>
            ))}
            {otherCities.map((c) => (
              <Link
                key={c.slug}
                href={`/jasa-pembuatan-website/${c.slug}`}
                className="text-xs text-slate-600 bg-slate-100 hover:bg-brand-100 hover:text-brand-700 px-3 py-1.5 rounded-full transition-colors"
              >
                Jasa Website {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-slate-400 mt-6 text-center">
        Lihat juga{" "}
        <Link href="/layanan" className="text-brand-600 hover:underline">
          daftar layanan lengkap
        </Link>{" "}
        kami.
      </p>
    </article>
  );
}
