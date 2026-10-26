"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil, Trash2, MapPin, Star, StarOff } from "lucide-react";
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
import { Badge } from "~/components/ui/badge";
import { EmptyState } from "~/components/ui/misc";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "~/components/ui/table";

export type CityRow = {
  id: string;
  name: string;
  slug: string;
  province: string | null;
  isActive: boolean;
};

export function CitiesIndexClient({
  rows,
  deleteCityAction,
  bulkDeleteAction,
  bulkSetActiveAction,
}: {
  rows: CityRow[];
  deleteCityAction: (id: string) => Promise<void>;
  bulkDeleteAction: (ids: string[]) => Promise<void>;
  bulkSetActiveAction: (ids: string[], value: boolean) => Promise<void>;
}) {
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSelectedIds(new Set());
  }, [searchParams]);

  const allSelected = rows.length > 0 && rows.every((c) => selectedIds.has(c.id));

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(rows.map((c) => c.id)));
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

  function handleBulkActive(value: boolean) {
    const ids = Array.from(selectedIds);
    runBulk(() => bulkSetActiveAction(ids, value), value ? "Kota diaktifkan" : "Kota dinonaktifkan");
  }

  function handleConfirmBulkDelete() {
    const ids = Array.from(selectedIds);
    setBulkDeleteOpen(false);
    runBulk(() => bulkDeleteAction(ids), `${ids.length} kota dihapus`);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-brand-dark">Kota</h1>
        <Link href="/admin/cities/new" className={buttonVariants()}>
          + Tambah Kota
        </Link>
      </div>

      {selectedIds.size > 0 ? (
        <div className="flex items-center justify-between gap-2 flex-wrap bg-brand-50 border border-brand-100 rounded-lg px-4 py-2.5 mb-4">
          <span className="text-sm text-brand-700 font-medium">{selectedIds.size} kota dipilih</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={isPending} onClick={() => handleBulkActive(true)}>
              <Star size={14} /> Aktifkan
            </Button>
            <Button variant="outline" size="sm" disabled={isPending} onClick={() => handleBulkActive(false)}>
              <StarOff size={14} /> Nonaktifkan
            </Button>
            <Button variant="ghost" size="sm" disabled={isPending} onClick={() => setBulkDeleteOpen(true)} className="text-rose-600 hover:bg-rose-50">
              <Trash2 size={14} /> Hapus Terpilih
            </Button>
          </div>
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <th className="w-10 px-4 py-2">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 accent-brand-500" />
              </th>
              <TableHead>Nama</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Provinsi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(c.id)}
                    onChange={() => toggleOne(c.id)}
                    className="w-4 h-4 accent-brand-500"
                  />
                </td>
                <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">/jasa-pembuatan-website/{c.slug}</TableCell>
                <TableCell className="text-muted-foreground">{c.province ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? "success" : "secondary"}>{c.isActive ? "Aktif" : "Nonaktif"}</Badge>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    <Link
                      href={`/admin/cities/${c.id}/edit`}
                      aria-label="Edit"
                      className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                    >
                      <Pencil size={15} />
                    </Link>
                    <DeleteForm
                      action={() => deleteCityAction(c.id)}
                      confirmMessage={`Hapus kota "${c.name}"?`}
                      buttonClassName="text-rose-500 hover:bg-rose-50 inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                    >
                      <Trash2 size={15} />
                    </DeleteForm>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 && <EmptyState icon={<MapPin size={28} />} title="Belum ada kota." />}
      </Card>

      <Dialog open={bulkDeleteOpen} onClose={() => !isPending && setBulkDeleteOpen(false)}>
        <DialogCloseButton onClose={() => setBulkDeleteOpen(false)} />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 size={18} className="shrink-0 text-rose-500" /> Hapus kota?
          </DialogTitle>
          <DialogDescription>{selectedIds.size} kota terpilih akan dihapus permanen.</DialogDescription>
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
