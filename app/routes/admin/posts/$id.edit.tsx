import { redirect } from "react-router";
import { Link } from "react-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import type { Route } from "./+types/$id.edit";
import { db } from "~/db";
import { posts } from "~/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { imagekit } from "~/lib/imagekit-server";
import { PostForm } from "~/components/admin/post-form";
import { postSchema, flattenZodErrors } from "~/lib/validation/post";
import type { JSONContent } from "@tiptap/react";

export async function loader({ params }: Route.LoaderArgs) {
  const post = await db.query.posts.findFirst({ where: eq(posts.id, params.id) });
  if (!post) throw new Response("Not found", { status: 404 });

  const categoryList = await db.query.categories.findMany();
  return { post, categories: categoryList };
}

export async function action({ request, params }: Route.ActionArgs) {
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

  const slugTaken = await db.query.posts.findFirst({
    where: and(eq(posts.slug, slug), ne(posts.id, params.id)),
  });
  if (slugTaken) {
    return { errors: { slug: "Slug ini sudah dipakai artikel lain" } };
  }

  const contentRichRaw = String(formData.get("contentRich") ?? "");
  const contentRich = contentRichRaw ? JSON.parse(contentRichRaw) : { type: "doc", content: [] };

  const existing = await db.query.posts.findFirst({ where: eq(posts.id, params.id) });

  const updates: Record<string, unknown> = {
    title,
    slug,
    summary,
    categoryId,
    status,
    contentRich,
    updatedAt: new Date(),
    publishedAt: status === "published" ? (existing?.publishedAt ?? new Date()) : null,
  };

  const coverFile = formData.get("coverImage") as File | null;
  if (coverFile && coverFile.size > 0) {
    if (existing?.coverImageId) {
      await imagekit.deleteFile(existing.coverImageId).catch(() => null);
    }
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    const uploaded = await imagekit.upload({
      file: buffer,
      fileName: coverFile.name,
      folder: "/posts/cover",
    });
    updates.coverImageUrl = `${uploaded.url}?tr=f-webp`;
    updates.coverImageId = uploaded.fileId;
  }

  await db.update(posts).set(updates).where(eq(posts.id, params.id));

  return redirect("/admin/posts");
}

export default function EditPost({ loaderData, actionData }: Route.ComponentProps) {
  const { post, categories } = loaderData;
  const isPublished = post.status === "published";
  const previewHref = "/blog/" + post.slug;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/admin/posts" className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-colors" aria-label="Kembali ke daftar artikel">
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
          categories={categories}
          errors={actionData?.errors}
          defaultValues={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            summary: post.summary,
            contentRich: (post.contentRich ?? null) as JSONContent | null,
            categoryId: post.categoryId,
            status: post.status,
            coverImageUrl: post.coverImageUrl,
          }}
        />
      </div>
    </div>
  );
}