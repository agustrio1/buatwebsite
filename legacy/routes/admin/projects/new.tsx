import { redirect } from "react-router";
import type { Route } from "./+types/new";
import { db } from "~/db";
import { projects, projectImages } from "~/db/schema";
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

  const coverImageUrl = String(formData.get("coverImageUrl") ?? "") || null;
  const coverImageId = String(formData.get("coverImageId") ?? "") || null;

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

  const galleryRaw = String(formData.get("galleryUploads") ?? "");
  const gallery: { url: string; key: string }[] = galleryRaw ? JSON.parse(galleryRaw) : [];

  for (const [index, img] of gallery.entries()) {
    await db.insert(projectImages).values({
      projectId: project.id,
      imageUrl: img.url,
      imageId: img.key,
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