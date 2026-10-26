import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { db } from "~/db";
import { getPublicSettings } from "~/lib/settings.server";
import { PostForm } from "~/components/admin/post-form";
import { createPost } from "../actions";

export default async function NewPost() {
  const categoryList = await db.query.categories.findMany();
  const settings = await getPublicSettings();
  const siteName: string = settings.general?.siteName ?? "";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/posts"
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-colors"
            aria-label="Kembali ke daftar artikel"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Blog</p>
            <h1 className="text-xl md:text-2xl font-bold text-brand-dark truncate">Tulis Artikel Baru</h1>
          </div>
        </div>

        <span
          title="Preview tersedia setelah artikel disimpan"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-400 cursor-not-allowed"
        >
          <Eye size={16} />
          Pratinjau
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-8">
        <PostForm action={createPost} categories={categoryList} siteName={siteName} />
      </div>
    </div>
  );
}
