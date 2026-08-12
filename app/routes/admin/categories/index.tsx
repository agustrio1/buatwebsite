import { Form, useLoaderData } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/db";
import { categories } from "~/db/schema";
import { eq, asc } from "drizzle-orm";
import { Trash2, Plus } from "lucide-react";

export async function loader() {
  const data = await db.query.categories.findMany({ orderBy: [asc(categories.name)] });
  return { categories: data };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { error: "Nama kategori wajib diisi" };
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await db.insert(categories).values({ name, slug });
  }

  if (intent === "delete") {
    const id = String(formData.get("id"));
    await db.delete(categories).where(eq(categories.id, id));
  }

  return null;
}

export default function CategoriesIndex() {
  const { categories } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Kategori Blog</h1>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4">
        <Form method="post" className="flex gap-2">
          <input type="hidden" name="intent" value="create" />
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
        </Form>
      </div>

      <div className="bg-white rounded-lg shadow divide-y">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">{c.name}</span>
            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={c.id} />
              <button
                type="submit"
                onClick={(e) => {
                  if (!confirm(`Hapus kategori "${c.name}"?`)) e.preventDefault();
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </Form>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-slate-400 italic px-4 py-6 text-center">Belum ada kategori.</p>
        )}
      </div>
    </div>
  );
}