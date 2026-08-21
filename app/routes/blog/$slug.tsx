import { Link, data as createResponse } from "react-router";
import type { Route } from "./+types/$slug";
import { db } from "~/db";
import { posts } from "~/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft, User, Calendar } from "lucide-react";
import { richTextToHtml } from "~/components/site/rich-text-view";
import { resizeImage, buildSrcSet } from "~/lib/imagekit-url";
import type { JSONContent } from "@tiptap/react";

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return loaderHeaders;
}

export async function loader({ params }: Route.LoaderArgs) {
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, params.slug),
    with: { category: true, author: true },
  });

  if (!post || post.status !== "published") {
    throw new Response("Not found", { status: 404 });
  }

  const contentHtml = richTextToHtml(post.contentRich as JSONContent | null);

  return createResponse(
    { post, contentHtml },
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
  return [
    { title: loaderData.post.title },
    { name: "description", content: loaderData.post.summary ?? "" },
  ];
}

export default function BlogDetail({ loaderData }: Route.ComponentProps) {
  const { post, contentHtml } = loaderData;

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <article className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors mb-8"
      >
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

      {post.coverImageUrl && (
        <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 mt-8">
          <img
            src={resizeImage(post.coverImageUrl, 1024)}
            srcSet={buildSrcSet(post.coverImageUrl, 1024)}
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

      {contentHtml && (
        <div
          className="prose prose-sm sm:prose-base max-w-none mt-8"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      )}
    </article>
  );
}
