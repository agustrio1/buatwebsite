"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil, Trash2, Search, X, FileText } from "lucide-react";
import { DeleteForm } from "~/components/admin/delete-form";
import { Card } from "~/components/ui/card";
import { Button, buttonVariants } from "~/components/ui/button";
import { Input, Select, Label } from "~/components/ui/input";
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
          <Link href="/admin/categories" className={buttonVariants({ variant: "outline" })}>
            Kelola Kategori
          </Link>
          <Link href="/admin/posts/new" className={buttonVariants()}>
            + Tulis Artikel
          </Link>
        </div>
      </div>

      <Card className="p-4 mb-4">
        <form method="get" className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-56">
            <Label className="mb-1.5 block text-xs">Cari judul</Label>
            <div className="relative">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input type="text" name="q" defaultValue={q} placeholder="Cari artikel..." className="pl-8" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Status</Label>
            <Select name="status" defaultValue={statusFilter} className="w-auto">
              <option value="">Semua</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Kategori</Label>
            <Select name="category" defaultValue={categoryFilter} className="w-auto">
              <option value="">Semua</option>
              {categoryList.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <Button type="submit">Terapkan</Button>
          {hasFilter ? (
            <Link
              href="/admin/posts"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-2 py-2"
            >
              <X size={14} /> Reset
            </Link>
          ) : null}
        </form>
      </Card>

      {selectedIds.size > 0 ? (
        <div className="flex items-center justify-between bg-brand-50 border border-brand-100 rounded-lg px-4 py-2.5 mb-4">
          <span className="text-sm text-brand-700 font-medium">{selectedIds.size} artikel dipilih</span>
          <Button variant="ghost" size="sm" disabled={isPending} onClick={handleBulkDelete} className="text-rose-600 hover:bg-rose-50">
            <Trash2 size={14} /> Hapus Terpilih
          </Button>
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <th className="w-10 px-4 py-2">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 accent-brand-500" />
              </th>
              <TableHead>Judul</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Penulis</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => toggleOne(p.id)}
                    className="w-4 h-4 accent-brand-500"
                  />
                </td>
                <TableCell className="font-medium text-foreground">{p.title}</TableCell>
                <TableCell className="text-muted-foreground">{p.categoryName ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant={p.status === "published" ? "success" : "default"}>
                    {p.status === "published" ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.authorName ?? "-"}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    <Link
                      href={`/admin/posts/${p.id}/edit`}
                      aria-label="Edit"
                      className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                    >
                      <Pencil size={15} />
                    </Link>
                    <DeleteForm
                      action={() => deletePostAction(p.id)}
                      confirmMessage={`Hapus artikel "${p.title}"?`}
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
        {rows.length === 0 && (
          <EmptyState
            icon={<FileText size={28} />}
            title={hasFilter ? "Tidak ada artikel yang cocok" : "Belum ada artikel"}
            description={hasFilter ? "Coba ubah kata kunci atau filter." : "Tulis artikel pertama Anda."}
          />
        )}
      </Card>
    </>
  );
}
