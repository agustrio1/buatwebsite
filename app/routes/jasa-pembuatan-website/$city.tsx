import { Link, useOutletContext } from "react-router";
import type { Route } from "./+types/$city";
import { db } from "~/db";
import { cities } from "~/db/schema";
import { and, eq } from "drizzle-orm";
import { useState } from "react";
import { Check, MessageCircle, ChevronDown, MapPin } from "lucide-react";
import { buildWaLink } from "~/lib/format";

export async function loader({ params }: Route.LoaderArgs) {
  const city = await db.query.cities.findFirst({
    where: and(eq(cities.slug, params.city), eq(cities.isActive, true)),
  });
  if (!city) throw new Response("Not found", { status: 404 });
  return { city };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.city) return [{ title: "Halaman tidak ditemukan" }];
  const { city } = loaderData;
  return [
    { title: city.metaTitle || `Jasa Pembuatan Website ${city.name} Profesional` },
    {
      name: "description",
      content:
        city.metaDescription ||
        `Jasa pembuatan website profesional untuk bisnis di ${city.name}. Cepat, modern, dan terjangkau.`,
    },
  ];
}

export default function CityServicePage({ loaderData }: Route.ComponentProps) {
  const { city } = loaderData;
  const { settings } = useOutletContext<{ settings: Record<string, any> }>();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const businessTypes = (city.businessTypes as string[] | null) ?? [];
  const relevantServices = (city.relevantServices as string[] | null) ?? [];
  const advantages = (city.advantages as string[] | null) ?? [];
  const serviceAreas = (city.serviceAreas as string[] | null) ?? [];
  const faqs = (city.faqs as { question: string; answer: string }[] | null) ?? [];

  const contact = settings.contact ?? {};
  const templates = settings.whatsapp_templates ?? {};

  const waNumber = city.ctaWhatsappNumber || contact.whatsappNumber;
  const waLink = buildWaLink(
    waNumber,
    (templates.packageInquiry ?? "Halo, saya berminat dengan layanan {packageName}").replace(
      "{packageName}",
      `Jasa Pembuatan Website di ${city.name}`
    )
  );

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Jasa Pembuatan Website",
    areaServed:
      serviceAreas.length > 0
        ? serviceAreas.map((area) => ({ "@type": "Place", name: area }))
        : { "@type": "City", name: city.name },
    provider: { "@type": "Organization", name: settings.general?.siteName },
  };

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

  return (
    <article className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <h1 className="text-2xl md:text-4xl font-bold text-brand-dark leading-tight">
        {city.h1 || `Jasa Pembuatan Website Profesional di ${city.name}`}
      </h1>

      <p className="text-lg text-slate-500 mt-4 leading-relaxed">
        {city.intro ||
          `Bantu bisnis Anda di ${city.name} tampil profesional secara online dengan website modern, cepat, dan mudah dikelola.`}
      </p>

      {city.localContext && (
        <p className="text-slate-600 leading-relaxed mt-6">{city.localContext}</p>
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

      {(relevantServices.length > 0 || advantages.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          {relevantServices.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-brand-dark mb-4">Layanan yang Relevan</h2>
              <ul className="space-y-3">
                {relevantServices.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check size={16} className="text-brand-500 mt-0.5 shrink-0" />
                    {s}
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
          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  >
                    <span className="font-medium text-brand-dark text-sm">{faq.question}</span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="pb-4 text-sm leading-relaxed text-slate-500">{faq.answer}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center mt-12">
        <h2 className="text-xl md:text-2xl font-bold text-brand-dark">
          {city.ctaTitle || `Siap Bangun Website Bisnis Anda di ${city.name}?`}
        </h2>
        <p className="text-slate-500 mt-3 max-w-md mx-auto leading-relaxed">
          {city.ctaDescription || "Konsultasikan kebutuhan website Anda, gratis tanpa komitmen."}
        </p>
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3.5 rounded-full mt-6 transition-colors shadow-lg shadow-brand-500/20"
        >
          <MessageCircle size={18} /> Konsultasi untuk {city.name}
        </a>
      </div>

      <p className="text-sm text-slate-400 mt-6 text-center">
        Lihat juga{" "}
        <Link to="/layanan" className="text-brand-600 hover:underline">
          daftar layanan lengkap
        </Link>{" "}
        kami.
      </p>
    </article>
  );
}