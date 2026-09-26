import { Form, useLoaderData, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/index";
import { db } from "~/db";
import { inquiries } from "~/db/schema";
import { eq, desc, and, or, ilike, inArray } from "drizzle-orm";
import { Trash2, Mail, Phone, Search, X } from "lucide-react";
import { logActivity } from "~/lib/activity-log.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const statusFilter = url.searchParams.get("status") ?? "";

  const conditions = [];
  if (q) {
    conditions.push(or(ilike(inquiries.name, `%${q}%`), ilike(inquiries.email, `%${q}%`)));
  }
  if (statusFilter === "new" || statusFilter === "contacted" || statusFilter === "closed") {
    conditions.push(eq(inquiries.status, statusFilter));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db.query.inquiries.findMany({
    where: whereClause,
    orderBy: [desc(inquiries.createdAt)],
  });

  return { inquiries: data, q, statusFilter };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "bulk-delete") {
    const ids = formData.getAll("ids").map(String);
    if (ids.length > 0) {
      const rows = await db.query.inquiries.findMany({ where: inArray(inquiries.id, ids) });
      await db.delete(inquiries).where(inArray(inquiries.id, ids));
      for (const row of rows) {
        await logActivity({
          action: "delete",
          entityType: "inquiry",
          entityId: row.id,
          entityLabel: row.name,
        });
      }
    }
    return null;
  }

  if (intent === "bulk-status") {
    const ids = formData.getAll("ids").map(String);
    const status = String(formData.get("bulkStatus")) as "new" | "contacted" | "closed";
    if (ids.length > 0) {
      await db.update(inquiries).set({ status }).where(inArray(inquiries.id, ids));
      const rows = await db.query.inquiries.findMany({ where: inArray(inquiries.id, ids) });
      for (const row of rows) {
        await logActivity({
          action: "update",
          entityType: "inquiry",
          entityId: row.id,
          entityLabel: row.name,
          metadata: { newStatus: status },
        });
      }
    }
    return null;
  }

  const id = String(formData.get("id"));

  if (intent === "update-status") {
    const status = String(formData.get("status")) as "new" | "contacted" | "closed";
    await db.update(inquiries).set({ status }).where(eq(inquiries.id, id));
    const inq = await db.query.inquiries.findFirst({ where: eq(inquiries.id, id) });
    await logActivity({
      action: "update",
      entityType: "inquiry",
      entityId: id,
      entityLabel: inq?.name,
      metadata: { newStatus: status },
    });
  }

  if (intent === "delete") {
    const inq = await db.query.inquiries.findFirst({ where: eq(inquiries.id, id) });
    await db.delete(inquiries).where(eq(inquiries.id, id));
    await logActivity({
      action: "delete",
      entityType: "inquiry",
      entityId: id,
      entityLabel: inq?.name,
    });
  }

  return null;
}

const statusStyle: Record<string, string> = {
  new: "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  closed: "bg-slate-100 text-slate-500",
};

export default function InquiriesIndex() {
  const { inquiries, q, statusFilter } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIds(new Set());
  }, [searchParams]);

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const hasFilter = q || statusFilter;

  return (
    <div>
      <Form method="post" id="bulk-form" className="hidden">
        <input type="hidden" name="intent" value="" />
        <select name="bulkStatus" defaultValue="contacted" className="hidden" />
      </Form>

      <h1 className="text-2xl font-bold text-brand-dark mb-6">Inquiries</h1>

      <Form method="get" className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-50">
          <label className="block text-xs font-medium text-slate-500 mb-1">Cari nama/email</label>
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari inquiry..."
              className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
          <select name="status" defaultValue={statusFilter} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Semua</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm">
          Terapkan
        </button>
        {hasFilter ? (
          <a href="/admin/inquiries" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 px-2 py-2">
            <X size={14} /> Reset
          </a>
        ) : null}
      </Form>

      {selectedIds.size > 0 ? (
        <div className="flex items-center justify-between flex-wrap gap-3 bg-brand-50 border border-brand-200 rounded-lg px-4 py-2.5 mb-4">
          <span className="text-sm text-brand-700 font-medium">{selectedIds.size} inquiry dipilih</span>
          <div className="flex items-center gap-3">
            <select
              form="bulk-form"
              name="bulkStatus"
              defaultValue="contacted"
              className="border border-brand-200 rounded-lg px-2 py-1.5 text-sm bg-white"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
            <button
              type="submit"
              form="bulk-form"
              name="intent"
              value="bulk-status"
              className="text-sm text-brand-700 hover:text-brand-800 font-medium"
            >
              Ubah Status
            </button>
            <button
              type="submit"
              form="bulk-form"
              name="intent"
              value="bulk-delete"
              onClick={(e) => {
                if (!confirm(`Hapus ${selectedIds.size} inquiry terpilih?`)) e.preventDefault();
              }}
              className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              <Trash2 size={14} /> Hapus
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {inquiries.map((inq) => (
          <div key={inq.id} className="bg-white rounded-lg shadow p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="ids"
                value={inq.id}
                form="bulk-form"
                checked={selectedIds.has(inq.id)}
                onChange={() => toggleOne(inq.id)}
                className="w-4 h-4 mt-1 accent-brand-500 shrink-0"
              />
              <div className="flex-1 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-brand-dark">{inq.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${statusStyle[inq.status]}`}>
                      {inq.status}
                    </span>
                  </div>
                  {inq.companyName && <p className="text-sm text-slate-400">{inq.companyName}</p>}
                  <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail size={14} /> {inq.email}
                    </span>
                    {inq.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} /> {inq.phone}
                      </span>
                    )}
                  </div>
                  {inq.serviceType && <p className="text-xs text-brand-600 mt-1">Layanan: {inq.serviceType}</p>}
                  <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{inq.message}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <Form method="post">
                    <input type="hidden" name="intent" value="update-status" />
                    <input type="hidden" name="id" value={inq.id} />
                    <select
                      name="status"
                      defaultValue={inq.status}
                      onChange={(e) => e.currentTarget.form?.requestSubmit()}
                      className="border rounded px-2 py-1.5 text-sm bg-white"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </Form>
                  <Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={inq.id} />
                    <button
                      type="submit"
                      onClick={(e) => {
                        if (!confirm(`Hapus inquiry dari "${inq.name}"?`)) e.preventDefault();
                      }}
                      className="text-red-500 hover:text-red-700 p-1.5"
                    >
                      <Trash2 size={16} />
                    </button>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        ))}
        {inquiries.length === 0 && (
          <p className="text-center text-slate-400 italic py-10">
            {hasFilter ? "Tidak ada inquiry yang cocok dengan filter." : "Belum ada inquiry masuk."}
          </p>
        )}
      </div>
    </div>
  );
}