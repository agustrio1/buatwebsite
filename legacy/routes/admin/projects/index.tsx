import { Link, Form, useLoaderData, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/index";
import { db } from "~/db";
import { projects } from "~/db/schema";
import { eq, desc, count, and, or, ilike, inArray } from "drizzle-orm";
import { deleteFromR2 } from "~/lib/r2-server";
import { Pencil, Trash2, Search, X } from "lucide-react";
import { parsePage, getPagination } from "~/lib/pagination";
import { Pagination } from "~/components/shared/pagination";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parsePage(url.searchParams);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const featuredFilter = url.searchParams.get("featured") ?? "";

  const conditions = [];
  if (q) {
    conditions.push(or(ilike(projects.title, `%${q}%`), ilike(projects.clientName, `%${q}%`)));
  }
  if (featuredFilter === "yes") conditions.push(eq(projects.isFeatured, true));
  if (featuredFilter === "no") conditions.push(eq(projects.isFeatured, false));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ value: totalItems }] = await db.select({ value: count() }).from(projects).where(whereClause);
  const { limit, offset, currentPage, totalPages } = getPagination(page, totalItems, 12);

  const data = await db.query.projects.findMany({
    where: whereClause,
    orderBy: [desc(projects.createdAt)],
    with: { images: true },
    limit,
    offset,
  });

  return { projects: data, currentPage, totalPages, q, featuredFilter };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "bulk-delete") {
    const ids = formData.getAll("ids").map(String);
    if (ids.length === 0) return null;

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
    return null;
  }

  const id = String(formData.get("id"));
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

  return null;
}

export default function ProjectsIndex() {
  const { projects, currentPage, totalPages, q, featuredFilter } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIds(new Set());
  }, [searchParams]);

  const allSelected = projects.length > 0 && projects.every((p) => selectedIds.has(p.id));

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(projects.map((p) => p.id)));
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const hasFilter = q || featuredFilter;

  return (
    <div>
      <Form method="post" id="bulk-form" className="hidden">
        <input type="hidden" name="intent" value="bulk-delete" />
      </Form>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-brand-dark">Portofolio</h1>
        <Link to="/admin/projects/new" className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded">
          + Tambah Proyek
        </Link>
      </div>

      <Form method="get" className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-50">
          <label className="block text-xs font-medium text-slate-500 mb-1">Cari nama/klien</label>
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari proyek..."
              className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Featured</label>
          <select name="featured" defaultValue={featuredFilter} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Semua</option>
            <option value="yes">Featured</option>
            <option value="no">Bukan Featured</option>
          </select>
        </div>
        <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm">
          Terapkan
        </button>
        {hasFilter ? (
          <Link to="/admin/projects" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 px-2 py-2">
            <X size={14} /> Reset
          </Link>
        ) : null}
      </Form>

      {selectedIds.size > 0 ? (
        <div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-lg px-4 py-2.5 mb-4">
          <span className="text-sm text-brand-700 font-medium">{selectedIds.size} proyek dipilih</span>
          <button
            type="submit"
            form="bulk-form"
            name="intent"
            value="bulk-delete"
            onClick={(e) => {
              if (!confirm(`Hapus ${selectedIds.size} proyek terpilih?`)) e.preventDefault();
            }}
            className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-medium"
          >
            <Trash2 size={14} /> Hapus Terpilih
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow overflow-hidden relative">
            <label className="absolute top-2 left-2 z-10 bg-white/90 rounded-md p-1 shadow-sm">
              <input
                type="checkbox"
                name="ids"
                value={p.id}
                form="bulk-form"
                checked={selectedIds.has(p.id)}
                onChange={() => toggleOne(p.id)}
                className="w-4 h-4 accent-brand-500 block"
              />
            </label>
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
                <Link to={`/admin/projects/${p.id}/edit`} className="flex items-center gap-1 text-sm text-brand-600 hover:underline">
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
            {hasFilter ? "Tidak ada proyek yang cocok dengan filter." : "Belum ada proyek."}
          </p>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}