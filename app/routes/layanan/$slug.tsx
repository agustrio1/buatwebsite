import { Link, useOutletContext } from "react-router";
import type { ReactNode } from "react";
import type { Route } from "./+types/$slug";
import { servicePages, type ServicePage } from "~/data/service-pages";
import { ArrowRight, ChevronRight, Check, MessageCircle } from "lucide-react";
import { buildWaLink } from "~/lib/format";
import { mergeMeta } from "~/lib/meta";

function absoluteUrl(origin: string, path?: string) {
  if (!path) return undefined;
  return /^https?:\/\//.test(path) ? path : `${origin}${path}`;
}

function formatDateId(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function loader({ params, request }: Route.LoaderArgs) {
  const service = servicePages.find((s) => s.slug === params.slug);
  if (!service) throw new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  return {
    service,
    origin: url.origin,
    host: url.hostname,
    canonical: `${url.origin}${url.pathname.replace(/\/+$/, "")}`,
  };
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  if (!loaderData?.service) return [{ title: "Layanan tidak ditemukan" }];
  const { service, canonical, origin, host } = loaderData;
  const image = absoluteUrl(origin, service.ogImage);

  const tags: any[] = [
    { title: service.metaTitle },
    { name: "description", content: service.metaDesc },
    {
      name: "robots",
      content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
    },
    { tagName: "link", rel: "canonical", href: canonical },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "id_ID" },
    { property: "og:site_name", content: host },
    { property: "og:title", content: service.metaTitle },
    { property: "og:description", content: service.metaDesc },
    { property: "og:url", content: canonical },
    { name: "twitter:title", content: service.metaTitle },
    { name: "twitter:description", content: service.metaDesc },
  ];

  if (image) {
    tags.push(
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: service.title },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: service.title }
    );
  }

  return mergeMeta(matches, tags);
}

function Block({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl md:text-2xl font-bold text-brand-dark">{heading}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function WaButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3.5 rounded-full transition-colors shadow-lg shadow-brand-500/20"
    >
      <MessageCircle size={18} /> Konsultasi Layanan Ini
    </a>
  );
}

