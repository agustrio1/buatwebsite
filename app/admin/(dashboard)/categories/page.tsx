import { db } from "~/db";
import { categories } from "~/db/schema";
import { asc } from "drizzle-orm";
import { Trash2, Plus, FolderTree } from "lucide-react";
import { DeleteForm } from "~/components/admin/delete-form";
import { createCategory, deleteCategory } from "./actions";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { EmptyState } from "~/components/ui/misc";

export default async function CategoriesIndex() {
  const rows = await db.query.categories.findMany({ orderBy: [asc(categories.name)] });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Kategori Blog</h1>

      <Card className="p-4 sm:p-5 mb-4">
        <form action={createCategory} className="flex gap-2">
          <Input
            name="name"
            placeholder="Nama kategori baru"
            required
            className="flex-1"
          />
          <Button type="submit" className="shrink-0">
            <Plus size={16} /> Tambah
          </Button>
        </form>
      </Card>

      <Card className="divide-y divide-border">
        {rows.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-foreground">{c.name}</span>
            <DeleteForm
              action={deleteCategory.bind(null, c.id)}
              confirmMessage={`Hapus kategori "${c.name}"?`}
              buttonClassName="inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <Trash2 size={16} />
            </DeleteForm>
          </div>
        ))}
        {rows.length === 0 && (
          <EmptyState icon={<FolderTree size={28} />} title="Belum ada kategori." />
        )}
      </Card>
    </div>
  );
}
