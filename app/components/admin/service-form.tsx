import { useState } from "react";
import { Form } from "react-router";
import { Plus, Trash2, Save } from "lucide-react";

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

export function ServiceForm({
  defaultValues,
  error,
}: {
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
    <Form method="post" className="space-y-6 max-w-3xl">
      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded p-3">
          {error}
        </p>
      )}

      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}
      <input type="hidden" name="featuresJson" value={JSON.stringify(features)} />

      {/* Info dasar */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-brand-dark">Info Dasar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Judul</label>
            <input
              name="title"
              defaultValue={defaultValues?.title}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              name="slug"
              defaultValue={defaultValues?.slug}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ringkasan</label>
          <textarea
            name="summary"
            defaultValue={defaultValues?.summary ?? ""}
            rows={3}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Badge</label>
            <input
              name="badge"
              defaultValue={defaultValues?.badge ?? ""}
              placeholder="Paling Populer"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Urutan</label>
            <input
              type="number"
              name="sortOrder"
              defaultValue={defaultValues?.sortOrder ?? 0}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isFeatured"
            value="true"
            defaultChecked={defaultValues?.isFeatured}
          />
          Tandai sebagai Featured
        </label>
      </div>

      {/* Harga */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-brand-dark">Harga</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPriceVisible"
              value="true"
              checked={isPriceVisible}
              onChange={(e) => setIsPriceVisible(e.target.checked)}
            />
            Tampilkan harga
          </label>
        </div>

        {isPriceVisible ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nominal</label>
              <input
                type="number"
                step="0.01"
                name="priceAmount"
                defaultValue={defaultValues?.priceAmount ?? ""}
                placeholder="1500000"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input
                name="priceLabel"
                defaultValue={defaultValues?.priceLabel ?? ""}
                placeholder="Mulai dari / Nego / Custom"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Satuan</label>
              <input
                name="priceUnit"
                defaultValue={defaultValues?.priceUnit ?? ""}
                placeholder="/projek"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">
            Harga disembunyikan dari halaman publik.
          </p>
        )}
      </div>

      {/* Fitur */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-brand-dark">Fitur Layanan</h2>
          <button
            type="button"
            onClick={addFeature}
            className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
          >
            <Plus size={16} /> Tambah Fitur
          </button>
        </div>

        <div className="space-y-2">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <input
                value={feature.featureText}
                onChange={(e) => updateFeature(i, { featureText: e.target.value })}
                placeholder="Contoh: Free 3x revisi"
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                <input
                  type="checkbox"
                  checked={feature.isIncluded}
                  onChange={(e) => updateFeature(i, { isIncluded: e.target.checked })}
                />
                Termasuk
              </label>
              <button
                type="button"
                onClick={() => removeFeature(i)}
                className="text-red-500 hover:text-red-700 self-end sm:self-auto shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {features.length === 0 && (
            <p className="text-sm text-slate-400 italic">Belum ada fitur.</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded"
      >
        <Save size={16} /> Simpan Layanan
      </button>
    </Form>
  );
}