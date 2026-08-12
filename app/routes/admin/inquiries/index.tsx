import { Form, useLoaderData } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/db";
import { inquiries } from "~/db/schema";
import { eq, desc } from "drizzle-orm";
import { Trash2, Mail, Phone } from "lucide-react";

export async function loader() {
  const data = await db.query.inquiries.findMany({ orderBy: [desc(inquiries.createdAt)] });
  return { inquiries: data };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = String(formData.get("id"));

  if (intent === "update-status") {
    const status = String(formData.get("status")) as "new" | "contacted" | "closed";
    await db.update(inquiries).set({ status }).where(eq(inquiries.id, id));
  }

  if (intent === "delete") {
    await db.delete(inquiries).where(eq(inquiries.id, id));
  }

  return null;
}

const statusStyle: Record<string, string> = {
  new: "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  closed: "bg-slate-100 text-slate-500",
};

export default function InquiriesIndex() {
  const { inquiries } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Inquiries</h1>

      <div className="space-y-3">
        {inquiries.map((inq) => (
          <div key={inq.id} className="bg-white rounded-lg shadow p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-brand-dark">{inq.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusStyle[inq.status]}`}>
                    {inq.status}
                  </span>
                </div>
                {inq.companyName && (
                  <p className="text-sm text-slate-400">{inq.companyName}</p>
                )}
                <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail size={14} /> {inq.email}
                  </span>
                  {inq.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={14} /> {inq.phone}
                    </span>
                  )}
                </div>
                {inq.serviceType && (
                  <p className="text-xs text-brand-600 mt-1">Layanan: {inq.serviceType}</p>
                )}
                <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{inq.message}</p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                <Form method="post">
                  <input type="hidden" name="intent" value="update-status" />
                  <input type="hidden" name="id" value={inq.id} />
                  <select
                    name="status"
                    defaultValue={inq.status}
                    onChange={(e) => e.currentTarget.form?.requestSubmit()}
                    className="border rounded px-2 py-1.5 text-sm bg-white"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </Form>
                <Form method="post">
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="id" value={inq.id} />
                  <button
                    type="submit"
                    onClick={(e) => {
                      if (!confirm(`Hapus inquiry dari "${inq.name}"?`)) e.preventDefault();
                    }}
                    className="text-red-500 hover:text-red-700 p-1.5"
                  >
                    <Trash2 size={16} />
                  </button>
                </Form>
              </div>
            </div>
          </div>
        ))}
        {inquiries.length === 0 && (
          <p className="text-center text-slate-400 italic py-10">Belum ada inquiry masuk.</p>
        )}
      </div>
    </div>
  );
}