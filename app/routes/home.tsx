import { Link, useOutletContext } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/home";
import { db } from "~/db";
import { services, projects, posts } from "~/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { formatPrice, buildWaLink } from "~/lib/format";
import { resizeImage } from "~/lib/imagekit-url";
import {
  Check,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  Star,
} from "lucide-react";

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={`shrink-0 fill-current ${className}`}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.012 2C6.486 2 2 6.479 2 12.005c0 2.13.663 4.106 1.794 5.733L2 22l4.406-1.748A9.957 9.957 0 0012.012 22c5.527 0 10.013-4.479 10.013-9.995C22.025 6.479 17.539 2 12.012 2zm0 18.232c-1.802 0-3.486-.487-4.938-1.339l-.354-.208-2.617 1.038.988-2.505-.23-.365A8.183 8.183 0 013.8 12.005c0-4.528 3.684-8.212 8.212-8.212 4.528 0 8.213 3.684 8.213 8.212 0 4.528-3.685 8.227-8.213 8.227zm4.502-6.155c-.247-.124-1.463-.722-1.69-.804-.227-.083-.392-.124-.557.124-.165.247-.64.804-.784.97-.144.165-.289.185-.536.062-.247-.124-1.044-.385-1.988-1.227-.735-.656-1.232-1.465-1.376-1.712-.144-.247-.015-.381.108-.504.111-.11.247-.289.371-.433.124-.144.165-.247.247-.412.083-.165.042-.31-.02-.433-.062-.124-.557-1.341-.763-1.836-.2-.482-.404-.417-.557-.425-.144-.008-.31-.008-.475-.008s-.433.062-.66.31c-.227.247-.866.846-.866 2.064 0 1.217.887 2.393 1.011 2.558.124.165 1.745 2.664 4.229 3.738.591.255 1.053.407 1.412.521.593.188 1.133.162 1.56.098.476-.071 1.463-.598 1.669-1.176.206-.578.206-1.073.144-1.176-.062-.103-.227-.185-.474-.309z" />
    </svg>
  );
}

export async function loader() {
  const [allProjects, featuredServices, latestPosts, allProjectsCount] = await Promise.all([
    db.query.projects.findMany({
      orderBy: [desc(projects.isFeatured), desc(projects.createdAt)],
      limit: 6,
    }),
    db.query.services.findMany({
      orderBy: [asc(services.sortOrder)],
      with: { features: true },
      limit: 6,
    }),
    db.query.posts.findMany({
      where: eq(posts.status, "published"),
      orderBy: [desc(posts.publishedAt)],
      with: { category: true },
      limit: 3,
    }),
    db.$count(projects),
  ]);

  return {
    services: featuredServices,
    projects: allProjects,
    posts: latestPosts,
    projectsCount: allProjectsCount,
  };
}

const processSteps = [
  {
    step: "01",
    title: "Konsultasi",
    desc: "Kami dengarkan kebutuhan bisnis Anda, target audiens, dan fitur yang diperlukan. Disesuaikan, bukan template mentah.",
  },
  {
    step: "02",
    title: "Desain & Struktur",
    desc: "Tampilan dirancang mengikuti identitas brand Anda, dengan struktur konten yang SEO-friendly.",
  },
  {
    step: "03",
    title: "Pengembangan",
    desc: "Dibangun dengan teknologi modern, responsif di semua perangkat, cepat, dan mudah dikelola.",
  },
  {
    step: "04",
    title: "Rilis & Pendampingan",
    desc: "Website online, kami dampingi Anda di masa-masa awal pemakaian setelah rilis.",
  },
];

const testimonials = [
  {
    name: "Rina Wijaya",
    role: "Owner, Toko Kue Rina",
    quote:
      "Yang paling kerasa itu pelanggan udah nggak nanya-nanya harga lewat DM lagi, tinggal buka menu di website. Ngurangin kerjaan admin lumayan banyak.",
    rating: 5,
  },
  {
    name: "Doni Prasetyo",
    role: "Founder, Doni Konveksi",
    quote:
      "Sempat ragu perlu website apa nggak buat konveksi. Tapi sekarang kalau ada calon klien nanya portofolio, tinggal kasih link, nggak perlu kirim PDF satu-satu lagi.",
    rating: 5,
  },
  {
    name: "Melati Sari",
    role: "Manajer, Klinik Melati",
    quote:
      "Proses bolak-balik revisi jadwal booking-nya agak lama di awal, tapi hasil akhirnya sesuai kebutuhan kami. Sekarang pasien bisa cek jadwal dokter sendiri tanpa telepon.",
    rating: 4,
  },
];

