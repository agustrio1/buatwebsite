"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db } from "~/db";
import { pages } from "~/db/schema";
import { requireAdmin } from "~/lib/session.server";
import { logActivity } from "~/lib/activity-log.server";
import { revalidateCustomPages } from "~/lib/revalidate-public";
import { emptyDocument } from "~/lib/page-builder/types";
import {
  pageSchema,
  pageDocumentSchema,
  flattenPageErrors,
  parsePageContent,
  type PageFormErrors,
} from "~/lib/validation/custom-page";

export type PageAdminState = { errors?: PageFormErrors; savedAt?: number } | null;

function seoFields(formData: FormData) {
  return {
    metaTitle: String(formData.get("metaTitle") ?? "").trim() || null,
    metaDescription: String(formData.get("metaDescription") ?? "").trim() || null,
    ogImageUrl: String(formData.get("ogImageUrl") ?? "").trim() || null,
    canonicalUrl: String(formData.get("canonicalUrl") ?? "").trim() || null,
    noindex: formData.get("noindex") === "true" || formData.get("noindex") === "1",
  };
}

/** Buat halaman baru (dokumen kosong) lalu buka builder-nya. */
export async function createPage(
  _prevState: PageAdminState,
  formData: FormData
): Promise<PageAdminState> {
  const { userId } = await requireAdmin();

  const parsed = pageSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    status: "draft",
  });
  if (!parsed.success) return { errors: flattenPageErrors(parsed.error) };

  const { title, slug } = parsed.data;
  const taken = await db.query.pages.findFirst({ where: eq(pages.slug, slug) });
  if (taken) return { errors: { slug: "Slug ini sudah dipakai halaman lain" } };

  const [row] = await db
    .insert(pages)
    .values({ title, slug, status: "draft", content: emptyDocument(), authorId: userId })
    .returning();

  await logActivity({
    userId,
    action: "create",
    entityType: "page",
    entityId: row.id,
    entityLabel: title,
  });

  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${row.id}/edit`);
}

/** Simpan dari builder: field dasar + SEO + dokumen blok (JSON). */
export async function savePage(
  id: string,
  _prevState: PageAdminState,
  formData: FormData
): Promise<PageAdminState> {
  await requireAdmin();

  const parsed = pageSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { errors: flattenPageErrors(parsed.error) };
  const { title, slug, status } = parsed.data;

  const docParsed = pageDocumentSchema.safeParse(
    parsePageContent(String(formData.get("content") ?? ""))
  );
  if (!docParsed.success) {
    return { errors: { content: "Dokumen halaman tidak valid. Muat ulang builder lalu coba lagi." } };
  }

  const slugTaken = await db.query.pages.findFirst({
    where: and(eq(pages.slug, slug), ne(pages.id, id)),
  });
  if (slugTaken) return { errors: { slug: "Slug ini sudah dipakai halaman lain" } };

  const existing = await db.query.pages.findFirst({ where: eq(pages.id, id) });
  if (!existing) return { errors: { slug: "Halaman tidak ditemukan" } };

  await db
    .update(pages)
    .set({
      title,
      slug,
      status,
      content: docParsed.data,
      ...seoFields(formData),
      updatedAt: new Date(),
      publishedAt: status === "published" ? (existing.publishedAt ?? new Date()) : null,
    })
    .where(eq(pages.id, id));

  await logActivity({
    action: "update",
    entityType: "page",
    entityId: id,
    entityLabel: title,
  });

  revalidateCustomPages([slug, existing.slug]);
  revalidatePath("/admin/pages");
  return { savedAt: Date.now() };
}

export async function deletePage(id: string) {
  await requireAdmin();
  const page = await db.query.pages.findFirst({ where: eq(pages.id, id) });
  await db.delete(pages).where(eq(pages.id, id));

  await logActivity({
    action: "delete",
    entityType: "page",
    entityId: id,
    entityLabel: page?.title,
  });

  revalidateCustomPages([page?.slug]);
  revalidatePath("/admin/pages");
}
