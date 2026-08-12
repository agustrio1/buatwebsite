import { useState } from "react";
import { Form, useNavigation } from "react-router";
import { ImagePlus, Save, Trash2 } from "lucide-react";
import { RichTextEditor } from "~/components/admin/rich-text-editor";
import type { JSONContent } from "@tiptap/react";

type GalleryImage = { id: string; imageUrl: string; imageId: string };

type ProjectFormValues = {
  id?: string;
  title: string;
  slug: string;
  clientName: string | null;
  summary: string | null;
  descriptionRich?: JSONContent | null;
  liveDemoUrl: string | null;
  techStack: string[];
  isFeatured: boolean;
  coverImageUrl: string | null;
  existingGallery?: GalleryImage[];
};

export function ProjectForm({
  defaultValues,
  onDeleteImage,
}: {
  defaultValues?: ProjectFormValues;
  onDeleteImage?: (imageId: string) => void;
}) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [coverPreview, setCoverPreview] = useState<string | null>(
    defaultValues?.coverImageUrl ?? null
  );
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setCoverPreview(file ? URL.createObjectURL(file) : defaultValues?.coverImageUrl ?? null);
  }

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setGalleryPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  return (
    <Form method="post" encType="multipart/form-data" className="space-y-6 max-w-3xl">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-brand-dark">Info Proyek</h2>
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
          <div>
            <label className="block text-sm font-medium mb-1">Nama Klien</label>
            <input name="clientName" defaultValue={defaultValues?.clientName ?? ""}
              className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Live Demo URL</label>
            <input name="liveDemoUrl" type="url" defaultValue={defaultValues?.liveDemoUrl ?? ""}
              className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ringkasan</label>
          <textarea name="summary" defaultValue={defaultValues?.summary ?? ""} rows={3}
            className="w-full border rounded px-3 py-2" />
          <p className="text-xs text-slate-400 mt-1">Teks pendek buat card/list, bukan konten lengkap.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tech Stack</label>
          <input
            name="techStack"
            defaultValue={defaultValues?.techStack?.join(", ") ?? ""}
            placeholder="React, Tailwind, Drizzle"
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-slate-400 mt-1">Pisahkan dengan koma</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" value="true" defaultChecked={defaultValues?.isFeatured} />
          Tandai sebagai Featured
        </label>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-brand-dark">Deskripsi Lengkap</h2>
        <RichTextEditor name="descriptionRich" defaultValue={defaultValues?.descriptionRich} />
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
        {defaultValues?.coverImageUrl && (
          <p className="text-xs text-slate-400">Pilih file baru untuk mengganti cover.</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-brand-dark">Galeri</h2>

        {defaultValues?.existingGallery && defaultValues.existingGallery.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {defaultValues.existingGallery.map((img) => (
              <div key={img.id} className="relative group">
                <img src={img.imageUrl} alt="" className="aspect-square object-cover rounded w-full" />
                <button
                  type="button"
                  onClick={() => onDeleteImage?.(img.imageId)}
                  className="absolute top-1 right-1 bg-white/90 rounded p-1 text-red-500 hover:bg-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg h-24 cursor-pointer hover:border-brand-500 transition-colors">
          <ImagePlus size={20} className="text-slate-400" />
          <span className="text-sm text-slate-400">Tambah gambar galeri</span>
          <input type="file" name="galleryImages" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
        </label>
        {galleryPreviews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {galleryPreviews.map((src, i) => (
              <img key={i} src={src} alt="" className="aspect-square object-cover rounded" />
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-5 py-2.5 rounded"
      >
        <Save size={16} /> {isSubmitting ? "Menyimpan..." : "Simpan Proyek"}
      </button>
    </Form>
  );
}