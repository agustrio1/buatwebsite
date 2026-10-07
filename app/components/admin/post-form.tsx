import { useState } from "react";
import { Form, useNavigation } from "react-router";
import { ImagePlus, Save } from "lucide-react";
import { RichTextEditor } from "~/components/admin/rich-text-editor";
import type { JSONContent } from "@tiptap/react";
import { SCHEMA_TYPES, type SchemaType, type SeoErrors } from "~/lib/validation/post-seo";

type PostFormValues = {
  id?: string;
  title: string;
  slug: string;
  summary: string | null;
  contentRich?: JSONContent | null;
  categoryId: string | null;
  status: "draft" | "published";
  coverImageUrl: string | null;
  // SEO
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
  schemaType?: SchemaType;
  customJsonLd?: string | null;
};

const SCHEMA_LABELS: Record<SchemaType, string> = {
  BlogPosting: "BlogPosting (artikel blog, default)",
  Article: "Article (artikel umum)",
  NewsArticle: "NewsArticle (berita)",
  None: "Tanpa schema artikel",
};

function Counter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={`text-xs ${over ? "text-amber-600" : "text-slate-400"}`}>
      {value.length}/{max}
    </span>
  );
}

export function PostForm({
  defaultValues,
  categories,
  errors,
}: {
  defaultValues?: PostFormValues;
  categories: { id: string; name: string }[];
  errors?: Partial<Record<"title" | "slug" | "summary" | "categoryId" | "status", string>> &
    SeoErrors;
}) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [coverPreview, setCoverPreview] = useState<string | null>(
    defaultValues?.coverImageUrl ?? null
  );

  // Dilacak untuk preview snippet
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [summary, setSummary] = useState(defaultValues?.summary ?? "");

  // SEO
  const [metaTitle, setMetaTitle] = useState(defaultValues?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(defaultValues?.metaDescription ?? "");
  const [ogPreview, setOgPreview] = useState<string | null>(defaultValues?.ogImageUrl ?? null);
  const [hasNewOg, setHasNewOg] = useState(false);
  const [removeOg, setRemoveOg] = useState(false);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setCoverPreview(file ? URL.createObjectURL(file) : defaultValues?.coverImageUrl ?? null);
  }

  function handleOgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setOgPreview(URL.createObjectURL(file));
      setHasNewOg(true);
      setRemoveOg(false);
    } else {
      setOgPreview(defaultValues?.ogImageUrl ?? null);
      setHasNewOg(false);
    }
  }

  const showOgPreview = ogPreview && !(removeOg && !hasNewOg);

  return (
    <Form method="post" encType="multipart/form-data" className="space-y-6 max-w-3xl">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-brand-dark">Info Artikel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Judul</label>
            <input
              name="title"
              defaultValue={defaultValues?.title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={`w-full border rounded px-3 py-2 ${errors?.title ? "border-red-400" : ""}`}
            />
            {errors?.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              name="slug"
              defaultValue={defaultValues?.slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className={`w-full border rounded px-3 py-2 ${errors?.slug ? "border-red-400" : ""}`}
            />
            {errors?.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ringkasan</label>
          <textarea
            name="summary"
            defaultValue={defaultValues?.summary ?? ""}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select
              name="categoryId"
              defaultValue={defaultValues?.categoryId ?? ""}
              className="w-full border rounded px-3 py-2 bg-white"
            >
              <option value="">Tanpa kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              defaultValue={defaultValues?.status ?? "draft"}
              className="w-full border rounded px-3 py-2 bg-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-brand-dark">Konten</h2>
        <RichTextEditor name="contentRich" defaultValue={defaultValues?.contentRich} />
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-brand-dark">Cover Image</h2>
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg h-40 cursor-pointer hover:border-brand-500 transition-colors overflow-hidden">
          {coverPreview ? (
            <img src={coverPreview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <>
              <ImagePlus size={28} className="text-slate-400" />
              <span className="text-sm text-slate-400">Pilih gambar cover</span>
            </>
          )}
          <input type="file" name="coverImage" accept="image/*" onChange={handleCoverChange} className="hidden" />
        </label>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-5">
        <h2 className="font-semibold text-brand-dark">SEO</h2>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-400 mb-2">Preview di hasil pencarian</p>
          <p className="text-xs text-slate-500 truncate">/blog/{slug || "slug-artikel"}</p>
          <p className="text-lg text-blue-700 leading-snug line-clamp-2">
            {metaTitle || title || "Judul artikel"}
          </p>
          <p className="text-sm text-slate-600 line-clamp-2">
            {metaDescription || summary || "Deskripsi artikel akan tampil di sini."}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium">Meta Title</label>
            <Counter value={metaTitle} max={60} />
          </div>
          <input
            name="metaTitle"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Kosong = pakai judul artikel + nama situs"
            className={`w-full border rounded px-3 py-2 ${errors?.metaTitle ? "border-red-400" : ""}`}
          />
          {errors?.metaTitle && <p className="text-xs text-red-500 mt-1">{errors.metaTitle}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium">Meta Description</label>
            <Counter value={metaDescription} max={160} />
          </div>
          <textarea
            name="metaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
            placeholder="Kosong = pakai ringkasan artikel"
            className={`w-full border rounded px-3 py-2 ${errors?.metaDescription ? "border-red-400" : ""}`}
          />
          {errors?.metaDescription && (
            <p className="text-xs text-red-500 mt-1">{errors.metaDescription}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Open Graph Image</label>
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg h-40 cursor-pointer hover:border-brand-500 transition-colors overflow-hidden">
            {showOgPreview ? (
              <img src={ogPreview!} alt="Preview OG" className="h-full w-full object-cover" />
            ) : (
              <>
                <ImagePlus size={28} className="text-slate-400" />
                <span className="text-sm text-slate-400">Pilih gambar OG (1200x630)</span>
              </>
            )}
            <input type="file" name="ogImage" accept="image/*" onChange={handleOgChange} className="hidden" />
          </label>
          <p className="text-xs text-slate-400 mt-1">Kosong = pakai cover image.</p>
          {defaultValues?.ogImageUrl && !hasNewOg && (
            <label className="flex items-center gap-2 text-sm text-slate-600 mt-2">
              <input
                type="checkbox"
                name="removeOgImage"
                value="1"
                checked={removeOg}
                onChange={(e) => setRemoveOg(e.target.checked)}
                className="w-4 h-4 accent-brand-500"
              />
              Hapus gambar OG ini
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Canonical URL</label>
          <input
            name="canonicalUrl"
            defaultValue={defaultValues?.canonicalUrl ?? ""}
            placeholder="Kosong = otomatis dari slug"
            className={`w-full border rounded px-3 py-2 ${errors?.canonicalUrl ? "border-red-400" : ""}`}
          />
          {errors?.canonicalUrl && (
            <p className="text-xs text-red-500 mt-1">{errors.canonicalUrl}</p>
          )}
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="noindex"
            defaultChecked={defaultValues?.noindex ?? false}
            className="w-4 h-4 mt-0.5 accent-brand-500"
          />
          <span>
            Jangan indeks artikel ini (noindex)
            <span className="block text-xs text-slate-400">
              Artikel tetap bisa dibuka, tapi tidak muncul di Google.
            </span>
          </span>
        </label>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-5">
        <h2 className="font-semibold text-brand-dark">Schema (JSON-LD)</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Tipe schema artikel</label>
          <select
            name="schemaType"
            defaultValue={defaultValues?.schemaType ?? "BlogPosting"}
            className="w-full border rounded px-3 py-2 bg-white"
          >
            {SCHEMA_TYPES.map((t) => (
              <option key={t} value={t}>{SCHEMA_LABELS[t]}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Breadcrumb dibuat otomatis. Custom JSON-LD di bawah ditambahkan ke schema yang sama.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Custom JSON-LD (opsional)</label>
          <textarea
            name="customJsonLd"
            defaultValue={defaultValues?.customJsonLd ?? ""}
            rows={8}
            spellCheck={false}
            placeholder={'{\n  "@type": "HowTo",\n  "name": "..."\n}'}
            className={`w-full border rounded px-3 py-2 font-mono text-xs ${errors?.customJsonLd ? "border-red-400" : ""}`}
          />
          <p className="text-xs text-slate-400 mt-1">
            Boleh satu object, array, atau object dengan @graph. @context dibuang otomatis.
          </p>
          {errors?.customJsonLd && (
            <p className="text-xs text-red-500 mt-1">{errors.customJsonLd}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-5 py-2.5 rounded"
      >
        <Save size={16} /> {isSubmitting ? "Menyimpan..." : "Simpan Artikel"}
      </button>
    </Form>
  );
}