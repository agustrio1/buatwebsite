import { z } from "zod";

export const cityFaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const citySchema = z.object({
  // 1. Informasi Kota
  name: z.string().min(1, "Nama kota wajib diisi"),
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda strip"),
  province: z.string().optional().nullable(),

  // 2. Konten Utama
  h1: z.string().optional().nullable(),
  intro: z.string().optional().nullable(),
  localContext: z.string().optional().nullable(),

  // 3. Kebutuhan Bisnis
  localChallenges: z.string().optional().nullable(),
  whyWebsiteNeeded: z.string().optional().nullable(),
  businessTypes: z.array(z.string()).optional().default([]),

  // 4. Layanan & Keunggulan
  relevantServices: z.array(z.string()).optional().default([]),
  advantages: z.array(z.string()).optional().default([]),

  // 5. Area Layanan
  serviceAreas: z.array(z.string()).optional().default([]),

  // 6. FAQ
  faqs: z.array(cityFaqSchema).optional().default([]),

  // 7. SEO & CTA
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  ctaTitle: z.string().optional().nullable(),
  ctaDescription: z.string().optional().nullable(),
  ctaWhatsappNumber: z.string().optional().nullable(),

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