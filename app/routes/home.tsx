import { Link, useOutletContext } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/home";
import { db } from "~/db";
import { services, projects, posts } from "~/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { formatPrice, buildWaLink } from "~/lib/format";
import {
  Check,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  Star,
} from "lucide-react";

// Komponen Ikon WhatsApp Sempurna (Vektor 24x24 Anti-Distorsi)
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
  const [featuredServices, featuredProjects, latestPosts, allProjectsCount] = await Promise.all([
    db.query.services.findMany({
      orderBy: [asc(services.sortOrder)],
      with: { features: true },
      limit: 6,
    }),
    db.query.projects.findMany({
      where: eq(projects.isFeatured, true),
      orderBy: [desc(projects.createdAt)],
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

  const displayedProjects =
    featuredProjects.length > 0
      ? featuredProjects
      : await db.query.projects.findMany({ orderBy: [desc(projects.createdAt)], limit: 3 });

  return {
    services: featuredServices,
    projects: displayedProjects,
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

  // JSON-LD: daftar layanan sebagai ItemList of Service
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

  // JSON-LD: artikel blog terbaru sebagai BlogPosting
  const blogJsonLd =
    posts.length > 0
      ? posts.map((post) => ({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.summary ?? undefined,
          image: post.coverImageUrl ?? undefined,
          datePublished: post.publishedAt ?? undefined,
          author: post.author
            ? { "@type": "Person", name: post.author.name }
            : undefined,
        }))
      : [];

  return (
    <div className="bg-white min-h-screen">
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

      {/* Hero */}
      <section className="overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark leading-tight">
            {hero.headline ?? (
              <>
                Jasa Pembuatan Website Profesional untuk{" "}
                <span className="text-brand-500">UMKM & Bisnis</span>
              </>
            )}
          </h1>
          {hero.subheadline && (
            <p className="text-slate-500 max-w-xl mx-auto mt-5 text-base md:text-lg">
              {hero.subheadline}
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <a
              href={hero.ctaPrimaryUrl || waConsult}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-7 py-3.5 rounded-full w-full sm:w-auto justify-center transition-colors shadow-lg shadow-brand-500/20"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span>{hero.ctaPrimaryText ?? "Konsultasi Sekarang"}</span>
              <ArrowUpRight size={18} />
            </a>
            {features.showPortfolioDemoLinks !== false && projects.length > 0 && (
              <a
                href="#projek"
                className="flex items-center gap-1.5 text-slate-600 hover:text-brand-600 font-medium px-7 py-3.5 rounded-full w-full sm:w-auto justify-center transition-colors"
              >
                Lihat Project <ArrowRight size={16} />
              </a>
            )}
          </div>
          {projectsCount > 0 && (
            <p className="text-sm text-slate-400 mt-5">
              Dipercaya menyelesaikan <span className="font-semibold text-brand-600">{projectsCount}+ proyek</span> website
            </p>
          )}
        </div>

        {projects.length > 0 && (
          <div className="pb-16 md:pb-20">
            <div className="flex gap-5 w-max px-4 mx-auto animate-marquee">
              {[...projects, ...projects].map((p, i) => (
                <div
                  key={`${p.id}-${i}`}
                  className="w-64 md:w-72 aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-white shrink-0 shadow-sm"
                >
                  {p.coverImageUrl && (
                    <img src={p.coverImageUrl} alt={p.title} className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Proses Kerja */}
      <section>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="text-center mb-14">
            <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              Cara Kami Bekerja
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">Proses yang Jelas dari Awal</h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-10">
            {processSteps.map((item) => (
              <div key={item.step} className="flex gap-6 border-t border-slate-100 pt-8 first:border-0 first:pt-0">
                <span className="text-3xl md:text-4xl font-bold text-slate-200 shrink-0 w-16">{item.step}</span>
                <div>
                  <h3 className="font-semibold text-brand-dark text-lg">{item.title}</h3>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      {features.showPricingSection !== false && services.length > 0 && (
        <section id="layanan">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Harga
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">Paket Harga Terbaik</h2>
              <p className="text-slate-500 mt-2">Pilih paket yang sesuai dengan kebutuhan bisnis Anda.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => {
                const priceText = s.isPriceVisible
                  ? s.priceLabel || formatPrice(s.priceAmount, s.priceUnit) || "Hubungi kami"
                  : null;
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
                    className={`relative bg-white rounded-3xl border p-7 flex flex-col ${
                      s.isFeatured ? "border-brand-500 shadow-xl shadow-brand-500/10" : "border-slate-200"
                    }`}
                  >
                    {s.badge && (
                      <span className="absolute -top-3 left-7 bg-brand-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {s.badge}
                      </span>
                    )}
                    <h3 className="font-semibold text-lg text-brand-dark">{s.title}</h3>
                    {s.summary && <p className="text-sm text-slate-500 mt-1.5">{s.summary}</p>}

                    <div className="mt-5">
                      {priceText ? (
                        <p className="text-3xl font-bold text-brand-dark">{priceText}</p>
                      ) : (
                        <p className="text-lg font-semibold text-slate-400 italic">Hubungi kami untuk harga</p>
                      )}
                    </div>

                    {s.features.length > 0 && (
                      <ul className="space-y-2.5 mt-6 flex-1">
                        {s.features.map((f) => (
                          <li
                            key={f.id}
                            className={`flex items-start gap-2 text-sm ${
                              f.isIncluded ? "text-slate-600" : "text-slate-300 line-through"
                            }`}
                          >
                            <Check size={16} className={`mt-0.5 shrink-0 ${f.isIncluded ? "text-brand-500" : "text-slate-300"}`} />
                            {f.featureText}
                          </li>
                        ))}
                      </ul>
                    )}

                    <a
                      href={waPackage}
                      target="_blank"
                      rel="noreferrer"
                      className={`mt-7 flex items-center justify-center gap-2.5 font-medium px-4 py-3 rounded-full transition-colors ${
                        s.isFeatured
                          ? "bg-brand-500 hover:bg-brand-600 text-white"
                          : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <WhatsAppIcon className="w-5 h-5" />
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

      {/* Projects */}
      {projects.length > 0 && (
        <section id="projek">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Portofolio
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">Karya Terbaik Kami</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 group">
                  <div className="aspect-video bg-slate-100 overflow-hidden">
                    {p.coverImageUrl && (
                      <img
                        src={p.coverImageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-brand-dark">{p.title}</h3>
                    {p.clientName && <p className="text-sm text-slate-400 mt-0.5">{p.clientName}</p>}
                    {p.techStack && p.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {p.techStack.slice(0, 4).map((t) => (
                          <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
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
                        className="flex items-center gap-1.5 text-sm text-brand-600 hover:underline mt-4"
                      >
                        Lihat Demo <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimoni */}
      <section>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              Testimoni
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">Apa Kata Klien Kami</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-brand-500 text-brand-500" />
                  ))}
                  {Array.from({ length: 5 - t.rating }).map((_, i) => (
                    <Star key={`empty-${i}`} size={14} className="text-slate-200" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{t.quote}</p>
                <div className="flex items-center gap-3 mt-5">
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold flex items-center justify-center shrink-0">
                    {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-dark text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="text-center mb-10">
            <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">Pertanyaan yang Sering Ditanyakan</h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-200 px-6">
            {faqs.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 text-left py-5"
                  >
                    <span className="font-medium text-brand-dark">{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <p className="pb-5 text-sm text-slate-500 leading-relaxed">{item.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Blog */}
      {features.showBlogSection !== false && (
        <section id="blog">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Blog
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">Artikel Terbaru</h2>
              <p className="text-slate-500 mt-2">Tips dan insight seputar website dan bisnis digital.</p>
            </div>

            {posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 group"
                  >
                    <div className="aspect-video bg-slate-100 overflow-hidden">
                      {post.coverImageUrl && (
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="p-5">
                      {post.category && (
                        <span className="text-xs font-medium text-brand-600">{post.category.name}</span>
                      )}
                      <h3 className="font-semibold text-brand-dark mt-1.5 line-clamp-2">{post.title}</h3>
                      {post.summary && (
                        <p className="text-sm text-slate-500 mt-1.5 line-clamp-2">{post.summary}</p>
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

      {/* Contact CTA */}
      <section>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="bg-white rounded-3xl border border-slate-200 px-6 md:px-12 py-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">Siap Memulai Proyek Website Anda?</h2>
            <p className="text-slate-500 max-w-xl mx-auto mt-3">
              Konsultasikan kebutuhan website Anda bersama tim kami, gratis tanpa komitmen.
            </p>
            <a
              href={waConsult}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium px-7 py-3.5 rounded-full mt-7 transition-colors shadow-lg shadow-brand-500/20"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span>Konsultasi Sekarang</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}