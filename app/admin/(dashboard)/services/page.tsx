import Link from "next/link";
import { db } from "~/db";
import { services } from "~/db/schema";
import { asc, count } from "drizzle-orm";
import { Check, LayoutGrid } from "lucide-react";
import { parsePage, getPagination } from "~/lib/pagination";
import { Pagination } from "~/components/shared/pagination";
import { DeleteForm } from "~/components/admin/delete-form";
import { deleteService } from "./actions";
import { Card } from "~/components/ui/card";
import { buttonVariants } from "~/components/ui/button";
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

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ServicesIndex({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = parsePage(sp);

  const [{ value: totalItems }] = await db.select({ value: count() }).from(services);
  const { limit, offset, currentPage, totalPages } = getPagination(page, totalItems, 10);

  const rows = await db.query.services.findMany({
    orderBy: [asc(services.sortOrder)],
    with: { features: true },
    limit,
    offset,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Layanan</h1>
        <Link href="/admin/services/new" className={buttonVariants()}>
          + Tambah Layanan
        </Link>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Judul</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium text-foreground">{s.title}</TableCell>
                <TableCell>
                  {!s.isPriceVisible ? (
                    <span className="text-muted-foreground italic">Disembunyikan</span>
                  ) : s.priceLabel ? (
                    s.priceLabel
                  ) : s.priceAmount ? (
                    `Rp${Number(s.priceAmount).toLocaleString("id-ID")}${s.priceUnit ?? ""}`
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{s.badge && <Badge variant="brand">{s.badge}</Badge>}</TableCell>
                <TableCell>{s.isFeatured && <Check size={16} className="text-brand-600" />}</TableCell>
                <TableCell>{s.sortOrder}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    <Link
                      href={`/admin/services/${s.id}/edit`}
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      Edit
                    </Link>
                    <DeleteForm
                      action={deleteService.bind(null, s.id)}
                      confirmMessage={`Hapus layanan "${s.title}"?`}
                      buttonClassName={buttonVariants({ variant: "ghost", size: "sm", className: "text-rose-500 hover:bg-rose-50" })}
                    >
                      Hapus
                    </DeleteForm>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 && (
          <EmptyState icon={<LayoutGrid size={28} />} title="Belum ada layanan." />
        )}
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/admin/services" searchParams={sp} />
    </div>
  );
}
