import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "~/db";
import { projects, projectImages } from "~/db/schema";
import { eq, asc, desc, ne } from "drizzle-orm";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { richTextToHtml } from "~/components/site/rich-text-view";
import { resizeImage, buildSrcSet } from "~/lib/imagekit-url";
import { buildWaLink } from "~/lib/format";
import type { JSONContent } from "@tiptap/react";
import { getSiteUrl } from "~/lib/seo";
import { getPublicSettings } from "~/lib/settings.server";
import { safeJsonLd } from "~/lib/json-ld";
import { absoluteUrl, buildMetadata } from "~/lib/metadata";
import { GalleryLightbox } from "~/components/site/gallery-lightbox";

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

function toIso(value: Date | string | null | undefined) {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

// Prerender seluruh projek saat build (SSG); slug baru dibuat on-demand lalu
// di-cache (ISR) setelahnya.
export const revalidate = 300;

export async function generateStaticParams() {
  const rows = await db.query.projects.findMany({ columns: { slug: true } });
  return rows.map((r) => ({ slug: r.slug }));
}

// generateMetadata dan Page dipanggil pada request yang sama; cache() memastikan
// seluruh query (project, related, settings, siteUrl) hanya dijalankan sekali.
const getPortfolioPageData = cache(async (slug: string) => {
  const [project, settings, siteUrl] = await Promise.all([
    db.query.projects.findFirst({
      where: eq(projects.slug, slug),
      with: { images: { orderBy: [asc(projectImages.sortOrder)] } },
    }),
    getPublicSettings(),
    getSiteUrl(),
  ]);

  if (!project) return null;

  const relatedRows = await db.query.projects.findMany({
    where: ne(projects.id, project.id),
    orderBy: [desc(projects.createdAt)],
    limit: 3,
  });

  const contentHtml = richTextToHtml(project.descriptionRich as JSONContent | null);

  const general = (settings.general as Record<string, any>) ?? {};
  const siteName: string = general.siteName ?? "JadikanWeb";

  const ogImage = absoluteUrl(
    siteUrl,
    project.coverImageUrl ? resizeImage(project.coverImageUrl, 1200) : null
  );

  // Hanya kolom yang dipakai di halaman. descriptionRich sengaja tidak ikut.
  const projectData = {
    id: project.id,
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    coverImageUrl: project.coverImageUrl,
    clientName: project.clientName,
    liveDemoUrl: project.liveDemoUrl,
    techStack: project.techStack,
    createdAt: toIso(project.createdAt) ?? null,
    images: (project.images ?? []).map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      altText: img.altText,
    })),
  };

  const related = relatedRows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    coverImageUrl: r.coverImageUrl,
  }));

  return {
    project: projectData,
    contentHtml,
    related,
    siteUrl,
    siteName,
    ogImage,
    contact: settings?.contact ?? {},
    features: settings?.features ?? {},
  };
});

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await getPortfolioPageData(slug);
  if (!data) return { title: "Demo proyek tidak ditemukan" };

  const { project, siteName, ogImage } = data;
  const title = `${project.title} - Demo Proyek | ${siteName}`;
  const description =
    project.summary ??
    `Demo ${project.title} buatan ${siteName}. Bukan proyek klien, bisa disesuaikan dengan kebutuhan bisnis Anda.`;

  return buildMetadata({
    title,
    description,
    path: `/projek/${project.slug}`,
    ogImage,
    ogImageAlt: `Tampilan demo ${project.title}`,
    // Dimensi hanya pasti kalau cover di-resize 1200.
    ogImageDimensions: ogImage ? { width: 1200, height: 675 } : undefined,
    ogType: "website",
  });
}

