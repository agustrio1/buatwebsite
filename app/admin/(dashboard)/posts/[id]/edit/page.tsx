import { notFound } from "next/navigation";
import Link from "next/link";
import type { JSONContent } from "@tiptap/react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { db } from "~/db";
import { posts } from "~/db/schema";
import { eq } from "drizzle-orm";
import { getPublicSettings } from "~/lib/settings.server";
import { PostForm } from "~/components/admin/post-form";
import type { SchemaType } from "~/lib/validation/post-seo";
import { updatePost } from "../../actions";

type Params = Promise<{ id: string }>;

export default async function EditPost({ params }: { params: Params }) {
  const { id } = await params;

  const post = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  if (!post) notFound();

  const categoryList = await db.query.categories.findMany();
  const settings = await getPublicSettings();
  const siteName: string = settings.general?.siteName ?? "";
  const isPublished = post.status === "published";
  const previewHref = "/blog/" + post.slug;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/posts" className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-colors" aria-label="Kembali ke daftar artikel">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Blog</p>
            <h1 className="text-xl md:text-2xl font-bold text-brand-dark truncate">{post.title}</h1>
          </div>
        </div>

        {isPublished ? (
          <a href={previewHref} target="_blank" rel="noreferrer" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-200 bg-brand-50 text-sm font-medium text-brand-700 hover:bg-brand-100 transition-colors">
            <Eye size={16} />
            Lihat Pratinjau
          </a>
        ) : (
          <span title="Artikel masih draft, belum bisa dilihat publik" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-400 cursor-not-allowed">
            <EyeOff size={16} />
            Draft
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-8">
        <PostForm
          action={updatePost.bind(null, post.id)}
          categories={categoryList}
          siteName={siteName}
          defaultValues={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            summary: post.summary,
            contentRich: post.contentRich as JSONContent | null,
            categoryId: post.categoryId,
            status: post.status,
            coverImageUrl: post.coverImageUrl,
            metaTitle: post.metaTitle,
            metaDescription: post.metaDescription,
            ogImageUrl: post.ogImageUrl,
            canonicalUrl: post.canonicalUrl,
            noindex: post.noindex,
            schemaType: post.schemaType as SchemaType,
            customJsonLd: post.customJsonLd,
          }}
        />
      </div>
    </div>
  );
}
