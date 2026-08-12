import { Link, Form, useLoaderData, useOutletContext } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/db";
import { users } from "~/db/schema";
import { eq, asc } from "drizzle-orm";
import { Pencil, Trash2 } from "lucide-react";

export async function loader() {
  const data = await db.query.users.findMany({ orderBy: [asc(users.name)] });
  return { users: data };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const id = String(formData.get("id"));
  await db.delete(users).where(eq(users.id, id));
  return null;
}

export default function UsersIndex() {
  const { users } = useLoaderData<typeof loader>();
  const { userId } = useOutletContext<{ userId: string; role: string }>();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Pengguna Admin</h1>
        <Link
          to="/admin/users/new"
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded text-sm"
        >
          + Tambah User
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Nama</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-slate-500">{u.email}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      u.role === "admin" ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-3 text-right space-x-3 whitespace-nowrap">
                  <Link to={`/admin/users/${u.id}/edit`} className="text-brand-600 hover:underline inline-flex items-center gap-1">
                    <Pencil size={14} /> Edit
                  </Link>
                  {u.id !== userId && (
                    <Form method="post" className="inline">
                      <input type="hidden" name="id" value={u.id} />
                      <button
                        type="submit"
                        onClick={(e) => {
                          if (!confirm(`Hapus user "${u.name}"?`)) e.preventDefault();
                        }}
                        className="text-red-500 hover:underline inline-flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </Form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}