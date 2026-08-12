import { redirect } from "react-router";
import type { Route } from "./+types/new";
import { db } from "~/db";
import { projects, projectImages } from "~/db/schema";
import { imagekit } from "~/lib/imagekit-server";
import { ProjectForm } from "~/components/admin/project-form";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

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
  let coverImageUrl: string | null = null;
  let coverImageId: string | null = null;

  if (coverFile && coverFile.size > 0) {
    const buffer = Buffer.from(await coverFile.arrayBuffer());
    const uploaded = await imagekit.upload({
      file: buffer,
      fileName: coverFile.name,
      folder: "/projects/cover",
    });
    coverImageUrl = uploaded.url;
    coverImageId = uploaded.fileId;
  }

  const [project] = await db
    .insert(projects)
    .values({
      title,
      slug,
      clientName,
      summary,
      descriptionRich,
      liveDemoUrl,
      techStack,
      coverImageUrl,
      coverImageId,
      isFeatured,
    })
    .returning();

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
      projectId: project.id,
      imageUrl: uploaded.url,
      imageId: uploaded.fileId,
      sortOrder: index,
    });
  }

  return redirect("/admin/projects");
}

export default function NewProject() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Tambah Portofolio</h1>
      <ProjectForm />
    </div>
  );
}