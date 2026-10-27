import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "~/db";
import { posts } from "~/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { ArrowLeft, User, Calendar } from "lucide-react";
import { richTextToHtml } from "~/components/site/rich-text-view";
import { resizeImage, buildSrcSet } from "~/lib/imagekit-url";
import type { JSONContent } from "@tiptap/react";
import { getPublicSettings } from "~/lib/settings.server";
import { getSiteUrl, ogUrl } from "~/lib/seo";
import { safeJsonLd } from "~/lib/json-ld";
import { buildMetadata } from "~/lib/metadata";
import type { FaqItem } from "~/lib/validation/post-seo";
import { TocNav } from "~/components/site/toc-nav";
import { servicePages } from "~/data/service-pages";
import { ArrowRight } from "lucide-react";

type TocItem = { id: string; text: string; level: number };

// ---------- tautan layanan internal ----------

const GENERIC_TOKENS = new Set([
  "jasa",
  "buat",
  "bikin",
  "website",
  "web",
  "sistem",
  "custom",
  "profesional",
  "murah",
]);

/**
 * Cocokkan artikel dengan halaman layanan: sebutan slug ("toko-online"),
 * kedua kata kunci slug ("company" + "profile"), atau frasa keyword terdaftar.
 */
function matchServicePages(hay: string): { slug: string; title: string }[] {
  const out: { slug: string; title: string; score: number }[] = [];
  for (const s of servicePages) {
    let score = 0;
    if (hay.includes(s.slug)) score += 2;
    const tokens = s.slug.split("-").filter((t) => t.length > 3 && !GENERIC_TOKENS.has(t));
    if (tokens.length && tokens.every((t) => hay.includes(t))) score += 2;
    for (const kw of s.keywords ?? []) {
      if (hay.includes(kw.toLowerCase())) {
        score += 1;
        break;
      }
    }
    if (score >= 2) out.push({ slug: s.slug, title: s.title, score });
  }
  return out
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ slug, title }) => ({ slug, title }));
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function addHeadingIdsAndToc(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const usedIds = new Set<string>();

  const newHtml = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_match, level: string, attrs: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      const baseId = slugify(text) || `heading-${toc.length + 1}`;
      let uniqueId = baseId;
      let i = 2;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${baseId}-${i}`;
        i++;
      }
      usedIds.add(uniqueId);
      toc.push({ id: uniqueId, text, level: Number(level) });
      return `<h${level}${attrs} id="${uniqueId}">${inner}</h${level}>`;
    }
  );

  return { html: newHtml, toc };
}

function absoluteUrl(base: string, path: string) {
  return /^https?:\/\//i.test(path) ? path : `${base}${path}`;
}

function toIso(value: Date | string | null | undefined) {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

// Prerender seluruh artikel published saat build (SSG); slug baru dibuat
// on-demand lalu di-cache (ISR) setelahnya.
export const revalidate = 300;

export async function generateStaticParams() {
  const rows = await db.query.posts.findMany({
    where: eq(posts.status, "published"),
    columns: { slug: true },
  });
  return rows.map((r) => ({ slug: r.slug }));
}

// generateMetadata dan Page dipanggil pada request yang sama; cache() memastikan
// seluruh query (post, related, settings, siteUrl) hanya dijalankan sekali.
const getBlogPageData = cache(async (slug: string) => {
  const [post, settings, siteUrl] = await Promise.all([
    db.query.posts.findFirst({
      where: eq(posts.slug, slug),
      with: { category: true, author: true },
    }),
    getPublicSettings(),
    getSiteUrl(),
  ]);

  if (!post || post.status !== "published") return null;

  const rawHtml = richTextToHtml(post.contentRich as JSONContent | null);
  const { html: contentHtml, toc } = rawHtml
    ? addHeadingIdsAndToc(rawHtml)
    : { html: "", toc: [] as TocItem[] };

  // Layanan yang disebut artikel ini → box tautan internal (dofollow)
  const hay = `${post.title} ${post.summary ?? ""} ${(contentHtml || "").replace(/<[^>]+>/g, " ")}`.toLowerCase();
  const relatedServices = matchServicePages(hay);

  const relatedRows = post.categoryId
    ? await db.query.posts.findMany({
        where: and(
          eq(posts.categoryId, post.categoryId),
          eq(posts.status, "published"),
          ne(posts.id, post.id)
        ),
        orderBy: desc(posts.publishedAt),
        limit: 4,
        with: { category: true },
      })
    : [];

  const general = (settings.general as Record<string, any>) ?? {};
  const siteName: string = general.siteName ?? "JadikanWeb";

  const canonicalUrl = post.canonicalUrl || `${siteUrl}/blog/${post.slug}`;
  const description = post.metaDescription || post.summary || "";

  // Gambar OG: upload khusus > cover image > generator dinamis /og
  const ogImage = post.ogImageUrl
    ? absoluteUrl(siteUrl, post.ogImageUrl)
    : post.coverImageUrl
      ? absoluteUrl(siteUrl, resizeImage(post.coverImageUrl, 1200) ?? "")
      : ogUrl({ siteUrl, title: post.title, subtitle: description, label: siteName });

  const schemaImages = post.ogImageUrl
    ? [absoluteUrl(siteUrl, post.ogImageUrl)]
    : post.coverImageUrl
      ? [1200, 768, 480].map((w) =>
          absoluteUrl(siteUrl, resizeImage(post.coverImageUrl!, w) ?? "")
        )
      : undefined;

  const faqs: FaqItem[] = Array.isArray(post.faqs)
    ? (post.faqs as FaqItem[]).filter((f) => f?.question && f?.answer)
    : [];

  const publishedIso = toIso(post.publishedAt ?? post.createdAt);
  const modifiedIso = toIso(post.updatedAt);

  // @id ini harus sama dengan yang dibuat di root.tsx
  const orgId = `${siteUrl}/#organization`;

  // ---- JSON-LD ----
  const graph: Record<string, unknown>[] = [];

  if (post.schemaType !== "None") {
    graph.push({
      "@type": post.schemaType,
      "@id": `${canonicalUrl}#article`,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
      headline: post.title,
      description,
      image: schemaImages,
      datePublished: publishedIso,
      dateModified: modifiedIso ?? publishedIso,
      author: post.author
        ? { "@type": "Person", name: post.author.name }
        : { "@id": orgId },
      publisher: { "@id": orgId },
      articleSection: post.category?.name,
      url: canonicalUrl,
      inLanguage: "id-ID",
    });
  }

  graph.push({
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
    ],
  });

  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  if (post.customJsonLd) {
    try {
      const parsed = JSON.parse(post.customJsonLd);
      const items = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.["@graph"])
          ? parsed["@graph"]
          : [parsed];
      for (const item of items) {
        if (item && typeof item === "object") {
          const { "@context": _ctx, ...rest } = item as Record<string, unknown>;
          graph.push(rest);
        }
      }
    } catch {
      // JSON-LD custom rusak: abaikan, jangan bikin halaman error
    }
  }

  const jsonLd = { "@context": "https://schema.org", "@graph": graph };

  // Hanya kolom yang dipakai di halaman. contentRich sengaja tidak ikut dipakai.
  const postData = {
    id: post.id,
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    coverImageUrl: post.coverImageUrl,
    ogImageUrl: post.ogImageUrl,
    metaTitle: post.metaTitle,
    noindex: post.noindex,
    publishedAt: publishedIso ?? null,
    updatedAt: modifiedIso ?? null,
    category: post.category ? { name: post.category.name } : null,
    author: post.author ? { name: post.author.name } : null,
  };

  const relatedPosts = relatedRows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    coverImageUrl: r.coverImageUrl,
    category: r.category ? { name: r.category.name } : null,
  }));

  return {
    post: postData,
    contentHtml,
    toc,
    relatedPosts,
    relatedServices,
    faqs,
    jsonLd,
    canonicalUrl,
    description,
    ogImage,
    siteName,
  };
});

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await getBlogPageData(slug);
  if (!data) return { title: "Artikel tidak ditemukan" };

  const { post, canonicalUrl, siteName, description, ogImage } = data;
  const title = post.metaTitle || `${post.title} | ${siteName}`;
  const socialTitle = post.metaTitle || post.title;

  return buildMetadata({
    title,
    socialTitle,
    description,
    path: `/blog/${post.slug}`,
    canonical: canonicalUrl,
    ogImage,
    ogImageAlt: post.title,
    // Dimensi pasti hanya utk generator /og (1200x630); cover/upload tingginya variatif.
    ogImageDimensions:
      !post.ogImageUrl && !post.coverImageUrl ? { width: 1200, height: 630 } : undefined,
    ogType: "article",
    noindex: post.noindex ?? undefined,
    article: {
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt ?? undefined,
      section: post.category?.name,
      author: post.author?.name,
    },
  });
}

