import Link from "next/link";
import { db } from "~/db";
import { cities } from "~/db/schema";
import { asc } from "drizzle-orm";
import { Pencil, Trash2 } from "lucide-react";
import { DeleteForm } from "~/components/admin/delete-form";
import { deleteCity } from "./actions";

export default async function CitiesIndex() {
  const rows = await db.query.cities.findMany({
    orderBy: [asc(cities.sortOrder), asc(cities.name)],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Kota</h1>
        <Link
          href="/admin/cities/new"
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
            {rows.map((c) => (
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
                    href={`/admin/cities/${c.id}/edit`}
                    className="text-brand-600 hover:underline inline-flex items-center gap-1"
                  >
                    <Pencil size={14} /> Edit
                  </Link>
                  <DeleteForm
                    action={deleteCity.bind(null, c.id)}
                    confirmMessage={`Hapus kota "${c.name}"?`}
                    buttonClassName="text-red-500 hover:underline inline-flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Hapus
                  </DeleteForm>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
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
