"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { revalidatePostPages } from "~/lib/revalidate-public";
import { eq, and, ne, inArray } from "drizzle-orm";
import { db } from "~/db";
import { posts } from "~/db/schema";
import { uploadToR2, deleteFromR2 } from "~/lib/r2-server";
import { requireAdmin } from "~/lib/session.server";
import { postSchema, flattenZodErrors } from "~/lib/validation/post";
import { parseSeoFields } from "~/lib/validation/post-seo";
import { logActivity } from "~/lib/activity-log.server";
import type { PostFormState } from "~/components/admin/post-form";

type PostParseResult = ReturnType<typeof postSchema.safeParse>;
type SeoParseResult = ReturnType<typeof parseSeoFields>;

function buildErrorState(parsed: PostParseResult, seo: SeoParseResult): PostFormState {
  return {
    errors: {
      ...(parsed.success ? {} : flattenZodErrors(parsed.error)),
      ...seo.errors,
    },
  };
}

export async function createPost(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const { userId } = await requireAdmin();

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: String(formData.get("summary") ?? "") || null,
    categoryId: String(formData.get("categoryId") ?? "") || null,
    status: formData.get("status"),
  });

  const seo = parseSeoFields(formData);

  if (!parsed.success || Object.keys(seo.errors).length > 0) {
    return buildErrorState(parsed, seo);
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
    const uploaded = await uploadToR2(buffer, coverFile.name, "posts/cover", coverFile.type);
    coverImageUrl = uploaded.url;
    coverImageId = uploaded.key;
  }

  const ogFile = formData.get("ogImage") as File | null;
  let ogImageUrl: string | null = null;
  let ogImageId: string | null = null;

  if (ogFile && ogFile.size > 0) {
    const buffer = Buffer.from(await ogFile.arrayBuffer());
    const uploaded = await uploadToR2(buffer, ogFile.name, "posts/og", ogFile.type);
    ogImageUrl = uploaded.url;
    ogImageId = uploaded.key;
  }

  const [inserted] = await db
    .insert(posts)
    .values({
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
      ogImageUrl,
      ogImageId,
      metaTitle: seo.values.metaTitle,
      metaDescription: seo.values.metaDescription,
      canonicalUrl: seo.values.canonicalUrl,
      noindex: seo.values.noindex,
      schemaType: seo.values.schemaType,
      customJsonLd: seo.values.customJsonLd,
    })
    .returning();

  await logActivity({
    userId,
    action: "create",
    entityType: "post",
    entityId: inserted.id,
    entityLabel: title,
  });

  revalidatePostPages([slug]);
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function updatePost(
  id: string,
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  await requireAdmin();

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: String(formData.get("summary") ?? "") || null,
    categoryId: String(formData.get("categoryId") ?? "") || null,
    status: formData.get("status"),
  });

  const seo = parseSeoFields(formData);

  if (!parsed.success || Object.keys(seo.errors).length > 0) {
    return buildErrorState(parsed, seo);
  }

  const { title, slug, summary, categoryId, status } = parsed.data;

  const slugTaken = await db.query.posts.findFirst({
    where: and(eq(posts.slug, slug), ne(posts.id, id)),
  });
  if (slugTaken) {
    return { errors: { slug: "Slug ini sudah dipakai artikel lain" } };
  }

  const contentRichRaw = String(formData.get("contentRich") ?? "");
  const contentRich = contentRichRaw ? JSON.parse(contentRichRaw) : { type: "doc", content: [] };

  const existing = await db.query.posts.findFirst({ where: eq(posts.id, id) });

  const updates: Record<string, unknown> = {
    title,
    slug,
    summary,
    categoryId,
    status,
    contentRich,
    updatedAt: new Date(),
    publishedAt: status === "published" ? (existing?.publishedAt ?? new Date()) : null,
    metaTitle: seo.values.metaTitle,
    metaDescription: seo.values.metaDescription,
    canonicalUrl: seo.values.canonicalUrl,
    noindex: seo.values.noindex,
    schemaType: seo.values.schemaType,
    customJsonLd: seo.values.customJsonLd,
  };

  const coverFile = formData.get("coverImage") as File | null;
  if (coverFile && coverFile.size > 0) {
    await deleteFromR2(existing?.coverImageId);
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    const uploaded = await uploadToR2(buffer, coverFile.name, "posts/cover", coverFile.type);
    updates.coverImageUrl = uploaded.url;
    updates.coverImageId = uploaded.key;
  }

  const ogFile = formData.get("ogImage") as File | null;
  if (ogFile && ogFile.size > 0) {
    await deleteFromR2(existing?.ogImageId);
    const buffer = Buffer.from(await ogFile.arrayBuffer());
    const uploaded = await uploadToR2(buffer, ogFile.name, "posts/og", ogFile.type);
    updates.ogImageUrl = uploaded.url;
    updates.ogImageId = uploaded.key;
  } else if (formData.get("removeOgImage") === "1") {
    await deleteFromR2(existing?.ogImageId);
    updates.ogImageUrl = null;
    updates.ogImageId = null;
  }

  await db.update(posts).set(updates).where(eq(posts.id, id));

  await logActivity({
    action: "update",
    entityType: "post",
    entityId: id,
    entityLabel: title,
  });

  revalidatePostPages([slug, existing?.slug]);
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function deletePost(id: string) {
  await requireAdmin();
  const post = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  await deleteFromR2(post?.coverImageId);
  await db.delete(posts).where(eq(posts.id, id));

  await logActivity({
    action: "delete",
    entityType: "post",
    entityId: id,
    entityLabel: post?.title,
  });

  revalidatePostPages([post?.slug]);
  revalidatePath("/admin/posts");
}

export async function bulkDeletePosts(ids: string[]) {
  await requireAdmin();
  if (ids.length === 0) return;

  const rows = await db.query.posts.findMany({ where: inArray(posts.id, ids) });
  for (const row of rows) {
    await deleteFromR2(row.coverImageId);
    await logActivity({
      action: "delete",
      entityType: "post",
      entityId: row.id,
      entityLabel: row.title,
    });
  }
  await db.delete(posts).where(inArray(posts.id, ids));

  revalidatePostPages(rows.map((r) => r.slug));
  revalidatePath("/admin/posts");
}
