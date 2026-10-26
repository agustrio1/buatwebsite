"use client";

import { useActionState } from "react";
import { SortableTextList } from "./sortable-text-list";
import { SortableFaqList } from "./sortable-faq-list";
import { ChevronDown } from "lucide-react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input, Textarea, Label } from "~/components/ui/input";

type Faq = { question: string; answer: string };

export type CityFormState = { errors?: Record<string, string> } | null;

type CityFormProps = {
  action: (prevState: CityFormState, formData: FormData) => Promise<CityFormState>;
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Label className="mb-1 block text-sm text-slate-600">{children}</Label>;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

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
    <details open={defaultOpen} className="group">
      <Card className="overflow-hidden">
        <summary className="flex cursor-pointer select-none list-none items-center justify-between px-5 py-4">
          <span className="text-sm font-semibold text-brand-dark">
            {number}. {title}
          </span>
          <ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-border px-5 pb-5 pt-1">{children}</div>
      </Card>
    </details>
  );
}

export function CityForm({ action, defaultValues }: CityFormProps) {
  const [state, formAction] = useActionState(action, null);
  const errors = state?.errors;

  return (
    <form action={formAction} className="w-full space-y-4">
      <Section number={1} title="Informasi Kota" defaultOpen>
        <div>
          <FieldLabel>Nama Kota</FieldLabel>
          <Input
            type="text"
            name="name"
            defaultValue={defaultValues?.name}
            placeholder="Jakarta"
          />
          <FieldError msg={errors?.name} />
        </div>

        <div>
          <FieldLabel>Provinsi</FieldLabel>
          <Input
            type="text"
            name="province"
            defaultValue={defaultValues?.province ?? ""}
            placeholder="DKI Jakarta"
          />
        </div>

        <div>
          <FieldLabel>Slug</FieldLabel>
          <Input type="text" name="slug" defaultValue={defaultValues?.slug} placeholder="jakarta" />
          <p className="mt-1 text-xs text-muted-foreground">
            URL: /jasa-pembuatan-website/{defaultValues?.slug || "slug-kota"}
          </p>
          <FieldError msg={errors?.slug} />
        </div>
      </Section>

      <Section number={2} title="Konten Utama" defaultOpen>
        <div>
          <FieldLabel>H1 (judul utama halaman, kosongkan untuk pakai default)</FieldLabel>
          <Input
            type="text"
            name="h1"
            defaultValue={defaultValues?.h1 ?? ""}
            placeholder={`Jasa Pembuatan Website Profesional di ${defaultValues?.name || "[Kota]"}`}
          />
        </div>

        <div>
          <FieldLabel>Paragraf Pembuka</FieldLabel>
          <Textarea name="intro" defaultValue={defaultValues?.intro ?? ""} rows={3} />
        </div>

        <div>
          <FieldLabel>Konteks Bisnis Lokal</FieldLabel>
          <Textarea
            name="localContext"
            defaultValue={defaultValues?.localContext ?? ""}
            rows={4}
            placeholder="Ceritakan karakteristik bisnis di kota ini..."
          />
        </div>
      </Section>

      <Section number={3} title="Kebutuhan Bisnis">
        <div>
          <FieldLabel>Tantangan Bisnis Lokal</FieldLabel>
          <Textarea name="localChallenges" defaultValue={defaultValues?.localChallenges ?? ""} rows={3} />
        </div>

        <div>
          <FieldLabel>Kenapa Website Dibutuhkan</FieldLabel>
          <Textarea name="whyWebsiteNeeded" defaultValue={defaultValues?.whyWebsiteNeeded ?? ""} rows={3} />
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
          <FieldLabel>Meta Title</FieldLabel>
          <Input type="text" name="metaTitle" defaultValue={defaultValues?.metaTitle ?? ""} />
        </div>

        <div>
          <FieldLabel>Meta Description</FieldLabel>
          <Textarea name="metaDescription" defaultValue={defaultValues?.metaDescription ?? ""} rows={2} />
        </div>

        <div>
          <FieldLabel>CTA Judul</FieldLabel>
          <Input
            type="text"
            name="ctaTitle"
            defaultValue={defaultValues?.ctaTitle ?? ""}
            placeholder="Siap Bangun Website Bisnis Anda?"
          />
        </div>

        <div>
          <FieldLabel>CTA Deskripsi</FieldLabel>
          <Textarea name="ctaDescription" defaultValue={defaultValues?.ctaDescription ?? ""} rows={2} />
        </div>

        <div>
          <FieldLabel>WhatsApp (opsional, kosongkan untuk pakai nomor default)</FieldLabel>
          <Input
            type="text"
            name="ctaWhatsappNumber"
            defaultValue={defaultValues?.ctaWhatsappNumber ?? ""}
            placeholder="62812xxxxxxx"
          />
        </div>
      </Section>

      <Card className="p-5">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={defaultValues?.isActive ?? true}
            className="h-4 w-4 accent-brand-500"
          />
          Aktif (tampil di website)
        </label>

        <Button type="submit" className="mt-4 w-full sm:w-auto">
          Simpan
        </Button>
      </Card>
    </form>
  );
}
