import { db } from "~/db";
import { categories } from "~/db/schema";
import { asc } from "drizzle-orm";
import { Trash2, Plus } from "lucide-react";
import { DeleteForm } from "~/components/admin/delete-form";
import { createCategory, deleteCategory } from "./actions";

export default async function CategoriesIndex() {
  const rows = await db.query.categories.findMany({ orderBy: [asc(categories.name)] });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Kategori Blog</h1>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4">
        <form action={createCategory} className="flex gap-2">
          <input
            name="name"
            placeholder="Nama kategori baru"
            required
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded text-sm shrink-0"
          >
            <Plus size={16} /> Tambah
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        {rows.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">{c.name}</span>
            <DeleteForm
              action={deleteCategory.bind(null, c.id)}
              confirmMessage={`Hapus kategori "${c.name}"?`}
              buttonClassName="text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </DeleteForm>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-slate-400 italic px-4 py-6 text-center">Belum ada kategori.</p>
        )}
      </div>
    </div>
  );
}
