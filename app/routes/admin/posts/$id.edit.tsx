import { redirect } from "react-router";
import type { Route } from "./+types/$id.edit";
import { db } from "~/db";
import { posts } from "~/db/schema";
import { eq } from "drizzle-orm";
import { imagekit } from "~/lib/imagekit-server";
import { PostForm } from "~/components/admin/post-form";
import type { JSONContent } from "@tiptap/react";

export async function loader({ params }: Route.LoaderArgs) {
  const post = await db.query.posts.findFirst({ where: eq(posts.id, params.id) });
  if (!post) throw new Response("Not found", { status: 404 });

  const categoryList = await db.query.categories.findMany();
  return { post, categories: categoryList };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();

  const title = String(formData.get("title"));
  const slug = String(formData.get("slug"));
  const summary = String(formData.get("summary") ?? "") || null;
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const status = String(formData.get("status")) as "draft" | "published";

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
    updates.coverImageUrl = uploaded.url;
    updates.coverImageId = uploaded.fileId;
  }

  await db.update(posts).set(updates).where(eq(posts.id, params.id));

  return redirect("/admin/posts");
}

export default function EditPost({ loaderData }: Route.ComponentProps) {
  const { post, categories } = loaderData;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Edit Artikel</h1>
      <PostForm
        categories={categories}
        defaultValues={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          summary: post.summary,
          contentRich: post.contentRich as JSONContent | null,
          categoryId: post.categoryId,
          status: post.status,
          coverImageUrl: post.coverImageUrl,
        }}
      />
    </div>
  );
}