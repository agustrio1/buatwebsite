import { useState } from "react";
import { Link, data as createResponse } from "react-router";
import type { Route } from "./+types/$slug";
import { db } from "~/db";
import { posts, siteSettings } from "~/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { ArrowLeft, User, Calendar, List } from "lucide-react";
import { richTextToHtml } from "~/components/site/rich-text-view";
import { resizeImage, buildSrcSet } from "~/lib/imagekit-url";
import type { JSONContent } from "@tiptap/react";
import { checkRedirect } from "~/lib/redirects.server";

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

export async function loader({ params, request }: Route.LoaderArgs) {
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, params.slug),
    with: { category: true, author: true },
  });

  if (!post || post.status !== "published") {
    const url = new URL(request.url);
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

  const settingsRows = await db.query.siteSettings.findMany();
  const settingsMap = Object.fromEntries(
    settingsRows.map((s) => [s.key, s.value])
  );
  const siteName = (settingsMap["site_name"] as string) ?? "Nama Situs";
  const siteLogo = (settingsMap["site_logo_url"] as string | undefined) ?? undefined;

  const url = new URL(request.url);
  const canonicalUrl = `${url.origin}/blog/${post.slug}`;

  return createResponse(
    {
      post,
      contentHtml,
      toc,
      relatedPosts,
      canonicalUrl,
      origin: url.origin,
      siteName,
      siteLogo,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.post) {
    return [{ title: "Artikel tidak ditemukan" }];
  }

  const { post, canonicalUrl, siteName } = loaderData;
  const description = post.summary ?? "";
  const featuredImage = post.coverImageUrl
    ? resizeImage(post.coverImageUrl, 1200)
    : undefined;

  const tags: Route.MetaDescriptors = [
    { title: `${post.title} | ${siteName}` },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: canonicalUrl },
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: siteName },
    { property: "og:title", content: post.title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonicalUrl },
    { property: "og:locale", content: "id_ID" },
    { property: "article:published_time", content: post.publishedAt?.toString() ?? "" },
    { property: "article:modified_time", content: post.updatedAt?.toString() ?? "" },
    ...(post.category ? [{ property: "article:section", content: post.category.name }] : []),
    ...(post.author ? [{ property: "article:author", content: post.author.name }] : []),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: post.title },
    { name: "twitter:description", content: description },
  ];

  if (featuredImage) {
    tags.push(
      { property: "og:image", content: featuredImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "675" },
      { property: "og:image:alt", content: post.title },
      { name: "twitter:image", content: featuredImage }
    );
  }

  return tags;
}

export default function BlogDetail({ loaderData }: Route.ComponentProps) {
  const {
    post,
    contentHtml = "",
    toc = [],
    relatedPosts = [],
    canonicalUrl,
    origin,
    siteName,
    siteLogo,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    headline: post.title,
    description: post.summary ?? "",
    image: post.coverImageUrl
      ? [
          resizeImage(post.coverImageUrl, 1200),
          resizeImage(post.coverImageUrl, 768),
          resizeImage(post.coverImageUrl, 480),
        ]
      : undefined,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.name,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: siteLogo ?? `${origin}/logo.png`,
      },
    },
    articleSection: post.category?.name,
    url: canonicalUrl,
  };

  return (
    <article className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors mb-8">
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