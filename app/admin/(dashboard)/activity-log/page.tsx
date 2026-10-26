import Link from "next/link";
import { db } from "~/db";
import { activityLogs } from "~/db/schema";
import { desc, eq, and, count } from "drizzle-orm";
import { parsePage, getPagination } from "~/lib/pagination";
import { Pagination } from "~/components/shared/pagination";
import { Plus, Pencil, Trash2, X, History } from "lucide-react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Select, Label } from "~/components/ui/input";
import { EmptyState } from "~/components/ui/misc";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

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

export default async function ActivityLogIndex({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = parsePage(sp);
  const entityTypeFilter = String(sp.entityType ?? "");
  const actionFilter = String(sp.action ?? "");

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

  const hasFilter = entityTypeFilter || actionFilter;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Activity Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Riwayat perubahan yang dilakukan admin.</p>
      </div>

      <Card className="p-4 mb-4">
        <form method="get" className="flex flex-wrap gap-3 items-end">
          <div>
            <Label className="mb-1.5 block text-xs">Jenis Data</Label>
            <Select name="entityType" defaultValue={entityTypeFilter} className="w-auto">
              <option value="">Semua</option>
              <option value="post">Artikel</option>
              <option value="project">Proyek</option>
              <option value="inquiry">Inquiry</option>
              <option value="category">Kategori</option>
              <option value="redirect">Redirect</option>
              <option value="settings">Pengaturan</option>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Aksi</Label>
            <Select name="action" defaultValue={actionFilter} className="w-auto">
              <option value="">Semua</option>
              <option value="create">Tambah</option>
              <option value="update">Ubah</option>
              <option value="delete">Hapus</option>
            </Select>
          </div>
          <Button type="submit">Terapkan</Button>
          {hasFilter ? (
            <Link
              href="/admin/activity-log"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-2 py-2"
            >
              <X size={14} /> Reset
            </Link>
          ) : null}
        </form>
      </Card>

      <Card className="divide-y divide-border">
        {logs.map((log) => {
          const Icon = actionIcon[log.action] ?? Pencil;
          return (
            <div key={log.id} className="flex items-start gap-3 px-4 py-3.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  actionStyle[log.action] ?? "bg-muted text-muted-foreground"
                }`}
              >
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{log.userName ?? "Seseorang"}</span>{" "}
                  {log.action === "create" ? "menambahkan" : log.action === "update" ? "mengubah" : "menghapus"}{" "}
                  {entityTypeLabel[log.entityType] ?? log.entityType}
                  {log.entityLabel ? (
                    <span className="font-medium text-foreground"> "{log.entityLabel}"</span>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(log.createdAt)}</p>
              </div>
            </div>
          );
        })}
        {logs.length === 0 && (
          <EmptyState
            icon={<History size={28} />}
            title={hasFilter ? "Tidak ada log yang cocok dengan filter." : "Belum ada aktivitas tercatat."}
          />
        )}
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/admin/activity-log" searchParams={sp} />
    </div>
  );
}
