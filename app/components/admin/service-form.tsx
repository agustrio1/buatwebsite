"use client";

import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Card, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input, Textarea, Label } from "~/components/ui/input";

type Feature = { id?: string; featureText: string; isIncluded: boolean };

type ServiceFormValues = {
  id?: string;
  title: string;
  slug: string;
  summary: string | null;
  isPriceVisible: boolean;
  priceAmount: string | null;
  priceLabel: string | null;
  priceUnit: string | null;
  badge: string | null;
  isFeatured: boolean;
  sortOrder: number;
  features: Feature[];
};

function FL({ children }: { children: React.ReactNode }) {
  return <Label className="mb-1 block text-sm text-slate-600">{children}</Label>;
}

export function ServiceForm({
  action,
  defaultValues,
  error,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: ServiceFormValues;
  error?: string;
}) {
  const [isPriceVisible, setIsPriceVisible] = useState(
    defaultValues?.isPriceVisible ?? true
  );
  const [features, setFeatures] = useState<Feature[]>(
    defaultValues?.features ?? []
  );

  function addFeature() {
    setFeatures((f) => [...f, { featureText: "", isIncluded: true }]);
  }

  function removeFeature(index: number) {
    setFeatures((f) => f.filter((_, i) => i !== index));
  }

  function updateFeature(index: number, patch: Partial<Feature>) {
    setFeatures((f) => f.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  return (
    <form action={action} className="w-full">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}
      <input type="hidden" name="featuresJson" value={JSON.stringify(features)} />

      {/* Desktop (xl): dua kolom — info & harga di kiri, fitur + simpan di kanan. */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
      <div className="min-w-0 space-y-6">
      {/* Info dasar */}
      <Card>
        <div className="p-5 pb-3 sm:p-6 sm:pb-3">
          <CardTitle>Info Dasar</CardTitle>
        </div>
        <div className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FL>Judul</FL>
              <Input name="title" defaultValue={defaultValues?.title} required />
            </div>
            <div>
              <FL>Slug</FL>
              <Input name="slug" defaultValue={defaultValues?.slug} required />
            </div>
          </div>
          <div>
            <FL>Ringkasan</FL>
            <Textarea name="summary" defaultValue={defaultValues?.summary ?? ""} rows={3} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FL>Badge</FL>
              <Input name="badge" defaultValue={defaultValues?.badge ?? ""} placeholder="Paling Populer" />
            </div>
            <div>
              <FL>Urutan</FL>
              <Input
                type="number"
                name="sortOrder"
                defaultValue={defaultValues?.sortOrder ?? 0}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              name="isFeatured"
              value="true"
              defaultChecked={defaultValues?.isFeatured}
              className="h-4 w-4 accent-brand-500"
            />
            Tandai sebagai Featured
          </label>
        </div>
      </Card>

      {/* Harga */}
      <Card>
        <div className="flex items-center justify-between p-5 pb-3 sm:p-6 sm:pb-3">
          <CardTitle>Harga</CardTitle>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              name="isPriceVisible"
              value="true"
              checked={isPriceVisible}
              onChange={(e) => setIsPriceVisible(e.target.checked)}
              className="h-4 w-4 accent-brand-500"
            />
            Tampilkan harga
          </label>
        </div>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          {isPriceVisible ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <FL>Nominal</FL>
                <Input
                  type="number"
                  step="0.01"
                  name="priceAmount"
                  defaultValue={defaultValues?.priceAmount ?? ""}
                  placeholder="1500000"
                />
              </div>
              <div>
                <FL>Label</FL>
                <Input
                  name="priceLabel"
                  defaultValue={defaultValues?.priceLabel ?? ""}
                  placeholder="Mulai dari / Nego / Custom"
                />
              </div>
              <div>
                <FL>Satuan</FL>
                <Input name="priceUnit" defaultValue={defaultValues?.priceUnit ?? ""} placeholder="/projek" />
              </div>
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              Harga disembunyikan dari halaman publik.
            </p>
          )}
        </div>
      </Card>

      </div>

      <div className="min-w-0 space-y-6">
      {/* Fitur */}
      <Card>
        <div className="flex items-center justify-between p-5 pb-3 sm:p-6 sm:pb-3">
          <CardTitle>Fitur Layanan</CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={addFeature} className="text-brand-600">
            <Plus size={16} /> Tambah Fitur
          </Button>
        </div>
        <div className="space-y-2 px-5 pb-5 sm:px-6 sm:pb-6">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={feature.featureText}
                onChange={(e) => updateFeature(i, { featureText: e.target.value })}
                placeholder="Contoh: Free 3x revisi"
                className="flex-1"
              />
              <label className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={feature.isIncluded}
                  onChange={(e) => updateFeature(i, { isIncluded: e.target.checked })}
                  className="h-4 w-4 accent-brand-500"
                />
                Termasuk
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeFeature(i)}
                className="self-end text-rose-500 hover:bg-rose-50 sm:self-auto"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          {features.length === 0 && (
            <p className="text-sm italic text-muted-foreground">Belum ada fitur.</p>
          )}
        </div>
      </Card>

      <Button type="submit">
        <Save size={16} /> Simpan Layanan
      </Button>
      </div>
      </div>
    </form>
  );
}
