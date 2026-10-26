import { useLoaderData, useSearchParams, Link } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/db";
import { activityLogs } from "~/db/schema";
import { desc, eq, and, count } from "drizzle-orm";
import { parsePage, getPagination } from "~/lib/pagination";
import { Pagination } from "~/components/shared/pagination";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parsePage(url.searchParams);
  const entityTypeFilter = url.searchParams.get("entityType") ?? "";
  const actionFilter = url.searchParams.get("action") ?? "";

  const conditions = [];
  if (entityTypeFilter) conditions.push(eq(activityLogs.entityType, entityTypeFilter));
  if (actionFilter === "create" || actionFilter === "update" || actionFilter === "delete") {
    conditions.push(eq(activityLogs.action, actionFilter));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ value: totalItems }] = await db.select({ value: count() }).from(activityLogs).where(whereClause);
  const { limit, offset, currentPage, totalPages } = getPagination(page, totalItems, 25);

  const logs = await db.query.activityLogs.findMany({
    where: whereClause,
    orderBy: [desc(activityLogs.createdAt)],
    limit,
    offset,
  });

  return { logs, currentPage, totalPages, entityTypeFilter, actionFilter };
}

const actionIcon: Record<string, typeof Plus> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
};

const actionStyle: Record<string, string> = {
  create: "bg-emerald-50 text-emerald-600",
  update: "bg-blue-50 text-blue-600",
  delete: "bg-rose-50 text-rose-600",
};

const entityTypeLabel: Record<string, string> = {
  post: "Artikel",
  project: "Proyek",
  inquiry: "Inquiry",
  category: "Kategori",
  redirect: "Redirect",
  settings: "Pengaturan",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ActivityLogIndex() {
  const { logs, currentPage, totalPages, entityTypeFilter, actionFilter } = useLoaderData<typeof loader>();
  const hasFilter = entityTypeFilter || actionFilter;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Activity Log</h1>
        <p className="text-sm text-slate-400 mt-1">Riwayat perubahan yang dilakukan admin.</p>
      </div>

      <form method="get" className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Jenis Data</label>
          <select name="entityType" defaultValue={entityTypeFilter} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Semua</option>
            <option value="post">Artikel</option>
            <option value="project">Proyek</option>
            <option value="inquiry">Inquiry</option>
            <option value="category">Kategori</option>
            <option value="redirect">Redirect</option>
            <option value="settings">Pengaturan</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Aksi</label>
          <select name="action" defaultValue={actionFilter} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Semua</option>
            <option value="create">Tambah</option>
            <option value="update">Ubah</option>
            <option value="delete">Hapus</option>
          </select>
        </div>
        <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm">
          Terapkan
        </button>
        {hasFilter ? (
          <Link to="/admin/activity-log" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 px-2 py-2">
            <X size={14} /> Reset
          </Link>
        ) : null}
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {logs.map((log) => {
          const Icon = actionIcon[log.action] ?? Pencil;
          return (
            <div key={log.id} className="flex items-start gap-3 px-4 py-3.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${actionStyle[log.action] ?? "bg-slate-50 text-slate-500"}`}>
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">{log.userName ?? "Seseorang"}</span>{" "}
                  {log.action === "create" ? "menambahkan" : log.action === "update" ? "mengubah" : "menghapus"}{" "}
                  {entityTypeLabel[log.entityType] ?? log.entityType}
                  {log.entityLabel ? (
                    <span className="font-medium text-slate-800"> "{log.entityLabel}"</span>
                  ) : null}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{formatDate(log.createdAt)}</p>
              </div>
            </div>
          );
        })}
        {logs.length === 0 && (
          <p className="text-sm text-slate-400 italic px-4 py-10 text-center">
            {hasFilter ? "Tidak ada log yang cocok dengan filter." : "Belum ada aktivitas tercatat."}
          </p>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}