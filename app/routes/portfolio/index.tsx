import { Link, redirect, useOutletContext } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/db";
import { projects } from "~/db/schema";
import { desc, count } from "drizzle-orm";
import { ArrowRight, ChevronDown, ExternalLink } from "lucide-react";
import { parsePage, getPagination } from "~/lib/pagination";
import { Pagination } from "~/components/shared/pagination";
import { resizeImage, buildSrcSet } from "~/lib/imagekit-url";
import { buildWaLink } from "~/lib/format";
import { pageMeta } from "~/lib/meta";

// Escape "<" supaya data dari DB tidak bisa menutup tag <script>
function safeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`shrink-0 fill-current ${className}`}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.012 2C6.486 2 2 6.479 2 12.005c0 2.13.663 4.106 1.794 5.733L2 22l4.406-1.748A9.957 9.957 0 0012.012 22c5.527 0 10.013-4.479 10.013-9.995C22.025 6.479 17.539 2 12.012 2zm0 18.232c-1.802 0-3.486-.487-4.938-1.339l-.354-.208-2.617 1.038.988-2.505-.23-.365A8.183 8.183 0 013.8 12.005c0-4.528 3.684-8.212 8.212-8.212 4.528 0 8.213 3.684 8.213 8.212 0 4.528-3.685 8.227-8.213 8.227zm4.502-6.155c-.247-.124-1.463-.722-1.69-.804-.227-.083-.392-.124-.557.124-.165.247-.64.804-.784.97-.144.165-.289.185-.536.062-.247-.124-1.044-.385-1.988-1.227-.735-.656-1.232-1.465-1.376-1.712-.144-.247-.015-.381.108-.504.111-.11.247-.289.371-.433.124-.144.165-.247.247-.412.083-.165.042-.31-.02-.433-.062-.124-.557-1.341-.763-1.836-.2-.482-.404-.417-.557-.425-.144-.008-.31-.008-.475-.008s-.433.062-.66.31c-.227.247-.866.846-.866 2.064 0 1.217.887 2.393 1.011 2.558.124.165 1.745 2.664 4.229 3.738.591.255 1.053.407 1.412.521.593.188 1.133.162 1.56.098.476-.071 1.463-.598 1.669-1.176.206-.578.206-1.073.144-1.176-.062-.103-.227-.185-.474-.309z" />
    </svg>
  );
}

const faqs = [
  {
    q: "Apakah proyek di halaman ini milik klien?",
    a: "Bukan. Semua proyek di halaman ini adalah demo yang kami bangun sendiri untuk menunjukkan kemampuan teknis. Proyek-proyek ini tidak mewakili klien tertentu.",
  },
  {
    q: "Apakah demo ini bisa dicoba langsung?",
    a: "Bisa, untuk proyek yang menampilkan tombol Lihat Demo. Data yang tampil di dalam demo adalah data contoh, bukan data bisnis yang sebenarnya.",
  },
  {
    q: "Sistem apa saja yang bisa dibuat?",
    a: "Company profile, landing page, toko online dengan pembayaran dan ongkos kirim otomatis, CRM, sistem keuangan atau ERP skala kecil, serta sistem booking. Kebutuhan lain bisa dibahas lewat konsultasi.",
  },
  {
    q: "Apakah demo bisa disesuaikan dengan bisnis saya?",
    a: "Bisa. Fitur, alur, dan tampilan disesuaikan dengan cara kerja bisnis Anda. Ceritakan kebutuhan Anda lewat konsultasi, lalu kami usulkan fitur yang sesuai.",
  },
  {
    q: "Bagaimana cara memulai?",
    a: "Hubungi kami lewat WhatsApp atau isi form brief di halaman utama. Konsultasi awal gratis dan tanpa komitmen.",
  },
];

