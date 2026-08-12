import { Link, Form, useLoaderData } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/db";
import { projects } from "~/db/schema";
import { eq, desc } from "drizzle-orm";
import { imagekit } from "~/lib/imagekit-server";
import { Pencil, Trash2 } from "lucide-react";

export async function loader() {
  const data = await db.query.projects.findMany({
    orderBy: [desc(projects.createdAt)],
    with: { images: true },
  });
  return { projects: data };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const id = String(formData.get("id"));

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: { images: true },
  });

  if (project) {
    if (project.coverImageId) {
      await imagekit.deleteFile(project.coverImageId).catch(() => null);
    }
    for (const img of project.images) {
      await imagekit.deleteFile(img.imageId).catch(() => null);
    }
    await db.delete(projects).where(eq(projects.id, id));
  }

  return null;
}

export default function ProjectsIndex() {
  const { projects } = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Portofolio</h1>
        <Link
          to="/admin/projects/new"
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded"
        >
          + Tambah Proyek
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-video bg-slate-100">
              {p.coverImageUrl && (
                <img src={p.coverImageUrl} alt={p.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-brand-dark truncate">{p.title}</h3>
              {p.clientName && <p className="text-sm text-slate-400">{p.clientName}</p>}
              {p.techStack && p.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.techStack.map((t) => (
                    <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <Link
                  to={`/admin/projects/${p.id}/edit`}
                  className="flex items-center gap-1 text-sm text-brand-600 hover:underline"
                >
                  <Pencil size={14} /> Edit
                </Link>
                <Form method="post">
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    onClick={(e) => {
                      if (!confirm(`Hapus proyek "${p.title}"?`)) e.preventDefault();
                    }}
                    className="flex items-center gap-1 text-sm text-red-500 hover:underline"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </Form>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-slate-400 italic col-span-full text-center py-10">
            Belum ada proyek.
          </p>
        )}
      </div>
    </div>
  );
}