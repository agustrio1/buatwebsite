"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Trash2, Mail, Phone, Search, X, MessageCircle } from "lucide-react";
import { DeleteForm } from "~/components/admin/delete-form";

export type InquiryRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  serviceType: string | null;
  message: string;
  budget: string | null;
  source: string | null;
  status: string;
};

const statusStyle: Record<string, string> = {
  new: "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  closed: "bg-slate-100 text-slate-500",
};

// Nomor Indonesia: 08xx / 8xx / +62 / 62 -> link wa.me
function waHref(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  else if (digits.startsWith("8")) digits = "62" + digits;
  return `https://wa.me/${digits}`;
}

export function InquiriesIndexClient({
  rows,
  q,
  statusFilter,
  updateStatusAction,
  deleteAction,
  bulkDeleteAction,
  bulkStatusAction,
}: {
  rows: InquiryRow[];
  q: string;
  statusFilter: string;
  updateStatusAction: (id: string, status: string) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
  bulkDeleteAction: (ids: string[]) => Promise<void>;
  bulkStatusAction: (ids: string[], status: string) => Promise<void>;
}) {
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("contacted");
  const [isPending, startTransition] = useTransition();

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
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Inquiries</h1>

      <form method="get" className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-50">
          <label className="block text-xs font-medium text-slate-500 mb-1">Cari nama/email/nomor</label>
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
      </form>

      {selectedIds.size > 0 ? (
        <div className="flex items-center justify-between flex-wrap gap-3 bg-brand-50 border border-brand-200 rounded-lg px-4 py-2.5 mb-4">
          <span className="text-sm text-brand-700 font-medium">{selectedIds.size} inquiry dipilih</span>
          <div className="flex items-center gap-3">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="border border-brand-200 rounded-lg px-2 py-1.5 text-sm bg-white"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => bulkStatusAction(Array.from(selectedIds), bulkStatus))}
              className="text-sm text-brand-700 hover:text-brand-800 font-medium disabled:opacity-50"
            >
              Ubah Status
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                if (!window.confirm(`Hapus ${selectedIds.size} inquiry terpilih?`)) return;
                startTransition(() => bulkDeleteAction(Array.from(selectedIds)));
              }}
              className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-medium disabled:opacity-50"
            >
              <Trash2 size={14} /> Hapus
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {rows.map((inq) => (
          <div key={inq.id} className="bg-white rounded-lg shadow p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
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
                    {inq.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={14} /> {inq.email}
                      </span>
                    )}
                    {inq.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} /> {inq.phone}
                      </span>
                    )}
                  </div>
                  {inq.serviceType && <p className="text-xs text-brand-600 mt-1">Layanan: {inq.serviceType}</p>}
                  {(inq.budget || inq.source) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {inq.budget && (
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                          Budget: {inq.budget}
                        </span>
                      )}
                      {inq.source && (
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                          Sumber: {inq.source}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{inq.message}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  {inq.phone && (
                    <a
                      href={waHref(inq.phone)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded px-2.5 py-1.5"
                    >
                      <MessageCircle size={14} /> Chat WA
                    </a>
                  )}
                  <select
                    defaultValue={inq.status}
                    onChange={(e) => {
                      const next = e.target.value;
                      startTransition(() => updateStatusAction(inq.id, next));
                    }}
                    className="border rounded px-2 py-1.5 text-sm bg-white"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                  <DeleteForm
                    action={() => deleteAction(inq.id)}
                    confirmMessage={`Hapus inquiry dari "${inq.name}"?`}
                    className="inline"
                    buttonClassName="text-red-500 hover:text-red-700 p-1.5"
                  >
                    <Trash2 size={16} />
                  </DeleteForm>
                </div>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-center text-slate-400 italic py-10">
            {hasFilter ? "Tidak ada inquiry yang cocok dengan filter." : "Belum ada inquiry masuk."}
          </p>
        )}
      </div>
    </div>
  );
}
