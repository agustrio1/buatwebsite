"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Trash2, Mail, Phone, Search, X, MessageCircle, Inbox } from "lucide-react";
import { DeleteForm } from "~/components/admin/delete-form";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input, Select, Label } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { EmptyState } from "~/components/ui/misc";

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

const statusVariant: Record<string, "warning" | "default" | "secondary"> = {
  new: "warning",
  contacted: "default",
  closed: "secondary",
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

      <Card className="p-4 mb-4">
        <form method="get" className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-56">
            <Label className="mb-1.5 block text-xs">Cari nama/email/nomor</Label>
            <div className="relative">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input type="text" name="q" defaultValue={q} placeholder="Cari inquiry..." className="pl-8" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Status</Label>
            <Select name="status" defaultValue={statusFilter} className="w-auto">
              <option value="">Semua</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </Select>
          </div>
          <Button type="submit">Terapkan</Button>
          {hasFilter ? (
            <a
              href="/admin/inquiries"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-2 py-2"
            >
              <X size={14} /> Reset
            </a>
          ) : null}
        </form>
      </Card>

      {selectedIds.size > 0 ? (
        <div className="flex items-center justify-between flex-wrap gap-3 bg-brand-50 border border-brand-100 rounded-lg px-4 py-2.5 mb-4">
          <span className="text-sm text-brand-700 font-medium">{selectedIds.size} inquiry dipilih</span>
          <div className="flex items-center gap-3">
            <Select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="w-auto h-8"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => startTransition(() => bulkStatusAction(Array.from(selectedIds), bulkStatus))}
              className="text-brand-700 hover:bg-brand-100/50"
            >
              Ubah Status
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => {
                if (!window.confirm(`Hapus ${selectedIds.size} inquiry terpilih?`)) return;
                startTransition(() => bulkDeleteAction(Array.from(selectedIds)));
              }}
              className="text-rose-600 hover:bg-rose-50"
            >
              <Trash2 size={14} /> Hapus
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {rows.map((inq) => (
          <Card key={inq.id} className="p-4 sm:p-5">
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
                    <Badge variant={statusVariant[inq.status] ?? "default"}>{inq.status}</Badge>
                  </div>
                  {inq.companyName && <p className="text-sm text-muted-foreground">{inq.companyName}</p>}
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
                      {inq.budget && <Badge variant="success">Budget: {inq.budget}</Badge>}
                      {inq.source && <Badge variant="secondary">Sumber: {inq.source}</Badge>}
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
                      className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded-lg px-2.5 py-1.5"
                    >
                      <MessageCircle size={14} /> Chat WA
                    </a>
                  )}
                  <Select
                    defaultValue={inq.status}
                    onChange={(e) => {
                      const next = e.target.value;
                      startTransition(() => updateStatusAction(inq.id, next));
                    }}
                    className="w-auto h-8"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </Select>
                  <DeleteForm
                    action={() => deleteAction(inq.id)}
                    confirmMessage={`Hapus inquiry dari "${inq.name}"?`}
                    className="inline"
                    buttonClassName="text-rose-500 hover:text-rose-700 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </DeleteForm>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {rows.length === 0 && (
          <Card>
            <EmptyState
              icon={<Inbox size={28} />}
              title={hasFilter ? "Tidak ada inquiry yang cocok" : "Belum ada inquiry masuk"}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