export default function LayananDetail({ loaderData }: Route.ComponentProps) {
  const { service, origin, host, canonical } = loaderData;
  const { settings } = useOutletContext<{ settings: Record<string, any> }>();

  const contact = settings.contact ?? {};
  const templates = settings.whatsapp_templates ?? {};
  const waLink = buildWaLink(
    contact.whatsappNumber,
    (templates.packageInquiry ?? "Halo, saya berminat dengan layanan {packageName}").replace(
      "{packageName}",
      service.title
    )
  );

  const related = (service.related ?? [])
    .map((slug) => servicePages.find((s) => s.slug === slug))
    .filter((s): s is ServicePage => Boolean(s));

  const image = absoluteUrl(origin, service.ogImage);

  const orgId = `${origin}/#organization`;
  const siteId = `${origin}/#website`;
  const pageId = `${canonical}#webpage`;
  const serviceId = `${canonical}#service`;
  const breadcrumbId = `${canonical}#breadcrumb`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: host,
        url: origin,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          url: waLink,
          availableLanguage: "id",
        },
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        url: origin,
        name: host,
        inLanguage: "id-ID",
        publisher: { "@id": orgId },
      },
      {
        "@type": "WebPage",
        "@id": pageId,
        url: canonical,
        name: service.metaTitle,
        description: service.metaDesc,
        inLanguage: "id-ID",
        isPartOf: { "@id": siteId },
        breadcrumb: { "@id": breadcrumbId },
        about: { "@id": serviceId },
        ...(image ? { primaryImageOfPage: { "@type": "ImageObject", url: image } } : {}),
        ...(service.updatedAt ? { dateModified: service.updatedAt } : {}),
      },
      {
        "@type": "Service",
        "@id": serviceId,
        name: service.title,
        serviceType: service.title,
        description: service.metaDesc,
        url: canonical,
        image,
        areaServed: { "@type": "Country", name: "Indonesia" },
        provider: { "@id": orgId },
        mainEntityOfPage: { "@id": pageId },
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: origin },
          { "@type": "ListItem", position: 2, name: "Layanan", item: `${origin}/layanan` },
          { "@type": "ListItem", position: 3, name: service.title, item: canonical },
        ],
      },
      ...(service.faqs?.length
        ? [
            {
              "@type": "FAQPage",
              "@id": `${canonical}#faq`,
              isPartOf: { "@id": pageId },
              mainEntity: service.faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <article className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <nav aria-label="Breadcrumb" className="mb-8 min-w-0">
        <ol className="flex items-center gap-1.5 text-sm text-slate-500">
          <li>
            <Link to="/" className="hover:text-brand-600 transition-colors">
              Beranda
            </Link>
          </li>
          <ChevronRight size={14} className="shrink-0" aria-hidden="true" />
          <li>
            <Link to="/layanan" className="hover:text-brand-600 transition-colors">
              Layanan
            </Link>
          </li>
          <ChevronRight size={14} className="shrink-0" aria-hidden="true" />
          <li className="truncate text-slate-400" aria-current="page">
            {service.title}
          </li>
        </ol>
      </nav>

      <h1 className="text-2xl md:text-4xl font-bold text-brand-dark leading-tight">
        {service.title}
      </h1>
      <p className="text-lg text-slate-500 mt-4 leading-relaxed">{service.shortDesc}</p>

      {service.updatedAt && (
        <p className="text-sm text-slate-400 mt-3">
          Diperbarui:{" "}
          <time dateTime={service.updatedAt}>{formatDateId(service.updatedAt)}</time>
        </p>
      )}

      <div className="mt-6">
        <WaButton href={waLink} />
      </div>

      {service.answer && (
        <section className="mt-10">
          <h2 className="text-xl md:text-2xl font-bold text-brand-dark">
            {service.answer.heading}
          </h2>
          <p className="text-slate-700 leading-relaxed mt-3">{service.answer.text}</p>
        </section>
      )}

      <p className="text-slate-600 leading-relaxed mt-10">{service.intro}</p>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-8">
        <h2 className="font-semibold text-brand-dark mb-4">Yang Anda dapatkan</h2>
        <ul className="space-y-3">
          {service.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
              <Check size={16} className="text-brand-500 mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {service.problems && (
        <Block heading={service.problems.heading}>
          <ul className="grid gap-3">
            {service.problems.items.map((p) => (
              <li key={p.title} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-medium text-brand-dark">{p.title}</p>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{p.desc}</p>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {service.metrics && (
        <Block heading={service.metrics.heading}>
          <div className="grid gap-4 sm:grid-cols-3">
            {service.metrics.items.map((m) => (
              <div key={m.title} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-lg font-bold text-brand-600">{m.title}</p>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </Block>
      )}

      {service.process && (
        <Block heading={service.process.heading}>
          <ol className="space-y-5">
            {service.process.items.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-brand-dark">{s.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </Block>
      )}

      {service.faqs && service.faqs.length > 0 && (
        <Block heading="Pertanyaan yang sering ditanyakan">
          <div className="space-y-3">
            {service.faqs.map((f) => (
              <details key={f.q} className="rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer font-medium text-brand-dark">{f.q}</summary>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </Block>
      )}

      {related.length > 0 && (
        <Block heading="Layanan terkait">
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/layanan/${r.slug}`}
                className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-500 transition-colors"
              >
                <p className="font-medium text-brand-dark group-hover:text-brand-600 transition-colors">
                  {r.title}
                </p>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {r.shortDesc}
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-brand-600 mt-3">
                  Lihat layanan <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </Block>
      )}

      <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <p className="font-semibold text-brand-dark">Ceritakan kebutuhan Anda lewat WhatsApp</p>
        <p className="text-sm text-slate-500 mt-1">Konsultasi awal gratis.</p>
        <div className="mt-5">
          <WaButton href={waLink} />
        </div>
      </div>
    </article>
  );
}