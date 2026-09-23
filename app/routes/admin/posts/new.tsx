import { redirect } from "react-router";
import { Link } from "react-router";
import { ArrowLeft, Eye } from "lucide-react";
import type { Route } from "./+types/new";
import { db } from "~/db";
import { posts, categories } from "~/db/schema";
import { imagekit } from "~/lib/imagekit-server";
import { requireAdmin } from "~/lib/session.server";
import { PostForm } from "~/components/admin/post-form";
import { postSchema, flattenZodErrors } from "~/lib/validation/post";

export async function loader() {
  const categoryList = await db.query.categories.findMany();
  return { categories: categoryList };
}

export async function action({ request }: Route.ActionArgs) {
  const { userId } = await requireAdmin(request);
  const formData = await request.formData();

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: String(formData.get("summary") ?? "") || null,
    categoryId: String(formData.get("categoryId") ?? "") || null,
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { errors: flattenZodErrors(parsed.error) };
  }

  const { title, slug, summary, categoryId, status } = parsed.data;

  const existingSlug = await db.query.posts.findFirst({ where: (p, { eq }) => eq(p.slug, slug) });
  if (existingSlug) {
    return { errors: { slug: "Slug ini sudah dipakai artikel lain" } };
  }

  const contentRichRaw = String(formData.get("contentRich") ?? "");
  const contentRich = contentRichRaw ? JSON.parse(contentRichRaw) : { type: "doc", content: [] };

  const coverFile = formData.get("coverImage") as File | null;
  let coverImageUrl: string | null = null;
  let coverImageId: string | null = null;

  if (coverFile && coverFile.size > 0) {
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    const uploaded = await imagekit.upload({
      file: buffer,
      fileName: coverFile.name,
      folder: "/posts/cover",
    });
    coverImageUrl = uploaded.url;
    coverImageId = uploaded.fileId;
  }

  await db.insert(posts).values({
    authorId: userId,
    categoryId,
    title,
    slug,
    summary,
    contentRich,
    status,
    publishedAt: status === "published" ? new Date() : null,
    coverImageUrl,
    coverImageId,
  });

  return redirect("/admin/posts");
}

export default function NewPost({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/admin/posts"
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
        <PostForm categories={loaderData.categories} errors={actionData?.errors} />
      </div>
    </div>
  );
}