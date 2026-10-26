"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil, Trash2, Search, X } from "lucide-react";
import { DeleteForm } from "~/components/admin/delete-form";

export type PostRow = {
  id: string;
  title: string;
  categoryName: string | null;
  status: string;
  authorName: string | null;
};

export function PostsIndexClient({
  rows,
  categoryList,
  q,
  statusFilter,
  categoryFilter,
  deletePostAction,
  bulkDeleteAction,
}: {
  rows: PostRow[];
  categoryList: { id: string; name: string }[];
  q: string;
  statusFilter: string;
  categoryFilter: string;
  deletePostAction: (id: string) => Promise<void>;
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
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((p) => p.id)));
    }
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
    if (!window.confirm(`Hapus ${selectedIds.size} artikel terpilih?`)) return;
    startTransition(() => bulkDeleteAction(Array.from(selectedIds)));
  }

  const hasFilter = q || statusFilter || categoryFilter;

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-brand-dark">Blog</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/categories"
            className="border border-slate-300 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded text-sm"
          >
            Kelola Kategori
          </Link>
          <Link
            href="/admin/posts/new"
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded text-sm"
          >
            + Tulis Artikel
          </Link>
        </div>
      </div>

      <form method="get" className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-50">
          <label className="block text-xs font-medium text-slate-500 mb-1">Cari judul</label>
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari artikel..."
              className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
          <select name="status" defaultValue={statusFilter} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Semua</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Kategori</label>
          <select name="category" defaultValue={categoryFilter} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Semua</option>
            {categoryList.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm">
          Terapkan
        </button>
        {hasFilter ? (
          <Link href="/admin/posts" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 px-2 py-2">
            <X size={14} /> Reset
          </Link>
        ) : null}
      </form>

      {selectedIds.size > 0 ? (
        <div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-lg px-4 py-2.5 mb-4">
          <span className="text-sm text-brand-700 font-medium">{selectedIds.size} artikel dipilih</span>
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

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-162.5">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3 w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 accent-brand-500" />
              </th>
              <th className="p-3">Judul</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Status</th>
              <th className="p-3">Penulis</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => toggleOne(p.id)}
                    className="w-4 h-4 accent-brand-500"
                  />
                </td>
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-slate-500">{p.categoryName ?? "-"}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      p.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {p.status === "published" ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-3 text-slate-500">{p.authorName ?? "-"}</td>
                <td className="p-3 text-right space-x-3 whitespace-nowrap">
                  <Link href={`/admin/posts/${p.id}/edit`} className="text-brand-600 hover:underline inline-flex items-center gap-1">
                    <Pencil size={14} /> Edit
                  </Link>
                  <DeleteForm
                    action={() => deletePostAction(p.id)}
                    confirmMessage={`Hapus artikel "${p.title}"?`}
                    buttonClassName="text-red-500 hover:underline inline-flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Hapus
                  </DeleteForm>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  {hasFilter ? "Tidak ada artikel yang cocok dengan filter." : "Belum ada artikel."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