const faqs = [
  {
    q: "Berapa lama waktu pengerjaan website?",
    a: "Landing page atau website sederhana bisa selesai 1–2 hari kerja. Company profile multi-halaman sekitar 3–5 hari kerja. Sistem custom menyesuaikan kompleksitas fitur.",
  },
  {
    q: "Apakah bisa request revisi?",
    a: "Bisa. Ada jatah revisi di setiap paket, dan kami diskusikan dulu sebelum mulai kerja supaya arahnya jelas.",
  },
  {
    q: "Apakah sudah termasuk domain dan hosting?",
    a: "Tergantung paket. Beberapa paket sudah termasuk domain dan hosting gratis periode tertentu — detailnya ada di tiap paket harga.",
  },
  {
    q: "Bisa dikelola sendiri setelah website jadi?",
    a: "Bisa. Kami sediakan panduan pemakaian, dan website dibuat agar mudah diubah tanpa harus paham coding.",
  },
];

type PortfolioProject = {
  id: string | number;
  title: string;
  coverImageUrl: string | null;
};

function PortfolioMarquee({ projects }: { projects: PortfolioProject[] }) {
  if (!projects.length) return null;

  const row1 = [...projects, ...projects];
  const reversedProjects = [...projects].reverse();
  const row2 = [...reversedProjects, ...reversedProjects];

  return (
    <div className="portfolio-showcase">
      <div className="portfolio-fade portfolio-fade-left" />
      <div className="portfolio-fade portfolio-fade-right" />

      <div className="portfolio-marquee">
        <div className="portfolio-track portfolio-track-left">
          {row1.map((project, index) => (
            <div key={`portfolio-row-1-${project.id}-${index}`} className="portfolio-card">
              <div className="portfolio-card-image">
                {project.coverImageUrl ? (
                  <img
                    src={resizeImage(project.coverImageUrl, 400)}
                    alt={project.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
                    {project.title}
                  </div>
                )}
              </div>
              <div className="portfolio-card-label">{project.title}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="portfolio-marquee portfolio-marquee-second">
        <div className="portfolio-track portfolio-track-right">
          {row2.map((project, index) => (
            <div key={`portfolio-row-2-${project.id}-${index}`} className="portfolio-card">
              <div className="portfolio-card-image">
                {project.coverImageUrl ? (
                  <img
                    src={resizeImage(project.coverImageUrl, 400)}
                    alt={project.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
                    {project.title}
                  </div>
                )}
              </div>
              <div className="portfolio-card-label">{project.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { services, projects, posts, projectsCount } = loaderData;
  const { settings } = useOutletContext<{ settings: Record<string, any> }>();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const hero = settings.hero ?? {};
  const contact = settings.contact ?? {};
  const templates = settings.whatsapp_templates ?? {};
  const features = settings.features ?? {};
  const general = settings.general ?? {};

  const waConsult = buildWaLink(contact.whatsappNumber, templates.defaultConsultation);

  const servicesJsonLd =
    services.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: services.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Service",
              name: s.title,
              description: s.summary ?? undefined,
              provider: {
                "@type": "Organization",
                name: general.siteName,
              },
              offers:
                s.isPriceVisible && s.priceAmount
                  ? {
                      "@type": "Offer",
                      price: s.priceAmount,
                      priceCurrency: "IDR",
                    }
                  : undefined,
            },
          })),
        }
      : null;

  const blogJsonLd =
    posts.length > 0
      ? posts.map((post) => ({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.summary ?? undefined,
          image: post.coverImageUrl ?? undefined,
          datePublished: post.publishedAt ?? undefined,
          author: post.author ? { "@type": "Person", name: post.author.name } : undefined,
        }))
      : [];

  return (
    <div className="min-h-screen bg-white">
      {servicesJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
        />
      )}

      {blogJsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 md:px-8 md:pb-12 md:pt-24 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:pb-20">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold leading-tight text-brand-dark sm:text-4xl md:text-5xl lg:text-6xl">
              {hero.headline ?? (
                <>
                  Jasa Pembuatan Website Profesional untuk{" "}
                  <span className="text-brand-500">UMKM & Bisnis</span>
                </>
              )}
            </h1>

            {hero.subheadline && (
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-500 md:text-lg lg:mx-0">
                {hero.subheadline}
              </p>
            )}

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <a
                href={hero.ctaPrimaryUrl || waConsult}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2.5 rounded-full bg-brand-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand-500/20 transition-colors hover:bg-brand-600 sm:w-auto"
              >
                <WhatsAppIcon className="h-5 w-5" />
                <span>{hero.ctaPrimaryText ?? "Konsultasi Sekarang"}</span>
                <ArrowUpRight size={18} />
              </a>

              {features.showPortfolioDemoLinks !== false && projects.length > 0 && (
                <a
                  href="#projek"
                  className="flex w-full items-center justify-center gap-1.5 rounded-full px-7 py-3.5 font-medium text-slate-600 transition-colors hover:text-brand-600 sm:w-auto"
                >
                  Lihat Portofio
                  <ArrowRight size={16} />
                </a>
              )}
            </div>

            {projectsCount > 0 && (
              <p className="mt-5 text-sm text-slate-400">
                Berbagai solusi digital telah kami bangun untuk kebutuhan bisnis.
              </p>
            )}
          </div>

          {projects.length > 0 && (
            <div className="mt-12 lg:mt-0">
              <PortfolioMarquee projects={projects as PortfolioProject[]} />
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-20">
          <div className="mb-14 text-center">
            <span className="mb-4 inline-block rounded-full bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700">
              Cara Kami Bekerja
            </span>
            <h2 className="text-2xl font-bold text-brand-dark md:text-3xl">
              Proses yang Jelas dari Awal
            </h2>
          </div>

          <div className="space-y-10 rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
            {processSteps.map((item) => (
              <div
                key={item.step}
                className="flex gap-6 border-t border-slate-100 pt-8 first:border-0 first:pt-0"
              >
                <span className="w-16 shrink-0 text-3xl font-bold text-slate-200 md:text-4xl">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-brand-dark">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {features.showPricingSection !== false && services.length > 0 && (
        <section id="layanan">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="mb-4 inline-block rounded-full bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700">
                Harga
              </span>
              <h2 className="text-2xl font-bold text-brand-dark md:text-3xl">
                Paket Harga Terbaik
              </h2>
              <p className="mt-2 text-slate-500">
                Pilih paket yang sesuai dengan kebutuhan bisnis Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => {
                const priceAmountText = formatPrice(s.priceAmount, s.priceUnit);
                const waPackage = buildWaLink(
                  contact.whatsappNumber,
                  (templates.packageInquiry ?? "Halo, saya berminat dengan paket {packageName}").replace(
                    "{packageName}",
                    s.title
                  )
                );

                return (
                  <div
                    key={s.id}
                    className={`relative flex flex-col rounded-3xl border bg-white p-7 ${
                      s.isFeatured
                        ? "border-brand-500 shadow-xl shadow-brand-500/10"
                        : "border-slate-200"
                    }`}
                  >
                    {s.badge && (
                      <span className="absolute -top-3 left-7 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                        {s.badge}
                      </span>
                    )}

                    <h3 className="text-lg font-semibold text-brand-dark">{s.title}</h3>
                    {s.summary && <p className="mt-1.5 text-sm text-slate-500">{s.summary}</p>}

                    <div className="mt-5">
                      {!s.isPriceVisible ? (
                        <p className="text-lg font-semibold italic text-slate-400">
                          Hubungi kami untuk harga
                        </p>
                      ) : priceAmountText ? (
                        <>
                          {s.priceLabel && (
                            <p className="mb-1 text-sm font-medium text-slate-500">{s.priceLabel}</p>
                          )}
                          <p className="text-3xl font-bold text-brand-dark">{priceAmountText}</p>
                        </>
                      ) : s.priceLabel ? (
                        <p className="text-3xl font-bold text-brand-dark">{s.priceLabel}</p>
                      ) : (
                        <p className="text-lg font-semibold italic text-slate-400">
                          Hubungi kami untuk harga
                        </p>
                      )}
                    </div>

                    {s.features.length > 0 && (
                      <ul className="mt-6 flex-1 space-y-2.5">
                        {s.features.map((f) => (
                          <li
                            key={f.id}
                            className={`flex items-start gap-2 text-sm ${
                              f.isIncluded ? "text-slate-600" : "text-slate-300 line-through"
                            }`}
                          >
                            <Check
                              size={16}
                              className={`mt-0.5 shrink-0 ${
                                f.isIncluded ? "text-brand-500" : "text-slate-300"
                              }`}
                            />
                            {f.featureText}
                          </li>
                        ))}
                      </ul>
                    )}

                    <a
                      href={waPackage}
                      target="_blank"
                      rel="noreferrer"
                      className={`mt-7 flex items-center justify-center gap-2.5 rounded-full px-4 py-3 font-medium transition-colors ${
                        s.isFeatured
                          ? "bg-brand-500 text-white hover:bg-brand-600"
                          : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                      <span>Pesan Sekarang</span>
                      <ArrowRight size={16} />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section id="projek">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="mb-4 inline-block rounded-full bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700">
                Portofolio
              </span>
              <h2 className="text-2xl font-bold text-brand-dark md:text-3xl">Karya Terbaik Kami</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    {p.coverImageUrl && (
                      <img
                        src={resizeImage(p.coverImageUrl, 640)}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-brand-dark">{p.title}</h3>
                    {p.clientName && <p className="mt-0.5 text-sm text-slate-400">{p.clientName}</p>}

                    {p.techStack && p.techStack.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
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

                    {features.showPortfolioDemoLinks !== false && p.liveDemoUrl && (
                      <a
                        href={p.liveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 flex items-center gap-1.5 text-sm text-brand-600 hover:underline"
                      >
                        Lihat Demo
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-4 inline-block rounded-full bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700">
              Testimoni
            </span>
            <h2 className="text-2xl font-bold text-brand-dark md:text-3xl">Apa Kata Klien Kami</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-brand-500 text-brand-500" />
                  ))}
                  {Array.from({ length: 5 - t.rating }).map((_, i) => (
                    <Star key={`empty-${i}`} size={14} className="text-slate-200" />
                  ))}
                </div>

                <p className="text-sm leading-relaxed text-slate-600">{t.quote}</p>

                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-20">
          <div className="mb-10 text-center">
            <span className="mb-4 inline-block rounded-full bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700">
              FAQ
            </span>
            <h2 className="text-2xl font-bold text-brand-dark md:text-3xl">
              Pertanyaan yang Sering Ditanyakan
            </h2>
          </div>

          <div className="divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white px-6">
            {faqs.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="font-medium text-brand-dark">{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="pb-5 text-sm leading-relaxed text-slate-500">{item.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {features.showBlogSection !== false && (
        <section id="blog">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="mb-4 inline-block rounded-full bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700">
                Blog
              </span>
              <h2 className="text-2xl font-bold text-brand-dark md:text-3xl">Artikel Terbaru</h2>
              <p className="mt-2 text-slate-500">
                Tips dan insight seputar website dan bisnis digital.
              </p>
            </div>

            {posts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <div className="aspect-video overflow-hidden bg-slate-100">
                      {post.coverImageUrl && (
                        <img
                          src={resizeImage(post.coverImageUrl, 640)}
                          alt={post.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                    </div>

                    <div className="p-5">
                      {post.category && (
                        <span className="text-xs font-medium text-brand-600">
                          {post.category.name}
                        </span>
                      )}
                      <h3 className="mt-1.5 line-clamp-2 font-semibold text-brand-dark">
                        {post.title}
                      </h3>
                      {post.summary && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{post.summary}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-slate-400">Artikel akan segera hadir.</p>
            )}
          </div>
        </section>
      )}

      <section>
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-20">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center md:px-12">
            <h2 className="text-2xl font-bold text-brand-dark md:text-3xl">
              Siap Memulai Proyek Website Anda?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              Konsultasikan kebutuhan website Anda bersama tim kami, gratis tanpa komitmen.
            </p>
            <a
              href={waConsult}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-500 px-7 py-3.5 font-medium text-white shadow-lg shadow-brand-500/20 transition-colors hover:bg-brand-600"
            >
              <WhatsAppIcon className="h-5 w-5" />
              <span>Konsultasi Sekarang</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
