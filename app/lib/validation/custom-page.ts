import { z } from "zod";
import { BLOCK_TYPES, COLUMN_RATIOS } from "~/lib/page-builder/types";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Slug yang tidak boleh dipakai halaman custom karena sudah ditangani
 * route statis/dinamis lain di app/(site) dan app/admin.
 */
export const RESERVED_PAGE_SLUGS = [
  "blog",
  "layanan",
  "projek",
  "jasa-pembuatan-website",
  "kalkulator",
  "kontak",
  "legal",
  "admin",
  "login",
  "logout",
  "media",
  "api",
  "rss",
  "rss.xml",
  "sitemap",
  "sitemap-index.xml",
  "robots.txt",
  "llms",
  "llms.txt",
  "og",
  "favicon.ico",
];

export function isReservedPageSlug(slug: string): boolean {
  const s = slug.toLowerCase().replace(/^\/+|\/+$/g, "");
  return RESERVED_PAGE_SLUGS.includes(s);
}

export const pageSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(255),
  slug: z
    .string()
    .trim()
    .min(2, "Slug minimal 2 karakter")
    .max(255)
    .regex(slugRegex, "Slug cuma boleh huruf kecil, angka, dan tanda strip (-)")
    .refine((s) => !isReservedPageSlug(s), "Slug ini dipakai halaman sistem"),
  status: z.enum(["draft", "published"]),
});

// ---------- Dokumen builder ----------

const blockNodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(BLOCK_TYPES),
  props: z.record(z.string(), z.unknown()),
});

const columnSchema = z.object({
  id: z.string().min(1),
  ratio: z.enum(COLUMN_RATIOS),
  blocks: z.array(blockNodeSchema),
});

const sectionSchema = z.object({
  id: z.string().min(1),
  background: z
    .object({
      color: z.string().nullish(),
      imageUrl: z.string().nullish(),
    })
    .default({}),
  padding: z.enum(["none", "sm", "md", "lg"]).default("md"),
  columns: z.array(columnSchema).min(1, "Section minimal punya 1 kolom"),
});

export const pageDocumentSchema = z.object({
  version: z.literal(1),
  sections: z.array(sectionSchema),
});

export type PageFormErrors = {
  title?: string;
  slug?: string;
  status?: string;
  content?: string;
};

export function flattenPageErrors(error: z.ZodError): PageFormErrors {
  const errors: PageFormErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key === "title" || key === "slug" || key === "status" || key === "content") {
      if (!errors[key]) errors[key] = issue.message;
    }
  }
  return errors;
}

/** Parse JSON konten dari FormData; null kalau kosong/rusak. */
export function parsePageContent(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
