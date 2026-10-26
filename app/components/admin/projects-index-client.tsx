"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil, Trash2, Search, X } from "lucide-react";
import { DeleteForm } from "~/components/admin/delete-form";

export type ProjectRow = {
  id: string;
  title: string;
  clientName: string | null;
  coverImageUrl: string | null;
  techStack: string[] | null;
};

export function ProjectsIndexClient({
  rows,
  q,
  featuredFilter,
  deleteProjectAction,
  bulkDeleteAction,
}: {
  rows: ProjectRow[];
  q: string;
  featuredFilter: string;
  deleteProjectAction: (id: string) => Promise<void>;
  bulkDeleteAction: (ids: string[]) => Promise<void>;
}) {
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSelectedIds(new Set());
  }, [searchParams]);

  const allSelected = rows.length > 0 && rows.every((p) => selectedIds.has(p.id));

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(rows.map((p) => p.id)));
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleBulkDelete() {
    if (!window.confirm(`Hapus ${selectedIds.size} proyek terpilih?`)) return;
    startTransition(() => bulkDeleteAction(Array.from(selectedIds)));
  }

  const hasFilter = q || featuredFilter;

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-brand-dark">Portofolio</h1>
        <Link href="/admin/projects/new" className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded">
          + Tambah Proyek
        </Link>
      </div>

      <form method="get" className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-end">
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
          <Link href="/admin/projects" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 px-2 py-2">
            <X size={14} /> Reset
          </Link>
        ) : null}
      </form>

      {selectedIds.size > 0 ? (
        <div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-lg px-4 py-2.5 mb-4">
          <span className="text-sm text-brand-700 font-medium">{selectedIds.size} proyek dipilih</span>
          <button
            type="button"
            disabled={isPending}
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-medium disabled:opacity-50"
          >
            <Trash2 size={14} /> Hapus Terpilih
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow overflow-hidden relative">
            <label className="absolute top-2 left-2 z-10 bg-white/90 rounded-md p-1 shadow-sm">
              <input
                type="checkbox"
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
                <Link href={`/admin/projects/${p.id}/edit`} className="flex items-center gap-1 text-sm text-brand-600 hover:underline">
                  <Pencil size={14} /> Edit
                </Link>
                <DeleteForm
                  action={() => deleteProjectAction(p.id)}
                  confirmMessage={`Hapus proyek "${p.title}"?`}
                  buttonClassName="flex items-center gap-1 text-sm text-red-500 hover:underline"
                >
                  <Trash2 size={14} /> Hapus
                </DeleteForm>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-slate-400 italic col-span-full text-center py-10">
            {hasFilter ? "Tidak ada proyek yang cocok dengan filter." : "Belum ada proyek."}
          </p>
        )}
      </div>
    </>
  );
}