export default async function PortfolioDetail({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await getPortfolioPageData(slug);
  if (!data) notFound();

  const { project, contentHtml, related, siteUrl, ogImage, contact, features } = data;
  const images = project.images ?? [];
  const techStack = project.techStack ?? [];

  const waProject = buildWaLink(
    contact.whatsappNumber,
    `Halo, saya tertarik dengan demo "${project.title}". Boleh minta info untuk bisnis saya?`
  );

  const hasTech = techStack.length > 0;
  const showDemo = features.showPortfolioDemoLinks !== false && !!project.liveDemoUrl;
  const pageUrl = `${siteUrl}/projek/${project.slug}`;

  // @id ini harus sama dengan yang dibuat di root
  const orgId = `${siteUrl}/#organization`;

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${pageUrl}#project`,
    name: project.title,
    description: project.summary ?? undefined,
    url: pageUrl,
    inLanguage: "id-ID",
    image: ogImage,
    keywords: hasTech ? techStack.join(", ") : undefined,
    datePublished: project.createdAt ?? undefined,
    creator: { "@id": orgId },
    mainEntityOfPage: pageUrl,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Demo Proyek", item: `${siteUrl}/projek` },
      { "@type": "ListItem", position: 3, name: project.title, item: pageUrl },
    ],
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(projectJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <li>
            <Link href="/" className="transition-colors hover:text-brand-600">
              Beranda
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/projek" className="transition-colors hover:text-brand-600">
              Demo Proyek
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="line-clamp-1 text-slate-600">
            {project.title}
          </li>
        </ol>
      </nav>

      <header>
        <span className="mb-4 inline-block rounded-full bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700">
          Demo Buatan Sendiri
        </span>

        <h1 className="text-2xl font-bold leading-tight text-brand-dark md:text-4xl">
          {project.title}
        </h1>

        {features.showClientName === true && project.clientName && (
          <p className="mt-2 text-slate-500">{project.clientName}</p>
        )}

        {project.summary && (
          <p className="mt-5 text-base leading-relaxed text-slate-600 md:text-lg">
            {project.summary}
          </p>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          {showDemo && (
            <a
              href={project.liveDemoUrl!}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-colors hover:bg-brand-600"
            >
              Lihat Demo
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          )}
          <a
            href={waProject}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2.5 rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Tanya untuk Bisnis Saya
          </a>
        </div>
      </header>

      {project.coverImageUrl && (
        <div className="mt-10 aspect-video overflow-hidden rounded-2xl bg-slate-100">
          <img
            src={resizeImage(project.coverImageUrl, 1024) ?? undefined}
            srcSet={buildSrcSet(project.coverImageUrl, 1024) ?? undefined}
            sizes="(max-width: 767px) 100vw, 896px"
            alt={`Tampilan demo ${project.title}`}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <section aria-labelledby="ringkasan-cepat" className="mt-10">
        <h2 id="ringkasan-cepat" className="sr-only">
          Ringkasan cepat
        </h2>
        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3">
          <div className="bg-white p-5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Jenis</dt>
            <dd className="mt-1.5 text-sm text-slate-700">Demo buatan sendiri, bukan proyek klien</dd>
          </div>
          <div className="bg-white p-5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Teknologi</dt>
            <dd className="mt-1.5 text-sm text-slate-700">
              {hasTech ? techStack.join(", ") : "Sesuai kebutuhan"}
            </dd>
          </div>
          <div className="bg-white p-5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Demo langsung
            </dt>
            <dd className="mt-1.5 text-sm text-slate-700">
              {showDemo ? "Tersedia, bisa dicoba" : "Belum tersedia"}
            </dd>
          </div>
        </dl>
      </section>

      {contentHtml && (
        <div
          className="prose prose-sm mt-10 max-w-none sm:prose-base"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      )}

      {images.length > 0 && (
        <section aria-labelledby="galeri" className="mt-12">
          <h2 id="galeri" className="mb-4 text-lg font-semibold text-brand-dark">
            Galeri
          </h2>
          <GalleryLightbox images={images} title={project.title} />
        </section>
      )}

      <section className="mt-14 rounded-3xl border border-slate-200 bg-slate-50/60 p-6 text-center md:p-10">
        <h2 className="text-xl font-bold text-brand-dark md:text-2xl">
          Butuh sistem seperti ini untuk bisnis Anda?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500 md:text-base">
          Demo ini bisa disesuaikan dengan alur kerja dan kebutuhan Anda. Konsultasi awal gratis dan
          tanpa komitmen.
        </p>
        <a
          href={waProject}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand-500/20 transition-colors hover:bg-brand-600"
        >
          <WhatsAppIcon className="h-5 w-5" />
          <span>Konsultasi via WhatsApp</span>
          <ArrowRight size={18} aria-hidden="true" />
        </a>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="demo-lainnya" className="mt-14">
          <h2 id="demo-lainnya" className="mb-5 text-lg font-semibold text-brand-dark">
            Demo Lainnya
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/projek/${p.slug}`}
                prefetch={false}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="aspect-video overflow-hidden bg-slate-100">
                  {p.coverImageUrl && (
                    <img
                      src={resizeImage(p.coverImageUrl, 400) ?? undefined}
                      srcSet={buildSrcSet(p.coverImageUrl, 400) ?? undefined}
                      sizes="(max-width: 639px) 100vw, 33vw"
                      alt={`Tampilan demo ${p.title}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold text-brand-dark">{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12">
        <Link
          href="/projek"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-brand-600"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Kembali ke Demo Proyek
        </Link>
      </div>
    </article>
  );
}
