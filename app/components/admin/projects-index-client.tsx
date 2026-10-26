"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil, Trash2, Search, X, FolderKanban, Star, StarOff } from "lucide-react";
import { DeleteForm } from "~/components/admin/delete-form";
import { toast } from "~/components/ui/toast";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogCloseButton,
} from "~/components/ui/dialog";
import { Card } from "~/components/ui/card";
import { Button, buttonVariants } from "~/components/ui/button";
import { Input, Select, Label } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { EmptyState } from "~/components/ui/misc";
import { resizeImage } from "~/lib/imagekit-url";

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
  bulkSetFeaturedAction,
}: {
  rows: ProjectRow[];
  q: string;
  featuredFilter: string;
  deleteProjectAction: (id: string) => Promise<void>;
  bulkDeleteAction: (ids: string[]) => Promise<void>;
  bulkSetFeaturedAction: (ids: string[], value: boolean) => Promise<void>;
}) {
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
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

  function runBulk(fn: () => Promise<void>, okMsg: string) {
    startTransition(async () => {
      try {
        await fn();
        setSelectedIds(new Set());
        toast(okMsg, "success");
      } catch {
        toast("Gagal memproses. Coba lagi.", "error");
      }
    });
  }

  function handleBulkFeatured(value: boolean) {
    const ids = Array.from(selectedIds);
    runBulk(
      () => bulkSetFeaturedAction(ids, value),
      value ? "Dijadikan unggulan" : "Batal unggulan"
    );
  }

  function handleConfirmBulkDelete() {
    const ids = Array.from(selectedIds);
    setBulkDeleteOpen(false);
    runBulk(() => bulkDeleteAction(ids), `${ids.length} proyek dihapus`);
  }

  const hasFilter = q || featuredFilter;

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-brand-dark">Portofolio</h1>
        <Link href="/admin/projects/new" className={buttonVariants()}>
          + Tambah Proyek
        </Link>
      </div>

      <Card className="p-4 mb-4">
        <form method="get" className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-56">
            <Label className="mb-1.5 block text-xs">Cari nama/klien</Label>
            <div className="relative">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input type="text" name="q" defaultValue={q} placeholder="Cari proyek..." className="pl-8" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Featured</Label>
            <Select name="featured" defaultValue={featuredFilter} className="w-auto">
              <option value="">Semua</option>
              <option value="yes">Featured</option>
              <option value="no">Bukan Featured</option>
            </Select>
          </div>
          <Button type="submit">Terapkan</Button>
          {hasFilter ? (
            <Link
              href="/admin/projects"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-2 py-2"
            >
              <X size={14} /> Reset
            </Link>
          ) : null}
        </form>
      </Card>

      {selectedIds.size > 0 ? (
        <div className="flex items-center justify-between gap-2 flex-wrap bg-brand-50 border border-brand-100 rounded-lg px-4 py-2.5 mb-4">
          <span className="text-sm text-brand-700 font-medium">{selectedIds.size} proyek dipilih</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={isPending} onClick={() => handleBulkFeatured(true)}>
              <Star size={14} /> Jadikan Unggulan
            </Button>
            <Button variant="outline" size="sm" disabled={isPending} onClick={() => handleBulkFeatured(false)}>
              <StarOff size={14} /> Batal Unggulan
            </Button>
            <Button variant="ghost" size="sm" disabled={isPending} onClick={() => setBulkDeleteOpen(true)} className="text-rose-600 hover:bg-rose-50">
              <Trash2 size={14} /> Hapus Terpilih
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((p) => (
          <Card key={p.id} className="overflow-hidden relative">
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
                <img
                  src={resizeImage(p.coverImageUrl, 640) ?? p.coverImageUrl}
                  alt={p.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-brand-dark truncate">{p.title}</h3>
              {p.clientName && <p className="text-sm text-muted-foreground">{p.clientName}</p>}
              {p.techStack && p.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.techStack.map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Link
                  href={`/admin/projects/${p.id}/edit`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  <Pencil size={14} /> Edit
                </Link>
                <DeleteForm
                  action={() => deleteProjectAction(p.id)}
                  confirmMessage={`Hapus proyek "${p.title}"?`}
                  buttonClassName="inline-flex items-center gap-1 text-sm text-rose-500 hover:text-rose-700"
                >
                  <Trash2 size={14} /> Hapus
                </DeleteForm>
              </div>
            </div>
          </Card>
        ))}
        {rows.length === 0 && (
          <Card className="col-span-full">
            <EmptyState
              icon={<FolderKanban size={28} />}
              title={hasFilter ? "Tidak ada proyek yang cocok" : "Belum ada proyek"}
              description={hasFilter ? "Coba ubah kata kunci atau filter." : "Tambahkan proyek portofolio pertama."}
            />
          </Card>
        )}
      </div>

      <Dialog open={bulkDeleteOpen} onClose={() => !isPending && setBulkDeleteOpen(false)}>
        <DialogCloseButton onClose={() => setBulkDeleteOpen(false)} />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 size={18} className="shrink-0 text-rose-500" /> Hapus proyek?
          </DialogTitle>
          <DialogDescription>{selectedIds.size} proyek terpilih akan dihapus permanen.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setBulkDeleteOpen(false)} disabled={isPending}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleConfirmBulkDelete} disabled={isPending}>
            {isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
