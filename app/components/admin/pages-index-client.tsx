"use client";

import Link from "next/link";
import { Search, X, LayoutTemplate, Pencil, Trash2, ExternalLink } from "lucide-react";
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

export type PageRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: Date;
};

export function PagesIndexClient({
  rows,
  q,
  statusFilter,
  deletePageAction,
}: {
  rows: PageRow[];
  q: string;
  statusFilter: string;
  deletePageAction: (id: string) => Promise<void>;
}) {
  const hasFilter = q || statusFilter;

  return (
    <>
      <Card className="p-4 mb-4">
        <form method="get" className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-56">
            <Label className="mb-1.5 block text-xs">Cari judul</Label>
            <div className="relative">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input type="text" name="q" defaultValue={q} placeholder="Cari halaman..." className="pl-8" />
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
          <Button type="submit">Terapkan</Button>
          {hasFilter ? (
            <Link
              href="/admin/pages"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-2 py-2"
            >
              <X size={14} /> Reset
            </Link>
          ) : null}
        </form>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Judul</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Terakhir diubah</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-foreground">{p.title}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">/{p.slug}</TableCell>
                <TableCell>
                  <Badge variant={p.status === "published" ? "success" : "default"}>
                    {p.status === "published" ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
                    new Date(p.updatedAt)
                  )}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    {p.status === "published" && (
                      <a
                        href={`/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Lihat di website"
                        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <Link
                      href={`/admin/pages/${p.id}/edit`}
                      aria-label="Edit"
                      className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                    >
                      <Pencil size={15} />
                    </Link>
                    <DeleteForm
                      action={() => deletePageAction(p.id)}
                      confirmMessage={`Hapus halaman "${p.title}"?`}
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
            icon={<LayoutTemplate size={28} />}
            title={hasFilter ? "Tidak ada halaman yang cocok" : "Belum ada halaman custom"}
            description={
              hasFilter ? "Coba ubah kata kunci atau filter." : "Buat halaman landing custom pertamamu."
            }
          />
        )}
      </Card>
    </>
  );
}
