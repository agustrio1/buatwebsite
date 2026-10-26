import { Form } from "react-router";
import { SortableTextList } from "./sortable-text-list";
import { SortableFaqList } from "./sortable-faq-list";
import { ChevronDown } from "lucide-react";

type Faq = { question: string; answer: string };

type CityFormProps = {
  errors?: Record<string, string>;
  defaultValues?: {
    id?: string;
    name: string;
    slug: string;
    province?: string | null;
    h1?: string | null;
    intro?: string | null;
    localContext?: string | null;
    localChallenges?: string | null;
    whyWebsiteNeeded?: string | null;
    businessTypes?: string[] | null;
    relevantServices?: string[] | null;
    advantages?: string[] | null;
    serviceAreas?: string[] | null;
    faqs?: Faq[] | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    ctaTitle?: string | null;
    ctaDescription?: string | null;
    ctaWhatsappNumber?: string | null;
    isActive: boolean;
  };
};

function Section({
  number,
  title,
  children,
  defaultOpen = false,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="bg-white rounded-lg shadow overflow-hidden group"
    >
      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none list-none">
        <span className="font-semibold text-brand-dark text-sm">
          {number}. {title}
        </span>
        <ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-100">{children}</div>
    </details>
  );
}

export function CityForm({ errors, defaultValues }: CityFormProps) {
  return (
    <Form method="post" className="max-w-2xl space-y-4">
      <Section number={1} title="Informasi Kota" defaultOpen>
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
      </Section>

      <Section number={2} title="Konten Utama" defaultOpen>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            H1 (judul utama halaman, kosongkan untuk pakai default)
          </label>
          <input
            type="text"
            name="h1"
            defaultValue={defaultValues?.h1 ?? ""}
            placeholder={`Jasa Pembuatan Website Profesional di ${defaultValues?.name || "[Kota]"}`}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Paragraf Pembuka</label>
          <textarea
            name="intro"
            defaultValue={defaultValues?.intro ?? ""}
            rows={3}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Konteks Bisnis Lokal</label>
          <textarea
            name="localContext"
            defaultValue={defaultValues?.localContext ?? ""}
            rows={4}
            placeholder="Ceritakan karakteristik bisnis di kota ini..."
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
        </div>
      </Section>

      <Section number={3} title="Kebutuhan Bisnis">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Tantangan Bisnis Lokal</label>
          <textarea
            name="localChallenges"
            defaultValue={defaultValues?.localChallenges ?? ""}
            rows={3}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Kenapa Website Dibutuhkan</label>
          <textarea
            name="whyWebsiteNeeded"
            defaultValue={defaultValues?.whyWebsiteNeeded ?? ""}
            rows={3}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <SortableTextList
          name="businessTypes"
          label="Jenis Bisnis yang Dilayani"
          placeholder="Contoh: Toko retail, Klinik, Restoran"
          defaultValue={defaultValues?.businessTypes ?? []}
        />
      </Section>

      <Section number={4} title="Layanan & Keunggulan">
        <SortableTextList
          name="relevantServices"
          label="Layanan yang Relevan"
          placeholder="Contoh: Website company profile"
          defaultValue={defaultValues?.relevantServices ?? []}
        />

        <SortableTextList
          name="advantages"
          label="Keunggulan"
          placeholder="Contoh: Proses cepat 3-5 hari kerja"
          defaultValue={defaultValues?.advantages ?? []}
        />
      </Section>

      <Section number={5} title="Area Layanan">
        <SortableTextList
          name="serviceAreas"
          label="Area yang Dilayani"
          placeholder="Contoh: Jakarta Selatan, Jakarta Pusat"
          defaultValue={defaultValues?.serviceAreas ?? []}
        />
      </Section>

      <Section number={6} title="FAQ Kota">
        <SortableFaqList name="faqs" defaultValue={defaultValues?.faqs ?? []} />
      </Section>

      <Section number={7} title="SEO & CTA">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Meta Title</label>
          <input
            type="text"
            name="metaTitle"
            defaultValue={defaultValues?.metaTitle ?? ""}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Meta Description</label>
          <textarea
            name="metaDescription"
            defaultValue={defaultValues?.metaDescription ?? ""}
            rows={2}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">CTA Judul</label>
          <input
            type="text"
            name="ctaTitle"
            defaultValue={defaultValues?.ctaTitle ?? ""}
            placeholder="Siap Bangun Website Bisnis Anda?"
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">CTA Deskripsi</label>
          <textarea
            name="ctaDescription"
            defaultValue={defaultValues?.ctaDescription ?? ""}
            rows={2}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            WhatsApp (opsional, kosongkan untuk pakai nomor default)
          </label>
          <input
            type="text"
            name="ctaWhatsappNumber"
            defaultValue={defaultValues?.ctaWhatsappNumber ?? ""}
            placeholder="62812xxxxxxx"
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
        </div>
      </Section>

      <div className="bg-white rounded-lg shadow p-5">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" name="isActive" defaultChecked={defaultValues?.isActive ?? true} />
          Aktif (tampil di website)
        </label>

        <button
          type="submit"
          className="w-full sm:w-auto mt-4 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded text-sm font-medium"
        >
          Simpan
        </button>
      </div>
    </Form>
  );
}