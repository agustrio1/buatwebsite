"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { PageAdminState } from "~/admin/(dashboard)/pages/actions";
import { Card, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input, Label } from "~/components/ui/input";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function PageNewForm({
  action,
}: {
  action: (prevState: PageAdminState, formData: FormData) => Promise<PageAdminState>;
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const errors = state?.errors;
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={formAction} className="w-full max-w-xl">
      <Card>
        <div className="p-5 pb-3 sm:p-6 sm:pb-3">
          <CardTitle>Halaman Baru</CardTitle>
        </div>
        <div className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
          <div>
            <Label className="mb-1 block text-sm text-slate-600">Judul halaman</Label>
            <Input
              name="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="mis. Promo Website UMKM"
              required
              aria-invalid={!!errors?.title}
            />
            {errors?.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div>
            <Label className="mb-1 block text-sm text-slate-600">Slug (URL)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">/</span>
              <Input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="promo-website-umkm"
                required
                aria-invalid={!!errors?.slug}
              />
            </div>
            {errors?.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
            <p className="mt-1 text-xs text-muted-foreground">
              Otomatis dari judul — bisa diubah. Hindari kata: blog, kontak, layanan, projek.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Membuat..." : "Buat & Buka Builder"}
            </Button>
            <Link href="/admin/pages" className="text-sm text-muted-foreground hover:text-foreground">
              Batal
            </Link>
          </div>
        </div>
      </Card>
    </form>
  );
}
