"use client";

import { useEffect, useRef, useActionState } from "react";
import { Trash2, Plus, ArrowRight } from "lucide-react";
import { DeleteForm } from "~/components/admin/delete-form";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input, Select, Label } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { EmptyState } from "~/components/ui/misc";

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
        <p className="text-sm text-muted-foreground mt-1">
          Alihkan URL lama ke URL baru, mencegah 404 saat slug berubah.
        </p>
      </div>

      {state.error && (
        <div className="bg-rose-50 text-rose-600 border border-rose-200 rounded-lg px-4 py-3 mb-4 text-sm">
          {state.error}
        </div>
      )}

      <Card className="p-5 mb-5">
        <form action={formAction} ref={formRef} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div>
              <Label className="mb-1.5 block text-xs">Dari (path lama)</Label>
              <Input name="fromPath" placeholder="/blog/artikel-lama" required />
            </div>
            <div className="hidden sm:flex items-center justify-center pb-2">
              <ArrowRight size={16} className="text-slate-300" />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Ke (path baru)</Label>
              <Input name="toPath" placeholder="/blog/artikel-baru" required />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select name="statusCode" defaultValue="301" className="w-auto">
              <option value="301">301 - Permanen</option>
              <option value="302">302 - Sementara</option>
              <option value="307">307 - Sementara (method tetap)</option>
              <option value="308">308 - Permanen (method tetap)</option>
            </Select>
            <Button type="submit" disabled={isPending} className="ml-auto">
              <Plus size={15} /> {isPending ? "Menyimpan..." : "Tambah Redirect"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-mono">
                <span className="text-muted-foreground truncate">{r.fromPath}</span>
                <ArrowRight size={13} className="text-slate-300 shrink-0" />
                <span className="text-foreground truncate">{r.toPath}</span>
              </div>
              <Badge
                variant={r.statusCode === 301 || r.statusCode === 308 ? "default" : "warning"}
                className="mt-1.5"
              >
                {r.statusCode}
              </Badge>
            </div>
            <DeleteForm
              action={() => deleteAction(r.id)}
              confirmMessage={`Hapus redirect "${r.fromPath}"?`}
              buttonClassName="text-slate-400 hover:text-rose-600 shrink-0 transition-colors inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-rose-50"
            >
              <Trash2 size={16} />
            </DeleteForm>
          </div>
        ))}
        {rows.length === 0 && (
          <EmptyState title="Belum ada redirect terdaftar" />
        )}
      </Card>
    </div>
  );
}
