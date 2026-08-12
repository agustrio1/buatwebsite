import { redirect } from "react-router";
import type { Route } from "./+types/$id.edit";
import { db } from "~/db";
import { projects, projectImages } from "~/db/schema";
import { eq, asc } from "drizzle-orm";
import { imagekit } from "~/lib/imagekit-server";
import { ProjectForm } from "~/components/admin/project-form";
import type { JSONContent } from "@tiptap/react";

export async function loader({ params }: Route.LoaderArgs) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, params.id),
    with: { images: { orderBy: [asc(projectImages.sortOrder)] } },
  });

  if (!project) throw new Response("Not found", { status: 404 });

  return { project };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete-image") {
    const imageId = String(formData.get("imageId"));
    const image = await db.query.projectImages.findFirst({
      where: eq(projectImages.imageId, imageId),
    });
    if (image) {
      await imagekit.deleteFile(imageId).catch(() => null);
      await db.delete(projectImages).where(eq(projectImages.id, image.id));
    }
    return null;
  }

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

  const coverFile = formData.get("coverImage") as File | null;
  const updates: Record<string, unknown> = {
    title,
    slug,
    clientName,
    summary,
    descriptionRich,
    liveDemoUrl,
    techStack,
    isFeatured,
  };

  if (coverFile && coverFile.size > 0) {
    const existing = await db.query.projects.findFirst({ where: eq(projects.id, params.id) });
    if (existing?.coverImageId) {
      await imagekit.deleteFile(existing.coverImageId).catch(() => null);
    }
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    const uploaded = await imagekit.upload({
      file: buffer,
      fileName: coverFile.name,
      folder: "/projects/cover",
    });
    updates.coverImageUrl = uploaded.url;
    updates.coverImageId = uploaded.fileId;
  }

  await db.update(projects).set(updates).where(eq(projects.id, params.id));

  const existingImages = await db.query.projectImages.findMany({
    where: eq(projectImages.projectId, params.id),
  });
  const startOrder = existingImages.length;

  const galleryFiles = formData.getAll("galleryImages") as File[];
  for (const [index, file] of galleryFiles.entries()) {
    if (!file || file.size === 0) continue;
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: "/projects/gallery",
    });
    await db.insert(projectImages).values({
      projectId: params.id,
      imageUrl: uploaded.url,
      imageId: uploaded.fileId,
      sortOrder: startOrder + index,
    });
  }

  return redirect("/admin/projects");
}

export default function EditProject({ loaderData }: Route.ComponentProps) {
  const { project } = loaderData;

  async function handleDeleteImage(imageId: string) {
    if (!confirm("Hapus gambar ini?")) return;
    const fd = new FormData();
    fd.set("intent", "delete-image");
    fd.set("imageId", imageId);
    await fetch(window.location.pathname, { method: "POST", body: fd });
    window.location.reload();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Edit Proyek</h1>
      <ProjectForm
        defaultValues={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          clientName: project.clientName,
          summary: project.summary,
          descriptionRich: project.descriptionRich as JSONContent | null,
          liveDemoUrl: project.liveDemoUrl,
          techStack: project.techStack ?? [],
          isFeatured: project.isFeatured,
          coverImageUrl: project.coverImageUrl,
          existingGallery: project.images.map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            imageId: img.imageId,
          })),
        }}
        onDeleteImage={handleDeleteImage}
      />
    </div>
  );
}