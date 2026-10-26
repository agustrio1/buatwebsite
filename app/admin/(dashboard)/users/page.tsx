import Link from "next/link";
import { db } from "~/db";
import { users } from "~/db/schema";
import { asc } from "drizzle-orm";
import { Users as UsersIcon } from "lucide-react";
import { requireAdmin } from "~/lib/session.server";
import { DeleteForm } from "~/components/admin/delete-form";
import { deleteUser } from "./actions";
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

export default async function UsersIndex() {
  const { userId } = await requireAdmin();
  const rows = await db.query.users.findMany({ orderBy: [asc(users.name)] });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Pengguna Admin</h1>
        <Link href="/admin/users/new" className={buttonVariants()}>
          + Tambah User
        </Link>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-foreground">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "admin" ? "brand" : "secondary"}>{u.role}</Badge>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    <Link
                      href={`/admin/users/${u.id}/edit`}
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      Edit
                    </Link>
                    {u.id !== userId && (
                      <DeleteForm
                        action={deleteUser.bind(null, u.id)}
                        confirmMessage={`Hapus user "${u.name}"?`}
                        buttonClassName={buttonVariants({ variant: "ghost", size: "sm", className: "text-rose-500 hover:bg-rose-50" })}
                      >
                        Hapus
                      </DeleteForm>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 && (
          <EmptyState icon={<UsersIcon size={28} />} title="Belum ada pengguna." />
        )}
      </Card>
    </div>
  );
}
