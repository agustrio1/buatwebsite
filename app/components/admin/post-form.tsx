import { useState } from "react";
import { Form, useNavigation } from "react-router";
import { ImagePlus, Save } from "lucide-react";
import { RichTextEditor } from "~/components/admin/rich-text-editor";
import type { JSONContent } from "@tiptap/react";

type PostFormValues = {
  id?: string;
  title: string;
  slug: string;
  summary: string | null;
  contentRich?: JSONContent | null;
  categoryId: string | null;
  status: "draft" | "published";
  coverImageUrl: string | null;
};

export function PostForm({
  defaultValues,
  categories,
}: {
  defaultValues?: PostFormValues;
  categories: { id: string; name: string }[];
}) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [coverPreview, setCoverPreview] = useState<string | null>(
    defaultValues?.coverImageUrl ?? null
  );

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setCoverPreview(file ? URL.createObjectURL(file) : defaultValues?.coverImageUrl ?? null);
  }

  return (
    <Form method="post" encType="multipart/form-data" className="space-y-6 max-w-3xl">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-brand-dark">Info Artikel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Judul</label>
            <input name="title" defaultValue={defaultValues?.title} required
              className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input name="slug" defaultValue={defaultValues?.slug} required
              className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ringkasan</label>
          <textarea name="summary" defaultValue={defaultValues?.summary ?? ""} rows={2}
            className="w-full border rounded px-3 py-2" />
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