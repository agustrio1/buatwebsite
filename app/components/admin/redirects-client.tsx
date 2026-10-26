"use client";

import { useEffect, useRef, useActionState } from "react";
import { Trash2, Plus, ArrowRight } from "lucide-react";
import { DeleteForm } from "~/components/admin/delete-form";

export type RedirectState = { ok: boolean; error: string | null };

export type RedirectRow = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
};

export function RedirectsClient({
  rows,
  createAction,
  deleteAction,
}: {
  rows: RedirectRow[];
  createAction: (prevState: RedirectState, formData: FormData) => Promise<RedirectState>;
  deleteAction: (id: string) => Promise<void>;
}) {
  const initialState: RedirectState = { ok: false, error: null };
  const [state, formAction, isPending] = useActionState(createAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Redirect Management</h1>
        <p className="text-sm text-slate-400 mt-1">
          Alihkan URL lama ke URL baru, mencegah 404 saat slug berubah.
        </p>
      </div>

      {state.error && (
        <div className="bg-rose-50 text-rose-600 border border-rose-200 rounded-lg px-4 py-3 mb-4 text-sm">
          {state.error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5">
        <form action={formAction} ref={formRef} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Dari (path lama)</label>
              <input
                name="fromPath"
                placeholder="/blog/artikel-lama"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="hidden sm:flex items-center justify-center pb-2">
              <ArrowRight size={16} className="text-slate-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Ke (path baru)</label>
              <input
                name="toPath"
                placeholder="/blog/artikel-baru"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              name="statusCode"
              defaultValue="301"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="301">301 - Permanen</option>
              <option value="302">302 - Sementara</option>
              <option value="307">307 - Sementara (method tetap)</option>
              <option value="308">308 - Permanen (method tetap)</option>
            </select>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium ml-auto"
            >
              <Plus size={15} /> {isPending ? "Menyimpan..." : "Tambah Redirect"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-mono">
                <span className="text-slate-500 truncate">{r.fromPath}</span>
                <ArrowRight size={13} className="text-slate-300 shrink-0" />
                <span className="text-slate-800 truncate">{r.toPath}</span>
              </div>
              <span
                className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  r.statusCode === 301 || r.statusCode === 308
                    ? "bg-slate-100 text-slate-500"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {r.statusCode}
              </span>
            </div>
            <DeleteForm
              action={() => deleteAction(r.id)}
              confirmMessage={`Hapus redirect "${r.fromPath}"?`}
              buttonClassName="text-slate-400 hover:text-rose-600 shrink-0 transition-colors"
            >
              <Trash2 size={16} />
            </DeleteForm>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-slate-400 italic px-4 py-6 text-center">
            Belum ada redirect terdaftar.
          </p>
        )}
      </div>
    </div>
  );
}
