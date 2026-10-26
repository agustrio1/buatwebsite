import { notFound } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { db } from "~/db";
import { projects, projectImages } from "~/db/schema";
import { eq, asc } from "drizzle-orm";
import { ProjectForm } from "~/components/admin/project-form";
import { updateProject, deleteProjectImage } from "../../actions";

type Params = Promise<{ id: string }>;

export default async function EditProject({ params }: { params: Params }) {
  const { id } = await params;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: { images: { orderBy: [asc(projectImages.sortOrder)] } },
  });

  if (!project) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Edit Proyek</h1>
      <ProjectForm
        action={updateProject.bind(null, project.id)}
        onDeleteImage={deleteProjectImage}
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
      />
    </div>
  );
}
