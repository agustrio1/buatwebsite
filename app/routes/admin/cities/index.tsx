import { Link, Form, useLoaderData } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/db";
import { cities } from "~/db/schema";
import { eq, asc } from "drizzle-orm";
import { Pencil, Trash2 } from "lucide-react";

export async function loader() {
  const data = await db.query.cities.findMany({
    orderBy: [asc(cities.sortOrder), asc(cities.name)],
  });
  return { cities: data };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const id = String(formData.get("id"));
  await db.delete(cities).where(eq(cities.id, id));
  return null;
}

export default function CitiesIndex() {
  const { cities } = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Kota</h1>
        <Link
          to="/admin/cities/new"
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded text-sm"
        >
          + Tambah Kota
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Nama</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Provinsi</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {cities.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-slate-500">/jasa-pembuatan-website/{c.slug}</td>
                <td className="p-3 text-slate-500">{c.province ?? "-"}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      c.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {c.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="p-3 text-right space-x-3 whitespace-nowrap">
                  <Link
                    to={`/admin/cities/${c.id}/edit`}
                    className="text-brand-600 hover:underline inline-flex items-center gap-1"
                  >
                    <Pencil size={14} /> Edit
                  </Link>
                  <Form method="post" className="inline">
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      type="submit"
                      onClick={(e) => {
                        if (!confirm(`Hapus kota "${c.name}"?`)) e.preventDefault();
                      }}
                      className="text-red-500 hover:underline inline-flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </Form>
                </td>
              </tr>
            ))}
            {cities.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">
                  Belum ada kota.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}