import { z } from "zod";

export const cityFaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const citySchema = z.object({
  name: z.string().min(1, "Nama kota wajib diisi"),
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda strip"),
  province: z.string().optional().nullable(),
  intro: z.string().optional().nullable(),
  localContext: z.string().optional().nullable(),
  faqs: z.array(cityFaqSchema).optional().default([]),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  isActive: z.coerce.boolean().default(true),
});

export function flattenZodErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}