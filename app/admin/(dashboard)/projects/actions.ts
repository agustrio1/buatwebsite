"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { revalidateProjectPages } from "~/lib/revalidate-public";
import { db } from "~/db";
import { projects, projectImages } from "~/db/schema";
import { eq, inArray } from "drizzle-orm";
import { uploadToR2, deleteFromR2 } from "~/lib/r2-server";
import { requireAdmin } from "~/lib/session.server";

function readBaseValues(formData: FormData) {
  const title = String(formData.get("title"));
  const slug = String(formData.get("slug"));
  const clientName = String(formData.get("clientName") ?? "") || null;
  const summary = String(formData.get("summary") ?? "") || null;
  const liveDemoUrl = String(formData.get("liveDemoUrl") ?? "") || null;
  const techStack = String(formData.get("techStack") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const isFeatured = formData.get("isFeatured") === "true";

  const descriptionRichRaw = String(formData.get("descriptionRich") ?? "");
  const descriptionRich = descriptionRichRaw ? JSON.parse(descriptionRichRaw) : null;

  return { title, slug, clientName, summary, descriptionRich, liveDemoUrl, techStack, isFeatured };
}

export async function createProject(formData: FormData) {
  await requireAdmin();
  const values = readBaseValues(formData);

  const coverImageUrl = String(formData.get("coverImageUrl") ?? "") || null;
  const coverImageId = String(formData.get("coverImageId") ?? "") || null;

  const [project] = await db
    .insert(projects)
    .values({ ...values, coverImageUrl, coverImageId })
    .returning();

  const galleryRaw = String(formData.get("galleryUploads") ?? "");
  const gallery: { url: string; key: string }[] = galleryRaw ? JSON.parse(galleryRaw) : [];

  // neon-http nggak support db.transaction(), jadi insert galeri sequential
  for (const [index, img] of gallery.entries()) {
    await db.insert(projectImages).values({
      projectId: project.id,
      imageUrl: img.url,
      imageId: img.key,
      sortOrder: index,
    });
  }

  revalidateProjectPages([values.slug]);
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function updateProject(id: string, formData: FormData) {
  await requireAdmin();
  const values = readBaseValues(formData);
  const before = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    columns: { slug: true },
  });

  const updates: Record<string, unknown> = { ...values };

  // Cabang File di bawah ini dipertahankan apa adanya dari legacy: form tidak
  // pernah mengirim field bernama "coverImage"/"galleryImages" (upload-nya lewat
  // uploadDirect + hidden input), jadi cabang ini no-op saat edit.
  const coverFile = formData.get("coverImage") as File | null;
  if (coverFile && coverFile.size > 0) {
    const existing = await db.query.projects.findFirst({ where: eq(projects.id, id) });
    await deleteFromR2(existing?.coverImageId);
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    const uploaded = await uploadToR2(buffer, coverFile.name, "projects/cover", coverFile.type);
    updates.coverImageUrl = uploaded.url;
    updates.coverImageId = uploaded.key;
  }

  await db.update(projects).set(updates).where(eq(projects.id, id));

  const existingImages = await db.query.projectImages.findMany({
    where: eq(projectImages.projectId, id),
  });
  const startOrder = existingImages.length;

  const galleryFiles = formData.getAll("galleryImages") as File[];
  for (const [index, file] of galleryFiles.entries()) {
    if (!file || file.size === 0) continue;
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToR2(buffer, file.name, "projects/gallery", file.type);
    await db.insert(projectImages).values({
      projectId: id,
      imageUrl: uploaded.url,
      imageId: uploaded.key,
      sortOrder: startOrder + index,
    });
  }

  revalidateProjectPages([values.slug, before?.slug]);
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function deleteProjectImage(imageId: string) {
  await requireAdmin();
  const image = await db.query.projectImages.findFirst({
    where: eq(projectImages.imageId, imageId),
  });
  if (image) {
    await deleteFromR2(imageId);
    await db.delete(projectImages).where(eq(projectImages.id, image.id));
    const owner = await db.query.projects.findFirst({
      where: eq(projects.id, image.projectId),
      columns: { slug: true },
    });
    revalidateProjectPages([owner?.slug]);
  }
  revalidatePath("/admin/projects");
}

export async function deleteProject(id: string) {
  await requireAdmin();
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: { images: true },
  });

  if (project) {
    await deleteFromR2(project.coverImageId);
    for (const img of project.images) {
      await deleteFromR2(img.imageId);
    }
    await db.delete(projects).where(eq(projects.id, id));
  }

  revalidateProjectPages([project?.slug]);
  revalidatePath("/admin/projects");
}

export async function bulkDeleteProjects(ids: string[]) {
  await requireAdmin();
  if (ids.length === 0) return;

  const rows = await db.query.projects.findMany({
    where: inArray(projects.id, ids),
    with: { images: true },
  });
  for (const row of rows) {
    await deleteFromR2(row.coverImageId);
    for (const img of row.images) {
      await deleteFromR2(img.imageId);
    }
  }
  await db.delete(projects).where(inArray(projects.id, ids));

  revalidateProjectPages(rows.map((r) => r.slug));
  revalidatePath("/admin/projects");
}
