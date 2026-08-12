import { Link, Form, useLoaderData } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/db";
import { posts } from "~/db/schema";
import { eq, desc } from "drizzle-orm";
import { imagekit } from "~/lib/imagekit-server";
import { Pencil, Trash2 } from "lucide-react";

export async function loader() {
  const data = await db.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
    with: { category: true, author: true },
  });
  return { posts: data };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const id = String(formData.get("id"));

  const post = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  if (post?.coverImageId) {
    await imagekit.deleteFile(post.coverImageId).catch(() => null);
  }
  await db.delete(posts).where(eq(posts.id, id));

  return null;
}

export default function PostsIndex() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Blog</h1>
        <div className="flex gap-2">
          <Link
            to="/admin/categories"
            className="border border-slate-300 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded text-sm"
          >
            Kelola Kategori
          </Link>
          <Link
            to="/admin/posts/new"
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded text-sm"
          >
            + Tulis Artikel
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Judul</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Status</th>
              <th className="p-3">Penulis</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-slate-500">{p.category?.name ?? "-"}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      p.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {p.status === "published" ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-3 text-slate-500">{p.author?.name ?? "-"}</td>
                <td className="p-3 text-right space-x-3 whitespace-nowrap">
                  <Link to={`/admin/posts/${p.id}/edit`} className="text-brand-600 hover:underline inline-flex items-center gap-1">
                    <Pencil size={14} /> Edit
                  </Link>
                  <Form method="post" className="inline">
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      onClick={(e) => {
                        if (!confirm(`Hapus artikel "${p.title}"?`)) e.preventDefault();
                      }}
                      className="text-red-500 hover:underline inline-flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </Form>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">Belum ada artikel.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}