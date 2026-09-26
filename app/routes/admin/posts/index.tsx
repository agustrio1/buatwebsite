import { Link, Form, useLoaderData, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/index";
import { db } from "~/db";
import { posts, categories } from "~/db/schema";
import { eq, desc, count, and, ilike, inArray, asc } from "drizzle-orm";
import { deleteFromR2 } from "~/lib/r2-server";
import { Pencil, Trash2, Search, X } from "lucide-react";
import { parsePage, getPagination } from "~/lib/pagination";
import { Pagination } from "~/components/shared/pagination";
import { logActivity } from "~/lib/activity-log.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parsePage(url.searchParams);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const statusFilter = url.searchParams.get("status") ?? "";
  const categoryFilter = url.searchParams.get("category") ?? "";

  const conditions = [];
  if (q) conditions.push(ilike(posts.title, `%${q}%`));
  if (statusFilter === "draft" || statusFilter === "published") {
    conditions.push(eq(posts.status, statusFilter));
  }
  if (categoryFilter) conditions.push(eq(posts.categoryId, categoryFilter));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ value: totalItems }] = await db.select({ value: count() }).from(posts).where(whereClause);
  const { limit, offset, currentPage, totalPages } = getPagination(page, totalItems, 10);

  const data = await db.query.posts.findMany({
    where: whereClause,
    orderBy: [desc(posts.createdAt)],
    with: { category: true, author: true },
    limit,
    offset,
  });

  const categoryList = await db.query.categories.findMany({ orderBy: [asc(categories.name)] });

  return { posts: data, currentPage, totalPages, categoryList, q, statusFilter, categoryFilter };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "bulk-delete") {
    const ids = formData.getAll("ids").map(String);
    if (ids.length === 0) return null;

    const rows = await db.query.posts.findMany({ where: inArray(posts.id, ids) });
    for (const row of rows) {
      await deleteFromR2(row.coverImageId);
      await logActivity({
        action: "delete",
        entityType: "post",
        entityId: row.id,
        entityLabel: row.title,
      });
    }
    await db.delete(posts).where(inArray(posts.id, ids));
    return null;
  }

  const id = String(formData.get("id"));
  const post = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  await deleteFromR2(post?.coverImageId);
  await db.delete(posts).where(eq(posts.id, id));

  await logActivity({
    action: "delete",
    entityType: "post",
    entityId: id,
    entityLabel: post?.title,
  });

  return null;
}

export default function PostsIndex() {
  const { posts, currentPage, totalPages, categoryList, q, statusFilter, categoryFilter } =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIds(new Set());
  }, [searchParams]);

  const allSelected = posts.length > 0 && posts.every((p) => selectedIds.has(p.id));

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(posts.map((p) => p.id)));
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

  const hasFilter = q || statusFilter || categoryFilter;

  return (
    <div>
      <Form method="post" id="bulk-form" className="hidden">
        <input type="hidden" name="intent" value="bulk-delete" />
      </Form>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-brand-dark">Blog</h1>
        <div className="flex gap-2">
          <Link
            to="/admin/categories"
            className="border border-slate-300 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded text-sm"
          >
            Kelola Kategori
          </Link>
          <Link
            to="/admin/posts/new"
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded text-sm"
          >
            + Tulis Artikel
          </Link>
        </div>
      </div>

      <Form method="get" className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-end">
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
          <Link to="/admin/posts" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 px-2 py-2">
            <X size={14} /> Reset
          </Link>
        ) : null}
      </Form>

      {selectedIds.size > 0 ? (
        <div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-lg px-4 py-2.5 mb-4">
          <span className="text-sm text-brand-700 font-medium">{selectedIds.size} artikel dipilih</span>
          <button
            type="submit"
            form="bulk-form"
            name="intent"
            value="bulk-delete"
            onClick={(e) => {
              if (!confirm(`Hapus ${selectedIds.size} artikel terpilih?`)) e.preventDefault();
            }}
            className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-medium"
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
            {posts.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  <input
                    type="checkbox"
                    name="ids"
                    value={p.id}
                    form="bulk-form"
                    checked={selectedIds.has(p.id)}
                    onChange={() => toggleOne(p.id)}
                    className="w-4 h-4 accent-brand-500"
                  />
                </td>
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-slate-500">{p.category?.name ?? "-"}</td>
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
                <td className="p-3 text-slate-500">{p.author?.name ?? "-"}</td>
                <td className="p-3 text-right space-x-3 whitespace-nowrap">
                  <Link to={`/admin/posts/${p.id}/edit`} className="text-brand-600 hover:underline inline-flex items-center gap-1">
                    <Pencil size={14} /> Edit
                  </Link>
                  <Form method="post" className="inline">
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      onClick={(e) => {
                        if (!confirm(`Hapus artikel "${p.title}"?`)) e.preventDefault();
                      }}
                      className="text-red-500 hover:underline inline-flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </Form>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  {hasFilter ? "Tidak ada artikel yang cocok dengan filter." : "Belum ada artikel."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}