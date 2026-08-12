import { redirect } from "react-router";
import type { Route } from "./+types/new";
import { db } from "~/db";
import { posts, categories } from "~/db/schema";
import { imagekit } from "~/lib/imagekit-server";
import { requireAdmin } from "~/lib/session.server";
import { PostForm } from "~/components/admin/post-form";

export async function loader() {
  const categoryList = await db.query.categories.findMany();
  return { categories: categoryList };
}

export async function action({ request }: Route.ActionArgs) {
  const { userId } = await requireAdmin(request);
  const formData = await request.formData();

  const title = String(formData.get("title"));
  const slug = String(formData.get("slug"));
  const summary = String(formData.get("summary") ?? "") || null;
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const status = String(formData.get("status")) as "draft" | "published";

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

export default function NewPost({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Tulis Artikel</h1>
      <PostForm categories={loaderData.categories} />
    </div>
  );
}