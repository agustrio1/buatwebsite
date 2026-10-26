import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { db } from "~/db";
import { posts } from "~/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft, Eye, Pencil, User, Calendar } from "lucide-react";
import { RichTextView } from "~/components/site/rich-text-view";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    columns: { title: true },
  });
  return { title: `Preview: ${post?.title ?? "Artikel"}` };
}

export default async function PostPreview({ params }: { params: Params }) {
  const { id } = await params;

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: { category: true, author: true },
  });

  if (!post) notFound();

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Belum dipublikasikan";

  return (
    <div>
      {/* Banner preview mode */}
      <div className="sticky top-0 z-50 bg-amber-500 text-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Eye size={16} />
            Mode Pratinjau — begini kira-kira tampilan artikel di halaman publik
            {post.status === "draft" && (
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full ml-1">
                Draft
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/posts/${post.id}/edit`}
              className="flex items-center gap-1.5 bg-white text-amber-600 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-amber-50"
            >
              <Pencil size={14} /> Edit
            </Link>
            <Link
              href="/admin/posts"
              className="flex items-center gap-1.5 text-white/90 text-sm hover:text-white"
            >
              <ArrowLeft size={14} /> Kembali
            </Link>
          </div>
        </div>
      </div>

      {/* Render mirip persis halaman publik blog detail */}
      <article className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
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
          <span className="flex items-center gap-1.5">
            <Calendar size={15} /> {formattedDate}
          </span>
        </div>

        {post.coverImageUrl && (
          <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 mt-8">
            <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {post.summary && (
          <p className="text-lg text-slate-500 italic leading-relaxed mt-8 border-l-2 border-brand-200 pl-4">
            {post.summary}
          </p>
        )}

        <div className="mt-8">
          <RichTextView content={post.contentRich as JSONContent | null} />
        </div>
      </article>
    </div>
  );
}
