import { Link, Form, useLoaderData } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/db";
import { services } from "~/db/schema";
import { asc, eq } from "drizzle-orm";
import {Check} from "lucide-react"
export async function loader() {
  const data = await db.query.services.findMany({
    orderBy: [asc(services.sortOrder)],
    with: { features: true },
  });
  return { services: data };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = String(formData.get("id"));

  if (intent === "delete") {
    await db.delete(services).where(eq(services.id, id));
  }

  return null;
}

export default function ServicesIndex() {
  const { services } = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Layanan</h1>
        <Link
          to="/admin/services/new"
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded"
        >
          + Tambah Layanan
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Judul</th>
              <th className="p-3">Harga</th>
              <th className="p-3">Badge</th>
              <th className="p-3">Featured</th>
              <th className="p-3">Urutan</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3 font-medium">{s.title}</td>
                <td className="p-3">
                  {!s.isPriceVisible
                    ? <span className="text-slate-400 italic">Disembunyikan</span>
                    : s.priceLabel
                      ? s.priceLabel
                      : s.priceAmount
                        ? `Rp${Number(s.priceAmount).toLocaleString("id-ID")}${s.priceUnit ?? ""}`
                        : "-"}
                </td>
                <td className="p-3">
                  {s.badge && (
                    <span className="bg-brand-100 text-brand-700 text-xs px-2 py-1 rounded">
                      {s.badge}
                    </span>
                  )}
                </td>
                <td className="p-3">{s.isFeatured && <Check size={16} className="text-brand-600" />}</td>
                <td className="p-3">{s.sortOrder}</td>
                <td className="p-3 text-right space-x-3">
                  <Link to={`/admin/services/${s.id}/edit`} className="text-brand-600 hover:underline">
                    Edit
                  </Link>
                  <Form method="post" className="inline">
                    <input type="hidden" name="id" value={s.id} />
                    <button
                      type="submit"
                      name="intent"
                      value="delete"
                      onClick={(e) => {
                        if (!confirm(`Hapus layanan "${s.title}"?`)) e.preventDefault();
                      }}
                      className="text-red-500 hover:underline"
                    >
                      Hapus
                    </button>
                  </Form>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  Belum ada layanan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}