export default async function BlogDetail({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await getBlogPageData(slug);
  if (!data) notFound();

  const { post, contentHtml = "", toc = [], relatedPosts = [], relatedServices = [], faqs = [], jsonLd } = data;

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const featuredSrc = post.coverImageUrl ? resizeImage(post.coverImageUrl, 1024) : undefined;
  const featuredSrcSet = post.coverImageUrl ? buildSrcSet(post.coverImageUrl, 1024) : undefined;

  return (
    <article className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors mb-8">
        <ArrowLeft size={16} /> Kembali ke Blog
      </Link>

      {post.category && (
        <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          {post.category.name}
        </span>
      )}

      <h1 className="text-2xl md:text-4xl font-bold text-brand-dark leading-tight">
        {post.title}
      </h1>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 mt-5">
        {post.author && (
          <span className="flex items-center gap-1.5">
            <User size={15} /> {post.author.name}
          </span>
        )}
        {formattedDate && (
          <span className="flex items-center gap-1.5">
            <Calendar size={15} /> {formattedDate}
          </span>
        )}
      </div>

      {featuredSrc && (
        <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 mt-8">
          <img
            src={featuredSrc}
            srcSet={featuredSrcSet}
            sizes="(max-width: 767px) 100vw, 768px"
            alt={post.title}
            loading="eager"
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {post.summary && (
        <p className="text-lg text-slate-500 italic leading-relaxed mt-8 border-l-2 border-brand-200 pl-4">
          {post.summary}
        </p>
      )}

      <TocNav toc={toc} />

      {contentHtml && (
        <div
          className="prose prose-sm sm:prose-base max-w-none mt-8 [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      )}

      {relatedServices.length > 0 && (
        <section className="mt-10 rounded-2xl border border-brand-200 bg-brand-50/60 p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-brand-700">Layanan terkait</h2>
          <ul className="mt-3 space-y-2">
            {relatedServices.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/layanan/${s.slug}`}
                  className="group inline-flex items-center gap-2 text-sm font-medium text-brand-dark hover:text-brand-600"
                >
                  <ArrowRight size={15} className="text-brand-500 transition-transform group-hover:translate-x-0.5" />
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl md:text-2xl font-bold text-brand-dark">
            Pertanyaan yang Sering Ditanyakan
          </h2>
          <div className="mt-5 space-y-3">
            {faqs.map((f) => (
              <details key={f.question} className="rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer font-medium text-brand-dark">{f.question}</summary>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-10 border-t border-slate-200">
          <h2 className="text-xl font-bold text-brand-dark mb-6">Artikel Terkait</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedPosts.map((related) => {
              const relatedSrc = related.coverImageUrl
                ? resizeImage(related.coverImageUrl, 480)
                : undefined;
              return (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  prefetch={false}
                  className="group flex flex-col rounded-xl overflow-hidden border border-slate-200 hover:shadow-md transition-shadow"
                >
                  {relatedSrc && (
                    <div className="aspect-video bg-slate-100 overflow-hidden">
                      <img
                        src={relatedSrc}
                        alt={related.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    {related.category && (
                      <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
                        {related.category.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-brand-dark mt-1 line-clamp-2 group-hover:text-brand-600 transition-colors">
                      {related.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
