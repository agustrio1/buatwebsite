import { useState } from "react";
import { Link, data as createResponse } from "react-router";
import type { Route } from "./+types/$slug";
import { db } from "~/db";
import { posts } from "~/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { ArrowLeft, User, Calendar, List } from "lucide-react";
import { richTextToHtml } from "~/components/site/rich-text-view";
import { resizeImage, buildSrcSet } from "~/lib/imagekit-url";
import type { JSONContent } from "@tiptap/react";
import { checkRedirect } from "~/lib/redirects.server";
import { getPublicSettings } from "~/lib/settings.server";
import { mergeMeta } from "~/lib/meta";
import type { FaqItem } from "~/lib/validation/post-seo";

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

type TocItem = { id: string; text: string; level: number };

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

function absoluteUrl(origin: string, path: string) {
  return /^https?:\/\//i.test(path) ? path : `${origin}${path}`;
}

function toIso(value: Date | string | null | undefined) {
  return value ? new Date(value).toISOString() : undefined;
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  const [post, settings] = await Promise.all([
    db.query.posts.findFirst({
      where: eq(posts.slug, params.slug),
      with: { category: true, author: true },
    }),
    getPublicSettings(),
  ]);

  if (!post || post.status !== "published") {
    await checkRedirect(url.pathname);
    throw new Response("Not found", { status: 404 });
  }

  const rawHtml = richTextToHtml(post.contentRich as JSONContent | null);
  const { html: contentHtml, toc } = rawHtml
    ? addHeadingIdsAndToc(rawHtml)
    : { html: "", toc: [] as TocItem[] };

  const relatedPosts = post.categoryId
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
  const siteName: string = general.siteName ?? "Nama Situs";
  const siteLogo: string | undefined = general.logoUrl ?? undefined;

  const origin = url.origin;
  const canonicalUrl = post.canonicalUrl || `${origin}/blog/${post.slug}`;
  const description = post.metaDescription || post.summary || "";

  // Gambar OG: upload khusus > cover image
  const ogImage = post.ogImageUrl
    ? absoluteUrl(origin, post.ogImageUrl)
    : post.coverImageUrl
      ? absoluteUrl(origin, resizeImage(post.coverImageUrl, 1200))
      : undefined;

  const images = post.ogImageUrl
    ? [absoluteUrl(origin, post.ogImageUrl)]
    : post.coverImageUrl
      ? [1200, 768, 480].map((w) => absoluteUrl(origin, resizeImage(post.coverImageUrl!, w)))
      : undefined;

  const faqs: FaqItem[] = Array.isArray(post.faqs)
    ? (post.faqs as FaqItem[]).filter((f) => f?.question && f?.answer)
    : [];

  // ---- JSON-LD ----
  const graph: Record<string, unknown>[] = [];

  if (post.schemaType !== "None") {
    graph.push({
      "@type": post.schemaType,
      "@id": `${canonicalUrl}#article`,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
      headline: post.title,
      description,
      image: images,
      datePublished: toIso(post.publishedAt ?? post.createdAt),
      dateModified: toIso(post.updatedAt),
      author: post.author ? { "@type": "Person", name: post.author.name } : undefined,
      publisher: {
        "@type": "Organization",
        name: siteName,
        logo: { "@type": "ImageObject", url: siteLogo ?? `${origin}/logo.png` },
      },
      articleSection: post.category?.name,
      url: canonicalUrl,
      inLanguage: "id-ID",
    });
  }

  graph.push({
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: origin },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${origin}/blog` },
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

  return createResponse(
    {
      post,
      contentHtml,
      toc,
      relatedPosts,
      faqs,
      jsonLd,
      canonicalUrl,
      description,
      ogImage,
      siteName,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  if (!loaderData?.post) {
    return [{ title: "Artikel tidak ditemukan" }];
  }

  const { post, canonicalUrl, siteName, description, ogImage } = loaderData;
  const title = post.metaTitle || `${post.title} | ${siteName}`;
  const socialTitle = post.metaTitle || post.title;

  const tags: any[] = [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: canonicalUrl },
    { tagName: "link", rel: "alternate", hrefLang: "id", href: canonicalUrl },
    { tagName: "link", rel: "alternate", hrefLang: "x-default", href: canonicalUrl },
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: siteName },
    { property: "og:title", content: socialTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: canonicalUrl },
    { property: "og:locale", content: "id_ID" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: socialTitle },
    { name: "twitter:description", content: description },
  ];

  if (post.noindex) {
    tags.push({ name: "robots", content: "noindex, nofollow" });
  }

  if (post.publishedAt) {
    tags.push({ property: "article:published_time", content: String(post.publishedAt) });
  }
  if (post.updatedAt) {
    tags.push({ property: "article:modified_time", content: String(post.updatedAt) });
  }
  if (post.category) {
    tags.push({ property: "article:section", content: post.category.name });
  }
  if (post.author) {
    tags.push({ property: "article:author", content: post.author.name });
  }

  if (ogImage) {
    tags.push(
      { property: "og:image", content: ogImage },
      { property: "og:image:alt", content: post.title },
      { name: "twitter:image", content: ogImage },
      { name: "twitter:image:alt", content: post.title }
    );
    // Dimensi hanya pasti kalau gambar berasal dari cover (di-resize 1200)
    if (!post.ogImageUrl) {
      tags.push(
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "675" }
      );
    }
  }

  return mergeMeta(matches, tags);
}

export default function BlogDetail({ loaderData }: Route.ComponentProps) {
  const {
    post,
    contentHtml = "",
    toc = [],
    relatedPosts = [],
    faqs = [],
    jsonLd,
  } = loaderData;

  const [isTocOpen, setIsTocOpen] = useState(true);

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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Link to="/blog" prefetch="intent" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors mb-8">
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

      {toc.length > 0 && (
        <nav className="mt-8 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsTocOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-2 px-5 py-4 text-sm font-semibold text-brand-dark"
          >
            <span className="flex items-center gap-2">
              <List size={16} />
              Daftar Isi
            </span>
            <span className={`transition-transform duration-200 ${isTocOpen ? "rotate-180" : ""}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          {isTocOpen && (
            <ul className="space-y-1.5 text-sm px-5 pb-5">
              {toc.map((item) => {
                const indentClass = item.level === 3 ? "ml-4" : "ml-0";
                return (
                  <li key={item.id} className={indentClass}>
                    <a href={`#${item.id}`} className="text-slate-600 hover:text-brand-600 transition-colors">{item.text}</a>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      )}

      {contentHtml && (
        <div
          className="prose prose-sm sm:prose-base max-w-none mt-8 [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
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
                  to={`/blog/${related.slug}`}
                  prefetch="intent"
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