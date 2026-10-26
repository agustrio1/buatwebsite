import Link from "next/link";
import { db } from "~/db";
import { cities } from "~/db/schema";
import { asc } from "drizzle-orm";
import { MapPin } from "lucide-react";
import { DeleteForm } from "~/components/admin/delete-form";
import { deleteCity } from "./actions";
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

export default async function CitiesIndex() {
  const rows = await db.query.cities.findMany({
    orderBy: [asc(cities.sortOrder), asc(cities.name)],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Kota</h1>
        <Link href="/admin/cities/new" className={buttonVariants()}>
          + Tambah Kota
        </Link>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
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
                <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  /jasa-pembuatan-website/{c.slug}
                </TableCell>
                <TableCell className="text-muted-foreground">{c.province ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? "success" : "secondary"}>
                    {c.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    <Link
                      href={`/admin/cities/${c.id}/edit`}
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      Edit
                    </Link>
                    <DeleteForm
                      action={deleteCity.bind(null, c.id)}
                      confirmMessage={`Hapus kota "${c.name}"?`}
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
          <EmptyState icon={<MapPin size={28} />} title="Belum ada kota." />
        )}
      </Card>
    </div>
  );
}
