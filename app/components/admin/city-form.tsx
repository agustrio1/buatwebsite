import { Form } from "react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Faq = { question: string; answer: string };

type CityFormProps = {
  errors?: Record<string, string>;
  defaultValues?: {
    id?: string;
    name: string;
    slug: string;
    province?: string | null;
    intro?: string | null;
    localContext?: string | null;
    faqs?: Faq[] | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    isActive: boolean;
  };
};

export function CityForm({ errors, defaultValues }: CityFormProps) {
  const [faqs, setFaqs] = useState<Faq[]>(defaultValues?.faqs ?? []);

  function addFaq() {
    setFaqs([...faqs, { question: "", answer: "" }]);
  }

  function removeFaq(index: number) {
    setFaqs(faqs.filter((_, i) => i !== index));
  }

  function updateFaq(index: number, key: keyof Faq, value: string) {
    setFaqs(faqs.map((f, i) => (i === index ? { ...f, [key]: value } : f)));
  }

  return (
    <Form method="post" className="bg-white rounded-lg shadow p-6 max-w-2xl space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Nama Kota</label>
        <input
          type="text"
          name="name"
          defaultValue={defaultValues?.name}
          placeholder="Jakarta"
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
        />
        {errors?.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Slug</label>
        <input
          type="text"
          name="slug"
          defaultValue={defaultValues?.slug}
          placeholder="jakarta"
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
        />
        <p className="text-xs text-slate-400 mt-1">
          URL: /jasa-pembuatan-website/{defaultValues?.slug || "slug-kota"}
        </p>
        {errors?.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Provinsi</label>
        <input
          type="text"
          name="province"
          defaultValue={defaultValues?.province ?? ""}
          placeholder="DKI Jakarta"
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Paragraf Pembuka
        </label>
        <textarea
          name="intro"
          defaultValue={defaultValues?.intro ?? ""}
          rows={3}
          placeholder="Kalimat khas kota ini, kalau kosong pakai teks default."
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Konteks Bisnis Lokal (opsional, tapi disarankan diisi biar konten unik)
        </label>
        <textarea
          name="localContext"
          defaultValue={defaultValues?.localContext ?? ""}
          rows={5}
          placeholder="Contoh: ceritakan karakteristik UMKM/bisnis di kota ini, tantangan digitalnya, kenapa website penting untuk mereka..."
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-600">
            FAQ Khusus Kota Ini
          </label>
          <button
            type="button"
            onClick={addFaq}
            className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1"
          >
            <Plus size={14} /> Tambah FAQ
          </button>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">FAQ #{i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeFaq(i)}
                  className="text-red-500 hover:underline text-xs inline-flex items-center gap-1"
                >
                  <Trash2 size={12} /> Hapus
                </button>
              </div>
              <input
                type="text"
                value={faq.question}
                onChange={(e) => updateFaq(i, "question", e.target.value)}
                placeholder="Pertanyaan"
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              />
              <textarea
                value={faq.answer}
                onChange={(e) => updateFaq(i, "answer", e.target.value)}
                placeholder="Jawaban"
                rows={2}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              />
            </div>
          ))}
          {faqs.length === 0 && (
            <p className="text-xs text-slate-400 italic">Belum ada FAQ untuk kota ini.</p>
          )}
        </div>

        <input type="hidden" name="faqs" value={JSON.stringify(faqs)} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Meta Title (SEO)</label>
        <input
          type="text"
          name="metaTitle"
          defaultValue={defaultValues?.metaTitle ?? ""}
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Meta Description (SEO)
        </label>
        <textarea
          name="metaDescription"
          defaultValue={defaultValues?.metaDescription ?? ""}
          rows={2}
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={defaultValues?.isActive ?? true}
        />
        Aktif (tampil di website)
      </label>

      <button
        type="submit"
        className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded text-sm font-medium"
      >
        Simpan
      </button>
    </Form>
  );
}