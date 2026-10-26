"use client";

import { useState, useTransition } from "react";
import { ImagePlus, Save, Trash2, Eye } from "lucide-react";
import { RichTextEditor } from "~/components/admin/rich-text-editor";
import { uploadDirect } from "~/lib/image-client";
import { Card, CardTitle } from "~/components/ui/card";
import { Button, buttonVariants } from "~/components/ui/button";
import { Input, Textarea, Label } from "~/components/ui/input";
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

function FL({ children }: { children: React.ReactNode }) {
  return <Label className="mb-1 block text-sm text-slate-600">{children}</Label>;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <div className="p-5 pb-3 sm:p-6 sm:pb-3">
        <CardTitle>{title}</CardTitle>
      </div>
      <div className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">{children}</div>
    </Card>
  );
}

export function ProjectForm({
  action,
  defaultValues,
  onDeleteImage,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: ProjectFormValues;
  onDeleteImage?: (imageId: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const isSubmitting = isPending || uploading;

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    defaultValues?.coverImageUrl ?? null
  );
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setCoverFile(file);
    setCoverPreview(file ? URL.createObjectURL(file) : defaultValues?.coverImageUrl ?? null);
  }

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setGalleryFiles(files);
    setGalleryPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setUploadError(null);
    setUploading(true);
    try {
      if (coverFile) {
        const up = await uploadDirect(coverFile, "projects/cover");
        formData.set("coverImageUrl", up.url);
        formData.set("coverImageId", up.key);
      }

      if (galleryFiles.length > 0) {
        const uploads: { url: string; key: string }[] = [];
        for (const file of galleryFiles) {
          uploads.push(await uploadDirect(file, "projects/gallery"));
        }
        formData.set("galleryUploads", JSON.stringify(uploads));
      }

      startTransition(() => {
        action(formData);
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <SectionCard title="Info Proyek">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FL>Judul</FL>
            <Input name="title" defaultValue={defaultValues?.title} required />
          </div>
          <div>
            <FL>Slug</FL>
            <Input name="slug" defaultValue={defaultValues?.slug} required />
          </div>
          <div>
            <FL>Nama Klien</FL>
            <Input name="clientName" defaultValue={defaultValues?.clientName ?? ""} />
          </div>
          <div>
            <FL>Live Demo URL</FL>
            <Input name="liveDemoUrl" type="url" defaultValue={defaultValues?.liveDemoUrl ?? ""} />
          </div>
        </div>
        <div>
          <FL>Ringkasan</FL>
          <Textarea name="summary" defaultValue={defaultValues?.summary ?? ""} rows={3} />
          <p className="mt-1 text-xs text-muted-foreground">
            Teks pendek buat card/list, bukan konten lengkap.
          </p>
        </div>
        <div>
          <FL>Tech Stack</FL>
          <Input
            name="techStack"
            defaultValue={defaultValues?.techStack?.join(", ") ?? ""}
            placeholder="React, Tailwind, Drizzle"
          />
          <p className="mt-1 text-xs text-muted-foreground">Pisahkan dengan koma</p>
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
      </SectionCard>

      <SectionCard title="Deskripsi Lengkap">
        <RichTextEditor name="descriptionRich" defaultValue={defaultValues?.descriptionRich} />
      </SectionCard>

      <SectionCard title="Cover Image">
        <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-input transition-colors hover:border-brand-500">
          {coverPreview ? (
            <img src={coverPreview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <>
              <ImagePlus size={28} className="text-slate-400" />
              <span className="text-sm text-muted-foreground">Pilih gambar cover</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
        </label>
        {defaultValues?.coverImageUrl && (
          <p className="text-xs text-muted-foreground">Pilih file baru untuk mengganti cover.</p>
        )}
      </SectionCard>

      <SectionCard title="Galeri">
        {defaultValues?.existingGallery && defaultValues.existingGallery.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {defaultValues.existingGallery.map((img) => (
              <div key={img.id} className="group relative">
                <img src={img.imageUrl} alt="" className="aspect-square w-full rounded object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm("Hapus gambar ini?")) return;
                    onDeleteImage?.(img.imageId);
                  }}
                  className="absolute right-1 top-1 rounded bg-white/90 p-1 text-red-500 hover:bg-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="flex h-24 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input transition-colors hover:border-brand-500">
          <ImagePlus size={20} className="text-slate-400" />
          <span className="text-sm text-muted-foreground">Tambah gambar galeri</span>
          <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
        </label>
        {galleryPreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {galleryPreviews.map((src, i) => (
              <img key={i} src={src} alt="" className="aspect-square rounded object-cover" />
            ))}
          </div>
        )}
      </SectionCard>

      {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          <Save size={16} />{" "}
          {uploading ? "Mengunggah gambar..." : isSubmitting ? "Menyimpan..." : "Simpan Proyek"}
        </Button>

        {defaultValues?.id && (
          <a
            href={`/admin/posts/${defaultValues.id}/preview`}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            <Eye size={16} /> Preview
          </a>
        )}
      </div>
    </form>
  );
}
