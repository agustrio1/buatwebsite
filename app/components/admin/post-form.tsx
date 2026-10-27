"use client";

import { useState, useActionState } from "react";
import { ImagePlus, Save } from "lucide-react";
import { RichTextEditor } from "~/components/admin/rich-text-editor";
import { SeoPanel } from "~/components/admin/seo-analysis";
import type { JSONContent } from "@tiptap/react";
import { SCHEMA_TYPES, type SchemaType, type SeoErrors } from "~/lib/validation/post-seo";
import { Card, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input, Textarea, Select, Label } from "~/components/ui/input";

export type PostFormErrors = Partial<
  Record<"title" | "slug" | "summary" | "categoryId" | "status", string>
> &
  SeoErrors;

export type PostFormState = { errors?: PostFormErrors } | null;

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

function FL({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Label className={`mb-1 block text-sm text-slate-600 ${className ?? ""}`}>{children}</Label>;
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

function Counter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={`text-xs ${over ? "text-amber-600" : "text-muted-foreground"}`}>
      {value.length}/{max}
    </span>
  );
}

export function PostForm({
  action,
  defaultValues,
  categories,
  siteName = "",
}: {
  action: (prevState: PostFormState, formData: FormData) => Promise<PostFormState>;
  defaultValues?: PostFormValues;
  categories: { id: string; name: string }[];
  siteName?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const errors = state?.errors;
  const isSubmitting = isPending;

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

  // Analisis SEO (client-only, tidak di-submit / tidak dipersistensi)
  const [focusKeyword, setFocusKeyword] = useState("");
  const [editorJson, setEditorJson] = useState<JSONContent | null>(
    defaultValues?.contentRich ?? null
  );

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
    <form action={formAction} encType="multipart/form-data" className="space-y-6 w-full">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <Card>
        <div className="p-5 pb-3 sm:p-6 sm:pb-3">
          <CardTitle>Info Artikel</CardTitle>
        </div>
        <div className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FL>Judul</FL>
              <Input
                name="title"
                defaultValue={defaultValues?.title}
                onChange={(e) => setTitle(e.target.value)}
                required
                aria-invalid={!!errors?.title}
              />
              <Err msg={errors?.title} />
            </div>
            <div>
              <FL>Slug</FL>
              <Input
                name="slug"
                defaultValue={defaultValues?.slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                aria-invalid={!!errors?.slug}
              />
              <Err msg={errors?.slug} />
            </div>
          </div>
          <div>
            <FL>Ringkasan</FL>
            <Textarea
              name="summary"
              defaultValue={defaultValues?.summary ?? ""}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FL>Kategori</FL>
              <Select name="categoryId" defaultValue={defaultValues?.categoryId ?? ""}>
                <option value="">Tanpa kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <FL>Status</FL>
              <Select name="status" defaultValue={defaultValues?.status ?? "draft"}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-5 pb-3 sm:p-6 sm:pb-3">
          <CardTitle>Konten</CardTitle>
        </div>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <RichTextEditor
            name="contentRich"
            defaultValue={defaultValues?.contentRich}
            onUpdate={setEditorJson}
            autosaveKey={`post:${defaultValues?.id ?? "new"}:contentRich`}
          />
        </div>
      </Card>

      <Card>
        <div className="p-5 pb-3 sm:p-6 sm:pb-3">
          <CardTitle>Cover Image</CardTitle>
        </div>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-input transition-colors hover:border-brand-500">
            {coverPreview ? (
              <img src={coverPreview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <>
                <ImagePlus size={28} className="text-slate-400" />
                <span className="text-sm text-muted-foreground">Pilih gambar cover</span>
              </>
            )}
            <input type="file" name="coverImage" accept="image/*" onChange={handleCoverChange} className="hidden" />
          </label>
        </div>
      </Card>

      <Card>
        <div className="p-5 pb-3 sm:p-6 sm:pb-3">
          <CardTitle>SEO</CardTitle>
        </div>
        <div className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="mb-2 text-xs text-muted-foreground">Preview di hasil pencarian</p>
            <p className="truncate text-xs text-slate-500">/blog/{slug || "slug-artikel"}</p>
            <p className="text-lg leading-snug text-blue-700 line-clamp-2">
              {metaTitle || title || "Judul artikel"}
            </p>
            <p className="text-sm text-slate-600 line-clamp-2">
              {metaDescription || summary || "Deskripsi artikel akan tampil di sini."}
            </p>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <Label className="text-sm text-slate-600">Meta Title</Label>
              <Counter value={metaTitle} max={60} />
            </div>
            <Input
              name="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Kosong = pakai judul artikel + nama situs"
              aria-invalid={!!errors?.metaTitle}
            />
            <Err msg={errors?.metaTitle} />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <Label className="text-sm text-slate-600">Meta Description</Label>
              <Counter value={metaDescription} max={160} />
            </div>
            <Textarea
              name="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              placeholder="Kosong = pakai ringkasan artikel"
              aria-invalid={!!errors?.metaDescription}
            />
            <Err msg={errors?.metaDescription} />
          </div>

          <div>
            <FL>Open Graph Image</FL>
            <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-input transition-colors hover:border-brand-500">
              {showOgPreview ? (
                <img src={ogPreview!} alt="Preview OG" className="h-full w-full object-cover" />
              ) : (
                <>
                  <ImagePlus size={28} className="text-slate-400" />
                  <span className="text-sm text-muted-foreground">Pilih gambar OG (1200x630)</span>
                </>
              )}
              <input type="file" name="ogImage" accept="image/*" onChange={handleOgChange} className="hidden" />
            </label>
            <p className="mt-1 text-xs text-muted-foreground">Kosong = pakai cover image.</p>
            {defaultValues?.ogImageUrl && !hasNewOg && (
              <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  name="removeOgImage"
                  value="1"
                  checked={removeOg}
                  onChange={(e) => setRemoveOg(e.target.checked)}
                  className="h-4 w-4 accent-brand-500"
                />
                Hapus gambar OG ini
              </label>
            )}
          </div>

          <div>
            <FL>Canonical URL</FL>
            <Input
              name="canonicalUrl"
              defaultValue={defaultValues?.canonicalUrl ?? ""}
              placeholder="Kosong = otomatis dari slug"
              aria-invalid={!!errors?.canonicalUrl}
            />
            <Err msg={errors?.canonicalUrl} />
          </div>

          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="noindex"
              defaultChecked={defaultValues?.noindex ?? false}
              className="mt-0.5 h-4 w-4 accent-brand-500"
            />
            <span>
              Jangan indeks artikel ini (noindex)
              <span className="block text-xs text-muted-foreground">
                Artikel tetap bisa dibuka, tapi tidak muncul di Google.
              </span>
            </span>
          </label>
        </div>
      </Card>

     <Card>
        <div className="p-5 pb-3 sm:p-6 sm:pb-3">
          <CardTitle>Analisis SEO</CardTitle>
        </div>
        <div className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
          <div>
            <FL>
              Focus Keyword{" "}
              <span className="font-normal text-muted-foreground">(hanya untuk analisis, tidak disimpan)</span>
            </FL>
            <Input
              type="text"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="misal: jasa pembuatan website"
            />
          </div>

          <SeoPanel
            title={title}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            slug={slug}
            summary={summary}
            editorJson={editorJson}
            focusKeyword={focusKeyword}
            siteName={siteName}
          />
        </div>
      </Card>

      <Card>
        <div className="p-5 pb-3 sm:p-6 sm:pb-3">
          <CardTitle>Schema (JSON-LD)</CardTitle>
        </div>
        <div className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
          <div>
            <FL>Tipe schema artikel</FL>
            <Select name="schemaType" defaultValue={defaultValues?.schemaType ?? "BlogPosting"}>
              {SCHEMA_TYPES.map((t) => (
                <option key={t} value={t}>{SCHEMA_LABELS[t]}</option>
              ))}
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">
              Breadcrumb dibuat otomatis. Custom JSON-LD di bawah ditambahkan ke schema yang sama.
            </p>
          </div>

          <div>
            <FL>Custom JSON-LD (opsional)</FL>
            <Textarea
              name="customJsonLd"
              defaultValue={defaultValues?.customJsonLd ?? ""}
              rows={8}
              spellCheck={false}
              placeholder={'{\n  "@type": "HowTo",\n  "name": "..."\n}'}
              className="font-mono text-xs"
              aria-invalid={!!errors?.customJsonLd}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Boleh satu object, array, atau object dengan @graph. @context dibuang otomatis.
            </p>
            <Err msg={errors?.customJsonLd} />
          </div>
        </div>
      </Card>

      <Button type="submit" disabled={isSubmitting}>
        <Save size={16} /> {isSubmitting ? "Menyimpan..." : "Simpan Artikel"}
      </Button>
    </form>
  );
}