export function headers() {
  return {
    "Cache-Control": "public, max-age=60, s-maxage=600, stale-while-revalidate=86400",
  };
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  const page = loaderData?.currentPage ?? 1;
  const suffix = page > 1 ? ` - Halaman ${page}` : "";
  return pageMeta(matches, {
    title: `Demo Proyek Website & Sistem Bisnis${suffix} | JadikanWeb`,
    description:
      "Demo website dan sistem bisnis buatan JadikanWeb: toko online, CRM, ERP keuangan, dan booking. Bukan proyek klien, bisa dicoba dan disesuaikan dengan bisnis Anda." +
      (page > 1 ? ` Halaman ${page}.` : ""),
    page,
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  // /projek?page=1 sama dengan /projek, redirect biar nggak duplikat
  if (url.searchParams.get("page") === "1") {
    throw redirect(url.pathname, 301);
  }

  const page = parsePage(url.searchParams);

  const [{ value: totalItems }] = await db.select({ value: count() }).from(projects);
  const { limit, offset, currentPage, totalPages } = getPagination(page, totalItems);

  const allProjects = await db.query.projects.findMany({
    orderBy: [desc(projects.createdAt)],
    limit,
    offset,
  });

  return {
    projects: allProjects,
    currentPage,
    totalPages,
    totalItems,
    offset,
    origin: url.origin,
  };
}

export default function PortfolioIndex({ loaderData }: Route.ComponentProps) {
  const { projects, currentPage, totalPages, totalItems, offset, origin } = loaderData;
  const { settings } = useOutletContext<{ settings: Record<string, any> }>();

  const contact = settings?.contact ?? {};
  const templates = settings?.whatsapp_templates ?? {};
  const features = settings?.features ?? {};
  const general = settings?.general ?? {};

  const waConsult = buildWaLink(contact.whatsappNumber, templates.defaultConsultation);
  const pageUrl = `${origin}/projek${currentPage > 1 ? `?page=${currentPage}` : ""}`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Demo Proyek Website & Sistem Bisnis",
    description:
      "Kumpulan demo website dan sistem bisnis yang dibangun sendiri untuk menunjukkan kemampuan teknis.",
    url: pageUrl,
    inLanguage: "id-ID",
    isPartOf: general.siteName
      ? { "@type": "WebSite", name: general.siteName, url: origin }
      : undefined,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: totalItems,
      itemListElement: projects.map((p, i) => ({
        "@type": "ListItem",
        position: offset + i + 1,
        url: `${origin}/projek/${p.slug}`,
        name: p.title,
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: "Demo Proyek", item: `${origin}/projek` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      {currentPage === 1 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
        />
      )}

      <section className="border-b border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center md:px-8 md:py-20">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="transition-colors hover:text-brand-600">
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-slate-600">
                Demo Proyek
              </li>
            </ol>
          </nav>

          <span className="mb-4 inline-block rounded-full bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700">
            Showcase
          </span>
          <h1 className="text-3xl font-bold leading-tight text-brand-dark md:text-4xl">
            Demo Proyek Website & Sistem Bisnis
          </h1>
          <p className="mt-4 leading-relaxed text-slate-600">
            Kumpulan demo yang kami bangun sendiri untuk menunjukkan cara kerja toko online, CRM,
            sistem keuangan, dan sistem booking. Semuanya bisa dilihat dan disesuaikan dengan
            kebutuhan bisnis Anda.
          </p>

          <p className="mx-auto mt-6 max-w-xl rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-relaxed text-slate-500">
            <strong className="font-semibold text-slate-700">Catatan:</strong> proyek di halaman ini
            adalah demo buatan sendiri, bukan hasil kerja untuk klien tertentu.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        {projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <Link
                  key={p.id}
                  to={`/projek/${p.slug}`}
                  prefetch="intent"
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg hover:shadow-slate-200/60"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {p.coverImageUrl && (
                      <img
                        src={resizeImage(p.coverImageUrl, 640) ?? undefined}
                        srcSet={buildSrcSet(p.coverImageUrl, 640) ?? undefined}
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        alt={`Tampilan demo ${p.title}`}
                        loading={i === 0 ? "eager" : "lazy"}
                        fetchPriority={i === 0 ? "high" : undefined}
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                      Demo
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-lg font-semibold text-brand-dark">{p.title}</h2>

                    {features.showClientName === true && p.clientName && (
                      <p className="mt-0.5 text-sm text-slate-400">{p.clientName}</p>
                    )}

                    {p.summary && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">
                        {p.summary}
                      </p>
                    )}

                    {p.techStack && p.techStack.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {p.techStack.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-5 text-sm">
                      <span className="inline-flex items-center gap-1.5 font-medium text-brand-600">
                        Lihat detail
                        <ArrowRight
                          size={14}
                          aria-hidden="true"
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                      {p.liveDemoUrl && (
                        <span className="inline-flex items-center gap-1.5 text-slate-400">
                          Ada demo
                          <ExternalLink size={13} aria-hidden="true" />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </>
        ) : (
          <p className="py-16 text-center text-slate-400">Belum ada demo proyek yang ditampilkan.</p>
        )}
      </section>

      {currentPage === 1 && (
        <section className="border-t border-slate-100">
          <div className="mx-auto max-w-3xl px-4 py-14 md:px-8 md:py-20">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-brand-dark md:text-3xl">
                Pertanyaan tentang Demo Proyek
              </h2>
            </div>

            <div className="divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white px-6">
              {faqs.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-brand-dark [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      aria-hidden="true"
                      className="shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center md:px-8 md:py-16">
          <h2 className="text-2xl font-bold text-brand-dark md:text-3xl">
            Butuh sistem seperti ini untuk bisnis Anda?
          </h2>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-slate-500">
            Ceritakan alur kerja dan kebutuhan Anda. Konsultasi awal gratis dan tanpa komitmen.
          </p>
          <a
            href={waConsult}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand-500/20 transition-colors hover:bg-brand-600"
          >
            <WhatsAppIcon className="h-5 w-5" />
            <span>Konsultasi via WhatsApp</span>
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}